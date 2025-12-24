/**
 * 🛵 SERVICIO DE PEDIDOS DELIVERY
 * Gestiona pedidos provenientes de agregadores (Glovo, Uber Eats, Just Eat)
 */

import { notificationsService } from './notifications.service';
import { gestorAgregadores } from './aggregators/index';
import { PedidoAgregador, EstadoPedidoAgregador } from '../lib/aggregator-adapter';
import { Pedido, crearPedido, actualizarEstadoPedido, obtenerPedido } from './pedidos.service';

// ============================================================================
// TIPOS
// ============================================================================

export interface PedidoDelivery extends Pedido {
  agregador: 'glovo' | 'uber_eats' | 'justeat';
  idAgregadorExterno: string;
  comisionAgregador: number;
  estadoAgregador: EstadoPedidoAgregador;
  repartidor?: {
    id: string;
    nombre: string;
    telefono: string;
    ubicacion?: {
      lat: number;
      lng: number;
    };
  };
  tiempoPreparacionAceptado?: number; // minutos
  horaAceptacion?: string;
  horaListoRecogida?: string;
  horaRecogida?: string;
}

// ============================================================================
// STORAGE
// ============================================================================

const STORAGE_KEY_DELIVERY = 'udar-pedidos-delivery';

const getPedidosDelivery = (): PedidoDelivery[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_DELIVERY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error al cargar pedidos delivery:', error);
    return [];
  }
};

const savePedidosDelivery = (pedidos: PedidoDelivery[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_DELIVERY, JSON.stringify(pedidos));
  } catch (error) {
    console.error('Error al guardar pedidos delivery:', error);
  }
};

// ============================================================================
// CONVERSIÓN DE FORMATOS
// ============================================================================

/**
 * Convierte un pedido de agregador al formato interno
 */
export const convertirPedidoAgregadorAInterno = (
  pedidoAgregador: PedidoAgregador,
  agregador: 'glovo' | 'uber_eats' | 'justeat'
): PedidoDelivery => {
  
  const id = `PED-${agregador.toUpperCase()}-${Date.now()}`;
  const numero = `${new Date().getFullYear()}-${agregador.substring(0, 3).toUpperCase()}-${pedidoAgregador.id_externo.substring(0, 6)}`;

  return {
    // Datos básicos
    id,
    numero,
    fecha: pedidoAgregador.fecha_creacion.toISOString(),
    
    // Cliente
    cliente: {
      id: `CLI-${agregador}-${pedidoAgregador.cliente.id_externo || Date.now()}`,
      nombre: pedidoAgregador.cliente.nombre,
      telefono: pedidoAgregador.cliente.telefono,
      email: pedidoAgregador.cliente.email,
      direccion: `${pedidoAgregador.entrega.direccion}, ${pedidoAgregador.entrega.codigo_postal} ${pedidoAgregador.entrega.ciudad}`
    },
    
    // Items
    items: pedidoAgregador.items.map((item, index) => ({
      productoId: item.sku || item.id_externo || `PROD-${index}`,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio_unitario,
      subtotal: item.precio_unitario * item.cantidad,
      opciones: item.modificadores ? {
        extras: {
          modificadores: item.modificadores.map(m => m.nombre)
        }
      } : undefined,
      observaciones: item.notas
    })),
    
    // Importes
    subtotal: pedidoAgregador.subtotal,
    descuento: pedidoAgregador.descuentos,
    cuponAplicado: undefined,
    iva: pedidoAgregador.total * 0.10, // IVA 10% (aproximado)
    total: pedidoAgregador.total,
    
    // Pago y entrega
    metodoPago: 'online', // Siempre pagado en agregador
    tipoEntrega: 'domicilio',
    direccionEntrega: `${pedidoAgregador.entrega.direccion}, ${pedidoAgregador.entrega.codigo_postal} ${pedidoAgregador.entrega.ciudad}`,
    
    // Estados
    estado: 'pendiente', // Esperando aceptación
    estadoEntrega: 'pendiente',
    
    // Observaciones
    observaciones: pedidoAgregador.entrega.notas,
    
    // Tiempos
    tiempoPreparacion: pedidoAgregador.tiempo_preparacion_min,
    fechaEstimadaEntrega: pedidoAgregador.hora_entrega_estimada?.toISOString(),
    
    // Metadatos
    createdAt: pedidoAgregador.fecha_creacion.toISOString(),
    updatedAt: new Date().toISOString(),
    
    // ⭐ ESPECÍFICO DELIVERY
    agregador,
    idAgregadorExterno: pedidoAgregador.id_externo,
    comisionAgregador: pedidoAgregador.comision_agregador,
    estadoAgregador: pedidoAgregador.estado
  };
};

// ============================================================================
// GESTIÓN DE PEDIDOS DELIVERY
// ============================================================================

/**
 * Procesar un nuevo pedido recibido del webhook
 */
export const procesarNuevoPedidoDelivery = async (
  pedidoAgregador: PedidoAgregador,
  agregador: 'glovo' | 'uber_eats' | 'justeat'
): Promise<PedidoDelivery> => {
  
  console.log(`📦 [${agregador.toUpperCase()}] Nuevo pedido recibido:`, pedidoAgregador.id_externo);
  
  // Convertir a formato interno
  const pedidoInterno = convertirPedidoAgregadorAInterno(pedidoAgregador, agregador);
  
  // Guardar en storage delivery
  const pedidos = getPedidosDelivery();
  pedidos.push(pedidoInterno);
  savePedidosDelivery(pedidos);
  
  // ⭐ Notificación sonora/visual
  mostrarNotificacionPedidoNuevo(pedidoInterno);
  
  return pedidoInterno;
};

/**
 * Aceptar un pedido de delivery
 */
export const aceptarPedidoDelivery = async (
  pedidoId: string,
  tiempoPreparacion: number
): Promise<{ success: boolean; error?: string }> => {
  
  try {
    const pedidos = getPedidosDelivery();
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }
    
    const pedido = pedidos[pedidoIndex];
    
    // ⭐ NUEVO: Descontar stock al aceptar pedido delivery
    try {
      const { stockIntegrationService } = await import('../../services/stock-integration.service');
      const resultadoDescuento = stockIntegrationService.descontarStockPorPedido(
        pedido,
        'Sistema Delivery'
      );

      if (!resultadoDescuento.exito) {
        console.warn('⚠️ No se pudo descontar stock:', resultadoDescuento.errores);
        // Continuamos aunque falle (el pedido ya fue aceptado en agregador)
      } else {
        console.log('✅ Stock descontado delivery:', resultadoDescuento.movimientosRegistrados);
      }
    } catch (stockError) {
      console.error('❌ Error en integración de stock:', stockError);
      // No bloqueamos la aceptación por error de stock
    }
    
    // Llamar al adaptador del agregador
    const agregador = gestorAgregadores.obtener(pedido.agregador);
    if (!agregador) {
      return { success: false, error: 'Agregador no disponible' };
    }
    
    const resultado = await agregador.aceptarPedido(
      pedido.idAgregadorExterno,
      tiempoPreparacion
    );
    
    if (!resultado.success) {
      return { success: false, error: resultado.error?.message };
    }
    
    // Actualizar estado
    pedidos[pedidoIndex] = {
      ...pedido,
      estado: 'en_preparacion',
      estadoAgregador: EstadoPedidoAgregador.ACEPTADO,
      tiempoPreparacionAceptado: tiempoPreparacion,
      horaAceptacion: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    savePedidosDelivery(pedidos);
    
    console.log(`✅ [${pedido.agregador.toUpperCase()}] Pedido aceptado: ${pedido.idAgregadorExterno}`);
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error al aceptar pedido:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Rechazar un pedido de delivery
 */
export const rechazarPedidoDelivery = async (
  pedidoId: string,
  motivo: string
): Promise<{ success: boolean; error?: string }> => {
  
  try {
    const pedidos = getPedidosDelivery();
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }
    
    const pedido = pedidos[pedidoIndex];
    
    // Llamar al adaptador del agregador
    const agregador = gestorAgregadores.obtener(pedido.agregador);
    if (!agregador) {
      return { success: false, error: 'Agregador no disponible' };
    }
    
    const resultado = await agregador.rechazarPedido(
      pedido.idAgregadorExterno,
      motivo
    );
    
    if (!resultado.success) {
      return { success: false, error: resultado.error?.message };
    }
    
    // Actualizar estado
    pedidos[pedidoIndex] = {
      ...pedido,
      estado: 'cancelado',
      estadoAgregador: EstadoPedidoAgregador.RECHAZADO,
      updatedAt: new Date().toISOString()
    };
    
    savePedidosDelivery(pedidos);
    
    console.log(`❌ [${pedido.agregador.toUpperCase()}] Pedido rechazado: ${pedido.idAgregadorExterno}`);
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error al rechazar pedido:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Marcar pedido como listo para recoger
 */
export const marcarPedidoListoDelivery = async (
  pedidoId: string
): Promise<{ success: boolean; error?: string }> => {
  
  try {
    const pedidos = getPedidosDelivery();
    const pedidoIndex = pedidos.findIndex(p => p.id === pedidoId);
    
    if (pedidoIndex === -1) {
      return { success: false, error: 'Pedido no encontrado' };
    }
    
    const pedido = pedidos[pedidoIndex];
    
    // Llamar al adaptador del agregador
    const agregador = gestorAgregadores.obtener(pedido.agregador);
    if (!agregador) {
      return { success: false, error: 'Agregador no disponible' };
    }
    
    const resultado = await agregador.marcarListo(pedido.idAgregadorExterno);
    
    if (!resultado.success) {
      return { success: false, error: resultado.error?.message };
    }
    
    // Actualizar estado
    pedidos[pedidoIndex] = {
      ...pedido,
      estado: 'listo',
      estadoAgregador: EstadoPedidoAgregador.LISTO,
      horaListoRecogida: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    savePedidosDelivery(pedidos);
    
    console.log(`🎉 [${pedido.agregador.toUpperCase()}] Pedido listo: ${pedido.idAgregadorExterno}`);
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Error al marcar como listo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtener todos los pedidos delivery
 */
export const obtenerPedidosDelivery = (
  filtros?: {
    agregador?: 'glovo' | 'uber_eats' | 'justeat';
    estado?: PedidoDelivery['estado'];
  }
): PedidoDelivery[] => {
  
  let pedidos = getPedidosDelivery();
  
  if (filtros?.agregador) {
    pedidos = pedidos.filter(p => p.agregador === filtros.agregador);
  }
  
  if (filtros?.estado) {
    pedidos = pedidos.filter(p => p.estado === filtros.estado);
  }
  
  // Ordenar por fecha más reciente
  return pedidos.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Obtener pedidos pendientes de aceptar
 */
export const obtenerPedidosPendientesAceptacion = (): PedidoDelivery[] => {
  return getPedidosDelivery().filter(p => 
    p.estado === 'pendiente' && p.estadoAgregador === EstadoPedidoAgregador.NUEVO
  );
};

/**
 * Obtener pedidos en preparación
 */
export const obtenerPedidosEnPreparacion = (): PedidoDelivery[] => {
  return getPedidosDelivery().filter(p => 
    p.estado === 'en_preparacion'
  );
};

/**
 * Obtener pedidos listos para recoger
 */
export const obtenerPedidosListosRecoger = (): PedidoDelivery[] => {
  return getPedidosDelivery().filter(p => 
    p.estado === 'listo' && p.estadoAgregador === EstadoPedidoAgregador.LISTO
  );
};

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/**
 * Mostrar notificación de pedido nuevo
 */
const mostrarNotificacionPedidoNuevo = (pedido: PedidoDelivery) => {
  // Notificación visual
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`🛵 Nuevo pedido ${pedido.agregador.toUpperCase()}`, {
      body: `${pedido.cliente.nombre} - Total: €${pedido.total.toFixed(2)}`,
      icon: '/icon-delivery.png',
      tag: pedido.id,
      requireInteraction: true // Mantener hasta que se interactúe
    });
  }
  
  // Sonido de alerta (opcional)
  try {
    const audio = new Audio('/sounds/new-order.mp3');
    audio.volume = 0.7;
    audio.play().catch(err => console.log('No se pudo reproducir sonido:', err));
  } catch (error) {
    // Ignorar si no hay sonido
  }
  
  // Evento personalizado para que otros componentes reaccionen
  window.dispatchEvent(new CustomEvent('nuevo-pedido-delivery', {
    detail: pedido
  }));
};

/**
 * Solicitar permiso de notificaciones
 */
export const solicitarPermisoNotificaciones = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

// ============================================================================
// ESTADÍSTICAS
// ============================================================================

/**
 * Obtener estadísticas de delivery
 */
export const obtenerEstadisticasDelivery = () => {
  const pedidos = getPedidosDelivery();
  
  // Filtrar pedidos del mes actual
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  
  const pedidosMes = pedidos.filter(p => 
    new Date(p.createdAt) >= inicioMes
  );
  
  // Por agregador
  const porAgregador = {
    glovo: {
      total: pedidosMes.filter(p => p.agregador === 'glovo').length,
      ventas: pedidosMes.filter(p => p.agregador === 'glovo' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0),
      comision: pedidosMes.filter(p => p.agregador === 'glovo' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.comisionAgregador, 0)
    },
    uber_eats: {
      total: pedidosMes.filter(p => p.agregador === 'uber_eats').length,
      ventas: pedidosMes.filter(p => p.agregador === 'uber_eats' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0),
      comision: pedidosMes.filter(p => p.agregador === 'uber_eats' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.comisionAgregador, 0)
    },
    justeat: {
      total: pedidosMes.filter(p => p.agregador === 'justeat').length,
      ventas: pedidosMes.filter(p => p.agregador === 'justeat' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0),
      comision: pedidosMes.filter(p => p.agregador === 'justeat' && p.estado === 'entregado')
        .reduce((sum, p) => sum + p.comisionAgregador, 0)
    }
  };
  
  const totales = {
    pedidos: pedidosMes.length,
    ventas_brutas: pedidosMes.filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.total, 0),
    comision_total: pedidosMes.filter(p => p.estado === 'entregado')
      .reduce((sum, p) => sum + p.comisionAgregador, 0),
    ventas_netas: 0
  };
  
  totales.ventas_netas = totales.ventas_brutas - totales.comision_total;
  
  return {
    porAgregador,
    totales,
    pendientes: obtenerPedidosPendientesAceptacion().length,
    enPreparacion: obtenerPedidosEnPreparacion().length,
    listos: obtenerPedidosListosRecoger().length
  };
};