import { useEffect } from 'react';
import { ScreenOrientation, OrientationType } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

/**
 * Hook para controlar la orientación de la pantalla
 * Útil para forzar portrait o landscape en ciertas secciones
 */
export const useOrientation = () => {

  /**
   * Bloquear en modo portrait (vertical)
   */
  const lockPortrait = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await ScreenOrientation.lock({ orientation: 'portrait' as OrientationType });
      console.log('[Orientation] Bloqueado en portrait');
    } catch (error) {
      console.error('[Orientation] Error bloqueando portrait:', error);
    }
  };

  /**
   * Bloquear en modo landscape (horizontal)
   */
  const lockLandscape = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await ScreenOrientation.lock({ orientation: 'landscape' as OrientationType });
      console.log('[Orientation] Bloqueado en landscape');
    } catch (error) {
      console.error('[Orientation] Error bloqueando landscape:', error);
    }
  };

  /**
   * Desbloquear orientación (permitir rotación)
   */
  const unlock = async () => {
    if (!Capacitor.isNativePlatform()) return;

    try {
      await ScreenOrientation.unlock();
      console.log('[Orientation] Orientación desbloqueada');
    } catch (error) {
      console.error('[Orientation] Error desbloqueando:', error);
    }
  };

  /**
   * Obtener orientación actual
   */
  const getCurrentOrientation = async () => {
    if (!Capacitor.isNativePlatform()) return 'portrait';

    try {
      const result = await ScreenOrientation.orientation();
      return result.type;
    } catch (error) {
      console.error('[Orientation] Error obteniendo orientación:', error);
      return 'portrait';
    }
  };

  return {
    lockPortrait,
    lockLandscape,
    unlock,
    getCurrentOrientation,
  };
};

/**
 * Hook para forzar portrait en un componente específico
 * Se auto-limpia al desmontar
 */
export const useLockPortrait = () => {
  const { lockPortrait, unlock } = useOrientation();

  useEffect(() => {
    lockPortrait();
    return () => {
      unlock();
    };
  }, []);
};

/**
 * Hook para forzar landscape en un componente específico
 * Útil para vídeos, juegos, o visualizaciones horizontales
 */
export const useLockLandscape = () => {
  const { lockLandscape, unlock } = useOrientation();

  useEffect(() => {
    lockLandscape();
    return () => {
      unlock();
    };
  }, []);
};
