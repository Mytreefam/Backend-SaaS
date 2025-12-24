import { ChatModel } from '../models/chat.model';

export const getAllChats = async (req: any, res: any) => {
  const { clienteId, pedidoId } = req.query;
  const filter: any = {};
  if (clienteId) filter.clienteId = Number(clienteId);
  if (pedidoId) filter.pedidoId = Number(pedidoId);
  const chats = await ChatModel.findAll(filter);
  res.json(chats);
};

export const getChatById = async (req: any, res: any) => {
  const { id } = req.params;
  const chat = await ChatModel.findById(Number(id));
  if (!chat) return res.status(404).json({ error: 'No encontrado' });
  res.json(chat);
};

export const createChat = async (req: any, res: any) => {
  const chat = await ChatModel.create(req.body);
  res.status(201).json(chat);
};

export const updateChat = async (req: any, res: any) => {
  const { id } = req.params;
  const chat = await ChatModel.update(Number(id), req.body);
  res.json(chat);
};

export const deleteChat = async (req: any, res: any) => {
  const { id } = req.params;
  await ChatModel.delete(Number(id));
  res.status(204).end();
};

export const addMensaje = async (req: any, res: any) => {
  const { chatId } = req.params;
  const mensaje = await ChatModel.addMensaje(Number(chatId), req.body);
  res.status(201).json(mensaje);
};

export const deleteMensaje = async (req: any, res: any) => {
  const { id } = req.params;
  await ChatModel.deleteMensaje(Number(id));
  res.status(204).end();
};
