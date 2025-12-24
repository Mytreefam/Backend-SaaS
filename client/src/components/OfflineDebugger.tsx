/**
 * COMPONENTE DE DEBUG OFFLINE
 * 
 * Muestra el estado del sistema offline en modo desarrollo
 * Solo visible en entorno de desarrollo
 */

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Database, Loader2 } from 'lucide-react';
import { 
  isOfflineServiceReady, 
  isConnectionOnline,
  getPendingActions,
  type OfflineAction 
} from '../services/offline.service';
import { isDevelopment } from '../lib/env-utils';

export function OfflineDebugger() {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en modo debug/desarrollo
    setIsVisible(isDevelopment);

    if (!isDevelopment) return;

    // Verificar estado inicial
    const checkStatus = async () => {
      setIsReady(isOfflineServiceReady());
      setIsOnline(isConnectionOnline());
      
      if (isOfflineServiceReady()) {
        try {
          const actions = await getPendingActions();
          setPendingCount(actions.length);
        } catch (error) {
          console.error('Error obteniendo acciones pendientes:', error);
        }
      }
    };

    checkStatus();

    // Actualizar cada 5 segundos
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg text-sm space-y-2 z-50 max-w-xs">
      <div className="flex items-center justify-between border-b border-gray-700 pb-2 mb-2">
        <span className="font-semibold">🔧 Offline Debug</span>
      </div>

      {/* Estado de IndexedDB */}
      <div className="flex items-center gap-2">
        {isReady ? (
          <Database className="w-4 h-4 text-green-400" />
        ) : (
          <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
        )}
        <span className="text-xs">
          IndexedDB: {isReady ? (
            <span className="text-green-400">✓ Listo</span>
          ) : (
            <span className="text-yellow-400">⏳ Inicializando...</span>
          )}
        </span>
      </div>

      {/* Estado de conexión */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs">
          Conexión: {isOnline ? (
            <span className="text-green-400">✓ Online</span>
          ) : (
            <span className="text-red-400">✗ Offline</span>
          )}
        </span>
      </div>

      {/* Acciones pendientes */}
      {isReady && (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${pendingCount > 0 ? 'bg-yellow-400' : 'bg-gray-600'}`} />
          <span className="text-xs">
            Acciones pendientes: <span className="font-mono">{pendingCount}</span>
          </span>
        </div>
      )}

      {/* Advertencia si no está listo */}
      {!isReady && (
        <div className="text-xs text-yellow-300 mt-2 pt-2 border-t border-gray-700">
          ⚠️ Algunas funciones offline no están disponibles
        </div>
      )}
    </div>
  );
}
