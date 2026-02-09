import type { NextFunction, Request, Response } from 'express';

/**
 * Global response envelope.
 *
 * Ensures all JSON responses follow:
 * - { success: true, data: any }
 * - { success: false, error: string }
 *
 * Handlers that already return {success: ...} pass through unchanged.
 */
export function responseEnvelope(_req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = ((body: any) => {
    // If handler already uses the envelope, keep it.
    if (body && typeof body === 'object' && typeof body.success === 'boolean') {
      return originalJson(body);
    }

    const status = res.statusCode || 200;

    if (status >= 400) {
      const error =
        body && typeof body === 'object' && typeof body.error === 'string'
          ? body.error
          : 'REQUEST_FAILED';
      return originalJson({ success: false, error });
    }

    return originalJson({ success: true, data: body });
  }) as any;

  next();
}

