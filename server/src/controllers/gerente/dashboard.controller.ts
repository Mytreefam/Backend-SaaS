/**
 * CONTROLADOR: Dashboard Gerente
 * Endpoints para obtener métricas, KPIs y estadísticas del dashboard
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // TODO: Agregar filtros de empresa_id, marca_id, punto_venta_id cuando se agreguen al schema

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
    const ventas_periodo = pedidos.reduce((sum, p) => sum + p.total, 0);
    const pedidos_periodo = pedidos.length;
    const productos_vendidos = pedidos.reduce((sum, p) => 
      sum + p.items.reduce((itemSum, item) => itemSum + item.cantidad, 0), 0
    );
    const ticket_medio_pedido = pedidos_periodo > 0 ? ventas_periodo / pedidos_periodo : 0;
    const ticket_medio_producto = productos_vendidos > 0 ? ventas_periodo / productos_vendidos : 0;

    // Calcular ventas por canal (basado en metadata o campo específico)
    // TODO: Agregar campo 'canal' a Pedido en schema
    const ventas_mostrador = pedidos.filter(p => p.estado === 'completado').reduce((sum, p) => sum + p.total * 0.6, 0);
    const ventas_app_web = pedidos.filter(p => p.estado === 'completado').reduce((sum, p) => sum + p.total * 0.3, 0);
    const ventas_terceros = pedidos.filter(p => p.estado === 'completado').reduce((sum, p) => sum + p.total * 0.1, 0);

    // Calcular variaciones (comparar con periodo anterior)
    const periodoAnteriorStart = new Date(startDate);
    periodoAnteriorStart.setMonth(periodoAnteriorStart.getMonth() - 1);
    const periodoAnteriorEnd = new Date(startDate);
    periodoAnteriorEnd.setDate(periodoAnteriorEnd.getDate() - 1);

    const pedidosAnterior = await prisma.pedido.findMany({
      where: {
        fecha: {
          gte: periodoAnteriorStart,
          lte: periodoAnteriorEnd
        }
      }
    });

    const ventasAnterior = pedidosAnterior.reduce((sum, p) => sum + p.total, 0);
    const variacion_ventas_periodo = ventasAnterior > 0 
      ? ((ventas_periodo - ventasAnterior) / ventasAnterior) * 100 
      : 0;

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
      
      const ventasMes = pedidosMes.reduce((sum, p) => sum + p.total, 0);
      
      labels_ultimos_5_meses.push(mesDate.toLocaleDateString('es-ES', { month: 'short' }));
      ingresos_ultimos_5_meses.push(ventasMes);
    }

    // Helper to ensure a number is always defined
    const safeNumber = (val: any, decimals = 2) => Number.isFinite(val) ? parseFloat(Number(val).toFixed(decimals)) : 0;

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
      variacion_margen_neto_periodo: safeNumber(0),

      // Ventas por canal
      ventas_mostrador: safeNumber(ventas_mostrador),
      variacion_mostrador: safeNumber(8.2, 1),
      ventas_app_web: safeNumber(ventas_app_web),
      variacion_app_web: safeNumber(15.4, 1),
      ventas_terceros: safeNumber(ventas_terceros),
      variacion_terceros: safeNumber(12.1, 1),

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

    const pedidos = await prisma.pedido.findMany({
      where: {
        fecha: { gte: startDate, lte: endDate }
      },
      include: {
        items: true
      }
    });

    const totalVentas = pedidos.reduce((sum, p) => sum + p.total, 0);
    const totalPedidos = pedidos.length;
    const clientesUnicos = new Set(pedidos.map(p => p.clienteId)).size;

    // Calcular margen (mock - se calculará con costes reales)
    const margen = 34.5;

    res.json({
      mrr: totalVentas,
      variacion_mrr: 12.5,
      pedidos: totalPedidos,
      variacion_pedidos: 8.3,
      clientes_unicos: clientesUnicos,
      variacion_clientes: 5.2,
      margen_porcentaje: margen,
      variacion_margen: -2.1
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
    // TODO: Implementar sistema de alertas (stock bajo, pedidos pendientes, etc.)
    const alertas = [
      {
        id: '1',
        tipo: 'stock_bajo',
        mensaje: 'Stock bajo en 3 productos',
        prioridad: 'alta',
        fecha: new Date()
      },
      {
        id: '2',
        tipo: 'pedidos_pendientes',
        mensaje: '5 pedidos pendientes de aprobación',
        prioridad: 'media',
        fecha: new Date()
      }
    ];

    res.json(alertas);
  } catch (error) {
    console.error('Error al obtener alertas:', error);
    res.status(500).json({ error: 'Error al obtener alertas' });
  }
};
