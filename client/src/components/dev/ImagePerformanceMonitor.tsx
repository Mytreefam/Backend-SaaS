import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Image as ImageIcon, 
  Zap, 
  Download, 
  Clock, 
  Wifi,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { 
  useImagePerformance, 
  useNetworkQuality, 
  useSaveData 
} from '../../hooks/useImagePerformance';
import { formatBytes } from '../../utils/imageOptimization';

interface ImagePerformanceMonitorProps {
  /** Mostrar el monitor por defecto */
  defaultOpen?: boolean;
  /** Posición en pantalla */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/**
 * Monitor en tiempo real del rendimiento de imágenes
 * Solo debe usarse en desarrollo
 */
export function ImagePerformanceMonitor({
  defaultOpen = false,
  position = 'bottom-right',
}: ImagePerformanceMonitorProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { metrics, totalLoadTime, averageLoadTime, totalSize, clearMetrics } = useImagePerformance();
  const { quality: networkQuality, effectiveType } = useNetworkQuality();
  const saveData = useSaveData();

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Calcular estadísticas
  const slowestImage = metrics.length > 0 
    ? metrics.reduce((prev, curr) => prev.loadTime > curr.loadTime ? prev : curr)
    : null;

  const fastestImage = metrics.length > 0
    ? metrics.reduce((prev, curr) => prev.loadTime < curr.loadTime ? prev : curr)
    : null;

  const imagesAbove1s = metrics.filter(m => m.loadTime > 1000).length;

  // Ocultar en producción
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed ${positionClasses[position]} z-50 rounded-full w-12 h-12 p-0 shadow-lg bg-teal-600 hover:bg-teal-700`}
        title="Abrir Monitor de Imágenes"
      >
        <ImageIcon className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed ${positionClasses[position]} z-50 w-96 shadow-2xl border-2 border-teal-200`}
    >
      <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 p-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-teal-600" />
            Monitor de Imágenes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
        {/* Estado de Red */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" />
              Red
            </span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={networkQuality === 'high' ? 'default' : networkQuality === 'medium' ? 'secondary' : 'destructive'}
                className="text-xs"
              >
                {effectiveType || '4g'}
              </Badge>
              {saveData && (
                <Badge variant="outline" className="text-xs">
                  <Download className="w-3 h-3 mr-1" />
                  Ahorro Datos
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-600">Total Imágenes</span>
              <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-900">{metrics.length}</p>
          </div>

          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-green-600">Tamaño Total</span>
              <Download className="w-3.5 h-3.5 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-900">
              {formatBytes(totalSize)}
            </p>
          </div>

          <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-purple-600">Tiempo Medio</span>
              <Clock className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-purple-900">
              {averageLoadTime.toFixed(0)}ms
            </p>
          </div>

          <div className="bg-orange-50 p-2 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-orange-600">Lentas (>1s)</span>
              <Zap className="w-3.5 h-3.5 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-900">
              {imagesAbove1s}
            </p>
          </div>
        </div>

        {/* Mejor y Peor */}
        {metrics.length > 0 && (
          <div className="space-y-2">
            {fastestImage && (
              <div className="bg-green-50 p-2 rounded border border-green-200">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Más Rápida</span>
                </div>
                <p className="text-xs text-gray-600 truncate" title={fastestImage.url}>
                  {fastestImage.url}
                </p>
                <p className="text-xs font-bold text-green-900 mt-1">
                  {fastestImage.loadTime.toFixed(0)}ms
                  {fastestImage.size > 0 && ` • ${formatBytes(fastestImage.size)}`}
                </p>
              </div>
            )}

            {slowestImage && (
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingDown className="w-3 h-3 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Más Lenta</span>
                </div>
                <p className="text-xs text-gray-600 truncate" title={slowestImage.url}>
                  {slowestImage.url}
                </p>
                <p className="text-xs font-bold text-red-900 mt-1">
                  {slowestImage.loadTime.toFixed(0)}ms
                  {slowestImage.size > 0 && ` • ${formatBytes(slowestImage.size)}`}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Imágenes */}
        {metrics.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">
                Últimas Imágenes
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearMetrics}
                className="h-6 text-xs"
              >
                Limpiar
              </Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {metrics.slice(-10).reverse().map((metric, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-1.5 rounded text-xs border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 truncate flex-1 mr-2" title={metric.url}>
                      {metric.url.split('/').pop()?.substring(0, 30)}...
                    </span>
                    <Badge
                      variant={metric.loadTime > 1000 ? 'destructive' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {metric.loadTime.toFixed(0)}ms
                    </Badge>
                  </div>
                  {metric.size > 0 && (
                    <p className="text-gray-500 mt-0.5">
                      {formatBytes(metric.size)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {imagesAbove1s > 0 && (
          <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
            <p className="text-xs font-medium text-yellow-800 mb-1">
              ⚠️ Recomendaciones
            </p>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• {imagesAbove1s} imagen(es) tardan más de 1s en cargar</li>
              <li>• Considera reducir el tamaño o la calidad</li>
              <li>• Implementa lazy loading para imágenes below the fold</li>
            </ul>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay imágenes monitoreadas</p>
            <p className="text-xs mt-1">Las imágenes aparecerán aquí al cargar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
