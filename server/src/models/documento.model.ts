import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const DocumentoModel = {
  async findAll() {
    return prisma.documento.findMany({ include: { cliente: true } });
  },
  async findById(id: number) {
    return prisma.documento.findUnique({ where: { id }, include: { cliente: true } });
  },
  async create(data: any) {
    return prisma.documento.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.documento.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.documento.delete({ where: { id } });
  }
};
