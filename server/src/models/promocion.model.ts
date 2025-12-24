import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const PromocionModel = {
  async findAll() {
    return prisma.promocion.findMany();
  },
  async findById(id: number) {
    return prisma.promocion.findUnique({ where: { id } });
  },
  async create(data: any) {
    return prisma.promocion.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.promocion.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.promocion.delete({ where: { id } });
  }
};
