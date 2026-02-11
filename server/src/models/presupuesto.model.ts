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

export const PresupuestoModel = {
  async findAll() {
    return prisma.presupuesto.findMany({ include: { cliente: { select: clienteSafeSelect } } });
  },
  async findById(id: number) {
    return prisma.presupuesto.findUnique({ where: { id }, include: { cliente: { select: clienteSafeSelect } } });
  },
  async create(data: any) {
    return prisma.presupuesto.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.presupuesto.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.presupuesto.delete({ where: { id } });
  }
};
