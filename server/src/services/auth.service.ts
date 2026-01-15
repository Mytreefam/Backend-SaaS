
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const AuthService = {
  async login(email: string, password: string) {
    const user = await prisma.cliente.findUnique({ where: { email } });
    if (!user) return null;
    if (password !== user.password) return null;
    // Opcional: no devolver el hash
    const { password: _pw, ...userSafe } = user;
    return userSafe;
  },
};
