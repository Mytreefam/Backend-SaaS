import { OBSERVABILITY_ENABLED } from './envFlags';

export type BrowserInfo = {
  userAgent?: string;
  language?: string;
  platform?: string;
  viewport?: { w: number; h: number; dpr: number };
};

export type ErrorContext = {
  source: 'react' | 'unhandledrejection' | 'windowerror' | 'http' | 'manual';
  endpoint?: string;
  method?: string;
  status?: number;
  retryAttempt?: number;
  userId?: string | number | null;
  timestamp: string; // ISO
  browser: BrowserInfo;
};

export type TrackedError = {
  message: string;
  stack?: string;
  name?: string;
  context: ErrorContext;
};

const buffer: TrackedError[] = [];
const subscribers = new Set<(err: TrackedError) => void>();

function getBrowserInfo(): BrowserInfo {
  try {
    if (typeof window === 'undefined') return {};
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: (navigator as any).platform,
      viewport: {
        w: window.innerWidth,
        h: window.innerHeight,
        dpr: window.devicePixelRatio || 1,
      },
    };
  } catch {
    return {};
  }
}

export function getSafeUserId(): string | number | null {
  try {
    const raw =
      localStorage.getItem('currentUser') ||
      localStorage.getItem('user') ||
      sessionStorage.getItem('currentUser') ||
      sessionStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? null;
  } catch {
    return null;
  }
}

export function trackError(
  error: unknown,
  context: Omit<ErrorContext, 'timestamp' | 'browser' | 'userId'> & { userId?: ErrorContext['userId'] },
): void {
  if (!OBSERVABILITY_ENABLED) return;

  try {
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');

    const tracked: TrackedError = {
      message: err.message,
      stack: err.stack,
      name: err.name,
      context: {
        ...context,
        userId: context.userId ?? getSafeUserId(),
        timestamp: new Date().toISOString(),
        browser: getBrowserInfo(),
      },
    };

    buffer.push(tracked);
    // Keep last 200
    if (buffer.length > 200) buffer.splice(0, buffer.length - 200);

    for (const sub of subscribers) {
      try {
        sub(tracked);
      } catch {
        // never break app
      }
    }

    // Always console.error for now (no external sending yet)
    // eslint-disable-next-line no-console
    console.error('[observability] tracked error', tracked);
  } catch {
    // swallow
  }
}

export function getErrorBuffer(): TrackedError[] {
  return [...buffer];
}

export function onErrorTracked(handler: (err: TrackedError) => void): () => void {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

