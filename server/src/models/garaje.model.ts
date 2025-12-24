import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const GarajeModel = {
  async findAll() {
    return prisma.garaje.findMany({ include: { cliente: true } });
  },
  async findById(id: number) {
    return prisma.garaje.findUnique({ where: { id }, include: { cliente: true } });
  },
  async create(data: any) {
    return prisma.garaje.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.garaje.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.garaje.delete({ where: { id } });
  }
};
