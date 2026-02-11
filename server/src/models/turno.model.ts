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

export const TurnoModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.turno.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: { select: clienteSafeSelect }, pedido: true },
      orderBy: { creadoEn: 'desc' },
    });
  },
  async findById(id: number) {
    return prisma.turno.findUnique({ where: { id }, include: { cliente: { select: clienteSafeSelect }, pedido: true } });
  },
  async create(data: any) {
    return prisma.turno.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.turno.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.turno.delete({ where: { id } });
  }
};
