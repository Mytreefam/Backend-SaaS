import 'express';

export type AuthRole = 'cliente' | 'trabajador' | 'gerente';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: number;
      email: string;
      role: AuthRole;
    };
    requestId?: string;
  }
}

