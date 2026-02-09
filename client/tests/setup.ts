import { vi } from 'vitest';
import { toastMock } from './contracts/toast.mock';

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

// Minimal DOM-less storages for Node environment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).localStorage = new MemoryStorage();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).sessionStorage = new MemoryStorage();

// Ensure a clean fetch mock per test file when needed.
// Individual tests can overwrite globalThis.fetch.
if (!(globalThis as any).fetch) {
  (globalThis as any).fetch = vi.fn();
}

// Some source files import sonner using a pinned id (sonner@2.0.3).
// Provide a global mock so service modules can be imported in Node tests.
vi.mock('sonner@2.0.3', () => ({ toast: toastMock }));

