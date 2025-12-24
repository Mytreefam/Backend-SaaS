/**
 * 📊 SISTEMA DE MONITOREO DE RENDIMIENTO - UDAR EDGE
 * 
 * Herramienta para medir y analizar el rendimiento de los componentes
 * y cálculos en tiempo real.
 */

import { useEffect, useRef, useState } from 'react';
import { isDevelopment } from './env-utils';

// ============================================
// TIPOS
// ============================================

export interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  calculationTime: number;
  memoryUsage?: number;
  timestamp: number;
  dataSize?: number;
}

export interface PerformanceReport {
  component: string;
  avgRenderTime: number;
  maxRenderTime: number;
  minRenderTime: number;
  totalRenders: number;
  slowRenders: number; // > 16ms
  avgCalculationTime: number;
  avgMemoryDelta: number;
}

// ============================================
// ALMACENAMIENTO EN MEMORIA
// ============================================

class PerformanceStore {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;
  
  addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Mantener solo las últimas N métricas
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }
  
  getMetrics(componentName?: string): PerformanceMetric[] {
    if (componentName) {
      return this.metrics.filter(m => m.componentName === componentName);
    }
    return this.metrics;
  }
  
  generateReport(componentName: string): PerformanceReport | null {
    const componentMetrics = this.getMetrics(componentName);
    
    if (componentMetrics.length === 0) return null;
    
    const renderTimes = componentMetrics.map(m => m.renderTime);
    const calcTimes = componentMetrics.map(m => m.calculationTime);
    const memoryDeltas = componentMetrics
      .map(m => m.memoryUsage)
      .filter((m): m is number => m !== undefined);
    
    return {
      component: componentName,
      avgRenderTime: this.average(renderTimes),
      maxRenderTime: Math.max(...renderTimes),
      minRenderTime: Math.min(...renderTimes),
      totalRenders: componentMetrics.length,
      slowRenders: renderTimes.filter(t => t > 16).length,
      avgCalculationTime: this.average(calcTimes),
      avgMemoryDelta: this.average(memoryDeltas)
    };
  }
  
  getAllReports(): PerformanceReport[] {
    const componentNames = [...new Set(this.metrics.map(m => m.componentName))];
    return componentNames
      .map(name => this.generateReport(name))
      .filter((r): r is PerformanceReport => r !== null);
  }
  
  clear() {
    this.metrics = [];
  }
  
  exportToJSON(): string {
    return JSON.stringify({
      metrics: this.metrics,
      reports: this.getAllReports(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
  
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
}

export const performanceStore = new PerformanceStore();

// ============================================
// HOOK PARA MEDIR RENDERS
// ============================================

/**
 * Hook para medir el tiempo de render de un componente
 */
export const useRenderPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);
  
  // Marcar inicio del render
  renderStartTime.current = performance.now();
  
  useEffect(() => {
    // Calcular tiempo de render
    const renderTime = performance.now() - renderStartTime.current;
    
    // Registrar métrica
    performanceStore.addMetric({
      componentName,
      renderTime,
      calculationTime: 0, // Se medirá por separado
      timestamp: Date.now()
    });
    
    // Log en desarrollo
    if (isDevelopment && renderTime > 16) {
      console.warn(
        `⚠️ Render lento en ${componentName}: ${renderTime.toFixed(2)}ms`
      );
    }
  });
};

// ============================================
// HOOK PARA MEDIR CÁLCULOS useMemo
// ============================================

/**
 * Wrapper para useMemo que mide el tiempo de cálculo
 */
export const useMemoWithPerformance = <T,>(
  factory: () => T,
  deps: React.DependencyList,
  componentName: string
): T => {
  const startTime = performance.now();
  
  const result = React.useMemo(() => {
    const calcStartTime = performance.now();
    const computed = factory();
    const calcTime = performance.now() - calcStartTime;
    
    // Obtener tamaño de datos aproximado
    const dataSize = typeof computed === 'object' 
      ? JSON.stringify(computed).length 
      : 0;
    
    // Obtener memoria (si está disponible)
    const memory = (performance as any).memory?.usedJSHeapSize;
    
    performanceStore.addMetric({
      componentName,
      renderTime: 0,
      calculationTime: calcTime,
      memoryUsage: memory,
      dataSize,
      timestamp: Date.now()
    });
    
    if (isDevelopment && calcTime > 5) {
      console.warn(
        `⚠️ Cálculo lento en ${componentName}: ${calcTime.toFixed(2)}ms`
      );
    }
    
    return computed;
  }, deps);
  
  return result;
};

// ============================================
// COMPONENTE DE MONITOREO EN TIEMPO REAL
// ============================================

export const usePerformanceMonitor = (componentName: string) => {
  const [stats, setStats] = useState<PerformanceReport | null>(null);
  
  useEffect(() => {
    // Actualizar stats cada 5 segundos
    const interval = setInterval(() => {
      const report = performanceStore.generateReport(componentName);
      setStats(report);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [componentName]);
  
  return stats;
};

// ============================================
// UTILIDADES
// ============================================

/**
 * Medir tiempo de ejecución de una función
 */
export const measureTime = async <T,>(
  fn: () => T | Promise<T>,
  label: string
): Promise<T> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
  
  return result;
};

/**
 * Detectar memory leaks
 */
export const detectMemoryLeaks = () => {
  const memory = (performance as any).memory;
  
  if (!memory) {
    console.warn('Memory API no disponible en este navegador');
    return null;
  }
  
  return {
    used: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    total: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    limit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%'
  };
};

/**
 * Obtener métricas de navegador
 */
export const getBrowserMetrics = () => {
  if (!window.performance) return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    loadTime: navigation?.loadEventEnd - navigation?.loadEventStart,
    ttfb: navigation?.responseStart - navigation?.requestStart,
    domInteractive: navigation?.domInteractive - navigation?.fetchStart
  };
};

/**
 * Generar reporte completo
 */
export const generateFullReport = () => {
  const reports = performanceStore.getAllReports();
  const memory = detectMemoryLeaks();
  const browser = getBrowserMetrics();
  
  return {
    timestamp: new Date().toISOString(),
    components: reports,
    memory,
    browser,
    summary: {
      totalComponents: reports.length,
      componentsWithSlowRenders: reports.filter(r => r.slowRenders > 0).length,
      avgRenderTime: reports.reduce((acc, r) => acc + r.avgRenderTime, 0) / reports.length || 0,
      avgCalcTime: reports.reduce((acc, r) => acc + r.avgCalculationTime, 0) / reports.length || 0
    }
  };
};

/**
 * Limpiar métricas antiguas
 */
export const clearOldMetrics = (olderThanMinutes: number = 60) => {
  const cutoffTime = Date.now() - (olderThanMinutes * 60 * 1000);
  // Esta función se implementaría en PerformanceStore
  console.log(`Limpiando métricas anteriores a ${new Date(cutoffTime).toISOString()}`);
};

// ============================================
// DESARROLLO: PANEL DE RENDIMIENTO
// ============================================

export const PerformanceDebugPanel = () => {
  const [visible, setVisible] = useState(false);
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      setReports(performanceStore.getAllReports());
    }, 1000);
    
    return () => clearInterval(interval);
  }, [visible]);
  
  if (!isDevelopment) return null;
  
  return (
    <>
      {/* Botón flotante para abrir panel */}
      <button
        onClick={() => setVisible(!visible)}
        className="fixed bottom-4 right-4 bg-teal-600 text-white p-3 rounded-full shadow-lg z-50 hover:bg-teal-700"
        title="Performance Monitor"
      >
        📊
      </button>
      
      {visible && (
        <div className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-2xl p-4 w-96 max-h-96 overflow-y-auto z-50">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg">Performance Monitor</h3>
            <button 
              onClick={() => setVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.component} className="bg-gray-50 p-3 rounded border border-gray-200">
                <div className="font-medium text-sm mb-1">{report.component}</div>
                <div className="text-xs space-y-1">
                  <div>Renders: {report.totalRenders}</div>
                  <div>Avg Render: {report.avgRenderTime.toFixed(2)}ms</div>
                  <div>Avg Calc: {report.avgCalculationTime.toFixed(2)}ms</div>
                  {report.slowRenders > 0 && (
                    <div className="text-red-600">
                      ⚠️ Slow renders: {report.slowRenders}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t space-y-2">
            <button
              onClick={() => {
                const report = generateFullReport();
                console.log('📊 Full Performance Report:', report);
                alert('Reporte exportado a consola');
              }}
              className="w-full bg-teal-600 text-white py-2 rounded text-sm hover:bg-teal-700"
            >
              Exportar Reporte
            </button>
            
            <button
              onClick={() => {
                performanceStore.clear();
                setReports([]);
              }}
              className="w-full bg-gray-500 text-white py-2 rounded text-sm hover:bg-gray-600"
            >
              Limpiar Métricas
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// EXPORTAR
// ============================================

export default {
  useRenderPerformance,
  useMemoWithPerformance,
  usePerformanceMonitor,
  measureTime,
  detectMemoryLeaks,
  getBrowserMetrics,
  generateFullReport,
  PerformanceDebugPanel,
  performanceStore
};
