import prisma from '../prisma/client';

export const PuntoVentaModel = {
  async findAll(params?: { includeInactivos?: boolean }) {
    const includeInactivos = Boolean(params?.includeInactivos);
    return prisma.puntoVenta.findMany({
      where: includeInactivos ? undefined : { activo: true },
      orderBy: [{ activo: 'desc' }, { nombre: 'asc' }],
    });
  },

  async findById(id: string) {
    return prisma.puntoVenta.findUnique({ where: { id } });
  },

  async create(data: any) {
    return prisma.puntoVenta.create({ data });
  },

  async update(id: string, data: any) {
    return prisma.puntoVenta.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.puntoVenta.delete({ where: { id } });
  },
};

