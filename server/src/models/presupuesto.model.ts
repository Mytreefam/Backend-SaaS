import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const PresupuestoModel = {
  async findAll() {
    return prisma.presupuesto.findMany({ include: { cliente: true } });
  },
  async findById(id: number) {
    return prisma.presupuesto.findUnique({ where: { id }, include: { cliente: true } });
  },
  async create(data: any) {
    return prisma.presupuesto.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.presupuesto.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.presupuesto.delete({ where: { id } });
  }
};
