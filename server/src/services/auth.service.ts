import type { CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';
import { randomToken, sha256 } from '../utils/crypto';
import { signAccessToken } from '../utils/jwt';
import type { AuthRole } from '../types/express';

function normalizeRole(role: string | null | undefined): AuthRole {
  if (role === 'gerente' || role === 'trabajador' || role === 'cliente') return role;
  return 'cliente';
}

function getRefreshCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    // Narrow scope: only sent to refresh endpoint
    path: '/auth/refresh',
  };
}

function getRefreshTokenExpiryDate(): Date {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 30);
  const ms = Number.isFinite(days) ? days * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms);
}

function isBcryptHash(value: string): boolean {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
}

export const AuthService = {
  async login(params: { email: string; password: string; userAgent?: string; ip?: string }) {
    const user = await prisma.cliente.findUnique({ where: { email: params.email } });
    if (!user) return null;

    // Backwards-compatible migration:
    // - If passwords were stored in plaintext, accept once and upgrade to bcrypt.
    let passwordOk = false;
    if (isBcryptHash(user.password)) {
      passwordOk = await bcrypt.compare(params.password, user.password);
    } else {
      passwordOk = params.password === user.password;
      if (passwordOk) {
        const upgraded = await bcrypt.hash(params.password, 12);
        await prisma.cliente.update({ where: { id: user.id }, data: { password: upgraded } });
      }
    }

    if (!passwordOk) return null;

    const role = normalizeRole(user.role);
    const accessToken = signAccessToken({ clienteId: user.id, email: user.email, role });

    const refreshToken = randomToken(48);
    const refreshTokenHash = sha256(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        clienteId: user.id,
        expiresAt,
        userAgent: params.userAgent || null,
        ip: params.ip || null,
      },
    });

    // never return password
    const { password: _pw, ...userSafe } = user;

    return {
      user: { ...userSafe, role },
      accessToken,
      refreshToken,
      refreshCookieOptions: getRefreshCookieOptions(),
    };
  },

  async refresh(params: { refreshToken: string; userAgent?: string; ip?: string }) {
    const refreshTokenHash = sha256(params.refreshToken);
    const existing = await prisma.refreshToken.findUnique({
      where: { tokenHash: refreshTokenHash },
      include: { cliente: true },
    });

    if (!existing) throw new Error('Invalid refresh token');
    if (existing.revokedAt) throw new Error('Revoked refresh token');
    if (existing.expiresAt.getTime() <= Date.now()) throw new Error('Expired refresh token');

    const role = normalizeRole(existing.cliente.role);
    const accessToken = signAccessToken({
      clienteId: existing.cliente.id,
      email: existing.cliente.email,
      role,
    });

    // Rotate refresh token
    const newRefreshToken = randomToken(48);
    const newHash = sha256(newRefreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { tokenHash: refreshTokenHash },
        data: {
          revokedAt: new Date(),
          replacedByTokenHash: newHash,
        },
      }),
      prisma.refreshToken.create({
        data: {
          tokenHash: newHash,
          clienteId: existing.cliente.id,
          expiresAt,
          userAgent: params.userAgent || null,
          ip: params.ip || null,
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      refreshCookieOptions: getRefreshCookieOptions(),
    };
  },

  async logout(params: { refreshToken: string }) {
    const refreshTokenHash = sha256(params.refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
