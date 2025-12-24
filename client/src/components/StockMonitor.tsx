/**
 * 📊 MONITOR DE STOCK EN TIEMPO REAL
 * 
 * Componente de desarrollo para visualizar:
 * - Stock real de productos
 * - Reservas activas
 * - Stock disponible calculado
 * - Sincronización multi-tab
 */

import { useState, useEffect } from 'react';
import { useProductos } from '../contexts/ProductosContext';
import { stockReservationService } from '../services/stock-reservation.service';
import type { ReservaStock } from '../services/stock-reservation.service';

interface StockMonitorProps {
  productoId?: string; // Si se especifica, solo muestra ese producto
  compact?: boolean;
}

export function StockMonitor({ productoId, compact = false }: StockMonitorProps) {
  const { productos, verificarDisponibilidad } = useProductos();
  const [reservas, setReservas] = useState<ReservaStock[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  // Suscribirse a cambios de reservas
  useEffect(() => {
    const unsub = stockReservationService.suscribirse((nuevasReservas) => {
      setReservas(nuevasReservas);
    });

    // Cargar reservas iniciales
    setReservas(stockReservationService.obtenerTodasLasReservas());

    return unsub;
  }, []);

  // Actualizar estadísticas cada 5 segundos
  useEffect(() => {
    const actualizarEstadisticas = () => {
      const stats = stockReservationService.obtenerEstadisticas();
      setEstadisticas(stats);
    };

    actualizarEstadisticas();
    const interval = setInterval(actualizarEstadisticas, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filtrar productos si se especifica uno
  const productosAMostrar = productoId 
    ? productos.filter(p => p.id === productoId)
    : productos.slice(0, 10); // Mostrar solo los primeros 10 en modo normal

  if (compact) {
    return (
      <div className="bg-gray-900 text-white p-4 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">📊 Stock Monitor</h3>
          <span className="text-xs bg-green-600 px-2 py-1 rounded">
            {reservas.length} reservas activas
          </span>
        </div>
        
        {estadisticas && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Activas</div>
              <div className="text-lg">{estadisticas.reservasActivas}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Confirmadas</div>
              <div className="text-lg">{estadisticas.reservasConfirmadas}</div>
            </div>
            <div className="bg-gray-800 p-2 rounded">
              <div className="text-gray-400">Expiradas</div>
              <div className="text-lg">{estadisticas.reservasExpiradas}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📊 Monitor de Stock en Tiempo Real
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Sistema de reservas y sincronización multi-tab
          </p>
        </div>
        
        {estadisticas && (
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {estadisticas.reservasActivas}
              </div>
              <div className="text-xs text-gray-500">Activas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {estadisticas.reservasConfirmadas}
              </div>
              <div className="text-xs text-gray-500">Confirmadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">
                {estadisticas.reservasExpiradas}
              </div>
              <div className="text-xs text-gray-500">Expiradas</div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de productos */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Producto
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Stock Real
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Reservado
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Disponible
              </th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {productosAMostrar.map(producto => {
              const disponibilidad = verificarDisponibilidad(producto.id, 1);
              const porcentajeDisponible = (disponibilidad.stockDisponible / producto.stock) * 100;
              
              return (
                <tr 
                  key={producto.id}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {producto.nombre}
                      </div>
                      <div className="text-xs text-gray-500">
                        {producto.id}
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono text-gray-900 dark:text-white">
                      {producto.stock}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <span className={`font-mono ${
                      disponibilidad.stockReservado > 0 
                        ? 'text-yellow-600 dark:text-yellow-400 font-bold' 
                        : 'text-gray-400'
                    }`}>
                      {disponibilidad.stockReservado}
                    </span>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono font-bold ${
                        disponibilidad.stockDisponible === 0 
                          ? 'text-red-600'
                          : disponibilidad.stockDisponible < 5
                          ? 'text-orange-600'
                          : 'text-green-600'
                      }`}>
                        {disponibilidad.stockDisponible}
                      </span>
                      
                      {/* Barra de progreso */}
                      <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${
                            porcentajeDisponible === 0
                              ? 'bg-red-600'
                              : porcentajeDisponible < 30
                              ? 'bg-orange-600'
                              : 'bg-green-600'
                          }`}
                          style={{ width: `${Math.max(0, Math.min(100, porcentajeDisponible))}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="py-3 px-4 text-center">
                    {disponibilidad.stockDisponible === 0 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                        Sin stock
                      </span>
                    ) : disponibilidad.stockDisponible < 5 ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400">
                        Stock bajo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                        Disponible
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Listado de reservas activas */}
      {reservas.filter(r => r.estado === 'activa').length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔒 Reservas Activas ({reservas.filter(r => r.estado === 'activa').length})
          </h3>
          
          <div className="space-y-2">
            {reservas
              .filter(r => r.estado === 'activa')
              .sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())
              .slice(0, 5)
              .map(reserva => {
                const producto = productos.find(p => p.id === reserva.productoId);
                const tiempoRestante = new Date(reserva.expiraEn).getTime() - Date.now();
                const minutosRestantes = Math.floor(tiempoRestante / 60000);
                
                return (
                  <div 
                    key={reserva.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {producto?.nombre || reserva.productoId}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reserva.cantidad} {reserva.cantidad === 1 ? 'unidad' : 'unidades'} • 
                          Sesión: {reserva.sessionId.slice(0, 12)}...
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-mono ${
                        minutosRestantes < 3 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {minutosRestantes}min restantes
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(reserva.creadaEn).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Productos más reservados */}
      {estadisticas?.productosMasReservados?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🔥 Productos Más Reservados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {estadisticas.productosMasReservados.slice(0, 3).map((item: any, index: number) => {
              const producto = productos.find(p => p.id === item.productoId);
              
              return (
                <div 
                  key={item.productoId}
                  className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white font-bold text-sm">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {producto?.nombre || item.productoId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.cantidad} {item.cantidad === 1 ? 'reserva' : 'reservas'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
