import { NotificacionModel } from '../models/notificacion.model';
import prisma from '../prisma/client';
import { deliverNotification } from '../services/notificationDelivery.service';

function defaultPreferencias(clienteId: number) {
  // Keep shape compatible with frontend `NotificationPreferences`
  return {
    usuarioId: String(clienteId),
    canalesActivos: {
      email: true,
      push: true,
      sms: false,
      in_app: true,
    },
    preferencias: {
      pedido: { activo: true, canales: ['push', 'in_app'], sonido: true },
      stock: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      cita: { activo: true, canales: ['push', 'in_app', 'sms'], sonido: true },
      promocion: { activo: true, canales: ['push', 'in_app'], sonido: false },
      sistema: { activo: true, canales: ['in_app'], sonido: false },
      pago: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      alerta: { activo: true, canales: ['push', 'in_app', 'sms', 'email'], sonido: true },
      mensaje: { activo: true, canales: ['push', 'in_app'], sonido: true },
      rrhh: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      invitacion: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      fichaje: { activo: true, canales: ['push', 'in_app'], sonido: true },
      nomina: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      vacaciones: { activo: true, canales: ['push', 'in_app', 'email'], sonido: true },
      formacion: { activo: true, canales: ['push', 'in_app'], sonido: false },
    },
    horarioSilencioso: {
      activo: false,
      inicio: '22:00',
      fin: '08:00',
    },
    frecuenciaEmail: 'inmediato',
    agruparNotificaciones: true,
    actualizadoEn: new Date().toISOString(),
  };
}

function mergePreferencias(base: any, patch: any): any {
  if (!patch || typeof patch !== 'object') return base;
  const out: any = { ...(base || {}) };

  // shallow merge top-level
  for (const [k, v] of Object.entries(patch)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = { ...(out[k] || {}), ...(v as any) };
    } else {
      out[k] = v;
    }
  }

  // deeper merge for nested known objects
  if (patch?.canalesActivos && typeof patch.canalesActivos === 'object') {
    out.canalesActivos = { ...(base?.canalesActivos || {}), ...(patch.canalesActivos || {}) };
  }
  if (patch?.horarioSilencioso && typeof patch.horarioSilencioso === 'object') {
    out.horarioSilencioso = { ...(base?.horarioSilencioso || {}), ...(patch.horarioSilencioso || {}) };
  }
  if (patch?.preferencias && typeof patch.preferencias === 'object') {
    out.preferencias = { ...(base?.preferencias || {}) };
    for (const [tipo, cfg] of Object.entries(patch.preferencias)) {
      out.preferencias[tipo] = { ...(base?.preferencias?.[tipo] || {}), ...(cfg as any) };
    }
  }

  out.actualizadoEn = new Date().toISOString();
  return out;
}

export const getAllNotificaciones = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const notifs =
    req.user.role === 'gerente'
      ? await NotificacionModel.findAll()
      : await NotificacionModel.findAll({ clienteId: req.user.id });
  res.json({ success: true, data: notifs });
};

export const getNotificacionById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const notif = await NotificacionModel.findById(Number(id));
  if (!notif) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (req.user.role !== 'gerente' && notif.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json({ success: true, data: notif });
};

export const createNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  // Mass-assignment prevention
  const payload: any = {
    mensaje: req.body?.mensaje,
    leida: req.body?.leida !== undefined ? Boolean(req.body.leida) : false,
    titulo: req.body?.titulo ? String(req.body.titulo) : null,
    tipo: req.body?.tipo ? String(req.body.tipo) : null,
    prioridad: req.body?.prioridad ? String(req.body.prioridad) : null,
  };
  if (req.user.role === 'gerente' && req.body?.clienteId != null) {
    payload.clienteId = Number(req.body.clienteId);
  } else {
    payload.clienteId = req.user.id;
  }
  const nueva = await NotificacionModel.create(payload);

  // Fire-and-forget delivery (never block API response)
  void deliverNotification({
    clienteId: nueva.clienteId,
    titulo: nueva.titulo || 'Nueva notificación',
    mensaje: nueva.mensaje,
    data: { notificacionId: String(nueva.id) },
  }).catch(() => {});

  res.status(201).json({ success: true, data: nueva });
};

export const updateNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await NotificacionModel.findById(Number(id));
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  const payload: any = {
    leida: req.body?.leida !== undefined ? Boolean(req.body.leida) : undefined,
    mensaje: req.body?.mensaje !== undefined ? String(req.body.mensaje) : undefined,
    titulo: req.body?.titulo !== undefined ? (req.body.titulo ? String(req.body.titulo) : null) : undefined,
    tipo: req.body?.tipo !== undefined ? (req.body.tipo ? String(req.body.tipo) : null) : undefined,
    prioridad: req.body?.prioridad !== undefined ? (req.body.prioridad ? String(req.body.prioridad) : null) : undefined,
  };
  const actualizada = await NotificacionModel.update(Number(id), payload);
  res.json({ success: true, data: actualizada });
};

export const deleteNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await NotificacionModel.findById(Number(id));
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await NotificacionModel.delete(Number(id));
  res.status(200).json({ success: true, data: { deleted: true } });
};

export const getPreferencias = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const clienteId = Number(req.user.id);

  const existing = await prisma.notificacionPreferencias.findUnique({ where: { clienteId } });
  if (existing) {
    return res.json({ success: true, data: existing.data });
  }

  const created = await prisma.notificacionPreferencias.create({
    data: { clienteId, data: defaultPreferencias(clienteId) as any },
  });
  return res.json({ success: true, data: created.data });
};

export const updatePreferencias = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const clienteId = Number(req.user.id);
  const patch = req.body || {};

  const existing = await prisma.notificacionPreferencias.findUnique({ where: { clienteId } });
  const base = existing?.data ?? defaultPreferencias(clienteId);
  const merged = mergePreferencias(base, patch);

  const saved = await prisma.notificacionPreferencias.upsert({
    where: { clienteId },
    update: { data: merged as any },
    create: { clienteId, data: merged as any },
  });

  return res.json({ success: true, data: { preferencias: saved.data } });
};

export const registerPushDeviceToken = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const clienteId = Number(req.user.id);
  const token = String(req.body?.token || '').trim();
  const platform = String(req.body?.platform || 'unknown').trim();

  if (!token) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: token requerido' });

  const device = await prisma.pushDeviceToken.upsert({
    where: { token },
    update: { clienteId, platform, lastSeenEn: new Date(), revokedEn: null },
    create: { clienteId, token, platform, lastSeenEn: new Date() },
  });

  return res.json({ success: true, data: { ok: true, deviceId: device.id } });
};

export const sendTestNotification = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const clienteId = Number(req.user.id);

  const notif = await prisma.notificacion.create({
    data: { clienteId, mensaje: 'Notificación de prueba ✅', titulo: 'Notificación de prueba', tipo: 'sistema', prioridad: 'media' },
  });

  const delivery = await deliverNotification({
    clienteId,
    titulo: 'Notificación de prueba',
    mensaje: notif.mensaje,
    data: { notificacionId: String(notif.id), type: 'test' },
  });

  return res.status(201).json({ success: true, data: { ok: true, notificacionId: notif.id, delivery } });
};
