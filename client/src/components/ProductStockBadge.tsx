/**
 * 🏷️ BADGE DE STOCK DE PRODUCTO
 * 
 * Componente pequeño que muestra el estado del stock de un producto
 * considerando reservas activas. Se actualiza en tiempo real.
 */

import { useState, useEffect } from 'react';
import { useProductos } from '../contexts/ProductosContext';
import { stockReservationService } from '../services/stock-reservation.service';

interface ProductStockBadgeProps {
  productoId: string;
  showDetails?: boolean;
  className?: string;
}

export function ProductStockBadge({ 
  productoId, 
  showDetails = false,
  className = ''
}: ProductStockBadgeProps) {
  const { obtenerProducto, verificarDisponibilidad } = useProductos();
  const [, setTrigger] = useState(0);

  const producto = obtenerProducto(productoId);
  const disponibilidad = verificarDisponibilidad(productoId, 1);

  // Suscribirse a cambios de reservas para actualizar en tiempo real
  useEffect(() => {
    const unsub = stockReservationService.suscribirse(() => {
      setTrigger(prev => prev + 1);
    });

    return unsub;
  }, []);

  if (!producto) {
    return null;
  }

  // Determinar color y estado
  const getStockStatus = () => {
    if (disponibilidad.stockDisponible === 0) {
      return {
        color: 'bg-red-100 text-red-800 border-red-200',
        darkColor: 'dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
        label: 'Sin stock',
        icon: '🚫',
      };
    }
    
    if (disponibilidad.stockDisponible <= 5) {
      return {
        color: 'bg-orange-100 text-orange-800 border-orange-200',
        darkColor: 'dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
        label: 'Stock bajo',
        icon: '⚠️',
      };
    }
    
    if (disponibilidad.stockDisponible <= 10) {
      return {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        darkColor: 'dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
        label: 'Stock medio',
        icon: '📦',
      };
    }
    
    return {
      color: 'bg-green-100 text-green-800 border-green-200',
      darkColor: 'dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
      label: 'Disponible',
      icon: '✅',
    };
  };

  const status = getStockStatus();

  if (!showDetails) {
    // Versión simple: solo el badge
    return (
      <span 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.color} ${status.darkColor} ${className}`}
        title={`Stock disponible: ${disponibilidad.stockDisponible} (${disponibilidad.stockReservado} reservadas)`}
      >
        <span>{status.icon}</span>
        <span>{disponibilidad.stockDisponible}</span>
      </span>
    );
  }

  // Versión detallada
  return (
    <div className={`inline-flex flex-col gap-1 ${className}`}>
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${status.color} ${status.darkColor}`}>
        <span>{status.icon}</span>
        <span>{status.label}</span>
      </div>
      
      <div className="flex items-center gap-3 px-3 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-gray-500 dark:text-gray-400">Real:</span>
          <span className="font-mono font-semibold text-gray-900 dark:text-white">
            {disponibilidad.stockReal}
          </span>
        </div>
        
        {disponibilidad.stockReservado > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400">Reservado:</span>
            <span className="font-mono font-semibold text-yellow-600 dark:text-yellow-400">
              {disponibilidad.stockReservado}
            </span>
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <span className="text-gray-500 dark:text-gray-400">Disponible:</span>
          <span className={`font-mono font-semibold ${
            disponibilidad.stockDisponible === 0 
              ? 'text-red-600'
              : disponibilidad.stockDisponible < 5
              ? 'text-orange-600'
              : 'text-green-600'
          }`}>
            {disponibilidad.stockDisponible}
          </span>
        </div>
      </div>
    </div>
  );
}
