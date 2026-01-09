/**
 * CONTROLADOR: Finanzas y EBITDA
 * Endpoints para cuenta de resultados, EBITDA e indicadores financieros
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Obtener ingresos (pedidos)
    const pedidos = await prisma.pedido.findMany({
      where,
      select: {
        total: true,
        tipoEntrega: true,
      },
    });

    const ingresosNetos = pedidos.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

    // TODO: Obtener costes y gastos de tablas correspondientes
    // Por ahora usamos estimaciones basadas en porcentajes típicos del sector
    const costeVentas = ingresosNetos * 0.35; // 35% coste de ventas típico
    const margenBruto = ingresosNetos - costeVentas;
    const gastosOperativos = ingresosNetos * 0.45; // 45% gastos operativos
    const ebitda = margenBruto - gastosOperativos;
    const margenEbitda = ingresosNetos > 0 ? (ebitda / ingresosNetos) * 100 : 0;

    // Desglose por tipo de entrega
    const ingresosPorOrigen: Record<string, number> = {};
    pedidos.forEach(p => {
      const tipoEntrega = p.tipoEntrega || 'otros';
      if (!ingresosPorOrigen[tipoEntrega]) ingresosPorOrigen[tipoEntrega] = 0;
      ingresosPorOrigen[tipoEntrega] += Number(p.total) || 0;
    });

    const cuentaResultados = {
      periodo: `${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]}`,
      fechaInicio: fechaInicio.toISOString(),
      fechaFin: fechaFin.toISOString(),
      ingresosNetos,
      costeVentas,
      margenBruto,
      gastosOperativos,
      ebitda,
      margenEbitda: Math.round(margenEbitda * 100) / 100,
      desglose: {
        ingresos: Object.entries(ingresosPorOrigen).map(([concepto, importe]) => ({
          concepto,
          importe,
          porcentaje: ingresosNetos > 0 ? (importe / ingresosNetos) * 100 : 0,
        })),
        costes: [
          { concepto: 'Coste de materias primas', importe: costeVentas * 0.7 },
          { concepto: 'Coste de personal producción', importe: costeVentas * 0.3 },
        ],
        gastos: [
          { concepto: 'Personal', importe: gastosOperativos * 0.5 },
          { concepto: 'Alquiler y suministros', importe: gastosOperativos * 0.25 },
          { concepto: 'Marketing', importe: gastosOperativos * 0.1 },
          { concepto: 'Otros gastos', importe: gastosOperativos * 0.15 },
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

    const where: any = {
      fechaCreacion: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      estado: {
        notIn: ['cancelado'],
      },
    };

    if (empresa_id) where.empresaId = parseInt(empresa_id as string);
    if (punto_venta_id) where.puntoVentaId = parseInt(punto_venta_id as string);

    const pedidos = await prisma.pedido.aggregate({
      where,
      _sum: {
        total: true,
      },
    });

    const ingresos = Number(pedidos._sum.total) || 0;
    const gastos = ingresos * 0.8; // 80% gastos totales (estimación)
    const ebitda = ingresos - gastos;
    const margen = ingresos > 0 ? (ebitda / ingresos) * 100 : 0;

    res.json({
      ebitda: Math.round(ebitda * 100) / 100,
      margen: Math.round(margen * 100) / 100,
      ingresos: Math.round(ingresos * 100) / 100,
      gastos: Math.round(gastos * 100) / 100,
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

    // Obtener datos del mes actual vs anterior para calcular variaciones
    const hoy = new Date();
    const inicioMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0);

    const where: any = {};
    if (empresa_id) where.empresaId = parseInt(empresa_id as string);
    if (punto_venta_id) where.puntoVentaId = parseInt(punto_venta_id as string);

    const [ventasActual, ventasAnterior, pedidosActual, pedidosAnterior] = await Promise.all([
      prisma.pedido.aggregate({
        where: { ...where, fechaCreacion: { gte: inicioMesActual }, estado: { notIn: ['cancelado'] } },
        _sum: { total: true },
      }),
      prisma.pedido.aggregate({
        where: { ...where, fechaCreacion: { gte: inicioMesAnterior, lte: finMesAnterior }, estado: { notIn: ['cancelado'] } },
        _sum: { total: true },
      }),
      prisma.pedido.count({
        where: { ...where, fechaCreacion: { gte: inicioMesActual }, estado: { notIn: ['cancelado'] } },
      }),
      prisma.pedido.count({
        where: { ...where, fechaCreacion: { gte: inicioMesAnterior, lte: finMesAnterior }, estado: { notIn: ['cancelado'] } },
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
        valor: 20.5, // TODO: Calcular real cuando haya datos de costes
        unidad: '%',
        tendencia: 'positiva',
        variacion: 2.3,
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

    for (let i = numMeses - 1; i >= 0; i--) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 0, 23, 59, 59);

      const where: any = {
        fechaCreacion: {
          gte: fecha,
          lte: fechaFin,
        },
        estado: {
          notIn: ['cancelado'],
        },
      };

      if (empresa_id) where.empresaId = parseInt(empresa_id as string);
      if (punto_venta_id) where.puntoVentaId = parseInt(punto_venta_id as string);

      const pedidos = await prisma.pedido.aggregate({
        where,
        _sum: { total: true },
      });

      const ingresos = Number(pedidos._sum.total) || 0;
      const ebitda = ingresos * 0.2; // 20% margen estimado
      const margen = 20;

      historico.push({
        mes: fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
        ebitda: Math.round(ebitda * 100) / 100,
        margen,
      });
    }

    res.json(historico);
  } catch (error) {
    console.error('Error al obtener histórico EBITDA:', error);
    res.status(500).json({ error: 'Error al obtener histórico' });
  }
};
