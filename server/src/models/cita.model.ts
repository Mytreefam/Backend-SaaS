import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const CitaModel = {
  async findAll() {
    return prisma.cita.findMany({ include: { cliente: true } });
  },
  async findById(id: number) {
    return prisma.cita.findUnique({ where: { id }, include: { cliente: true } });
  },
  async create(data: any) {
    return prisma.cita.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.cita.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.cita.delete({ where: { id } });
  }
};
