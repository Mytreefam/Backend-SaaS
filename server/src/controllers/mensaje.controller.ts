import { MensajeModel } from '../models/mensaje.model';

export const getMensajesByChat = async (req: any, res: any) => {
  const { chatId } = req.params;
  const mensajes = await MensajeModel.findAll(Number(chatId));
  res.json(mensajes);
};

export const getMensajeById = async (req: any, res: any) => {
  const { id } = req.params;
  const mensaje = await MensajeModel.findById(Number(id));
  if (!mensaje) return res.status(404).json({ error: 'No encontrado' });
  res.json(mensaje);
};

export const createMensaje = async (req: any, res: any) => {
  const mensaje = await MensajeModel.create(req.body);
  res.status(201).json(mensaje);
};

export const updateMensaje = async (req: any, res: any) => {
  const { id } = req.params;
  const mensaje = await MensajeModel.update(Number(id), req.body);
  res.json(mensaje);
};

export const deleteMensaje = async (req: any, res: any) => {
  const { id } = req.params;
  await MensajeModel.delete(Number(id));
  res.status(204).end();
};
