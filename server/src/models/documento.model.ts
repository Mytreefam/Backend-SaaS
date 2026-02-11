import prisma from '../prisma/client';

const clienteSafeSelect = {
  id: true,
  codigo: true,
  nombre: true,
  email: true,
  telefono: true,
  creadoEn: true,
  role: true,
  avatar: true,
  ciudad: true,
  idioma: true,
} as const;

export const DocumentoModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.documento.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: { select: clienteSafeSelect } },
    });
  },
  async findById(id: number) {
    return prisma.documento.findUnique({ where: { id }, include: { cliente: { select: clienteSafeSelect } } });
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
