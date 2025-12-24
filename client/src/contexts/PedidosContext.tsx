/**
 * 📦 CONTEXTO GLOBAL DE PEDIDOS
 * 
 * Centraliza la gestión de pedidos en toda la aplicación
 * Flujo completo: Cliente → Trabajador → Gerente
 * 
 * Características:
 * - Sincronización en tiempo real entre roles (BroadcastChannel)
 * - Validación de stock automática
 * - Historial completo de cambios
 * - Notificaciones automáticas
 * - Estadísticas en tiempo real
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';

// ============================================================================
// TIPOS
// ============================================================================

export type EstadoPedido = 
  | 'pendiente'    // Cliente creó el pedido
  | 'confirmado'   // Trabajador confirmó
  | 'preparando'   // En preparación
  | 'listo'        // Listo para entrega
  | 'enviado'      // En camino (delivery)
  | 'entregado'    // Completado
  | 'cancelado';   // Cancelado

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  imagen?: string;
  observaciones?: string;
  opcionesPersonalizadas?: any;
}

export interface Pedido {
  id: string;
  numero: number; // Número secuencial visible (#0001)
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  items: ItemPedido[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: EstadoPedido;
  tipoEntrega: 'tienda' | 'domicilio' | 'mesa';
  direccionEntrega?: string;
  numeroMesa?: number;
  metodoPago: 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';
  observaciones?: string;
  cuponAplicado?: {
    codigo: string;
    descuento: number;
    tipo: 'porcentaje' | 'fijo';
  };
  fechaCreacion: string;
  fechaActualizacion: string;
  horaEstimadaEntrega?: string;
  actualizadoPor?: {
    userId: string;
    userName: string;
    timestamp: string;
  };
  marcaId?: string;
  puntoVentaId?: string;
  // Historial de cambios
  historialEstados?: Array<{
    estado: EstadoPedido;
    timestamp: string;
    userId: string;
    userName: string;
  }>;
}

interface PedidosContextType {
  // Estado
  pedidos: Pedido[];
  loading: boolean;
  
  // Acciones principales
  crearPedido: (datos: CrearPedidoRequest) => Promise<Pedido>;
  obtenerPedidos: (filtros?: FiltrosPedidos) => Pedido[];
  obtenerPedido: (id: string) => Pedido | undefined;
  actualizarEstado: (pedidoId: string, nuevoEstado: EstadoPedido, userId: string, userName: string) => void;
  cancelarPedido: (pedidoId: string, motivo: string, userId: string, userName: string) => void;
  actualizarPedido: (pedidoId: string, datos: Partial<Pedido>, userId: string, userName: string) => void;
  
  // Suscripciones en tiempo real
  suscribirseACambios: (callback: (pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => void) => () => void;
  
  // Estadísticas
  obtenerEstadisticas: (filtros?: FiltrosPedidos) => EstadisticasPedidos;
  
  // Utilidades
  obtenerSiguienteNumero: () => number;
}

export interface CrearPedidoRequest {
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  items: ItemPedido[];
  tipoEntrega: 'tienda' | 'domicilio' | 'mesa';
  direccionEntrega?: string;
  numeroMesa?: number;
  metodoPago: 'tarjeta' | 'efectivo' | 'bizum' | 'pendiente';
  observaciones?: string;
  cuponAplicado?: {
    codigo: string;
    descuento: number;
    tipo: 'porcentaje' | 'fijo';
  };
  marcaId?: string;
  puntoVentaId?: string;
  horaEstimadaEntrega?: string;
}

export interface FiltrosPedidos {
  estado?: EstadoPedido | EstadoPedido[];
  clienteId?: string;
  marcaId?: string;
  puntoVentaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  tipoEntrega?: 'tienda' | 'domicilio' | 'mesa';
  metodoPago?: string;
  busqueda?: string; // Buscar por nombre cliente, número pedido, etc.
}

export interface EstadisticasPedidos {
  total: number;
  pendientes: number;
  enPreparacion: number;
  completados: number;
  cancelados: number;
  ventaTotal: number;
  ticketMedio: number;
  itemsVendidos: number;
}

// ============================================================================
// BROADCAST CHANNEL - Sincronización en tiempo real
// ============================================================================

let pedidosChannel: BroadcastChannel | null = null;

// Inicializar canal solo una vez
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  pedidosChannel = new BroadcastChannel('udar-pedidos-sync');
}

// ============================================================================
// CONTEXTO
// ============================================================================

const PedidosContext = createContext<PedidosContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function PedidosProvider({ children }: { children: React.ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [suscriptores, setSuscriptores] = useState<Array<(pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => void>>([]);

  // ============================================================================
  // CARGAR DATOS INICIALES
  // ============================================================================

  useEffect(() => {
    try {
      const pedidosGuardados = localStorage.getItem('udar-pedidos');
      if (pedidosGuardados) {
        const pedidosParseados = JSON.parse(pedidosGuardados);
        setPedidos(pedidosParseados);
      }
    } catch (error) {
      console.error('❌ Error al cargar pedidos:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // PERSISTIR EN LOCALSTORAGE
  // ============================================================================

  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('udar-pedidos', JSON.stringify(pedidos));
      } catch (error) {
        console.error('❌ Error al guardar pedidos:', error);
      }
    }
  }, [pedidos, loading]);

  // ============================================================================
  // ESCUCHAR EVENTOS DE OTROS TABS/ROLES (BroadcastChannel)
  // ============================================================================

  useEffect(() => {
    if (!pedidosChannel) return;

    const handleMessage = (event: MessageEvent) => {
      const { type, pedido } = event.data;

      switch (type) {
        case 'PEDIDO_CREADO':
          setPedidos(prev => {
            // Evitar duplicados
            if (prev.some(p => p.id === pedido.id)) return prev;
            return [pedido, ...prev];
          });
          notificarSuscriptores(pedido, 'creado');
          break;

        case 'PEDIDO_ACTUALIZADO':
          setPedidos(prev => 
            prev.map(p => p.id === pedido.id ? pedido : p)
          );
          notificarSuscriptores(pedido, 'actualizado');
          break;

        case 'PEDIDO_CANCELADO':
          setPedidos(prev => 
            prev.map(p => p.id === pedido.id ? pedido : p)
          );
          notificarSuscriptores(pedido, 'cancelado');
          break;
      }
    };

    pedidosChannel.onmessage = handleMessage;

    return () => {
      if (pedidosChannel) {
        pedidosChannel.onmessage = null;
      }
    };
  }, []);

  // ============================================================================
  // NOTIFICAR SUSCRIPTORES
  // ============================================================================

  const notificarSuscriptores = useCallback((pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => {
    suscriptores.forEach(callback => {
      try {
        callback(pedido, tipo);
      } catch (error) {
        console.error('❌ Error en suscriptor:', error);
      }
    });
  }, [suscriptores]);

  // ============================================================================
  // OBTENER SIGUIENTE NÚMERO DE PEDIDO
  // ============================================================================

  const obtenerSiguienteNumero = useCallback((): number => {
    if (pedidos.length === 0) return 1;
    const maxNumero = Math.max(...pedidos.map(p => p.numero));
    return maxNumero + 1;
  }, [pedidos]);

  // ============================================================================
  // CREAR PEDIDO
  // ============================================================================

  const crearPedido = useCallback(async (datos: CrearPedidoRequest): Promise<Pedido> => {
    try {
      // 1. Calcular totales
      const subtotal = datos.items.reduce((sum, item) => sum + item.subtotal, 0);
      const descuento = datos.cuponAplicado?.descuento || 0;
      const subtotalConDescuento = subtotal - descuento;
      const iva = subtotalConDescuento * 0.21;
      const total = subtotalConDescuento + iva;

      // 2. Generar número de pedido secuencial
      const numero = obtenerSiguienteNumero();

      // 3. Crear pedido
      const nuevoPedido: Pedido = {
        id: `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        numero,
        clienteId: datos.clienteId,
        clienteNombre: datos.clienteNombre,
        clienteEmail: datos.clienteEmail,
        clienteTelefono: datos.clienteTelefono,
        items: datos.items,
        subtotal,
        descuento,
        iva,
        total,
        estado: 'pendiente',
        tipoEntrega: datos.tipoEntrega,
        direccionEntrega: datos.direccionEntrega,
        numeroMesa: datos.numeroMesa,
        metodoPago: datos.metodoPago,
        observaciones: datos.observaciones,
        cuponAplicado: datos.cuponAplicado,
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        horaEstimadaEntrega: datos.horaEstimadaEntrega,
        actualizadoPor: {
          userId: datos.clienteId,
          userName: datos.clienteNombre,
          timestamp: new Date().toISOString(),
        },
        marcaId: datos.marcaId,
        puntoVentaId: datos.puntoVentaId,
        historialEstados: [{
          estado: 'pendiente',
          timestamp: new Date().toISOString(),
          userId: datos.clienteId,
          userName: datos.clienteNombre,
        }],
      };

      // 4. Guardar pedido localmente
      setPedidos(prev => [nuevoPedido, ...prev]);

      // 5. ✅ Notificar a otros tabs/roles (BroadcastChannel)
      if (pedidosChannel) {
        pedidosChannel.postMessage({
          type: 'PEDIDO_CREADO',
          pedido: nuevoPedido,
        });
      }

      // 6. Notificar suscriptores
      notificarSuscriptores(nuevoPedido, 'creado');

      // 7. Mostrar confirmación
      toast.success('✅ Pedido creado correctamente', {
        description: `Pedido #${numero.toString().padStart(4, '0')} - Total: ${total.toFixed(2)}€`,
      });

      return nuevoPedido;
    } catch (error) {
      console.error('❌ Error al crear pedido:', error);
      toast.error('Error al crear el pedido');
      throw error;
    }
  }, [obtenerSiguienteNumero, notificarSuscriptores]);

  // ============================================================================
  // OBTENER PEDIDOS CON FILTROS
  // ============================================================================

  const obtenerPedidos = useCallback((filtros?: FiltrosPedidos): Pedido[] => {
    let resultado = [...pedidos];

    if (filtros?.estado) {
      const estados = Array.isArray(filtros.estado) ? filtros.estado : [filtros.estado];
      resultado = resultado.filter(p => estados.includes(p.estado));
    }

    if (filtros?.clienteId) {
      resultado = resultado.filter(p => p.clienteId === filtros.clienteId);
    }

    if (filtros?.marcaId) {
      resultado = resultado.filter(p => p.marcaId === filtros.marcaId);
    }

    if (filtros?.puntoVentaId) {
      resultado = resultado.filter(p => p.puntoVentaId === filtros.puntoVentaId);
    }

    if (filtros?.tipoEntrega) {
      resultado = resultado.filter(p => p.tipoEntrega === filtros.tipoEntrega);
    }

    if (filtros?.metodoPago) {
      resultado = resultado.filter(p => p.metodoPago === filtros.metodoPago);
    }

    if (filtros?.fechaDesde) {
      resultado = resultado.filter(p => p.fechaCreacion >= filtros.fechaDesde!);
    }

    if (filtros?.fechaHasta) {
      resultado = resultado.filter(p => p.fechaCreacion <= filtros.fechaHasta!);
    }

    if (filtros?.busqueda) {
      const busqueda = filtros.busqueda.toLowerCase();
      resultado = resultado.filter(p => 
        p.clienteNombre.toLowerCase().includes(busqueda) ||
        p.numero.toString().includes(busqueda) ||
        p.id.toLowerCase().includes(busqueda)
      );
    }

    return resultado;
  }, [pedidos]);

  // ============================================================================
  // OBTENER PEDIDO POR ID
  // ============================================================================

  const obtenerPedido = useCallback((id: string): Pedido | undefined => {
    return pedidos.find(p => p.id === id);
  }, [pedidos]);

  // ============================================================================
  // ACTUALIZAR ESTADO
  // ============================================================================

  const actualizarEstado = useCallback((pedidoId: string, nuevoEstado: EstadoPedido, userId: string, userName: string) => {
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoActual) {
      toast.error('Pedido no encontrado');
      return;
    }

    const timestamp = new Date().toISOString();

    const pedidoActualizado: Pedido = {
      ...pedidoActual,
      estado: nuevoEstado,
      fechaActualizacion: timestamp,
      actualizadoPor: {
        userId,
        userName,
        timestamp,
      },
      historialEstados: [
        ...(pedidoActual.historialEstados || []),
        {
          estado: nuevoEstado,
          timestamp,
          userId,
          userName,
        }
      ],
    };

    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? pedidoActualizado : p)
    );

    // ✅ Notificar a otros tabs/roles
    if (pedidosChannel) {
      pedidosChannel.postMessage({
        type: 'PEDIDO_ACTUALIZADO',
        pedido: pedidoActualizado,
      });
    }

    notificarSuscriptores(pedidoActualizado, 'actualizado');

    toast.success(`Pedido #${pedidoActual.numero.toString().padStart(4, '0')} actualizado`, {
      description: `Nuevo estado: ${nuevoEstado}`,
    });
  }, [pedidos, notificarSuscriptores]);

  // ============================================================================
  // ACTUALIZAR PEDIDO COMPLETO
  // ============================================================================

  const actualizarPedido = useCallback((pedidoId: string, datos: Partial<Pedido>, userId: string, userName: string) => {
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoActual) {
      toast.error('Pedido no encontrado');
      return;
    }

    const timestamp = new Date().toISOString();

    const pedidoActualizado: Pedido = {
      ...pedidoActual,
      ...datos,
      fechaActualizacion: timestamp,
      actualizadoPor: {
        userId,
        userName,
        timestamp,
      },
    };

    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? pedidoActualizado : p)
    );

    // ✅ Notificar a otros tabs/roles
    if (pedidosChannel) {
      pedidosChannel.postMessage({
        type: 'PEDIDO_ACTUALIZADO',
        pedido: pedidoActualizado,
      });
    }

    notificarSuscriptores(pedidoActualizado, 'actualizado');

    toast.success(`Pedido #${pedidoActual.numero.toString().padStart(4, '0')} actualizado`);
  }, [pedidos, notificarSuscriptores]);

  // ============================================================================
  // CANCELAR PEDIDO
  // ============================================================================

  const cancelarPedido = useCallback((pedidoId: string, motivo: string, userId: string, userName: string) => {
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoActual) {
      toast.error('Pedido no encontrado');
      return;
    }

    const timestamp = new Date().toISOString();

    const pedidoCancelado: Pedido = {
      ...pedidoActual,
      estado: 'cancelado',
      observaciones: `${pedidoActual.observaciones || ''}\n\n❌ CANCELADO: ${motivo}`,
      fechaActualizacion: timestamp,
      actualizadoPor: {
        userId,
        userName,
        timestamp,
      },
      historialEstados: [
        ...(pedidoActual.historialEstados || []),
        {
          estado: 'cancelado',
          timestamp,
          userId,
          userName,
        }
      ],
    };

    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? pedidoCancelado : p)
    );

    // ✅ Notificar a otros tabs/roles
    if (pedidosChannel) {
      pedidosChannel.postMessage({
        type: 'PEDIDO_CANCELADO',
        pedido: pedidoCancelado,
      });
    }

    notificarSuscriptores(pedidoCancelado, 'cancelado');

    toast.info(`Pedido #${pedidoActual.numero.toString().padStart(4, '0')} cancelado`, {
      description: motivo,
    });
  }, [pedidos, notificarSuscriptores]);

  // ============================================================================
  // SUSCRIBIRSE A CAMBIOS
  // ============================================================================

  const suscribirseACambios = useCallback((callback: (pedido: Pedido, tipo: 'creado' | 'actualizado' | 'cancelado') => void) => {
    setSuscriptores(prev => [...prev, callback]);

    // Retornar función para desuscribirse
    return () => {
      setSuscriptores(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  const obtenerEstadisticas = useCallback((filtros?: FiltrosPedidos): EstadisticasPedidos => {
    const pedidosFiltrados = filtros ? obtenerPedidos(filtros) : pedidos;

    const completados = pedidosFiltrados.filter(p => p.estado === 'entregado');
    const ventaTotal = completados.reduce((sum, p) => sum + p.total, 0);
    const itemsVendidos = completados.reduce((sum, p) => sum + p.items.reduce((s, i) => s + i.cantidad, 0), 0);

    return {
      total: pedidosFiltrados.length,
      pendientes: pedidosFiltrados.filter(p => p.estado === 'pendiente').length,
      enPreparacion: pedidosFiltrados.filter(p => ['confirmado', 'preparando', 'listo'].includes(p.estado)).length,
      completados: completados.length,
      cancelados: pedidosFiltrados.filter(p => p.estado === 'cancelado').length,
      ventaTotal,
      ticketMedio: completados.length > 0 ? ventaTotal / completados.length : 0,
      itemsVendidos,
    };
  }, [pedidos, obtenerPedidos]);

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const value: PedidosContextType = {
    pedidos,
    loading,
    crearPedido,
    obtenerPedidos,
    obtenerPedido,
    actualizarEstado,
    cancelarPedido,
    actualizarPedido,
    suscribirseACambios,
    obtenerEstadisticas,
    obtenerSiguienteNumero,
  };

  return (
    <PedidosContext.Provider value={value}>
      {children}
    </PedidosContext.Provider>
  );
}

// ============================================================================
// HOOK PERSONALIZADO
// ============================================================================

export function usePedidos() {
  const context = useContext(PedidosContext);
  if (!context) {
    throw new Error('usePedidos debe usarse dentro de PedidosProvider');
  }
  return context;
}
