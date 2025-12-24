import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const TurnoModel = {
  async findAll() {
    return prisma.turno.findMany({ include: { cliente: true, pedido: true } });
  },
  async findById(id: number) {
    return prisma.turno.findUnique({ where: { id }, include: { cliente: true, pedido: true } });
  },
  async create(data: {
    numero: string;
    estado?: string;
    tiempoEstimado?: string;
    clienteId: number;
    pedidoId: number;
  }) {
    return prisma.turno.create({ data });
  },
  async update(id: number, data: any) {
    return prisma.turno.update({ where: { id }, data });
  },
  async delete(id: number) {
    return prisma.turno.delete({ where: { id } });
  }
};
