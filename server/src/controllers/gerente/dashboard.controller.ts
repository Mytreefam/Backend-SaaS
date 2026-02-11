/**
 * CONTROLADOR: Dashboard Gerente
 * Endpoints para obtener métricas, KPIs y estadísticas del dashboard
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

function safeNumber(val: any, decimals = 2) {
  return Number.isFinite(val) ? parseFloat(Number(val).toFixed(decimals)) : 0;
}

function classifyPedidoCanal(p: { tipoEntrega?: string | null }): 'mostrador' | 'app_web' | 'terceros' | 'otros' {
  const t = (p.tipoEntrega || '').toString().trim().toLowerCase();
  if (!t) return 'mostrador';
  if (t.includes('glovo') || t.includes('uber') || t.includes('just') || t.includes('deliveroo')) return 'terceros';
  if (t.includes('delivery') || t.includes('app') || t.includes('web') || t.includes('recogida')) return 'app_web';
  if (t.includes('local') || t.includes('mostrador') || t.includes('tienda')) return 'mostrador';
  return 'otros';
}

function percentChange(current: number, previous: number) {
  if (!Number.isFinite(previous) || previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

async function resolvePdvIdsFromContext(params: { empresaId?: any; marcaId?: any; puntoVentaId?: any }) {
  const empresaId = typeof params.empresaId === 'string' ? params.empresaId : undefined;
  const marcaId = typeof params.marcaId === 'string' ? params.marcaId : undefined;
  const puntoVentaId = typeof params.puntoVentaId === 'string' ? params.puntoVentaId : undefined;

  if (puntoVentaId && puntoVentaId !== 'todas') return [puntoVentaId];
  if (!empresaId && !marcaId) return null;

  const pdvs = await prisma.puntoVenta.findMany({
    where: {
      ...(empresaId && empresaId !== 'todas' ? { empresaId } : {}),
      ...(marcaId && marcaId !== 'todas' ? { marcasIds: { has: marcaId } } : {}),
      activo: true,
    } as any,
    select: { id: true },
  });
  return pdvs.map((p) => p.id);
}

/**
 * @swagger
 * /api/gerente/dashboard/ventas:
 *   get:
 *     summary: Obtener datos de ventas para el dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *         description: ID de la empresa para filtrar
 *       - in: query
 *         name: marca_id
 *         schema:
 *           type: string
 *         description: ID de la marca para filtrar
 *       - in: query
 *         name: punto_venta_id
 *         schema:
 *           type: string
 *         description: ID del punto de venta para filtrar
 *       - in: query
 *         name: periodo_tipo
 *         schema:
 *           type: string
 *           enum: [mes_actual, mes_anterior, trimestre, año]
 *           default: mes_actual
 *         description: Tipo de periodo para el reporte
 *       - in: query
 *         name: fecha_inicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio personalizada
 *       - in: query
 *         name: fecha_fin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin personalizada
 *     responses:
 *       200:
 *         description: Datos de ventas obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DatosVentas'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
export const obtenerDatosVentas = async (req: Request, res: Response) => {
  try {
    const {
      empresa_id,
      marca_id,
      punto_venta_id,
      periodo_tipo = 'mes_actual', // mes_actual, mes_anterior, trimestre, año
      fecha_inicio,
      fecha_fin
    } = req.query;

    // Calcular fechas según el periodo
    let startDate: Date;
    let endDate: Date = new Date();

    switch (periodo_tipo) {
      case 'mes_actual':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        break;
      case 'mes_anterior':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 1, 1);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
        break;
      case 'trimestre':
        startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 3, 1);
        break;
      case 'año':
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = fecha_inicio ? new Date(fecha_inicio as string) : new Date(endDate.getFullYear(), endDate.getMonth(), 1);
        endDate = fecha_fin ? new Date(fecha_fin as string) : endDate;
    }

    // Construir filtros dinámicos
    const filtros: any = {
      fecha: {
        gte: startDate,
        lte: endDate
      }
    };

    const pdvIds = await resolvePdvIdsFromContext({
      empresaId: empresa_id,
      marcaId: marca_id,
      puntoVentaId: punto_venta_id,
    });
    if (pdvIds && pdvIds.length > 0) {
      filtros.puntoVentaId = { in: pdvIds };
    }

    // Obtener pedidos del periodo
    const pedidos = await prisma.pedido.findMany({
      where: filtros,
      include: {
        items: {
          include: {
            producto: true
          }
        },
        cliente: true
      }
    });

    // Calcular KPIs
    const ventas_periodo = pedidos.reduce((sum: number, p: any) => sum + p.total, 0);
    const pedidos_periodo = pedidos.length;
    const productos_vendidos = pedidos.reduce((sum: number, p: any) => 
      sum + p.items.reduce((itemSum: number, item: any) => itemSum + item.cantidad, 0), 0
    );
    const ticket_medio_pedido = pedidos_periodo > 0 ? ventas_periodo / pedidos_periodo : 0;
    const ticket_medio_producto = productos_vendidos > 0 ? ventas_periodo / productos_vendidos : 0;

    // Ventas por canal (derivado de tipoEntrega)
    const canales = { mostrador: 0, app_web: 0, terceros: 0, otros: 0 };
    pedidos.forEach((p: any) => {
      const canal = classifyPedidoCanal(p);
      canales[canal] += Number(p.total) || 0;
    });
    const ventas_mostrador = canales.mostrador;
    const ventas_app_web = canales.app_web;
    const ventas_terceros = canales.terceros;

    // Calcular variaciones (comparar con periodo anterior)
    const durationMs = Math.max(0, endDate.getTime() - startDate.getTime());
    const periodoAnteriorEnd = new Date(startDate.getTime() - 1);
    const periodoAnteriorStart = new Date(periodoAnteriorEnd.getTime() - durationMs);

    const pedidosAnterior = await prisma.pedido.findMany({
      where: {
        fecha: {
          gte: periodoAnteriorStart,
          lte: periodoAnteriorEnd
        },
        ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
      },
      select: { total: true, tipoEntrega: true }
    });

    const ventasAnterior = pedidosAnterior.reduce((sum: number, p: any) => sum + p.total, 0);
    const variacion_ventas_periodo = ventasAnterior > 0 
      ? ((ventas_periodo - ventasAnterior) / ventasAnterior) * 100 
      : 0;

    const canalesAnterior = { mostrador: 0, app_web: 0, terceros: 0, otros: 0 };
    pedidosAnterior.forEach((p: any) => {
      const canal = classifyPedidoCanal(p);
      canalesAnterior[canal] += Number(p.total) || 0;
    });

    const variacion_mostrador = percentChange(ventas_mostrador, canalesAnterior.mostrador);
    const variacion_app_web = percentChange(ventas_app_web, canalesAnterior.app_web);
    const variacion_terceros = percentChange(ventas_terceros, canalesAnterior.terceros);

    // Margen neto aproximado (gastos reales disponibles: compras + gastos empresa)
    const comprasPeriodo = await prisma.pedidoProveedor.aggregate({
      where: {
        fechaPedido: { gte: startDate, lte: endDate },
        ...(empresa_id && empresa_id !== 'todas' ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id && punto_venta_id !== 'todas' ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });
    const gastosPeriodo = await prisma.gastoEmpresa.aggregate({
      where: {
        fechaGasto: { gte: startDate, lte: endDate },
        ...(empresa_id && empresa_id !== 'todas' ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id && punto_venta_id !== 'todas' ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });

    const comprasPrev = await prisma.pedidoProveedor.aggregate({
      where: {
        fechaPedido: { gte: periodoAnteriorStart, lte: periodoAnteriorEnd },
        ...(empresa_id && empresa_id !== 'todas' ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id && punto_venta_id !== 'todas' ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });
    const gastosPrev = await prisma.gastoEmpresa.aggregate({
      where: {
        fechaGasto: { gte: periodoAnteriorStart, lte: periodoAnteriorEnd },
        ...(empresa_id && empresa_id !== 'todas' ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id && punto_venta_id !== 'todas' ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });

    const totalGastosPeriodo = (Number(comprasPeriodo._sum.total) || 0) + (Number(gastosPeriodo._sum.total) || 0);
    const totalGastosPrev = (Number(comprasPrev._sum.total) || 0) + (Number(gastosPrev._sum.total) || 0);
    const margenNetoPct = ventas_periodo > 0 ? ((ventas_periodo - totalGastosPeriodo) / ventas_periodo) * 100 : 0;
    const margenNetoPrevPct = ventasAnterior > 0 ? ((ventasAnterior - totalGastosPrev) / ventasAnterior) * 100 : 0;
    const variacion_margen_neto_periodo = percentChange(margenNetoPct, margenNetoPrevPct);

    // Obtener datos para gráficas (últimos 5 meses)
    const labels_ultimos_5_meses = [];
    const ingresos_ultimos_5_meses = [];
    
    for (let i = 4; i >= 0; i--) {
      const mesDate = new Date();
      mesDate.setMonth(mesDate.getMonth() - i);
      const mesStart = new Date(mesDate.getFullYear(), mesDate.getMonth(), 1);
      const mesEnd = new Date(mesDate.getFullYear(), mesDate.getMonth() + 1, 0);
      
      const pedidosMes = await prisma.pedido.findMany({
        where: {
          fecha: { gte: mesStart, lte: mesEnd }
        }
      });
      
      const ventasMes = pedidosMes.reduce((sum: number, p: any) => sum + p.total, 0);
      
      labels_ultimos_5_meses.push(mesDate.toLocaleDateString('es-ES', { month: 'short' }));
      ingresos_ultimos_5_meses.push(ventasMes);
    }

    const response = {
      empresa_id: empresa_id || 'todas',
      marca_id: marca_id || 'todas',
      punto_venta_id: punto_venta_id || 'todas',
      periodo_tipo,
      fecha_inicio: startDate.toISOString(),
      fecha_fin: endDate.toISOString(),

      // KPIs principales
      ventas_periodo: safeNumber(ventas_periodo),
      pedidos_periodo: safeNumber(pedidos_periodo, 0),
      productos_vendidos: safeNumber(productos_vendidos, 0),
      ticket_medio_pedido: safeNumber(ticket_medio_pedido),
      ticket_medio_producto: safeNumber(ticket_medio_producto),

      // Variaciones
      variacion_ventas_periodo: safeNumber(variacion_ventas_periodo),
      variacion_margen_neto_periodo: safeNumber(variacion_margen_neto_periodo),

      // Ventas por canal
      ventas_mostrador: safeNumber(ventas_mostrador),
      variacion_mostrador: safeNumber(variacion_mostrador, 1),
      ventas_app_web: safeNumber(ventas_app_web),
      variacion_app_web: safeNumber(variacion_app_web, 1),
      ventas_terceros: safeNumber(ventas_terceros),
      variacion_terceros: safeNumber(variacion_terceros, 1),

      // Gráficas
      labels_ultimos_5_meses: Array.isArray(labels_ultimos_5_meses) ? labels_ultimos_5_meses : [],
      ingresos_ultimos_5_meses: Array.isArray(ingresos_ultimos_5_meses) ? ingresos_ultimos_5_meses.map(v => safeNumber(v)) : [],
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener datos de ventas:', error);
    res.status(500).json({ error: 'Error al obtener datos de ventas' });
  }
};

/**
 * @swagger
 * /api/gerente/dashboard/kpis:
 *   get:
 *     summary: Obtener KPIs principales para tarjetas del dashboard
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: marca_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: punto_venta_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPIs obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/KPIs'
 *       500:
 *         description: Error del servidor
 */
export const obtenerKPIs = async (req: Request, res: Response) => {
  try {
    const { empresa_id, marca_id, punto_venta_id } = req.query;

    // Obtener datos del mes actual
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = new Date();
    const prevEnd = new Date(startDate.getTime() - 1);
    const prevStart = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), 1);

    const pdvIds = await resolvePdvIdsFromContext({
      empresaId: empresa_id,
      marcaId: marca_id,
      puntoVentaId: punto_venta_id,
    });

    const pedidos = await prisma.pedido.findMany({
      where: {
        fecha: { gte: startDate, lte: endDate },
        ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
      } as any,
      include: {
        items: true
      }
    });

    const totalVentas = pedidos.reduce((sum: number, p: any) => sum + p.total, 0);
    const totalPedidos = pedidos.length;
    const clientesUnicos = new Set(pedidos.map((p: any) => p.clienteId)).size;

    const pedidosPrev = await prisma.pedido.findMany({
      where: {
        fecha: { gte: prevStart, lte: prevEnd },
        ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
      } as any,
      select: { total: true, clienteId: true },
    });
    const ventasPrev = pedidosPrev.reduce((sum: number, p: any) => sum + (Number(p.total) || 0), 0);
    const pedidosPrevCount = pedidosPrev.length;
    const clientesPrev = new Set(pedidosPrev.map((p: any) => p.clienteId)).size;

    const comprasMes = await prisma.pedidoProveedor.aggregate({
      where: {
        fechaPedido: { gte: startDate, lte: endDate },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });
    const gastosMes = await prisma.gastoEmpresa.aggregate({
      where: {
        fechaGasto: { gte: startDate, lte: endDate },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });
    const comprasPrevAgg = await prisma.pedidoProveedor.aggregate({
      where: {
        fechaPedido: { gte: prevStart, lte: prevEnd },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });
    const gastosPrevAgg = await prisma.gastoEmpresa.aggregate({
      where: {
        fechaGasto: { gte: prevStart, lte: prevEnd },
        ...(empresa_id ? { empresaId: String(empresa_id) } : {}),
        ...(punto_venta_id ? { puntoVentaId: String(punto_venta_id) } : {}),
      } as any,
      _sum: { total: true },
    });

    const gastosTotal = (Number(comprasMes._sum.total) || 0) + (Number(gastosMes._sum.total) || 0);
    const gastosTotalPrev = (Number(comprasPrevAgg._sum.total) || 0) + (Number(gastosPrevAgg._sum.total) || 0);
    const margen = totalVentas > 0 ? ((totalVentas - gastosTotal) / totalVentas) * 100 : 0;
    const margenPrev = ventasPrev > 0 ? ((ventasPrev - gastosTotalPrev) / ventasPrev) * 100 : 0;

    res.json({
      mrr: safeNumber(totalVentas),
      variacion_mrr: safeNumber(percentChange(totalVentas, ventasPrev), 1),
      pedidos: totalPedidos,
      variacion_pedidos: safeNumber(percentChange(totalPedidos, pedidosPrevCount), 1),
      clientes_unicos: clientesUnicos,
      variacion_clientes: safeNumber(percentChange(clientesUnicos, clientesPrev), 1),
      margen_porcentaje: safeNumber(margen, 1),
      variacion_margen: safeNumber(percentChange(margen, margenPrev), 1),
    });
  } catch (error) {
    console.error('Error al obtener KPIs:', error);
    res.status(500).json({ error: 'Error al obtener KPIs' });
  }
};

/**
 * @swagger
 * /api/gerente/dashboard/alertas:
 *   get:
 *     summary: Obtener alertas y notificaciones importantes
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: empresa_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: punto_venta_id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Alertas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   tipo:
 *                     type: string
 *                     enum: [stock, pedido, empleado, finanzas]
 *                   nivel:
 *                     type: string
 *                     enum: [critico, importante, info]
 *                   titulo:
 *                     type: string
 *                   mensaje:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error del servidor
 */
export const obtenerAlertas = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id } = req.query as any;
    const marca_id = (req.query as any).marca_id;

    const pdvIds = await resolvePdvIdsFromContext({
      empresaId: empresa_id,
      marcaId: marca_id,
      puntoVentaId: punto_venta_id,
    });

    const stockWhere: any = {};
    if (empresa_id && empresa_id !== 'todas') stockWhere.empresaId = String(empresa_id);
    if (punto_venta_id && punto_venta_id !== 'todas') stockWhere.puntoVentaId = String(punto_venta_id);

    const [stockBajoCount, sinStockCount, pedidosPendientesCount, fichajesPendientesCount, gastosPendientesCount] =
      await Promise.all([
        prisma.articuloStock.count({ where: { ...stockWhere, alertaStockBajo: true, stockActual: { gt: 0 } } }),
        prisma.articuloStock.count({ where: { ...stockWhere, stockActual: { lte: 0 } } }),
        prisma.pedido.count({
          where: {
            estado: { in: ['pendiente', 'recibido', 'preparacion', 'enviado', 'en-carretera', 'nuevo', 'aceptado', 'en_preparacion', 'listo'] },
            ...(pdvIds && pdvIds.length > 0 ? { puntoVentaId: { in: pdvIds } } : {}),
          } as any,
        }),
        prisma.fichaje.count({ where: { validado: false } }),
        prisma.gastoEmpresa.count({
          where: {
            ...(empresa_id && empresa_id !== 'todas' ? { empresaId: String(empresa_id) } : {}),
            ...(punto_venta_id && punto_venta_id !== 'todas' ? { puntoVentaId: String(punto_venta_id) } : {}),
            estadoPago: 'pendiente',
          } as any,
        }),
      ]);

    const now = new Date();
    const alertas: any[] = [];

    if (sinStockCount > 0) {
      alertas.push({
        id: 'stock-sin',
        tipo: 'sin_stock',
        mensaje: `Sin stock en ${sinStockCount} producto(s)`,
        prioridad: 'alta',
        fecha: now,
      });
    }
    if (stockBajoCount > 0) {
      alertas.push({
        id: 'stock-bajo',
        tipo: 'stock_bajo',
        mensaje: `Stock bajo en ${stockBajoCount} producto(s)`,
        prioridad: 'media',
        fecha: now,
      });
    }
    if (pedidosPendientesCount > 0) {
      alertas.push({
        id: 'pedidos-pendientes',
        tipo: 'pedidos_pendientes',
        mensaje: `${pedidosPendientesCount} pedido(s) pendientes`,
        prioridad: 'media',
        fecha: now,
      });
    }
    if (fichajesPendientesCount > 0) {
      alertas.push({
        id: 'fichajes-pendientes',
        tipo: 'fichajes_pendientes',
        mensaje: `${fichajesPendientesCount} fichaje(s) pendientes de validación`,
        prioridad: 'baja',
        fecha: now,
      });
    }
    if (gastosPendientesCount > 0) {
      alertas.push({
        id: 'gastos-pendientes',
        tipo: 'finanzas',
        mensaje: `${gastosPendientesCount} gasto(s) pendientes de pago`,
        prioridad: 'media',
        fecha: now,
      });
    }

    // Excluir alertas ya resueltas (persistente)
    const empresaIdForResolve =
      (typeof empresa_id === 'string' && empresa_id && empresa_id !== 'todas' ? empresa_id : process.env.DEFAULT_EMPRESA_ID) || 'HOYPCM000';
    const pvForResolve = typeof punto_venta_id === 'string' && punto_venta_id && punto_venta_id !== 'todas' ? punto_venta_id : null;

    const resueltas = await prisma.dashboardAlertaResuelta.findMany({
      where: {
        empresaId: String(empresaIdForResolve),
        ...(pvForResolve ? { OR: [{ puntoVentaId: 'ALL' }, { puntoVentaId: String(pvForResolve) }] } : { puntoVentaId: 'ALL' }),
      } as any,
      select: { alertaId: true },
    });
    const resolvedSet = new Set(resueltas.map((r) => r.alertaId));
    const filtradas = alertas.filter((a) => !resolvedSet.has(String(a.id)));

    res.json(filtradas);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
};
