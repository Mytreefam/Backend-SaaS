import type { Response } from 'express';
import prisma from '../../prisma/client';

async function ensureEmpleadoForUser(params: {
  clienteId: number;
  email: string;
  puntoVentaId?: string;
}): Promise<{ id: number; puntoVentaId: string }> {
  const existing = await prisma.empleado.findUnique({ where: { email: params.email } });
  if (existing) return { id: existing.id, puntoVentaId: existing.puntoVentaId };

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

export const listMisVacaciones = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const list = await prisma.trabajadorSolicitudVacaciones.findMany({
    where: { empleadoId: empleado.id },
    orderBy: { creadoEn: 'desc' },
  });
  return res.json({ success: true, data: list });
};

export const crearMisVacaciones = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const body = req.body || {};
  const desde = new Date(String(body.desde));
  const hasta = new Date(String(body.hasta));
  const motivo = String(body.motivo || '').trim();
  if (!motivo || Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime())) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const created = await prisma.trabajadorSolicitudVacaciones.create({
    data: { empleadoId: empleado.id, desde, hasta, motivo, estado: 'pendiente' },
  });
  return res.status(201).json({ success: true, data: created });
};

export const listMisHorasExtra = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const list = await prisma.trabajadorSolicitudHoraExtra.findMany({
    where: { empleadoId: empleado.id },
    orderBy: { creadoEn: 'desc' },
  });
  return res.json({ success: true, data: list });
};

export const crearMisHorasExtra = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const body = req.body || {};
  const fecha = new Date(String(body.fecha));
  const horaInicio = String(body.horaInicio || '').trim();
  const horaFin = String(body.horaFin || '').trim();
  const motivo = String(body.motivo || '').trim();
  if (!motivo || !horaInicio || !horaFin || Number.isNaN(fecha.getTime())) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const created = await prisma.trabajadorSolicitudHoraExtra.create({
    data: { empleadoId: empleado.id, fecha, horaInicio, horaFin, motivo, estado: 'pendiente' },
  });
  return res.status(201).json({ success: true, data: created });
};

export const listMisConsumos = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const list = await prisma.trabajadorConsumoInterno.findMany({
    where: { empleadoId: empleado.id },
    orderBy: { fecha: 'desc' },
  });
  return res.json({ success: true, data: list });
};

export const crearMiConsumo = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const body = req.body || {};
  const producto = String(body.producto || '').trim();
  const categoria = String(body.categoria || '').trim();
  const cantidad = Number(body.cantidad ?? 1);
  const precio = Number(body.precio ?? 0);
  const fecha = body.fecha ? new Date(String(body.fecha)) : new Date();
  const notas = typeof body.notas === 'string' ? body.notas : null;
  if (!producto || !categoria || !Number.isFinite(cantidad) || cantidad <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const created = await prisma.trabajadorConsumoInterno.create({
    data: {
      empleadoId: empleado.id,
      producto,
      categoria,
      cantidad,
      precio: Number.isFinite(precio) ? precio : 0,
      fecha: Number.isNaN(fecha.getTime()) ? new Date() : fecha,
      notas,
    },
  });
  return res.status(201).json({ success: true, data: created });
};

export const listMisGastos = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const list = await prisma.trabajadorGasto.findMany({
    where: { empleadoId: empleado.id },
    orderBy: { fechaGasto: 'desc' },
  });
  return res.json({ success: true, data: list });
};

export const crearMiGasto = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const body = req.body || {};
  const concepto = String(body.concepto || '').trim();
  const categoria = String(body.categoria || '').trim();
  const importe = Number(body.importe);
  const fechaGasto = body.fechaGasto ? new Date(String(body.fechaGasto)) : new Date();
  const justificanteUrl = typeof body.justificanteUrl === 'string' ? body.justificanteUrl : null;
  const notas = typeof body.notas === 'string' ? body.notas : null;
  if (!concepto || !categoria || !Number.isFinite(importe) || importe <= 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR' });
  }

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const created = await prisma.trabajadorGasto.create({
    data: {
      empleadoId: empleado.id,
      concepto,
      categoria,
      importe,
      fechaGasto: Number.isNaN(fechaGasto.getTime()) ? new Date() : fechaGasto,
      estado: 'pendiente',
      justificanteUrl,
      notas,
    },
  });
  return res.status(201).json({ success: true, data: created });
};

