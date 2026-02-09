export type NetworkStatus = {
  online: boolean;
  lastChangedAt: number;
};

type Listener = (s: NetworkStatus) => void;

let status: NetworkStatus = {
  online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastChangedAt: Date.now(),
};

const listeners = new Set<Listener>();
let installed = false;

function emit() {
  for (const l of listeners) {
    try {
      l(status);
    } catch {
      // ignore
    }
  }
}

export function getNetworkStatus(): NetworkStatus {
  return status;
}

export function subscribeNetworkStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initNetworkStatusStore() {
  if (installed) return;
  installed = true;
  if (typeof window === 'undefined') return;

  const setOnline = (online: boolean) => {
    status = { online, lastChangedAt: Date.now() };
    emit();
  };

  window.addEventListener('online', () => setOnline(true));
  window.addEventListener('offline', () => setOnline(false));
}

