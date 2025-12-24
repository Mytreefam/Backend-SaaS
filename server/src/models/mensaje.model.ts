import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const MensajeModel = {
  async findAll(chatId: number) {
    return prisma.mensaje.findMany({
      where: { chatId },
      orderBy: { fecha: 'asc' }
    });
  },
  async findById(id: number) {
    return prisma.mensaje.findUnique({ where: { id } });
  },
  async create(data: any) {
    return prisma.mensaje.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.mensaje.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.mensaje.delete({ where: { id } });
  }
};
