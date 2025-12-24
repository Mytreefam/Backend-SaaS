import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllFacturas = async () => prisma.factura.findMany();
export const getFacturaById = async (id: number) => prisma.factura.findUnique({ where: { id } });
export const createFactura = async (data: any) => prisma.factura.create({ data });
export const updateFactura = async (id: number, data: any) => prisma.factura.update({ where: { id }, data });
export const deleteFactura = async (id: number) => prisma.factura.delete({ where: { id } });
