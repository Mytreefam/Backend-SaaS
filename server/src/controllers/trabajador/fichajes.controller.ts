import type { Request, Response } from 'express';
import prisma from '../../prisma/client';

function dayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

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

export const getMisFichajes = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const fecha = String(req.query?.fecha || '').trim();

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
  });

  const where: any = { empleadoId: empleado.id };
  if (fecha) {
    const { start, end } = dayBoundsUtc(fecha);
    where.fecha = { gte: start, lte: end };
  }

  const fichajes = await prisma.fichaje.findMany({
    where,
    orderBy: { creadoEn: 'asc' },
  });

  const out = fichajes.map((f) => ({
    id: f.id,
    empleadoId: f.empleadoId,
    tipo: f.tipo,
    fecha: f.fecha.toISOString().split('T')[0],
    hora: f.hora,
    notas: f.observaciones,
    puntoVentaId: f.puntoVentaId,
  }));

  return res.json({ success: true, data: out });
};

export const crearMiFichaje = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const tipo = String(req.body?.tipo || '').trim();
  const puntoVentaIdRaw = req.body?.puntoVentaId ? String(req.body.puntoVentaId) : '';
  const puntoVentaId = puntoVentaIdRaw.trim();
  const notas = req.body?.notas ? String(req.body.notas) : undefined;
  const fecha = req.body?.fecha ? String(req.body.fecha) : undefined;
  const hora = req.body?.hora ? String(req.body.hora) : undefined;

  const tiposValidos = ['entrada', 'salida', 'pausa', 'reanudacion'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: tipo de fichaje no válido' });
  }

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
    puntoVentaId: puntoVentaId || undefined,
  });

  const resolvedPuntoVentaId = puntoVentaId || empleado.puntoVentaId || String(process.env.DEFAULT_PUNTO_VENTA_ID || 'PDV-TIANA');

  const fichaje = await prisma.fichaje.create({
    data: {
      empleadoId: empleado.id,
      tipo,
      fecha: fecha ? new Date(fecha) : new Date(),
      hora: hora || new Date().toTimeString().split(' ')[0],
      horaTeorica: hora || new Date().toTimeString().split(' ')[0],
      diferenciaMinutos: 0,
      observaciones: notas || null,
      validado: true,
      puntoVentaId: resolvedPuntoVentaId,
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      id: fichaje.id,
      empleadoId: fichaje.empleadoId,
      tipo: fichaje.tipo,
      fecha: fichaje.fecha.toISOString().split('T')[0],
      hora: fichaje.hora,
      notas: fichaje.observaciones,
      puntoVentaId: fichaje.puntoVentaId,
    },
  });
};

export const getMiEstadoFichaje = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
  });

  const today = new Date();
  const yyyyMmDd = today.toISOString().split('T')[0];
  const { start, end } = dayBoundsUtc(yyyyMmDd);

  const fichajesHoy = await prisma.fichaje.findMany({
    where: { empleadoId: empleado.id, fecha: { gte: start, lte: end } },
    orderBy: { creadoEn: 'asc' },
  });

  let enTurno = false;
  let pausado = false;
  let horaEntrada: string | undefined;
  let puntoVentaId: string | undefined;

  for (const f of fichajesHoy) {
    if (f.tipo === 'entrada') {
      enTurno = true;
      pausado = false;
      horaEntrada = f.hora;
      puntoVentaId = f.puntoVentaId;
    } else if (f.tipo === 'salida') {
      enTurno = false;
      pausado = false;
    } else if (f.tipo === 'pausa') {
      if (enTurno) pausado = true;
    } else if (f.tipo === 'reanudacion') {
      if (enTurno) pausado = false;
    }
  }

  // tiempo trabajado (segundos) desde última entrada
  let tiempoTrabajado = 0;
  if (enTurno && horaEntrada) {
    const [h, m, s] = horaEntrada.split(':').map((x) => Number(x));
    const entrada = new Date();
    entrada.setHours(h || 0, m || 0, s || 0, 0);
    tiempoTrabajado = Math.max(0, Math.floor((Date.now() - entrada.getTime()) / 1000));
  }

  let puntoVentaNombre: string | undefined;
  if (puntoVentaId) {
    const pv = await prisma.puntoVenta.findUnique({ where: { id: puntoVentaId } });
    puntoVentaNombre = pv?.nombre || undefined;
  }

  return res.json({
    success: true,
    data: {
      empleadoId: empleado.id,
      enTurno,
      pausado,
      horaEntrada,
      tiempoTrabajado,
      puntoVentaId,
      puntoVentaNombre,
    },
  });
};

