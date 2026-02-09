import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { AuthRole } from '../types/express';

export interface AccessTokenClaims extends JwtPayload {
  sub: string; // clienteId as string
  email: string;
  role: AuthRole;
}

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return val;
}

export function signAccessToken(params: { clienteId: number; email: string; role: AuthRole }): string {
  const secret = requireEnv('JWT_ACCESS_SECRET');
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'];

  const claims: AccessTokenClaims = {
    sub: String(params.clienteId),
    email: params.email,
    role: params.role,
  };

  return jwt.sign(claims, secret, {
    algorithm: 'HS256',
    expiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenClaims {
  const secret = requireEnv('JWT_ACCESS_SECRET');
  const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });
  return decoded as AccessTokenClaims;
}

