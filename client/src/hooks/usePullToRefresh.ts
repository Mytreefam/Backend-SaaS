import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useHaptics } from './useHaptics';

/**
 * Hook para Pull to Refresh en móvil
 * Detecta el gesto de arrastrar hacia abajo y ejecuta callback
 */
export const usePullToRefresh = (
  onRefresh: () => Promise<void>,
  options?: {
    threshold?: number; // Distancia mínima para trigger (default: 80px)
    resistance?: number; // Resistencia al arrastre (default: 2.5)
    enabled?: boolean; // Habilitar/deshabilitar (default: true en móvil)
  }
) => {
  const haptics = useHaptics();
  const touchStartY = useRef<number>(0);
  const touchCurrentY = useRef<number>(0);
  const isRefreshing = useRef<boolean>(false);
  const pullIndicatorRef = useRef<HTMLDivElement | null>(null);

  const threshold = options?.threshold ?? 80;
  const resistance = options?.resistance ?? 2.5;
  const enabled = options?.enabled ?? Capacitor.isNativePlatform();

  useEffect(() => {
    if (!enabled) return;

    let touchIdentifier: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      // Solo activar si estamos en el top de la página
      if (window.scrollY > 0) return;
      
      touchStartY.current = e.touches[0].clientY;
      touchIdentifier = e.touches[0].identifier;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchIdentifier === null) return;
      if (isRefreshing.current) return;

      const touch = Array.from(e.touches).find(t => t.identifier === touchIdentifier);
      if (!touch) return;

      touchCurrentY.current = touch.clientY;
      const pullDistance = (touchCurrentY.current - touchStartY.current) / resistance;

      // Solo procesar si arrastramos hacia abajo
      if (pullDistance > 0 && window.scrollY === 0) {
        // Prevenir scroll nativo
        e.preventDefault();

        // Actualizar indicador visual
        if (pullIndicatorRef.current) {
          const progress = Math.min(pullDistance / threshold, 1);
          pullIndicatorRef.current.style.transform = `translateY(${pullDistance}px) rotate(${progress * 360}deg)`;
          pullIndicatorRef.current.style.opacity = `${progress}`;
        }

        // Haptic feedback al alcanzar threshold
        if (pullDistance >= threshold) {
          haptics.light();
        }
      }
    };

    const handleTouchEnd = async () => {
      if (touchIdentifier === null) return;
      
      const pullDistance = (touchCurrentY.current - touchStartY.current) / resistance;

      if (pullDistance >= threshold && !isRefreshing.current) {
        isRefreshing.current = true;
        
        // Haptic feedback de éxito
        haptics.medium();

        // Animación del indicador
        if (pullIndicatorRef.current) {
          pullIndicatorRef.current.style.transform = 'translateY(60px) rotate(360deg)';
          pullIndicatorRef.current.classList.add('refreshing');
        }

        try {
          // Ejecutar refresh
          await onRefresh();
          haptics.success();
        } catch (error) {
          console.error('[PullToRefresh] Error:', error);
          haptics.error();
        } finally {
          // Reset
          setTimeout(() => {
            if (pullIndicatorRef.current) {
              pullIndicatorRef.current.style.transform = 'translateY(-100px)';
              pullIndicatorRef.current.style.opacity = '0';
              pullIndicatorRef.current.classList.remove('refreshing');
            }
            isRefreshing.current = false;
          }, 500);
        }
      } else {
        // Reset si no alcanzó el threshold
        if (pullIndicatorRef.current) {
          pullIndicatorRef.current.style.transform = 'translateY(-100px)';
          pullIndicatorRef.current.style.opacity = '0';
        }
      }

      touchIdentifier = null;
      touchStartY.current = 0;
      touchCurrentY.current = 0;
    };

    // Registrar listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, threshold, resistance, onRefresh, haptics]);

  return { pullIndicatorRef };
};
