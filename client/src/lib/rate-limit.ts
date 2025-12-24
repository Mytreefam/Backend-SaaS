/**
 * Utilidades de Rate Limiting y Control de Flujo
 * 
 * Incluye:
 * - Throttle: Limita la ejecución a máximo una vez cada X ms
 * - Debounce: Espera X ms de inactividad antes de ejecutar
 * - Rate Limiter: Limita el número de llamadas en un periodo
 */

/**
 * Throttle: Ejecuta la función como máximo una vez cada `delay` ms
 * 
 * Uso: Para eventos que se disparan muy frecuentemente (scroll, resize, mousemove)
 * 
 * @example
 * const handleScroll = throttle(() => {
 *   console.log('Scroll event');
 * }, 200);
 * window.addEventListener('scroll', handleScroll);
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    } else {
      // Asegurar que se ejecute al final
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func.apply(this, args);
      }, delay - timeSinceLastCall);
    }
  };
}

/**
 * Debounce: Espera `delay` ms sin que se llame antes de ejecutar
 * 
 * Uso: Para búsquedas en tiempo real, autocompletado
 * 
 * @example
 * const buscar = debounce((query: string) => {
 *   console.log('Buscando:', query);
 * }, 300);
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * Rate Limiter: Limita el número de llamadas en un periodo de tiempo
 * 
 * @example
 * const limiter = createRateLimiter(5, 60000); // 5 llamadas por minuto
 * if (limiter.tryAcquire()) {
 *   // Ejecutar acción
 * } else {
 *   toast.error('Demasiadas peticiones. Espera un momento.');
 * }
 */
export class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens por ms
  private lastRefill: number;

  constructor(maxCalls: number, windowMs: number) {
    this.maxTokens = maxCalls;
    this.tokens = maxCalls;
    this.refillRate = maxCalls / windowMs;
    this.lastRefill = Date.now();
  }

  private refill() {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Intenta adquirir un token
   * @returns true si se pudo, false si se excedió el límite
   */
  tryAcquire(): boolean {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Obtiene el tiempo en ms hasta que haya un token disponible
   */
  getWaitTime(): number {
    this.refill();
    
    if (this.tokens >= 1) return 0;

    const tokensNeeded = 1 - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }

  /**
   * Resetea el rate limiter
   */
  reset() {
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
  }
}

/**
 * Crea un rate limiter con configuración simplificada
 */
export function createRateLimiter(maxCalls: number, windowMs: number): RateLimiter {
  return new RateLimiter(maxCalls, windowMs);
}

/**
 * Rate Limiter por clave (útil para limitar por usuario, IP, etc.)
 */
export class KeyedRateLimiter {
  private limiters: Map<string, RateLimiter>;
  private maxCalls: number;
  private windowMs: number;

  constructor(maxCalls: number, windowMs: number) {
    this.limiters = new Map();
    this.maxCalls = maxCalls;
    this.windowMs = windowMs;
  }

  tryAcquire(key: string): boolean {
    if (!this.limiters.has(key)) {
      this.limiters.set(key, new RateLimiter(this.maxCalls, this.windowMs));
    }

    return this.limiters.get(key)!.tryAcquire();
  }

  getWaitTime(key: string): number {
    if (!this.limiters.has(key)) {
      return 0;
    }

    return this.limiters.get(key)!.getWaitTime();
  }

  reset(key: string) {
    this.limiters.delete(key);
  }

  resetAll() {
    this.limiters.clear();
  }
}

/**
 * Hook-like para usar rate limiter en componentes React
 * 
 * @example
 * const limiter = useRateLimiter(5, 60000);
 * 
 * const handleClick = () => {
 *   if (!limiter.tryAcquire()) {
 *     toast.error('Demasiados clics. Espera un momento.');
 *     return;
 *   }
 *   // Acción permitida
 * };
 */
export function useRateLimiter(maxCalls: number, windowMs: number) {
  // En un hook real, usarías useRef para persistir el limiter
  // Por ahora, esto es una función helper
  return createRateLimiter(maxCalls, windowMs);
}

/**
 * Delay con Promise (útil para testing y animaciones)
 * 
 * @example
 * await delay(1000); // Espera 1 segundo
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry con backoff exponencial
 * 
 * @example
 * const resultado = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
  } = options;

  let lastError: any;
  let delayMs = initialDelay;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries) {
        await delay(Math.min(delayMs, maxDelay));
        delayMs *= backoffMultiplier;
      }
    }
  }

  throw lastError;
}

/**
 * Limita la ejecución concurrente de promesas
 * 
 * @example
 * const limiter = new ConcurrencyLimiter(3);
 * const results = await Promise.all(
 *   urls.map(url => limiter.run(() => fetch(url)))
 * );
 */
export class ConcurrencyLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(private maxConcurrent: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    while (this.running >= this.maxConcurrent) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;

    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
