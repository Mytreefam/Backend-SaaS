import { HTTP_LOGGING_ENABLED } from './envFlags';

export type HttpEvent = {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  duration: number; // ms
  retryAttempt: number; // 0 = no retry, 1 = 1st retry, etc.
  userId?: string | number | null;
};

export type HttpEventLogger = (event: HttpEvent) => void;

let logger: HttpEventLogger | null = null;

export function setHttpEventLogger(fn: HttpEventLogger | null) {
  logger = fn;
}

/**
 * Optional hook used by `envelopedFetch`.
 * Must never throw or block requests.
 */
export function logHttpEvent(event: HttpEvent) {
  if (!HTTP_LOGGING_ENABLED) return;
  if (!logger) return;
  try {
    logger(event);
  } catch {
    // never block app
  }
}

