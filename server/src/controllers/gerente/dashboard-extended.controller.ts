/**
 * CONTROLADOR: Dashboard Gerente - Ampliado
 * Endpoints para KPIs, ventas por canal, alertas
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/gerente/dashboard/ventas/canales
 * Obtener ventas segmentadas por canal
 */
export const obtenerVentasPorCanal = async (req: Request, res: Response) => {
  try {
    const { empresa_id, punto_venta_id, fecha } = req.query;
    
    // Obtener pedidos del periodo y calcular por canal
    const fechaFiltro = fecha ? new Date(fecha as string) : new Date();
    const inicioDia = new Date(fechaFiltro);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaFiltro);
    finDia.setHours(23, 59, 59, 999);

    const where: any = {
      fecha: {
        gte: inicioDia,
        lte: finDia,
      },
      estado: {
        notIn: ['cancelado'],
      },
    };

    const pedidos = await prisma.pedido.findMany({
      where,
      select: {
        total: true,
        tipoEntrega: true,
        metodoPago: true,
      },
    });

    // Calcular totales por canal
    const ventasPorCanal = {
      mostrador: 0,
      app: 0,
      web: 0,
      glovo: 0,
      uberEats: 0,
      justEat: 0,
      efectivo: 0,
      tarjeta: 0,
      total: 0,
    };

    pedidos.forEach(pedido => {
      const total = Number(pedido.total) || 0;
      ventasPorCanal.total += total;

      // Por tipo de entrega (simulado como origen)
      switch (pedido.tipoEntrega?.toLowerCase()) {
        case 'local':
        case 'mostrador':
          ventasPorCanal.mostrador += total;
          break;
        case 'delivery':
          ventasPorCanal.app += total;
          break;
        case 'recogida':
          ventasPorCanal.web += total;
          break;
        default:
          ventasPorCanal.mostrador += total;
          break;
      }

      // Por método de pago
      switch (pedido.metodoPago?.toLowerCase()) {
        case 'efectivo':
          ventasPorCanal.efectivo += total;
          break;
        case 'tarjeta':
        case 'visa':
        case 'mastercard':
          ventasPorCanal.tarjeta += total;
          break;
      }
    });

    res.json(ventasPorCanal);
  } catch (error) {
    console.error('Error al obtener ventas por canal:', error);
    res.status(500).json({ error: 'Error al obtener ventas por canal' });
  }
};

/**
 * PUT /api/gerente/dashboard/alertas/:id/resolver
 * Marcar alerta como resuelta
 */
export const resolverAlerta = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Actualizar en tabla Alertas cuando exista
    // Por ahora devolver éxito simulado
    res.json({ 
      id: parseInt(id), 
      resuelta: true, 
      fechaResolucion: new Date().toISOString() 
    });
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    res.status(500).json({ error: 'Error al resolver alerta' });
  }
};
