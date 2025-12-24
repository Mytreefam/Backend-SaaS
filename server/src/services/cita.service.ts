import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllCitas = async () => prisma.cita.findMany();
export const getCitaById = async (id: number) => prisma.cita.findUnique({ where: { id } });
export const createCita = async (data: any) => prisma.cita.create({ data });
export const updateCita = async (id: number, data: any) => prisma.cita.update({ where: { id }, data });
export const deleteCita = async (id: number) => prisma.cita.delete({ where: { id } });
