import { PrismaClient } from '@prisma/client';

/**
 * Prisma singleton.
 *
 * IMPORTANT:
 * - Only one PrismaClient instance must exist in the process.
 * - In dev/hot-reload environments we keep it on globalThis.
 */

declare global {
  // eslint-disable-next-line no-var
  var __PRISMA__: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.__PRISMA__ ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__PRISMA__ = prisma;
}

export default prisma;
