import prisma from '../prisma/client';

export const TurnoModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.turno.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: true, pedido: true },
    });
  },
  async findById(id: number) {
    return prisma.turno.findUnique({ where: { id }, include: { cliente: true, pedido: true } });
  },
  async create(data: any) {
    return prisma.turno.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.turno.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.turno.delete({ where: { id } });
  }
};
