/**
 * Global auth-expiry / logout event bus.
 *
 * Goal:
 * - single global event when refresh fails
 * - avoid cascading logout loops
 * - allow root to redirect safely to login (no UI changes required)
 */

export type AuthExpiredDetail = {
  reason: 'refresh_failed' | 'manual';
  message?: string;
  ts: number;
};

const EVENT_NAME = 'auth:expired';

let dispatched = false;
let toastHook: ((detail: AuthExpiredDetail) => void) | null = null;

/**
 * Optional hook for UI layers to show a toast.
 * Must NOT change existing toast texts; leave that to the caller.
 */
export function setAuthExpiryToastHook(fn: ((detail: AuthExpiredDetail) => void) | null) {
  toastHook = fn;
}

export function dispatchAuthExpired(detail: Omit<AuthExpiredDetail, 'ts'>) {
  if (typeof window === 'undefined') return;
  if (dispatched) return;
  dispatched = true;

  try {
    try {
      toastHook?.({ ...detail, ts: Date.now() });
    } catch {
      // ignore
    }

    window.dispatchEvent(
      new CustomEvent<AuthExpiredDetail>(EVENT_NAME, {
        detail: { ...detail, ts: Date.now() },
      }),
    );
  } catch {
    // ignore
  }
}

export function onAuthExpired(handler: (detail: AuthExpiredDetail) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (evt: Event) => {
    const detail = (evt as CustomEvent<AuthExpiredDetail>).detail;
    try {
      handler(detail);
    } catch {
      // ignore
    }
  };

  window.addEventListener(EVENT_NAME, listener as EventListener);
  return () => window.removeEventListener(EVENT_NAME, listener as EventListener);
}

