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
      if (schemas.params) req.params = schemas.params.parse(req.params) as any;
      if (schemas.query) req.query = schemas.query.parse(req.query) as any;
      if (schemas.body) req.body = schemas.body.parse(req.body) as any;
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

