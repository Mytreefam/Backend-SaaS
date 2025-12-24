/**
 * INDICADOR DE CONEXIÓN
 * 
 * Muestra el estado de conexión a Internet
 * - Online: Verde con icono WiFi
 * - Offline: Rojo con icono sin conexión
 * - Sincronizando: Amarillo con spinner
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wifi, WifiOff, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { Badge } from '../ui/badge';
import {
  getConnectionStatus,
  onConnectionChange,
  syncPendingActions,
  getPendingActions,
  type ConnectionStatus,
} from '../../services/offline.service';
import { t } from '../../config/i18n.config';

export function ConnectionIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Suscribirse a cambios de conexión
    const unsubscribe = onConnectionChange((newStatus) => {
      setStatus(newStatus);
    });

    // Actualizar contador de acciones pendientes
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const updatePendingCount = async () => {
    try {
      const actions = await getPendingActions();
      setPendingCount(actions.length);
    } catch (error) {
      console.error('Error obteniendo acciones pendientes:', error);
    }
  };

  const handleSync = async () => {
    if (!status.online || syncing) return;

    setSyncing(true);
    try {
      await syncPendingActions();
      await updatePendingCount();
    } catch (error) {
      console.error('Error sincronizando:', error);
    } finally {
      setSyncing(false);
    }
  };

  // No mostrar nada si está online y no hay pendientes
  if (status.online && pendingCount === 0 && !showDetails) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
      >
        <Badge
          variant={status.online ? 'default' : 'destructive'}
          className={`
            flex items-center gap-2 px-4 py-2 shadow-lg cursor-pointer
            ${status.online ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
            ${syncing ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
          `}
          onClick={() => setShowDetails(!showDetails)}
        >
          {/* Icono */}
          {syncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : status.online ? (
            pendingCount > 0 ? (
              <Cloud className="w-4 h-4" />
            ) : (
              <Wifi className="w-4 h-4" />
            )
          ) : (
            <WifiOff className="w-4 h-4" />
          )}

          {/* Texto */}
          <span className="font-medium">
            {syncing
              ? 'Sincronizando...'
              : status.online
              ? pendingCount > 0
                ? `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`
                : 'Conectado'
              : 'Sin conexión'}
          </span>

          {/* Botón sync */}
          {status.online && pendingCount > 0 && !syncing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSync();
              }}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </Badge>

        {/* Detalles expandidos */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 bg-white rounded-lg shadow-xl border p-4 min-w-[300px]"
            >
              <div className="space-y-2 text-sm">
                {/* Estado */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <span className={status.online ? 'text-green-600' : 'text-red-600'}>
                    {status.online ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>

                {/* Tipo de conexión */}
                {status.online && status.effectiveType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Conexión:</span>
                    <span className="text-gray-900 uppercase">
                      {status.effectiveType}
                    </span>
                  </div>
                )}

                {/* Acciones pendientes */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="text-gray-900">
                    {pendingCount}
                  </span>
                </div>

                {/* Botón sincronizar */}
                {status.online && pendingCount > 0 && (
                  <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="w-full mt-3 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {syncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Sincronizar ahora
                      </>
                    )}
                  </button>
                )}

                {/* Mensaje offline */}
                {!status.online && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      Los cambios se guardarán localmente y se sincronizarán cuando vuelva la conexión.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
