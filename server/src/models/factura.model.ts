import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const FacturaModel = {
  async findAll() {
    return prisma.factura.findMany({ include: { cliente: true, pedido: true } });
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
