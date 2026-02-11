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

export const FacturaModel = {
  async findAll(params?: { clienteId?: number }) {
    return prisma.factura.findMany({
      where: params?.clienteId ? { clienteId: params.clienteId } : undefined,
      include: { cliente: { select: clienteSafeSelect }, pedido: true },
    });
  },
  async findById(id: number) {
    return prisma.factura.findUnique({ where: { id }, include: { cliente: { select: clienteSafeSelect }, pedido: true } });
  },
  async create(data: any) {
    return prisma.factura.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.factura.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.factura.delete({ where: { id } });
  }
};
