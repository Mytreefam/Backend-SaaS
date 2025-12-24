import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const AuthService = {
  async login(email: string, password: string) {
    // En producción, compara el hash de la contraseña
    return prisma.cliente.findFirst({
      where: { email, password },
    });
  },
};
