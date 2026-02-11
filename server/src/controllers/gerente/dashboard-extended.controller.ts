/**
 * CONTROLADOR: Dashboard Gerente - Ampliado
 * Endpoints para KPIs, ventas por canal, alertas
 */

import { Request, Response } from 'express';
import prisma from '../../prisma/client';

function classifyCanalDetalle(tipoEntrega?: string | null) {
  const t = (tipoEntrega || '').toString().trim().toLowerCase();
  if (!t) return 'mostrador';
  if (t.includes('glovo')) return 'glovo';
  if (t.includes('uber')) return 'uberEats';
  if (t.includes('just')) return 'justEat';
  if (t.includes('web')) return 'web';
  if (t.includes('app') || t.includes('delivery')) return 'app';
  if (t.includes('local') || t.includes('mostrador') || t.includes('tienda')) return 'mostrador';
  return 'mostrador';
}

async function resolvePdvIdsFromContext(params: { empresaId?: string; marcaId?: string; puntoVentaId?: string }) {
  const { empresaId, marcaId, puntoVentaId } = params;
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
 * GET /api/gerente/dashboard/ventas/canales
 * Obtener ventas segmentadas por canal
 */
export const obtenerVentasPorCanal = async (req: Request, res: Response) => {
  try {
    const empresaId = typeof req.query.empresa_id === 'string' ? req.query.empresa_id : undefined;
    const marcaId = typeof req.query.marca_id === 'string' ? req.query.marca_id : undefined;
    const puntoVentaId = typeof req.query.punto_venta_id === 'string' ? req.query.punto_venta_id : undefined;
    const fecha = typeof req.query.fecha === 'string' ? req.query.fecha : undefined;
    
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

    const pdvIds = await resolvePdvIdsFromContext({
      empresaId,
      marcaId,
      puntoVentaId,
    });
    if (pdvIds && pdvIds.length > 0) where.puntoVentaId = { in: pdvIds };

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

    pedidos.forEach((pedido: any) => {
      const total = Number(pedido.total) || 0;
      ventasPorCanal.total += total;

      // Por tipo de entrega/origen
      const canal = classifyCanalDetalle(pedido.tipoEntrega);
      if (canal === 'glovo') ventasPorCanal.glovo += total;
      else if (canal === 'uberEats') ventasPorCanal.uberEats += total;
      else if (canal === 'justEat') ventasPorCanal.justEat += total;
      else if (canal === 'web') ventasPorCanal.web += total;
      else if (canal === 'app') ventasPorCanal.app += total;
      else ventasPorCanal.mostrador += total;

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

    return res.status(200).json({ success: true, data: ventasPorCanal });
  } catch (error) {
    console.error('Error al obtener ventas por canal:', error);
    return res.status(500).json({ success: false, error: 'VENTAS_CANALES_FAILED' });
  }
};

/**
 * PUT /api/gerente/dashboard/alertas/:id/resolver
 * Marcar alerta como resuelta
 */
export const resolverAlerta = async (req: Request, res: Response) => {
  try {
    const alertaId = String(req.params.id || '').trim();
    if (!alertaId) return res.status(400).json({ success: false, error: 'INVALID_ALERT_ID' });

    const body = req.body || {};
    const empresaId =
      (typeof body.empresaId === 'string' && body.empresaId.trim()) ||
      (typeof body.empresa_id === 'string' && body.empresa_id.trim()) ||
      process.env.DEFAULT_EMPRESA_ID ||
      'HOYPCM000';
    const puntoVentaId =
      (typeof body.puntoVentaId === 'string' && body.puntoVentaId.trim()) ||
      (typeof body.punto_venta_id === 'string' && body.punto_venta_id.trim()) ||
      'ALL';

    await prisma.dashboardAlertaResuelta.upsert({
      where: {
        empresaId_puntoVentaId_alertaId: {
          empresaId: String(empresaId),
          puntoVentaId: String(puntoVentaId),
          alertaId,
        },
      },
      update: {
        resueltaEn: new Date(),
      },
      create: {
        empresaId: String(empresaId),
        puntoVentaId: String(puntoVentaId),
        alertaId,
        resueltaPorId: (req as any)?.user?.id ?? null,
      },
    });

    return res.status(200).json({ success: true, data: { alertaId, resuelta: true } });
  } catch (error) {
    console.error('Error al resolver alerta:', error);
    return res.status(500).json({ success: false, error: 'ALERTA_RESOLVE_FAILED' });
  }
};
