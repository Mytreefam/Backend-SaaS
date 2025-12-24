import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export const getChats = async (req: Request, res: Response) => {
  const { clienteId, pedidoId } = req.query;
  const where: any = {};
  if (clienteId) where.clienteId = Number(clienteId);
  if (pedidoId) where.pedidoId = Number(pedidoId);
  const chats = await prisma.chat.findMany({
    where,
    include: { mensajes: true },
    orderBy: { creadoEn: 'desc' },
  });
  res.json(chats);
};

export const getChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const chat = await prisma.chat.findUnique({
    where: { id: Number(id) },
    include: { mensajes: true },
  });
  if (!chat) return res.status(404).json({ error: 'Chat no encontrado' });
  res.json(chat);
};

export const createChat = async (req: Request, res: Response) => {
  const { asunto, clienteId, pedidoId, estado, mensajes } = req.body;
  const chat = await prisma.chat.create({
    data: {
      asunto,
      estado: estado || 'abierto',
      clienteId,
      pedidoId,
      mensajes: mensajes ? { create: mensajes } : undefined,
    },
    include: { mensajes: true },
  });
  res.status(201).json(chat);
};

export const updateChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { asunto, estado } = req.body;
  const chat = await prisma.chat.update({
    where: { id: Number(id) },
    data: { asunto, estado },
    include: { mensajes: true },
  });
  res.json(chat);
};

export const deleteChat = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.mensaje.deleteMany({ where: { chatId: Number(id) } });
  await prisma.chat.delete({ where: { id: Number(id) } });
  res.json({ success: true });
};

export const addMensaje = async (req: Request, res: Response) => {
  const { chatId } = req.params;
  const { autor, texto } = req.body;
  const mensaje = await prisma.mensaje.create({
    data: {
      chatId: Number(chatId),
      autor,
      texto,
    },
  });
  res.status(201).json(mensaje);
};

export const deleteMensaje = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.mensaje.delete({ where: { id: Number(id) } });
  res.json({ success: true });
};
