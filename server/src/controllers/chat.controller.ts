import { ChatModel } from '../models/chat.model';

export const getAllChats = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  const { clienteId, pedidoId } = req.query;
  const filter: any = {};
  if (isStaff) {
    if (clienteId) filter.clienteId = Number(clienteId);
  } else {
    filter.clienteId = req.user.id;
  }
  if (pedidoId) filter.pedidoId = Number(pedidoId);
  const chats = await ChatModel.findAll(filter);
  res.json(chats);
};

export const getChatById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  const { id } = req.params;
  const chat = await ChatModel.findById(Number(id));
  if (!chat) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff && chat.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json(chat);
};

export const createChat = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';

  const payload: any = {
    asunto: req.body?.asunto,
    estado: req.body?.estado,
    pedidoId: req.body?.pedidoId ?? null,
    mensajes: req.body?.mensajes,
  };
  payload.clienteId = isStaff && req.body?.clienteId ? Number(req.body.clienteId) : req.user.id;

  const chat = await ChatModel.create(payload);
  res.status(201).json(chat);
};

export const updateChat = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  const { id } = req.params;
  const existing = await ChatModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const payload: any = {
    asunto: req.body?.asunto,
    estado: req.body?.estado,
  };

  const chat = await ChatModel.update(Number(id), payload);
  res.json(chat);
};

export const deleteChat = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  const { id } = req.params;
  const existing = await ChatModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (!isStaff && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  const [, deletedChat] = (await ChatModel.delete(Number(id))) as any;
  res.json({ deleted: true, chat: deletedChat });
};

export const addMensaje = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  const { chatId } = req.params;
  const chat = await ChatModel.findById(Number(chatId));
  if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
  if (!isStaff && chat.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }

  const payload: any = {
    contenido: req.body?.contenido,
    remitente: req.body?.remitente,
    leido: req.body?.leido ?? false,
  };

  const mensaje = await ChatModel.addMensaje(Number(chatId), payload);
  res.status(201).json(mensaje);
};

export const deleteMensaje = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  // NOTE: without joining to chat, we cannot strictly enforce ownership here.
  // For now, restrict deletes to staff only.
  const isStaff = req.user.role === 'gerente' || req.user.role === 'trabajador';
  if (!isStaff) return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  const { id } = req.params;
  await ChatModel.deleteMensaje(Number(id));
  res.status(204).end();
};
