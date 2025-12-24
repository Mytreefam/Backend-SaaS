import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const CuponModel = {
  async findAll() {
    return prisma.cupon.findMany();
  },
  async findById(id: number) {
    return prisma.cupon.findUnique({ where: { id } });
  },
  async create(data: any) {
    return prisma.cupon.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.cupon.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.cupon.delete({ where: { id } });
  }
};
