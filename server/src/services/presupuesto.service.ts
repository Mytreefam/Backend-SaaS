import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllPresupuestos = async () => prisma.presupuesto.findMany();
export const getPresupuestoById = async (id: number) => prisma.presupuesto.findUnique({ where: { id } });
export const createPresupuesto = async (data: any) => prisma.presupuesto.create({ data });
export const updatePresupuesto = async (id: number, data: any) => prisma.presupuesto.update({ where: { id }, data });
export const deletePresupuesto = async (id: number) => prisma.presupuesto.delete({ where: { id } });
