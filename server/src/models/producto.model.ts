import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const ProductoModel = {
  async findAll() {
    return prisma.producto.findMany();
  },
  async findById(id: number) {
    return prisma.producto.findUnique({ where: { id } });
  },
  async create(data: any) {
    return prisma.producto.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.producto.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.producto.delete({ where: { id } });
  }
};
