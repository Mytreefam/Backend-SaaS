import prisma from '../prisma/client';

export const NotificacionModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.notificacion.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
    });
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
