import prisma from '../prisma/client';

export const ChatModel = {
  async findAll(filter: any = {}) {
    return prisma.chat.findMany({
      where: filter,
      include: { mensajes: true, cliente: true, pedido: true },
      orderBy: { creadoEn: 'desc' }
    });
  },
  async findById(id: number) {
    return prisma.chat.findUnique({
      where: { id },
      include: { mensajes: true, cliente: true, pedido: true }
    });
  },
  async create(data: any) {
    const { mensajes, ...chatData } = data;
    return prisma.chat.create({
      data: {
        ...chatData,
        mensajes: mensajes ? { create: mensajes } : undefined
      },
      include: { mensajes: true }
    });
  },
  async update(id: number, data: any) {
    return prisma.chat.update({
      where: { id },
      data,
      include: { mensajes: true }
    });
  },
  async delete(id: number) {
    return prisma.$transaction([
      prisma.mensaje.deleteMany({ where: { chatId: id } }),
      prisma.chat.delete({ where: { id } }),
    ]);
  },
  async addMensaje(chatId: number, mensaje: any) {
    return prisma.mensaje.create({
      data: { ...mensaje, chatId }
    });
  },
  async deleteMensaje(id: number) {
    return prisma.mensaje.delete({ where: { id } });
  }
};
