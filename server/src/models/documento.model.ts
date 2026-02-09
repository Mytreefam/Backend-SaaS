import prisma from '../prisma/client';

export const DocumentoModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.documento.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: true },
    });
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
