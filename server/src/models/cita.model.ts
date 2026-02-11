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

export const CitaModel = {
  async findAll() {
    return prisma.cita.findMany({ include: { cliente: { select: clienteSafeSelect } } });
  },
  async findById(id: number) {
    return prisma.cita.findUnique({ where: { id }, include: { cliente: { select: clienteSafeSelect } } });
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
