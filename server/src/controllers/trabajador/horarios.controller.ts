import type { Response } from 'express';
import prisma from '../../prisma/client';

function startOfWeekUtc(d: Date): Date {
  // Monday as week start
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0..6 (Sun..Sat)
  const diffToMonday = (day + 6) % 7;
  date.setUTCDate(date.getUTCDate() - diffToMonday);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function endOfWeekUtc(d: Date): Date {
  const start = startOfWeekUtc(d);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
}

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
}): Promise<{ id: number; nombre: string; puntoVentaId: string }> {
  const existing = await prisma.empleado.findUnique({ where: { email: params.email } });
  if (existing) return { id: existing.id, nombre: existing.nombre, puntoVentaId: existing.puntoVentaId };

  const cliente = await prisma.cliente.findUnique({ where: { id: params.clienteId } });
  const nombre = cliente?.nombre || params.email.split('@')[0] || 'Trabajador';
  const puntoVentaId = String(process.env.DEFAULT_PUNTO_VENTA_ID || 'PDV-TIANA');

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

  return { id: nuevo.id, nombre: nuevo.nombre, puntoVentaId: nuevo.puntoVentaId };
}

function toTipoTurno(horaEntrada: string | null | undefined, tipodia: string | null | undefined) {
  const t = String(tipodia || '').toLowerCase();
  if (t && t !== 'laboral') return 'descanso';
  if (!horaEntrada) return 'manana';
  // HH:mm or HH:mm:ss
  const hh = Number(horaEntrada.split(':')[0] || 0);
  if (Number.isFinite(hh) && hh >= 14) return 'tarde';
  return 'manana';
}

/**
 * GET /trabajador/horarios?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Devuelve el horario por día del empleado autenticado.
 */
export const getMisHorarios = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const fromStr = req.query?.from ? String(req.query.from) : null;
  const toStr = req.query?.to ? String(req.query.to) : null;

  let from: Date;
  let to: Date;

  if (fromStr && toStr) {
    from = dayBoundsUtc(fromStr).start;
    to = dayBoundsUtc(toStr).end;
  } else {
    const now = new Date();
    from = startOfWeekUtc(now);
    to = endOfWeekUtc(now);
  }

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
  });

  const rows = await prisma.horarioEmpleado.findMany({
    where: { empleadoId: empleado.id, fecha: { gte: from, lte: to } },
    orderBy: { fecha: 'asc' },
  });

  const outFromRows = rows.map((r) => ({
    id: String(r.id),
    trabajadorId: String(req.user.id),
    trabajadorNombre: empleado.nombre,
    fecha: r.fecha.toISOString().split('T')[0],
    diaSemana: '', // el frontend lo deriva si lo necesita
    tipoTurno: toTipoTurno(r.horaEntrada, r.tipodia),
    horaInicio: r.horaEntrada,
    horaFin: r.horaSalida,
    puntoVentaId: empleado.puntoVentaId,
    puntoVentaNombre: undefined,
    estado: 'confirmado',
    notas: r.observaciones || undefined,
    creadoPor: 'Sistema',
    creadoEn: r.createdAt.toISOString(),
    modificadoPor: undefined,
    modificadoEn: r.updatedAt.toISOString(),
  }));

  // Fallback: si no hay HorarioEmpleado, derivar desde la asignación activa (plantilla Horario)
  if (outFromRows.length === 0) {
    const asignacion = await prisma.asignacionTurno.findFirst({
      where: {
        empleadoId: empleado.id,
        estado: 'activo',
        fechaVigenciaDesde: { lte: to },
        OR: [{ fechaVigenciaHasta: null }, { fechaVigenciaHasta: { gte: from } }],
      },
      include: { horario: true },
      orderBy: { fechaVigenciaDesde: 'desc' },
    });

    if (asignacion && asignacion.horario) {
      const asignacionId = asignacion.id;
      const horario = asignacion.horario as any;
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      const parseRange = (s: string) => {
        const trimmed = String(s || '').trim();
        const parts = trimmed.split('-').map((p) => p.trim());
        if (parts.length !== 2) return null;
        const [ini, fin] = parts;
        if (!ini || !fin) return null;
        return { ini, fin };
      };
      const weekdayKey = (d: Date) => {
        // getUTCDay(): 0 domingo .. 6 sábado
        const wd = d.getUTCDay();
        if (wd === 1) return 'lunes';
        if (wd === 2) return 'martes';
        if (wd === 3) return 'miercoles';
        if (wd === 4) return 'jueves';
        if (wd === 5) return 'viernes';
        if (wd === 6) return 'sabado';
        return 'domingo';
      };

      const startDay = new Date(from);
      startDay.setUTCHours(0, 0, 0, 0);
      const endDay = new Date(to);
      endDay.setUTCHours(0, 0, 0, 0);

      const derived = [];
      for (let d = new Date(startDay); d <= endDay; d.setUTCDate(d.getUTCDate() + 1)) {
        const key = weekdayKey(d);
        const raw = horario[key] as string | null | undefined;
        const parsed = raw ? parseRange(raw) : null;

        const tipodia = parsed ? 'laboral' : 'descanso';
        const horaEntrada = parsed?.ini ?? null;
        const horaSalida = parsed?.fin ?? null;

        derived.push({
          id: `asignacion-${asignacionId}-${fmt(d)}`,
          trabajadorId: String(req.user.id),
          trabajadorNombre: empleado.nombre,
          fecha: fmt(d),
          diaSemana: '',
          tipoTurno: toTipoTurno(horaEntrada, tipodia),
          horaInicio: horaEntrada,
          horaFin: horaSalida,
          puntoVentaId: empleado.puntoVentaId,
          puntoVentaNombre: undefined,
          estado: 'confirmado',
          notas: undefined,
          creadoPor: 'Sistema',
          creadoEn: new Date().toISOString(),
          modificadoPor: undefined,
          modificadoEn: new Date().toISOString(),
        });
      }

      return res.json({ success: true, data: derived });
    }
  }

  return res.json({ success: true, data: outFromRows });
};

/**
 * GET /trabajador/horarios/solicitudes
 */
export const getMisSolicitudesHorario = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
  });

  const rows = await prisma.solicitudCambioHorario.findMany({
    where: { empleadoId: empleado.id },
    orderBy: { solicitadoEn: 'desc' },
  });

  const out = rows.map((r) => ({
    id: String(r.id),
    trabajadorId: String(req.user.id),
    trabajadorNombre: empleado.nombre,
    tipo: r.tipo,
    turnoOriginalId: undefined,
    fechaSolicitada: r.fechaSolicitada.toISOString().split('T')[0],
    motivoSolicitud: r.motivoSolicitud,
    detalles: r.detalles || undefined,
    estado: r.estado,
    respuesta: r.respuesta || undefined,
    solicitadoEn: r.solicitadoEn.toISOString(),
    revisadoPor: r.revisadoPorId ? String(r.revisadoPorId) : undefined,
    revisadoEn: r.revisadoEn ? r.revisadoEn.toISOString() : undefined,
  }));

  return res.json({ success: true, data: out });
};

/**
 * POST /trabajador/horarios/solicitudes
 */
export const crearMiSolicitudHorario = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });

  const tipo = String(req.body?.tipo || '').trim();
  const fechaSolicitada = String(req.body?.fechaSolicitada || '').trim();
  const motivoSolicitud = String(req.body?.motivoSolicitud || '').trim();
  const detalles = req.body?.detalles ? String(req.body.detalles) : undefined;

  const tiposValidos = ['cambio_turno', 'dia_libre', 'cambio_horario', 'intercambio'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: tipo inválido' });
  }
  if (!fechaSolicitada) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: fechaSolicitada requerida' });
  }
  if (!motivoSolicitud) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: motivoSolicitud requerido' });
  }

  const empleado = await ensureEmpleadoForUser({
    clienteId: Number(req.user.id),
    email: String(req.user.email),
  });

  const created = await prisma.solicitudCambioHorario.create({
    data: {
      empleadoId: empleado.id,
      tipo,
      fechaSolicitada: dayBoundsUtc(fechaSolicitada).start,
      motivoSolicitud,
      detalles: detalles || null,
      estado: 'pendiente',
    },
  });

  return res.status(201).json({
    success: true,
    data: {
      id: String(created.id),
      trabajadorId: String(req.user.id),
      trabajadorNombre: empleado.nombre,
      tipo: created.tipo,
      fechaSolicitada: created.fechaSolicitada.toISOString().split('T')[0],
      motivoSolicitud: created.motivoSolicitud,
      detalles: created.detalles || undefined,
      estado: created.estado,
      solicitadoEn: created.solicitadoEn.toISOString(),
    },
  });
};

