import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner@2.0.3';
import { APP_CONFIG } from '../config/app.config';

interface AppVersion {
  current: string;
  latest: string;
  updateAvailable: boolean;
  updateRequired: boolean; // Si es crítica
  changelog?: string[];
}

/**
 * Hook para verificar actualizaciones de la app
 * Compara versión actual con la última disponible en tu API
 */
export const useAppUpdate = () => {
  const [versionInfo, setVersionInfo] = useState<AppVersion | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Obtener versión actual de la app
   */
  const getCurrentVersion = async (): Promise<string> => {
    // En web, usar versión del config
    if (!Capacitor.isNativePlatform()) {
      return APP_CONFIG.app.version;
    }

    // En nativo, obtener versión del build
    try {
      const { App } = await import('@capacitor/app');
      const info = await App.getInfo();
      return info.version;
    } catch (error) {
      console.error('[AppUpdate] Error obteniendo versión:', error);
      return APP_CONFIG.app.version;
    }
  };

  /**
   * Verificar si hay actualización disponible
   * TODO: Conectar con tu API backend
   */
  const checkForUpdate = async () => {
    setIsChecking(true);

    try {
      const currentVersion = await getCurrentVersion();

      // TODO: Reemplazar con tu endpoint real
      // const response = await fetch('https://api.udaredge.com/v1/app/version');
      // const data = await response.json();

      // Mock data - Por defecto NO HAY actualización disponible
      // Para testing, cambiar mockLatestVersion a una versión mayor (ej: '1.2.0')
      const mockLatestVersion = currentVersion; // Sin actualización por defecto
      const mockChangelog = [
        'Mejoras en el rendimiento',
        'Corrección de errores menores',
        'Nueva funcionalidad de compartir',
      ];
      const mockUpdateRequired = false; // Si es crítica

      // Comparar versiones
      const updateAvailable = compareVersions(currentVersion, mockLatestVersion) < 0;

      const versionData: AppVersion = {
        current: currentVersion,
        latest: mockLatestVersion,
        updateAvailable,
        updateRequired: mockUpdateRequired,
        changelog: mockChangelog,
      };

      setVersionInfo(versionData);

      // Mostrar notificación si hay actualización
      if (updateAvailable) {
        if (mockUpdateRequired) {
          toast.error('¡Actualización crítica disponible!', {
            description: 'Es necesario actualizar la app para continuar',
            duration: 10000,
          });
        } else {
          toast.info('Nueva versión disponible', {
            description: `Versión ${mockLatestVersion} ya está disponible`,
            action: {
              label: 'Ver',
              onClick: () => openUpdateModal(),
            },
          });
        }
      }

      return versionData;
    } catch (error) {
      console.error('[AppUpdate] Error verificando actualización:', error);
      toast.error('Error al verificar actualizaciones');
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Comparar dos versiones semánticas (1.2.3)
   * Retorna: -1 si v1 < v2, 0 si iguales, 1 si v1 > v2
   */
  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  };

  /**
   * Abrir modal de actualización (implementar según tu UI)
   */
  const openUpdateModal = () => {
    // TODO: Mostrar modal con changelog y botón de actualizar
    console.log('[AppUpdate] Abrir modal de actualización');
  };

  /**
   * Redirigir a la store para actualizar
   */
  const goToStore = () => {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'android') {
      window.open('https://play.google.com/store/apps/details?id=com.udar.edge', '_system');
    } else if (platform === 'ios') {
      window.open('https://apps.apple.com/app/udar-edge/id123456789', '_system');
    } else {
      toast.info('Por favor, actualiza desde la tienda de aplicaciones');
    }
  };

  // Auto-verificar al montar (opcional)
  useEffect(() => {
    // Verificar al abrir la app
    checkForUpdate();

    // Verificar cada 24 horas
    const interval = setInterval(() => {
      checkForUpdate();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    versionInfo,
    isChecking,
    checkForUpdate,
    goToStore,
    compareVersions,
  };
};
