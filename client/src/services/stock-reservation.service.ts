/**
 * 🔒 SERVICIO DE RESERVAS DE STOCK
 * 
 * Gestiona reservas temporales de stock durante el proceso de checkout
 * para prevenir overselling y mantener integridad de inventario
 */

import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export interface ReservaStock {
  id: string;
  productoId: string;
  cantidad: number;
  clienteId: string;
  sessionId: string; // ID de sesión del carrito
  creadaEn: Date;
  expiraEn: Date;
  estado: 'activa' | 'confirmada' | 'liberada' | 'expirada';
  metadata?: {
    carritoId?: string;
    pedidoId?: string;
  };
}

export interface ResultadoReserva {
  exitoso: boolean;
  reservaId?: string;
  mensaje: string;
  stockDisponible?: number;
  stockReservado?: number;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  DURACION_RESERVA_MS: 15 * 60 * 1000, // 15 minutos
  INTERVALO_LIMPIEZA_MS: 60 * 1000, // 1 minuto
  ALMACENAMIENTO_KEY: 'udar-reservas-stock',
  BROADCAST_CHANNEL: 'udar-stock-reservations',
};

// ============================================================================
// BROADCAST CHANNEL - Sincronización entre tabs
// ============================================================================

let reservasChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  reservasChannel = new BroadcastChannel(CONFIG.BROADCAST_CHANNEL);
}

// ============================================================================
// CLASE PRINCIPAL
// ============================================================================

class StockReservationService {
  private reservas: Map<string, ReservaStock> = new Map();
  private intervalLimpieza: NodeJS.Timeout | null = null;
  private listeners: Set<(reservas: ReservaStock[]) => void> = new Set();

  constructor() {
    this.cargarReservasDesdeStorage();
    this.iniciarLimpiezaAutomatica();
    this.escucharCambiosDeOtrosTabs();
  }

  // ==========================================================================
  // PERSISTENCIA
  // ==========================================================================

  private cargarReservasDesdeStorage(): void {
    try {
      const data = localStorage.getItem(CONFIG.ALMACENAMIENTO_KEY);
      if (data) {
        const reservasArray: ReservaStock[] = JSON.parse(data);
        
        // Filtrar reservas expiradas al cargar
        const ahora = new Date();
        reservasArray.forEach(reserva => {
          const expiraEn = new Date(reserva.expiraEn);
          if (expiraEn > ahora && reserva.estado === 'activa') {
            this.reservas.set(reserva.id, {
              ...reserva,
              creadaEn: new Date(reserva.creadaEn),
              expiraEn: new Date(reserva.expiraEn),
            });
          }
        });

        console.info(`📦 ${this.reservas.size} reservas de stock cargadas`);
      }
    } catch (error) {
      console.error('❌ Error al cargar reservas:', error);
    }
  }

  private guardarReservasEnStorage(): void {
    try {
      const reservasArray = Array.from(this.reservas.values());
      localStorage.setItem(CONFIG.ALMACENAMIENTO_KEY, JSON.stringify(reservasArray));
    } catch (error) {
      console.error('❌ Error al guardar reservas:', error);
    }
  }

  // ==========================================================================
  // BROADCAST - Sincronización multi-tab
  // ==========================================================================

  private escucharCambiosDeOtrosTabs(): void {
    if (!reservasChannel) return;

    reservasChannel.onmessage = (event: MessageEvent) => {
      const { type, reserva, reservaId } = event.data;

      switch (type) {
        case 'RESERVA_CREADA':
          this.reservas.set(reserva.id, {
            ...reserva,
            creadaEn: new Date(reserva.creadaEn),
            expiraEn: new Date(reserva.expiraEn),
          });
          this.notificarListeners();
          break;

        case 'RESERVA_LIBERADA':
          this.reservas.delete(reservaId);
          this.notificarListeners();
          break;

        case 'RESERVA_CONFIRMADA':
          const r = this.reservas.get(reservaId);
          if (r) {
            r.estado = 'confirmada';
            this.reservas.set(reservaId, r);
            this.notificarListeners();
          }
          break;
      }
    };
  }

  private broadcastCambio(type: string, data: any): void {
    if (reservasChannel) {
      reservasChannel.postMessage({ type, ...data });
    }
  }

  // ==========================================================================
  // LISTENERS - Suscripciones
  // ==========================================================================

  public suscribirse(callback: (reservas: ReservaStock[]) => void): () => void {
    this.listeners.add(callback);
    
    // Retornar función para desuscribirse
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notificarListeners(): void {
    const reservasArray = Array.from(this.reservas.values());
    this.listeners.forEach(callback => {
      try {
        callback(reservasArray);
      } catch (error) {
        console.error('❌ Error en listener de reservas:', error);
      }
    });
  }

  // ==========================================================================
  // CREAR RESERVA
  // ==========================================================================

  public crearReserva(
    productoId: string,
    cantidad: number,
    clienteId: string,
    sessionId: string,
    metadata?: any
  ): ResultadoReserva {
    try {
      // 1. Verificar que la cantidad sea válida
      if (cantidad <= 0) {
        return {
          exitoso: false,
          mensaje: 'La cantidad debe ser mayor a 0',
        };
      }

      // 2. Calcular stock disponible (considerando otras reservas activas)
      const stockReservado = this.obtenerStockReservado(productoId, sessionId);
      
      // Nota: El stock real se verificará desde ProductosContext antes de llamar a esta función

      // 3. Crear la reserva
      const ahora = new Date();
      const expiraEn = new Date(ahora.getTime() + CONFIG.DURACION_RESERVA_MS);

      const reserva: ReservaStock = {
        id: `RES-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        productoId,
        cantidad,
        clienteId,
        sessionId,
        creadaEn: ahora,
        expiraEn,
        estado: 'activa',
        metadata,
      };

      // 4. Guardar reserva
      this.reservas.set(reserva.id, reserva);
      this.guardarReservasEnStorage();

      // 5. Broadcast a otros tabs
      this.broadcastCambio('RESERVA_CREADA', { reserva });

      // 6. Notificar listeners
      this.notificarListeners();

      console.info(`✅ Reserva creada: ${reserva.id} - ${cantidad} unidades de ${productoId}`);

      return {
        exitoso: true,
        reservaId: reserva.id,
        mensaje: `Stock reservado por 15 minutos`,
        stockReservado: stockReservado + cantidad,
      };
    } catch (error) {
      console.error('❌ Error al crear reserva:', error);
      return {
        exitoso: false,
        mensaje: 'Error al reservar stock',
      };
    }
  }

  // ==========================================================================
  // LIBERAR RESERVA
  // ==========================================================================

  public liberarReserva(reservaId: string): boolean {
    try {
      const reserva = this.reservas.get(reservaId);
      if (!reserva) {
        console.warn(`⚠️ Reserva ${reservaId} no encontrada`);
        return false;
      }

      // Marcar como liberada
      reserva.estado = 'liberada';
      this.reservas.delete(reservaId);
      this.guardarReservasEnStorage();

      // Broadcast
      this.broadcastCambio('RESERVA_LIBERADA', { reservaId });

      // Notificar listeners
      this.notificarListeners();

      console.info(`✅ Reserva liberada: ${reservaId}`);

      return true;
    } catch (error) {
      console.error('❌ Error al liberar reserva:', error);
      return false;
    }
  }

  // ==========================================================================
  // LIBERAR POR SESIÓN
  // ==========================================================================

  public liberarReservasPorSesion(sessionId: string): number {
    try {
      let liberadas = 0;

      this.reservas.forEach((reserva, id) => {
        if (reserva.sessionId === sessionId && reserva.estado === 'activa') {
          this.liberarReserva(id);
          liberadas++;
        }
      });

      if (liberadas > 0) {
        console.info(`✅ ${liberadas} reservas liberadas para sesión ${sessionId}`);
      }

      return liberadas;
    } catch (error) {
      console.error('❌ Error al liberar reservas por sesión:', error);
      return 0;
    }
  }

  // ==========================================================================
  // CONFIRMAR RESERVA (cuando se completa el pedido)
  // ==========================================================================

  public confirmarReserva(reservaId: string, pedidoId: string): boolean {
    try {
      const reserva = this.reservas.get(reservaId);
      if (!reserva) {
        console.warn(`⚠️ Reserva ${reservaId} no encontrada`);
        return false;
      }

      // Marcar como confirmada
      reserva.estado = 'confirmada';
      if (reserva.metadata) {
        reserva.metadata.pedidoId = pedidoId;
      } else {
        reserva.metadata = { pedidoId };
      }

      this.reservas.set(reservaId, reserva);
      this.guardarReservasEnStorage();

      // Broadcast
      this.broadcastCambio('RESERVA_CONFIRMADA', { reservaId, pedidoId });

      // Notificar listeners
      this.notificarListeners();

      console.info(`✅ Reserva confirmada: ${reservaId} → Pedido ${pedidoId}`);

      return true;
    } catch (error) {
      console.error('❌ Error al confirmar reserva:', error);
      return false;
    }
  }

  // ==========================================================================
  // OBTENER STOCK RESERVADO
  // ==========================================================================

  public obtenerStockReservado(productoId: string, excluirSessionId?: string): number {
    let totalReservado = 0;

    this.reservas.forEach(reserva => {
      // Solo contar reservas activas del producto
      if (
        reserva.productoId === productoId &&
        reserva.estado === 'activa' &&
        reserva.sessionId !== excluirSessionId
      ) {
        // Verificar que no esté expirada
        if (new Date(reserva.expiraEn) > new Date()) {
          totalReservado += reserva.cantidad;
        }
      }
    });

    return totalReservado;
  }

  // ==========================================================================
  // OBTENER RESERVAS DE UNA SESIÓN
  // ==========================================================================

  public obtenerReservasPorSesion(sessionId: string): ReservaStock[] {
    const reservas: ReservaStock[] = [];

    this.reservas.forEach(reserva => {
      if (reserva.sessionId === sessionId && reserva.estado === 'activa') {
        reservas.push(reserva);
      }
    });

    return reservas;
  }

  // ==========================================================================
  // LIMPIEZA AUTOMÁTICA DE RESERVAS EXPIRADAS
  // ==========================================================================

  private iniciarLimpiezaAutomatica(): void {
    // Limpieza inicial
    this.limpiarReservasExpiradas();

    // Limpieza periódica cada minuto
    this.intervalLimpieza = setInterval(() => {
      this.limpiarReservasExpiradas();
    }, CONFIG.INTERVALO_LIMPIEZA_MS);
  }

  public limpiarReservasExpiradas(): number {
    let eliminadas = 0;
    const ahora = new Date();

    this.reservas.forEach((reserva, id) => {
      if (reserva.estado === 'activa' && new Date(reserva.expiraEn) <= ahora) {
        reserva.estado = 'expirada';
        this.reservas.delete(id);
        eliminadas++;

        console.info(`⏰ Reserva expirada: ${id}`);
      }
    });

    if (eliminadas > 0) {
      this.guardarReservasEnStorage();
      this.notificarListeners();
      console.info(`🧹 ${eliminadas} reservas expiradas eliminadas`);
    }

    return eliminadas;
  }

  // ==========================================================================
  // OBTENER TODAS LAS RESERVAS
  // ==========================================================================

  public obtenerTodasLasReservas(): ReservaStock[] {
    return Array.from(this.reservas.values());
  }

  // ==========================================================================
  // ESTADÍSTICAS
  // ==========================================================================

  public obtenerEstadisticas(): {
    totalReservas: number;
    reservasActivas: number;
    reservasConfirmadas: number;
    reservasExpiradas: number;
    productosMasReservados: Array<{ productoId: string; cantidad: number }>;
  } {
    const estadisticas = {
      totalReservas: this.reservas.size,
      reservasActivas: 0,
      reservasConfirmadas: 0,
      reservasExpiradas: 0,
      productosMasReservados: [] as Array<{ productoId: string; cantidad: number }>,
    };

    const productosCantidades = new Map<string, number>();

    this.reservas.forEach(reserva => {
      switch (reserva.estado) {
        case 'activa':
          estadisticas.reservasActivas++;
          break;
        case 'confirmada':
          estadisticas.reservasConfirmadas++;
          break;
        case 'expirada':
          estadisticas.reservasExpiradas++;
          break;
      }

      // Contar por producto
      const cantidad = productosCantidades.get(reserva.productoId) || 0;
      productosCantidades.set(reserva.productoId, cantidad + reserva.cantidad);
    });

    // Convertir a array y ordenar
    estadisticas.productosMasReservados = Array.from(productosCantidades.entries())
      .map(([productoId, cantidad]) => ({ productoId, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    return estadisticas;
  }

  // ==========================================================================
  // DESTRUIR SERVICIO
  // ==========================================================================

  public destruir(): void {
    if (this.intervalLimpieza) {
      clearInterval(this.intervalLimpieza);
      this.intervalLimpieza = null;
    }

    this.listeners.clear();

    if (reservasChannel) {
      reservasChannel.close();
      reservasChannel = null;
    }

    console.info('🗑️ Servicio de reservas de stock destruido');
  }
}

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

export const stockReservationService = new StockReservationService();

// ============================================================================
// LIMPIAR AL CERRAR LA VENTANA
// ============================================================================

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    stockReservationService.destruir();
  });
}
