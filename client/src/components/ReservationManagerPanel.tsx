/**
 * 🔧 PANEL DE GESTIÓN DE RESERVAS
 * 
 * Herramienta de administración para el perfil Gerente
 * que permite visualizar y gestionar reservas de stock
 */

import { useState, useEffect } from 'react';
import { stockReservationService } from '../services/stock-reservation.service';
import { useProductos } from '../contexts/ProductosContext';
import type { ReservaStock } from '../services/stock-reservation.service';
import { toast } from 'sonner@2.0.3';

export function ReservationManagerPanel() {
  const { productos, obtenerProducto } = useProductos();
  const [reservas, setReservas] = useState<ReservaStock[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'confirmadas' | 'expiradas'>('activas');
  const [busqueda, setBusqueda] = useState('');

  // Suscribirse a cambios
  useEffect(() => {
    const unsub = stockReservationService.suscribirse((nuevasReservas) => {
      setReservas(nuevasReservas);
    });

    // Cargar reservas iniciales
    setReservas(stockReservationService.obtenerTodasLasReservas());

    return unsub;
  }, []);

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(reserva => {
    // Filtro por estado
    if (filtro !== 'todas' && reserva.estado !== filtro.slice(0, -1)) {
      return false;
    }

    // Filtro por búsqueda
    if (busqueda) {
      const producto = obtenerProducto(reserva.productoId);
      const nombreProducto = producto?.nombre.toLowerCase() || '';
      const idProducto = reserva.productoId.toLowerCase();
      const sessionId = reserva.sessionId.toLowerCase();
      const busquedaLower = busqueda.toLowerCase();

      return nombreProducto.includes(busquedaLower) || 
             idProducto.includes(busquedaLower) ||
             sessionId.includes(busquedaLower);
    }

    return true;
  });

  // Liberar reserva manualmente
  const handleLiberarReserva = (reservaId: string) => {
    const exito = stockReservationService.liberarReserva(reservaId);
    
    if (exito) {
      toast.success('Reserva liberada correctamente');
    } else {
      toast.error('Error al liberar reserva');
    }
  };

  // Limpiar todas las reservas expiradas
  const handleLimpiarExpiradas = () => {
    const eliminadas = stockReservationService.limpiarReservasExpiradas();
    
    if (eliminadas > 0) {
      toast.success(`${eliminadas} reservas expiradas eliminadas`);
    } else {
      toast.info('No hay reservas expiradas');
    }
  };

  // Estadísticas
  const stats = {
    total: reservas.length,
    activas: reservas.filter(r => r.estado === 'activa').length,
    confirmadas: reservas.filter(r => r.estado === 'confirmada').length,
    expiradas: reservas.filter(r => r.estado === 'expirada').length,
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🔧 Gestión de Reservas
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Administra las reservas temporales de stock
          </p>
        </div>

        <button
          onClick={handleLimpiarExpiradas}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
        >
          🧹 Limpiar Expiradas
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
            Total
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
            {stats.total}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
            Activas
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-300">
            {stats.activas}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
            Confirmadas
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
            {stats.confirmadas}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
            Expiradas
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-gray-300">
            {stats.expiradas}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por producto, ID o sesión..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
          />
        </div>

        <div className="flex gap-2">
          {(['todas', 'activas', 'confirmadas', 'expiradas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de reservas */}
      {reservasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 dark:text-gray-400">
            No hay reservas {filtro !== 'todas' ? filtro : ''} que mostrar
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reservasFiltradas
            .sort((a, b) => new Date(b.creadaEn).getTime() - new Date(a.creadaEn).getTime())
            .map(reserva => {
              const producto = obtenerProducto(reserva.productoId);
              const tiempoRestante = new Date(reserva.expiraEn).getTime() - Date.now();
              const minutosRestantes = Math.floor(tiempoRestante / 60000);
              const horaCreacion = new Date(reserva.creadaEn).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });
              const horaExpiracion = new Date(reserva.expiraEn).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                >
                  {/* Info de la reserva */}
                  <div className="flex items-center gap-4 flex-1">
                    {/* Indicador de estado */}
                    <div className={`w-3 h-3 rounded-full ${
                      reserva.estado === 'activa'
                        ? 'bg-green-500 animate-pulse'
                        : reserva.estado === 'confirmada'
                        ? 'bg-purple-500'
                        : 'bg-gray-400'
                    }`} />

                    {/* Producto */}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {producto?.nombre || reserva.productoId}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="font-mono">{reserva.id}</span>
                        <span>•</span>
                        <span>{reserva.cantidad} {reserva.cantidad === 1 ? 'unidad' : 'unidades'}</span>
                        <span>•</span>
                        <span className="font-mono">{reserva.sessionId.slice(0, 16)}...</span>
                      </div>
                    </div>

                    {/* Tiempos */}
                    <div className="text-right">
                      <div className="text-sm text-gray-900 dark:text-white font-medium">
                        Creada: {horaCreacion}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Expira: {horaExpiracion}
                      </div>
                    </div>

                    {/* Tiempo restante */}
                    {reserva.estado === 'activa' && (
                      <div className="text-right">
                        <div className={`text-sm font-mono font-bold ${
                          minutosRestantes < 3
                            ? 'text-red-600 dark:text-red-400'
                            : minutosRestantes < 5
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {minutosRestantes > 0 ? `${minutosRestantes}min` : '<1min'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          restantes
                        </div>
                      </div>
                    )}

                    {/* Estado */}
                    <div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        reserva.estado === 'activa'
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                          : reserva.estado === 'confirmada'
                          ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                      }`}>
                        {reserva.estado === 'activa' ? '🟢 Activa' : 
                         reserva.estado === 'confirmada' ? '✅ Confirmada' : 
                         '⏰ Expirada'}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  {reserva.estado === 'activa' && (
                    <button
                      onClick={() => handleLiberarReserva(reserva.id)}
                      className="ml-4 px-4 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                    >
                      Liberar
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
