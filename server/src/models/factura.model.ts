import prisma from '../prisma/client';

export const FacturaModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.factura.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: true, pedido: true },
    });
  },
  async findById(id: number) {
    return prisma.factura.findUnique({ where: { id }, include: { cliente: true, pedido: true } });
  },
  async create(data: any) {
    return prisma.factura.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.factura.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.factura.delete({ where: { id } });
  }
};
