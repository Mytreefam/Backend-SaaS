import type { NextFunction, Request, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ZodError } from 'zod';

type Schemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        const parsed = schemas.params.parse(req.params) as any;
        // Express/Router may expose req.params as non-writable in some runtimes
        Object.assign(req.params as any, parsed);
      }
      if (schemas.query) {
        const parsed = schemas.query.parse(req.query) as any;
        // In some runtimes req.query has only a getter; avoid re-assigning.
        Object.assign(req.query as any, parsed);
      }
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as any;
      }
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        const isProd = process.env.NODE_ENV === 'production';
        // Keep contract minimal to avoid leaking internal details
        return res.status(400).json({
          success: false,
          error: isProd ? 'VALIDATION_ERROR' : `VALIDATION_ERROR: ${err.issues[0]?.message || 'Invalid request'}`,
        });
      }
      return next(err);
    }
  };
}

