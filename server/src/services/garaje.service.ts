import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllGarajes = async () => prisma.garaje.findMany();
export const getGarajeById = async (id: number) => prisma.garaje.findUnique({ where: { id } });
export const createGaraje = async (data: any) => prisma.garaje.create({ data });
export const updateGaraje = async (id: number, data: any) => prisma.garaje.update({ where: { id }, data });
export const deleteGaraje = async (id: number) => prisma.garaje.delete({ where: { id } });
