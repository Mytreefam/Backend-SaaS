import type { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import type { AuthRole } from '../types/express';

function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, token] = header.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) return next();
  try {
    const claims = verifyAccessToken(token);
    const id = Number(claims.sub);
    if (Number.isFinite(id)) {
      req.user = { id, email: claims.email, role: claims.role };
    }
  } catch {
    // Ignore invalid token here; requireAuth will enforce when needed
  }
  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractBearerToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  try {
    const claims = verifyAccessToken(token);
    const id = Number(claims.sub);
    if (!Number.isFinite(id)) {
      return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    }
    req.user = { id, email: claims.email, role: claims.role };
    return next();
  } catch {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  }
}

export function requireRole(...roles: AuthRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    }
    return next();
  };
}

export function requireOwnershipOrRole(params: { param: string; rolesAllowed?: AuthRole[] }) {
  const rolesAllowed = params.rolesAllowed ?? ['gerente'];
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    const resourceId = Number(req.params[params.param]);
    if (!Number.isFinite(resourceId)) {
      return res.status(400).json({ success: false, error: 'INVALID_ID' });
    }
    if (req.user.id === resourceId) return next();
    if (rolesAllowed.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  };
}

