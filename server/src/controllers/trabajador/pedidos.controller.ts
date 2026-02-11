import type { Response } from 'express';
import prisma from '../../prisma/client';
import { coercePedidoEstado } from '../../domain/pedido-estado';

const clienteSafeSelect = {
  id: true,
  codigo: true,
  nombre: true,
  email: true,
  telefono: true,
  creadoEn: true,
  role: true,
  avatar: true,
  ciudad: true,
  idioma: true,
} as const;

async function ensureEmpleadoForUser(params: {
  clienteId: number;
  email: string;
  puntoVentaId?: string;
}): Promise<{ id: number; puntoVentaId: string }> {
  const existing = await prisma.empleado.findUnique({ where: { email: params.email } });
  if (existing) {
    return { id: existing.id, puntoVentaId: existing.puntoVentaId };
  }

  const cliente = await prisma.cliente.findUnique({ where: { id: params.clienteId } });
  const nombre = cliente?.nombre || params.email.split('@')[0] || 'Trabajador';
  const puntoVentaId = params.puntoVentaId || String(process.env.DEFAULT_PUNTO_VENTA_ID || 'PDV-TIANA');

  const nuevo = await prisma.empleado.create({
    data: {
      nombre,
      email: params.email,
      telefono: cliente?.telefono || '',
      foto: cliente?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombre)}`,
      puesto: 'Trabajador',
      empresaId: String(process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000'),
      marcaId: String(process.env.DEFAULT_MARCA_ID || 'CAFE01'),
      puntoVentaId,
      horarioEntrada: '09:00',
      horarioSalida: '17:00',
      turno: null,
      salarioBase: 0,
      estado: 'activo',
      desempeno: 0,
      horasMes: 0,
    },
  });

  return { id: nuevo.id, puntoVentaId: nuevo.puntoVentaId };
}

export const getPedidos = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const estado = req.query?.estado ? String(req.query.estado) : undefined;
  const puntoVentaId = req.query?.puntoVentaId ? String(req.query.puntoVentaId).trim() : undefined;

  const where: any = {};
  if (estado) where.estado = coercePedidoEstado(estado);

  // Si es trabajador, restringir por PDV asignado para evitar exposición cruzada
  if (req.user.role === 'trabajador') {
    const empleado = await ensureEmpleadoForUser({
      clienteId: Number(req.user.id),
      email: String(req.user.email),
      puntoVentaId,
    });
    if (puntoVentaId && empleado.puntoVentaId && puntoVentaId !== empleado.puntoVentaId) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
    // Default: PDV del empleado (si no viene query)
    where.puntoVentaId = puntoVentaId || empleado.puntoVentaId;
  } else if (puntoVentaId) {
    // gerente: puede filtrar por query
    where.puntoVentaId = puntoVentaId;
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      cliente: { select: clienteSafeSelect },
      items: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              precio: true,
              imagen: true,
            },
          },
        },
      },
    },
    orderBy: { fecha: 'desc' },
  });

  return res.json({ success: true, data: pedidos });
};

export const updatePedido = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: INVALID_ID' });

  const existing = await prisma.pedido.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  if (req.user.role === 'trabajador') {
    const empleado = await ensureEmpleadoForUser({
      clienteId: Number(req.user.id),
      email: String(req.user.email),
      puntoVentaId: existing.puntoVentaId || undefined,
    });
    if (existing.puntoVentaId && empleado.puntoVentaId && existing.puntoVentaId !== empleado.puntoVentaId) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
  }

  const payload: any = {};
  if (req.body?.estado !== undefined) payload.estado = coercePedidoEstado(req.body.estado);
  if (req.body?.metodoPago !== undefined) payload.metodoPago = String(req.body.metodoPago);
  if (req.body?.tipoEntrega !== undefined) payload.tipoEntrega = String(req.body.tipoEntrega);
  if (req.body?.motivoCancelacion !== undefined) payload.motivoCancelacion = String(req.body.motivoCancelacion);
  if (req.body?.motivoDevolucion !== undefined) payload.motivoDevolucion = String(req.body.motivoDevolucion);

  const actualizado = await prisma.pedido.update({
    where: { id },
    data: payload,
    include: {
      cliente: { select: clienteSafeSelect },
      items: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              precio: true,
              imagen: true,
            },
          },
        },
      },
    },
  });

  return res.json({ success: true, data: actualizado });
};

export const cobrarPedido = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: INVALID_ID' });

  const existing = await prisma.pedido.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  if (req.user.role === 'trabajador') {
    const empleado = await ensureEmpleadoForUser({
      clienteId: Number(req.user.id),
      email: String(req.user.email),
      puntoVentaId: existing.puntoVentaId || undefined,
    });
    if (existing.puntoVentaId && empleado.puntoVentaId && existing.puntoVentaId !== empleado.puntoVentaId) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
  }

  // MVP: cobrar = mover de "pendiente" a "recibido" (representa cobro/aceptación en caja)
  const nextEstado = existing.estado === 'pendiente' ? 'recibido' : existing.estado;

  const actualizado = await prisma.pedido.update({
    where: { id },
    data: { estado: nextEstado },
    include: {
      cliente: { select: clienteSafeSelect },
      items: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              descripcion: true,
              precio: true,
              imagen: true,
            },
          },
        },
      },
    },
  });

  return res.json({ success: true, data: actualizado });
};

