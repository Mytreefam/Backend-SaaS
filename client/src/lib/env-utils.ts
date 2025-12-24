/**
 * Utilidades de Entorno
 * 
 * Helper functions para detectar el entorno de ejecución
 * sin depender de import.meta.env que puede no estar disponible
 */

/**
 * Detecta si estamos en entorno de desarrollo
 * Se evalúa una sola vez al cargar el módulo
 */
export const isDevelopment = (() => {
  try {
    // Verificar NODE_ENV si está disponible
    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // Verificar hostname
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      return (
        hostname === 'localhost' || 
        hostname === '127.0.0.1' || 
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.endsWith('.local')
      );
    }
    
    return false;
  } catch {
    return false;
  }
})();

/**
 * Detecta si estamos en entorno de producción
 */
export const isProduction = !isDevelopment;

/**
 * Detecta si estamos en un navegador
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Detecta si estamos en un servidor (SSR)
 */
export const isServer = !isBrowser;

/**
 * Log solo en desarrollo
 */
export const devLog = (...args: any[]) => {
  if (isDevelopment) {
    console.log('[DEV]', ...args);
  }
};

/**
 * Warn solo en desarrollo
 */
export const devWarn = (...args: any[]) => {
  if (isDevelopment) {
    console.warn('[DEV]', ...args);
  }
};

/**
 * Error solo en desarrollo
 */
export const devError = (...args: any[]) => {
  if (isDevelopment) {
    console.error('[DEV]', ...args);
  }
};
