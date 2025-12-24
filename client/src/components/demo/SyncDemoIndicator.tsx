/**
 * 🔄 Indicador de Sincronización en Tiempo Real
 * 
 * Componente de demostración que muestra cuando hay cambios
 * en el StockContext para verificar que la sincronización funciona
 * 
 * USO: Añadir este componente a las pantallas de gerente y trabajador
 * durante las pruebas para ver la sincronización en acción
 */

import { useEffect, useState } from 'react';
import { useStock } from '../../contexts/StockContext';
import { Badge } from '../ui/badge';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SyncDemoIndicator() {
  const { stock, pedidosProveedores, recepciones } = useStock();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [showPulse, setShowPulse] = useState(false);

  // Detectar cambios en el stock
  useEffect(() => {
    setLastUpdate(new Date());
    setShowPulse(true);
    
    const timer = setTimeout(() => setShowPulse(false), 2000);
    return () => clearTimeout(timer);
  }, [stock.length, pedidosProveedores.length, recepciones.length]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg border-2 border-teal-200 p-4 max-w-xs"
    >
      <div className="flex items-start gap-3">
        <AnimatePresence mode="wait">
          {showPulse ? (
            <motion.div
              key="syncing"
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <RefreshCw className="w-5 h-5 text-teal-600 animate-spin" />
            </motion.div>
          ) : (
            <motion.div
              key="synced"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-gray-900 text-sm">
              StockContext Sync
            </p>
            {showPulse && (
              <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200 text-xs">
                Actualizado
              </Badge>
            )}
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Stock:</span>
              <span className="font-medium text-gray-900">{stock.length} SKUs</span>
            </div>
            <div className="flex justify-between">
              <span>Pedidos:</span>
              <span className="font-medium text-gray-900">{pedidosProveedores.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Recepciones:</span>
              <span className="font-medium text-gray-900">{recepciones.length}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-200">
              <span>Última actualización:</span>
              <span className="font-medium text-teal-600">
                {formatTime(lastUpdate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation en el borde */}
      {showPulse && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-teal-400"
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}
