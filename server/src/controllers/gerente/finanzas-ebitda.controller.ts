/**
 * CONTROLADOR: Finanzas y EBITDA
 * Endpoints para cuenta de resultados, EBITDA e indicadores financieros
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

function safeNumber(val: any, decimals = 2) {
  return Number.isFinite(val) ? parseFloat(Number(val).toFixed(decimals)) : 0;
}

async function resolvePdvIdsFromContext(params: { empresaId?: string; puntoVentaId?: string }) {
  const { empresaId, puntoVentaId } = params;
  if (puntoVentaId && puntoVentaId !== 'todas') return [puntoVentaId];
  if (!empresaId || empresaId === 'todas') return null;
  const pdvs = await prisma.puntoVenta.findMany({
    where: { empresaId, activo: true },
    select: { id: true },
  });
  return pdvs.map((p) => p.id);
}

async function calcularEbitdaPeriodo(params: {
  from: Date;
  to: Date;
  empresaId?: string;
  puntoVentaId?: string;
}) {
  const { from, to, empresaId, puntoVentaId } = params;
  const pdvIds = await resolvePdvIdsFromContext({ empresaId, puntoVentaId });

  const ingresosAgg = await prisma.pedido.aggregate({
    where: {
      fecha: { gte: from, lte: to },
      estado: { notIn: ['cancelado'] },
      ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
    },
    _sum: { total: true },
  });
  const ingresos = Number(ingresosAgg._sum.total) || 0;

  const comprasAgg = await prisma.pedidoProveedor.aggregate({
    where: {
      fechaPedido: { gte: from, lte: to },
      estado: { notIn: ['cancelado'] },
      ...(empresaId ? { empresaId } : {}),
      ...(puntoVentaId ? { puntoVentaId } : {}),
    } as any,
    _sum: { total: true },
  });
  const compras = Number(comprasAgg._sum.total) || 0;

  const gastosEmpresaAgg = await prisma.gastoEmpresa.aggregate({
    where: {
      fechaGasto: { gte: from, lte: to },
      ...(empresaId ? { empresaId } : {}),
      ...(puntoVentaId ? { puntoVentaId } : {}),
    } as any,
    _sum: { total: true },
  });
  const gastosEmpresa = Number(gastosEmpresaAgg._sum.total) || 0;

  const personalExtraAgg = await prisma.empleadoRemuneracion.aggregate({
    where: { creadoEn: { gte: from, lte: to } },
    _sum: { importe: true },
  });
  const personalExtra = Number(personalExtraAgg._sum.importe) || 0;

  const empleados = await prisma.empleado.findMany({
    where: {
      estado: 'activo',
      fechaAlta: { lte: to },
      OR: [{ fechaBaja: null }, { fechaBaja: { gte: from } }],
      ...(empresaId ? { empresaId } : {}),
      ...(puntoVentaId ? { puntoVentaId } : {}),
    } as any,
    select: { salarioBase: true },
  });
  const salariosBase = empleados.reduce((sum, e) => sum + (Number(e.salarioBase) || 0), 0);

  const gastos = compras + gastosEmpresa + personalExtra + salariosBase;
  const ebitda = ingresos - gastos;
  const margen = ingresos > 0 ? (ebitda / ingresos) * 100 : 0;

  return { ingresos, compras, gastosEmpresa, personalExtra, salariosBase, gastos, ebitda, margen };
}

/**
 * GET /api/gerente/finanzas/cuenta-resultados
 * Obtener cuenta de resultados del periodo
 */
export const obtenerCuentaResultados = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, fecha_inicio, fecha_fin } = req.query;

    // Determinar periodo
    const fechaInicio = fecha_inicio 
      ? new Date(fecha_inicio as string) 
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const fechaFin = fecha_fin 
      ? new Date(fecha_fin as string) 
      : new Date();

    const where: any = {
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      estado: {
        notIn: ['cancelado'],
      },
    };

    const empresaId = empresa_id ? String(empresa_id) : undefined;
    const puntoVentaId = punto_venta_id ? String(punto_venta_id) : undefined;
    const pdvIds = await resolvePdvIdsFromContext({ empresaId, puntoVentaId });
    if (pdvIds && pdvIds.length > 0) where.puntoVentaId = { in: pdvIds };

    // Obtener ingresos (pedidos)
    const pedidos = await prisma.pedido.findMany({
      where,
      select: {
        total: true,
        tipoEntrega: true,
      },
    });

    const ingresosNetos = pedidos.reduce((sum: number, p: any) => sum + (Number(p.total) || 0), 0);

    const calc = await calcularEbitdaPeriodo({ from: fechaInicio, to: fechaFin, empresaId, puntoVentaId });

    const costeVentas = calc.compras; // proxy: compras del periodo
    const margenBruto = ingresosNetos - costeVentas;
    const gastosOperativos = calc.gastosEmpresa + calc.personalExtra + calc.salariosBase;
    const ebitda = ingresosNetos - costeVentas - gastosOperativos;
    const margenEbitda = ingresosNetos > 0 ? (ebitda / ingresosNetos) * 100 : 0;

    // Desglose por tipo de entrega
    const ingresosPorOrigen: Record<string, number> = {};
    pedidos.forEach((p: any) => {
      const tipoEntrega = p.tipoEntrega || 'otros';
      if (!ingresosPorOrigen[tipoEntrega]) ingresosPorOrigen[tipoEntrega] = 0;
      ingresosPorOrigen[tipoEntrega] += Number(p.total) || 0;
    });

    const cuentaResultados = {
      periodo: `${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]}`,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      ingresosNetos: safeNumber(ingresosNetos),
      costeVentas: safeNumber(costeVentas),
      margenBruto: safeNumber(margenBruto),
      gastosOperativos: safeNumber(gastosOperativos),
      ebitda: safeNumber(ebitda),
      margenEbitda: safeNumber(margenEbitda),
      desglose: {
        ingresos: Object.entries(ingresosPorOrigen).map(([concepto, importe]) => ({
          concepto,
          importe: safeNumber(importe),
          porcentaje: safeNumber(ingresosNetos > 0 ? (importe / ingresosNetos) * 100 : 0),
        })),
        costes: [
          { concepto: 'Compras a proveedores (proxy COGS)', importe: safeNumber(costeVentas) },
        ],
        gastos: [
          { concepto: 'Personal (estimado)', importe: safeNumber(calc.salariosBase + calc.personalExtra) },
          { concepto: 'Gastos empresa', importe: safeNumber(calc.gastosEmpresa) },
        ],
      },
    };

    res.json(cuentaResultados);
  } catch (error) {
    console.error('Error al obtener cuenta de resultados:', error);
    res.status(500).json({ error: 'Error al obtener cuenta de resultados' });
  }
};

/**
 * GET /api/gerente/finanzas/ebitda
 * Obtener EBITDA del periodo
 */
export const obtenerEBITDA = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, mes, año } = req.query;

    const mesActual = mes ? parseInt(mes as string) : new Date().getMonth() + 1;
    const añoActual = año ? parseInt(año as string) : new Date().getFullYear();

    const fechaInicio = new Date(añoActual, mesActual - 1, 1);
    const fechaFin = new Date(añoActual, mesActual, 0, 23, 59, 59);

    const empresaId = empresa_id ? String(empresa_id) : undefined;
    const puntoVentaId = punto_venta_id ? String(punto_venta_id) : undefined;
    const calc = await calcularEbitdaPeriodo({ from: fechaInicio, to: fechaFin, empresaId, puntoVentaId });

    res.json({
      ebitda: safeNumber(calc.ebitda),
      margen: safeNumber(calc.margen, 1),
      ingresos: safeNumber(calc.ingresos),
      gastos: safeNumber(calc.gastos),
    });
  } catch (error) {
    console.error('Error al obtener EBITDA:', error);
    res.status(500).json({ error: 'Error al obtener EBITDA' });
  }
};

/**
 * GET /api/gerente/finanzas/indicadores
 * Obtener indicadores financieros clave
 */
export const obtenerIndicadores = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id } = req.query;
    const empresaId = empresa_id ? String(empresa_id) : undefined;
    const puntoVentaId = punto_venta_id ? String(punto_venta_id) : undefined;
    const pdvIds = await resolvePdvIdsFromContext({ empresaId, puntoVentaId });

    // Obtener datos del mes actual vs anterior para calcular variaciones
    const hoy = new Date();
    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const [ventasActual, ventasAnterior, pedidosActual, pedidosAnterior] = await Promise.all([
      prisma.pedido.aggregate({
        where: {
          fecha: { gte: inicioMesActual },
          estado: { notIn: ['cancelado'] },
          ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
        } as any,
        _sum: { total: true },
      }),
      prisma.pedido.aggregate({
        where: {
          fecha: { gte: inicioMesAnterior, lte: finMesAnterior },
          estado: { notIn: ['cancelado'] },
          ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
        } as any,
        _sum: { total: true },
      }),
      prisma.pedido.count({
        where: {
          fecha: { gte: inicioMesActual },
          estado: { notIn: ['cancelado'] },
          ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
        } as any,
      }),
      prisma.pedido.count({
        where: {
          fecha: { gte: inicioMesAnterior, lte: finMesAnterior },
          estado: { notIn: ['cancelado'] },
          ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
        } as any,
      }),
    ]);

    const ventasActualNum = Number(ventasActual._sum.total) || 0;
    const ventasAnteriorNum = Number(ventasAnterior._sum.total) || 0;
    const variacionVentas = ventasAnteriorNum > 0 
      ? ((ventasActualNum - ventasAnteriorNum) / ventasAnteriorNum) * 100 
      : 0;

    const ticketMedioActual = pedidosActual > 0 ? ventasActualNum / pedidosActual : 0;
    const ticketMedioAnterior = pedidosAnterior > 0 ? ventasAnteriorNum / pedidosAnterior : 0;
    const variacionTicket = ticketMedioAnterior > 0 
      ? ((ticketMedioActual - ticketMedioAnterior) / ticketMedioAnterior) * 100 
      : 0;

    const ebitdaActual = await calcularEbitdaPeriodo({ from: inicioMesActual, to: hoy, empresaId, puntoVentaId });
    const ebitdaAnterior = await calcularEbitdaPeriodo({ from: inicioMesAnterior, to: finMesAnterior, empresaId, puntoVentaId });
    const variacionEbitda = ebitdaAnterior.margen !== 0 ? ((ebitdaActual.margen - ebitdaAnterior.margen) / Math.abs(ebitdaAnterior.margen)) * 100 : 0;

    const indicadores = [
      {
        nombre: 'Ventas del mes',
        valor: Math.round(ventasActualNum * 100) / 100,
        unidad: '€',
        tendencia: variacionVentas >= 0 ? 'positiva' : 'negativa',
        variacion: Math.round(variacionVentas * 100) / 100,
      },
      {
        nombre: 'Ticket medio',
        valor: Math.round(ticketMedioActual * 100) / 100,
        unidad: '€',
        tendencia: variacionTicket >= 0 ? 'positiva' : 'negativa',
        variacion: Math.round(variacionTicket * 100) / 100,
      },
      {
        nombre: 'Pedidos',
        valor: pedidosActual,
        unidad: '',
        tendencia: pedidosActual >= pedidosAnterior ? 'positiva' : 'negativa',
        variacion: pedidosAnterior > 0 
          ? Math.round(((pedidosActual - pedidosAnterior) / pedidosAnterior) * 10000) / 100 
          : 0,
      },
      {
        nombre: 'Margen EBITDA',
        valor: safeNumber(ebitdaActual.margen, 1),
        unidad: '%',
        tendencia: variacionEbitda >= 0 ? 'positiva' : 'negativa',
        variacion: safeNumber(variacionEbitda, 1),
      },
    ];

    res.json(indicadores);
  } catch (error) {
    console.error('Error al obtener indicadores:', error);
    res.status(500).json({ error: 'Error al obtener indicadores' });
  }
};

/**
 * GET /api/gerente/finanzas/ebitda/historico
 * Obtener histórico de EBITDA por meses
 */
export const obtenerHistoricoEBITDA = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, meses } = req.query;
    const numMeses = meses ? parseInt(meses as string) : 6;

    const historico: { mes: string; ebitda: number; margen: number }[] = [];
    const hoy = new Date();
    const empresaId = empresa_id ? String(empresa_id) : undefined;
    const puntoVentaId = punto_venta_id ? String(punto_venta_id) : undefined;

    for (let i = numMeses - 1; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0, 23, 59, 59);
      const calc = await calcularEbitdaPeriodo({ from: fecha, to: fechaFin, empresaId, puntoVentaId });

      historico.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        ebitda: safeNumber(calc.ebitda),
        margen: safeNumber(calc.margen, 1),
      });
    }

    res.json(historico);
  } catch (error) {
    console.error('Error al obtener histórico EBITDA:', error);
    res.status(500).json({ error: 'Error al obtener histórico' });
  }
};
