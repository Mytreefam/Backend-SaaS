import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message =
    typeof err?.message === 'string' && err.message.length > 0 ? err.message : 'INTERNAL_ERROR';

  // Avoid leaking internals in production
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  if (res.headersSent) return;

  res.status(status).json({
    success: false,
    error: status === 500 && isProd ? 'INTERNAL_ERROR' : message,
  });
}

