import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const NotificacionModel = {
  async findAll() {
    return prisma.notificacion.findMany();
  },
  async findById(id: number) {
    return prisma.notificacion.findUnique({ where: { id } });
  },
  async create(data: any) {
    return prisma.notificacion.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.notificacion.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.notificacion.delete({ where: { id } });
  }
};
