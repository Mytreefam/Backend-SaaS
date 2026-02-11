import type { Response } from 'express';
import prisma from '../../prisma/client';

function dayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const d = new Date(dateStr);
  const start = new Date(d);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

async function ensureEmpleadoForUser(params: { clienteId: number; email: string }): Promise<{ id: number }> {
  const existing = await prisma.empleado.findUnique({ where: { email: params.email } });
  if (existing) return { id: existing.id };

  const cliente = await prisma.cliente.findUnique({ where: { id: params.clienteId } });
  const nombre = cliente?.nombre || params.email.split('@')[0] || 'Trabajador';

  const nuevo = await prisma.empleado.create({
    data: {
      nombre,
      email: params.email,
      telefono: cliente?.telefono || '',
      foto: cliente?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(nombre)}`,
      puesto: 'Trabajador',
      empresaId: String(process.env.DEFAULT_EMPRESA_ID || 'HOYPCM000'),
      marcaId: String(process.env.DEFAULT_MARCA_ID || 'CAFE01'),
      puntoVentaId: String(process.env.DEFAULT_PUNTO_VENTA_ID || 'PDV-TIANA'),
      horarioEntrada: '09:00',
      horarioSalida: '17:00',
      turno: null,
      salarioBase: 0,
      estado: 'activo',
      desempeno: 0,
      horasMes: 0,
    },
  });

  return { id: nuevo.id };
}

function normalizePrioridad(value: string | null | undefined): 'alta' | 'media' | 'baja' {
  const v = String(value || '').toLowerCase();
  if (v.includes('urgente') || v.includes('alta')) return 'alta';
  if (v.includes('baja')) return 'baja';
  return 'media';
}

function normalizeEstado(value: string | null | undefined): 'pendiente' | 'en_progreso' | 'completada' | 'cancelada' {
  const v = String(value || '').toLowerCase();
  if (v.includes('en_progreso') || v.includes('progreso')) return 'en_progreso';
  if (v.includes('complet')) return 'completada';
  if (v.includes('cancel')) return 'cancelada';
  return 'pendiente';
}

export const listMisTareas = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const fecha = req.query?.fecha ? String(req.query.fecha) : undefined;

  const where: any = { asignadoAId: empleado.id };
  if (fecha) {
    const { start, end } = dayBoundsUtc(fecha);
    where.fechaAsignacion = { gte: start, lte: end };
  } else {
    // Default: last 30 days to keep it bounded
    const since = new Date();
    since.setDate(since.getDate() - 30);
    where.fechaAsignacion = { gte: since };
  }

  const tareas = await prisma.tareaOperativa.findMany({
    where,
    orderBy: [{ prioridad: 'desc' }, { fechaVencimiento: 'asc' }, { creadoEn: 'desc' }],
  });

  // Map to the frontend expected shape (TareaTrabajador)
  const out = tareas.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    descripcion: t.descripcion,
    estado: normalizeEstado(t.estado),
    prioridad: normalizePrioridad(t.prioridad),
    tipo: (t.esFormacion || t.tipo === 'formacion') ? 'formacion' : 'operativa',
    empleadoId: t.asignadoAId ?? empleado.id,
    empresaId: 0,
    fechaCreacion: t.creadoEn.toISOString(),
    fechaLimite: t.fechaVencimiento ? t.fechaVencimiento.toISOString().split('T')[0] : undefined,
    fechaCompletada: t.fechaCompletada ? t.fechaCompletada.toISOString() : undefined,
    notas: t.comentarioTrabajador ?? undefined,
    // Training fields (optional for UI)
    esFormacion: t.esFormacion,
    moduloFormacionId: t.moduloFormacionId ?? undefined,
    duracionEstimada: t.duracionEstimada ?? undefined,
    urlRecurso: t.urlRecurso ?? undefined,
  }));

  return res.json({ success: true, data: out });
};

export const updateMiTarea = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: INVALID_ID' });

  const empleado = await ensureEmpleadoForUser({ clienteId: Number(req.user.id), email: String(req.user.email) });
  const tarea = await prisma.tareaOperativa.findUnique({ where: { id } });
  if (!tarea) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (tarea.asignadoAId !== empleado.id) return res.status(403).json({ success: false, error: 'FORBIDDEN' });

  const data: any = {};
  if (req.body?.estado !== undefined) {
    data.estado = String(req.body.estado);
    if (String(req.body.estado).toLowerCase().includes('en_progreso') && !tarea.fechaInicio) {
      data.fechaInicio = new Date();
    }
    if (String(req.body.estado).toLowerCase().includes('complet') && !tarea.fechaCompletada) {
      data.fechaCompletada = new Date();
    }
  }
  if (req.body?.notas !== undefined) data.comentarioTrabajador = String(req.body.notas);

  const updated = await prisma.tareaOperativa.update({ where: { id }, data });

  return res.json({
    success: true,
    data: {
      id: updated.id,
      titulo: updated.titulo,
      descripcion: updated.descripcion,
      estado: normalizeEstado(updated.estado),
      prioridad: normalizePrioridad(updated.prioridad),
      tipo: (updated.esFormacion || updated.tipo === 'formacion') ? 'formacion' : 'operativa',
      empleadoId: updated.asignadoAId ?? empleado.id,
      empresaId: 0,
      fechaCreacion: updated.creadoEn.toISOString(),
      fechaLimite: updated.fechaVencimiento ? updated.fechaVencimiento.toISOString().split('T')[0] : undefined,
      fechaCompletada: updated.fechaCompletada ? updated.fechaCompletada.toISOString() : undefined,
      notas: updated.comentarioTrabajador ?? undefined,
      esFormacion: updated.esFormacion,
      moduloFormacionId: updated.moduloFormacionId ?? undefined,
      duracionEstimada: updated.duracionEstimada ?? undefined,
      urlRecurso: updated.urlRecurso ?? undefined,
    },
  });
};

export const completarMiTarea = async (req: any, res: Response) => {
  req.body = { ...(req.body || {}), estado: 'completada' };
  return updateMiTarea(req, res);
};

