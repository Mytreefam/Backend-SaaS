import { NotificacionModel } from '../models/notificacion.model';

export const getAllNotificaciones = async (req: any, res: any) => {
  const notifs = await NotificacionModel.findAll();
  res.json(notifs);
};

export const getNotificacionById = async (req: any, res: any) => {
  const { id } = req.params;
  const notif = await NotificacionModel.findById(Number(id));
  if (!notif) return res.status(404).json({ error: 'No encontrada' });
  res.json(notif);
};

export const createNotificacion = async (req: any, res: any) => {
  const nueva = await NotificacionModel.create(req.body);
  res.status(201).json(nueva);
};

export const updateNotificacion = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizada = await NotificacionModel.update(Number(id), req.body);
  res.json(actualizada);
};

export const deleteNotificacion = async (req: any, res: any) => {
  const { id } = req.params;
  await NotificacionModel.delete(Number(id));
  res.status(204).end();
};
