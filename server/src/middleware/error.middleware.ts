import type { NextFunction, Request, Response } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ success: false, error: 'NOT_FOUND' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = typeof err?.status === 'number' ? err.status : 500;

  // Avoid leaking internals in production
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
  }

  if (res.headersSent) return;

  res.status(status).json({
    success: false,
    // In production we never return raw messages; keep stable codes.
    error: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_FAILED',
  });
}

