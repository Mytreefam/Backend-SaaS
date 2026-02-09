import { NotificacionModel } from '../models/notificacion.model';

export const getAllNotificaciones = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const notifs =
    req.user.role === 'gerente'
      ? await NotificacionModel.findAll()
      : await NotificacionModel.findAll({ clienteId: req.user.id });
  res.json(notifs);
};

export const getNotificacionById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const notif = await NotificacionModel.findById(Number(id));
  if (!notif) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && notif.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json(notif);
};

export const createNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const payload = { ...req.body };
  if (req.user.role !== 'gerente') {
    payload.clienteId = req.user.id;
  }
  const nueva = await NotificacionModel.create(payload);
  res.status(201).json(nueva);
};

export const updateNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await NotificacionModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  const actualizada = await NotificacionModel.update(Number(id), req.body);
  res.json(actualizada);
};

export const deleteNotificacion = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await NotificacionModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrada' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await NotificacionModel.delete(Number(id));
  res.status(204).end();
};
