import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllDocumentos = async () => prisma.documento.findMany();
export const getDocumentoById = async (id: number) => prisma.documento.findUnique({ where: { id } });
export const createDocumento = async (data: any) => prisma.documento.create({ data });
export const updateDocumento = async (id: number, data: any) => prisma.documento.update({ where: { id }, data });
export const deleteDocumento = async (id: number) => prisma.documento.delete({ where: { id } });
