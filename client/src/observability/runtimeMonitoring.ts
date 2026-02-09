import { OBSERVABILITY_ENABLED } from './envFlags';
import { trackError } from './errorTracker';

let installed = false;

/**
 * Installs global listeners for:
 * - window 'error' (uncaught)
 * - window 'unhandledrejection'
 *
 * Safe to call multiple times.
 */
export function initRuntimeMonitoring() {
  if (!OBSERVABILITY_ENABLED) return;
  if (installed) return;
  installed = true;

  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    const err = (event as any)?.error ?? new Error((event as any)?.message ?? 'Uncaught error');
    trackError(err, {
      source: 'windowerror',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = (event as PromiseRejectionEvent)?.reason;
    trackError(reason instanceof Error ? reason : new Error(String(reason ?? 'Unhandled rejection')), {
      source: 'unhandledrejection',
    });
  });
}

