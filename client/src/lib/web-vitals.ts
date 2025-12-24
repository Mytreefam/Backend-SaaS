/**
 * Web Vitals Monitoring
 * 
 * Monitorea las métricas clave de rendimiento de la aplicación:
 * - LCP (Largest Contentful Paint) - Velocidad de carga
 * - FID (First Input Delay) - Interactividad
 * - CLS (Cumulative Layout Shift) - Estabilidad visual
 * - FCP (First Contentful Paint) - Primera pintura
 * - TTFB (Time to First Byte) - Tiempo de respuesta del servidor
 */

import { isDevelopment, isProduction } from './env-utils';

interface Metric {
  id: string;
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  entries: PerformanceEntry[];
}

type MetricCallback = (metric: Metric) => void;

/**
 * Umbrales de Web Vitals (según Google)
 */
const THRESHOLDS = {
  LCP: {
    good: 2500,
    poor: 4000,
  },
  FID: {
    good: 100,
    poor: 300,
  },
  CLS: {
    good: 0.1,
    poor: 0.25,
  },
  FCP: {
    good: 1800,
    poor: 3000,
  },
  TTFB: {
    good: 800,
    poor: 1800,
  },
};

/**
 * Determina el rating de una métrica
 */
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Reporta métricas a consola (development) o a analytics (production)
 */
function reportMetric(metric: Metric) {
  const { name, value, rating } = metric;

  // En desarrollo, loguear a consola
  if (isDevelopment) {
    const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
    console.log(`${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
  }

  // En producción, enviar a analytics
  if (isProduction) {
    // TODO: Integrar con tu servicio de analytics
    // analytics.logEvent('web_vital', {
    //   metric_name: name,
    //   metric_value: value,
    //   metric_rating: rating,
    // });

    // O enviar a Google Analytics 4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        value: Math.round(value),
        metric_id: metric.id,
        metric_value: value,
        metric_delta: metric.delta,
        metric_rating: rating,
      });
    }
  }
}

/**
 * Observa Largest Contentful Paint (LCP)
 * Mide cuándo se renderiza el elemento más grande visible
 */
export function onLCP(callback: MetricCallback = reportMetric) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;

      if (lastEntry) {
        const value = lastEntry.renderTime || lastEntry.loadTime;
        
        callback({
          id: generateUniqueId(),
          name: 'LCP',
          value,
          rating: getRating('LCP', value),
          delta: value,
          entries: entries as PerformanceEntry[],
        });
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (error) {
    if (isDevelopment) {
      console.error('Error observando LCP:', error);
    }
  }
}

/**
 * Observa First Input Delay (FID)
 * Mide el tiempo hasta que el usuario puede interactuar
 */
export function onFID(callback: MetricCallback = reportMetric) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as any;

      if (firstEntry) {
        const value = firstEntry.processingStart - firstEntry.startTime;

        callback({
          id: generateUniqueId(),
          name: 'FID',
          value,
          rating: getRating('FID', value),
          delta: value,
          entries: entries as PerformanceEntry[],
        });

        // FID solo se mide una vez
        observer.disconnect();
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  } catch (error) {
    if (isDevelopment) {
      console.error('Error observando FID:', error);
    }
  }
}

/**
 * Observa Cumulative Layout Shift (CLS)
 * Mide cambios inesperados en el layout
 */
export function onCLS(callback: MetricCallback = reportMetric) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  let clsValue = 0;
  const entries: PerformanceEntry[] = [];

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          entries.push(entry);
        }
      }

      callback({
        id: generateUniqueId(),
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
        delta: clsValue,
        entries,
      });
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (error) {
    if (isDevelopment) {
      console.error('Error observando CLS:', error);
    }
  }
}

/**
 * Observa First Contentful Paint (FCP)
 * Mide cuándo se renderiza el primer contenido
 */
export function onFCP(callback: MetricCallback = reportMetric) {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];

      if (firstEntry) {
        const value = firstEntry.startTime;

        callback({
          id: generateUniqueId(),
          name: 'FCP',
          value,
          rating: getRating('FCP', value),
          delta: value,
          entries: entries as PerformanceEntry[],
        });

        observer.disconnect();
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (error) {
    if (isDevelopment) {
      console.error('Error observando FCP:', error);
    }
  }
}

/**
 * Mide Time to First Byte (TTFB)
 * Tiempo de respuesta del servidor
 */
export function onTTFB(callback: MetricCallback = reportMetric) {
  if (typeof window === 'undefined' || !('performance' in window) || !performance.timing) return;

  try {
    const navTiming = performance.timing;
    const value = navTiming.responseStart - navTiming.requestStart;

    callback({
      id: generateUniqueId(),
      name: 'TTFB',
      value,
      rating: getRating('TTFB', value),
      delta: value,
      entries: [],
    });
  } catch (error) {
    if (isDevelopment) {
      console.error('Error midiendo TTFB:', error);
    }
  }
}

/**
 * Inicializa todos los observadores de Web Vitals
 */
export function initWebVitals(callback?: MetricCallback) {
  if (typeof window === 'undefined') return;
  
  const handler = callback || reportMetric;

  onLCP(handler);
  onFID(handler);
  onCLS(handler);
  onFCP(handler);
  onTTFB(handler);
}

/**
 * Genera un ID único para cada métrica
 */
function generateUniqueId(): string {
  return `v3-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Performance Observer para tiempos de navegación personalizados
 */
export function measurePerformance(name: string) {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  return {
    start: () => {
      performance.mark(`${name}-start`);
    },
    end: () => {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      
      if (measure && isDevelopment) {
        console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
      }

      return measure ? measure.duration : 0;
    },
  };
}

/**
 * Monitorea tiempos de carga de recursos
 */
export function getResourceTimings(): PerformanceResourceTiming[] {
  if (typeof window === 'undefined' || !('performance' in window)) return [];

  return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
}

/**
 * Analiza recursos lentos
 */
export function getSlowResources(threshold = 1000): PerformanceResourceTiming[] {
  return getResourceTimings().filter(
    (resource) => resource.duration > threshold
  );
}

/**
 * Obtiene el tamaño total de recursos cargados
 */
export function getTotalResourceSize(): number {
  return getResourceTimings().reduce(
    (total, resource) => total + (resource.transferSize || 0),
    0
  );
}

/**
 * Limpia marcas y medidas de performance
 */
export function clearPerformanceMarks() {
  if (typeof window === 'undefined' || !('performance' in window)) return;
  
  performance.clearMarks();
  performance.clearMeasures();
}

/**
 * Hook para React (si usas TypeScript y React)
 */
export function useWebVitals(callback?: MetricCallback) {
  // En un componente React, usarías useEffect
  // useEffect(() => {
  //   initWebVitals(callback);
  // }, [callback]);
}

// Tipos para gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
