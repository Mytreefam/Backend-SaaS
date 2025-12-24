import { useState, useEffect, useCallback } from 'react';

interface ImagePerformanceMetrics {
  loadTime: number;
  size: number;
  url: string;
}

interface UseImagePerformanceReturn {
  metrics: ImagePerformanceMetrics[];
  totalLoadTime: number;
  averageLoadTime: number;
  totalSize: number;
  trackImage: (url: string) => void;
  clearMetrics: () => void;
}

/**
 * Hook para monitorear el rendimiento de carga de imágenes
 */
export function useImagePerformance(): UseImagePerformanceReturn {
  const [metrics, setMetrics] = useState<ImagePerformanceMetrics[]>([]);

  const trackImage = useCallback((url: string) => {
    const startTime = performance.now();
    const img = new Image();

    img.onload = () => {
      const loadTime = performance.now() - startTime;

      // Intentar obtener el tamaño real (solo funciona si la imagen está en el mismo origen o con CORS)
      fetch(url, { method: 'HEAD' })
        .then((response) => {
          const size = parseInt(response.headers.get('content-length') || '0', 10);
          setMetrics((prev) => [
            ...prev,
            {
              url,
              loadTime,
              size,
            },
          ]);
        })
        .catch(() => {
          // Si falla el fetch, guardar sin tamaño
          setMetrics((prev) => [
            ...prev,
            {
              url,
              loadTime,
              size: 0,
            },
          ]);
        });
    };

    img.src = url;
  }, []);

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  const totalLoadTime = metrics.reduce((sum, m) => sum + m.loadTime, 0);
  const averageLoadTime = metrics.length > 0 ? totalLoadTime / metrics.length : 0;
  const totalSize = metrics.reduce((sum, m) => sum + m.size, 0);

  return {
    metrics,
    totalLoadTime,
    averageLoadTime,
    totalSize,
    trackImage,
    clearMetrics,
  };
}

/**
 * Hook para detectar conexión lenta y ajustar calidad de imágenes
 */
export function useNetworkQuality() {
  const [quality, setQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [effectiveType, setEffectiveType] = useState<string>('4g');

  useEffect(() => {
    // @ts-ignore - NetworkInformation no está en todos los tipos de navegador
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const updateConnectionInfo = () => {
        const type = connection.effectiveType;
        setEffectiveType(type);

        // Ajustar calidad según el tipo de conexión
        if (type === 'slow-2g' || type === '2g') {
          setQuality('low');
        } else if (type === '3g') {
          setQuality('medium');
        } else {
          setQuality('high');
        }
      };

      updateConnectionInfo();
      connection.addEventListener('change', updateConnectionInfo);

      return () => {
        connection.removeEventListener('change', updateConnectionInfo);
      };
    }
  }, []);

  return { quality, effectiveType };
}

/**
 * Hook para precargar imágenes importantes
 */
export function useImagePreload(urls: string[]) {
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    urls.forEach((url) => {
      if (loadedUrls.has(url) || failedUrls.has(url)) return;

      const img = new Image();
      
      img.onload = () => {
        setLoadedUrls((prev) => new Set([...prev, url]));
      };

      img.onerror = () => {
        setFailedUrls((prev) => new Set([...prev, url]));
      };

      img.src = url;
    });
  }, [urls]);

  return {
    loadedUrls: Array.from(loadedUrls),
    failedUrls: Array.from(failedUrls),
    isLoaded: (url: string) => loadedUrls.has(url),
    hasFailed: (url: string) => failedUrls.has(url),
  };
}

/**
 * Hook para detectar si el usuario tiene activado el modo de ahorro de datos
 */
export function useSaveData() {
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection && 'saveData' in connection) {
      setSaveData(connection.saveData);

      const updateSaveData = () => {
        setSaveData(connection.saveData);
      };

      connection.addEventListener('change', updateSaveData);

      return () => {
        connection.removeEventListener('change', updateSaveData);
      };
    }
  }, []);

  return saveData;
}

/**
 * Hook combinado que retorna la configuración óptima para imágenes
 */
export function useOptimalImageConfig() {
  const { quality: networkQuality } = useNetworkQuality();
  const saveData = useSaveData();

  // Si el usuario tiene activado saveData, forzar baja calidad
  if (saveData) {
    return {
      quality: 60,
      width: 400,
      format: 'webp',
      lazy: true,
    };
  }

  // Configuración según calidad de red
  const configs = {
    low: {
      quality: 60,
      width: 400,
      format: 'webp',
      lazy: true,
    },
    medium: {
      quality: 75,
      width: 600,
      format: 'webp',
      lazy: true,
    },
    high: {
      quality: 85,
      width: 1200,
      format: 'webp',
      lazy: true,
    },
  };

  return configs[networkQuality];
}

/**
 * Utilidad para calcular el tamaño óptimo de imagen según el viewport
 */
export function useOptimalImageSize(containerRef: React.RefObject<HTMLElement>) {
  const [optimalWidth, setOptimalWidth] = useState(400);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateSize = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const devicePixelRatio = window.devicePixelRatio || 1;
      
      // Calcular el ancho óptimo considerando el DPR (para pantallas retina)
      const width = Math.ceil(rect.width * devicePixelRatio);
      
      // Redondear a múltiplos de 100 para mejor caching
      const roundedWidth = Math.ceil(width / 100) * 100;
      
      setOptimalWidth(roundedWidth);
    };

    updateSize();

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return optimalWidth;
}
