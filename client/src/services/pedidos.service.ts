/**
 * 📦 SERVICIO DE GESTIÓN DE PEDIDOS
 * 
 * Gestiona la creación, actualización y consulta de pedidos.
 * Integrado con:
 * - Sistema de carrito
 * - Sistema de facturación VeriFactu
 * - Sistema de notificaciones
 * - LocalStorage (simulación - en producción: API backend)
 * - Sistema de ventas y EBITDA (auto-actualización)
 */

import { CartItem } from '../contexts/CartContext';
// ⭐ NUEVO: Importar servicio de facturación automática
import { procesarPagoYFacturar } from './facturacion-automatica.service';

// ============================================================================
// TIPOS
// ============================================================================

export type EstadoPedido = 'pendiente' | 'pagado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
export type EstadoEntrega = 'pendiente' | 'preparando' | 'listo' | 'en_camino' | 'entregado';
export type MetodoPago = 'tarjeta' | 'efectivo' | 'bizum' | 'transferencia';
export type TipoEntrega = 'recogida' | 'domicilio';

// ⭐ NUEVO: Origen del pedido
export type OrigenPedido = 'app' | 'tpv' | 'glovo' | 'justeat' | 'ubereats' | 'deliveroo';

// ⭐ NUEVO: Estado de pago (para efectivo)
export type EstadoPago = 'pagado' | 'pendiente_cobro';

// ⭐ NUEVO: Tipo de repartidor
export type TipoRepartidor = 'propio' | 'externo';

export interface Pedido {
  id: string;
  numero?: string;
  fecha: string;
  
  // ⭐ JERARQUÍA MULTIEMPRESA (NUEVO)
  empresaId: string;          // ID de la empresa (EMP-001)
  empresaNombre: string;      // "Disarmink S.L."
  marcaId: string;            // ID de la marca (MRC-001)
  marcaNombre: string;        // "Modomio"
  puntoVentaId: string;       // ID del punto de venta (PDV-TIANA)
  puntoVentaNombre: string;   // "Tiana"
  
  // ⭐ NUEVO: Origen y tipo de pedido
  origenPedido: OrigenPedido; // De dónde viene el pedido
  
  // Cliente
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion?: string;
  };
  
  // Items del pedido
  items: ItemPedido[];
  
  // Importes
  subtotal: number;
  descuento: number;
  cuponAplicado?: string;
  iva: number;
  total: number;
  
  // ⭐ NUEVO: Pago mejorado
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;      // Pagado o pendiente de cobro
  pagoEnEfectivo: boolean;     // Si debe cobrar el repartidor/cajero
  
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string;
  
  // Estados
  estado: EstadoPedido;
  estadoEntrega: EstadoEntrega;
  
  // ⭐ NUEVO: QR y Códigos de barras
  codigoQR?: string;           // Código QR para escaneo
  codigoBarras?: string;       // Código de barras
  
  // ⭐ NUEVO: Sistema de impresión
  impresoraId?: string;        // ID de la impresora donde se imprimió
  fechaImpresion?: string;     // Fecha de impresión
  reimprimir?: boolean;        // Flag para reimprimir
  
  // ⭐ NUEVO: Repartidor
  repartidorId?: string;
  repartidorNombre?: string;
  repartidorTipo?: TipoRepartidor;
  
  // ⭐ NUEVO: Plataforma externa (Glovo, Just Eat, etc.)
  plataformaExterna?: {
    pedidoExternoId: string;   // ID del pedido en la plataforma
    comisionPlataforma: number; // Comisión que cobra la plataforma
    tiempoEstimadoRecogida?: string; // Cuándo viene el rider
  };
  
  // ⭐ NUEVO: TPV (para pedidos presenciales)
  tpvId?: string;              // ID del TPV que creó el pedido
  cajeroId?: string;           // ID del cajero que atendió
  
  // Observaciones
  observaciones?: string;
  observacionesCocina?: string;
  
  // Tiempos
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  fechaListo?: string;         // ⭐ NUEVO: Cuándo se marcó como listo
  fechaPago?: string;          // ⭐ NUEVO: Cuándo se pagó
  fechaCancelacion?: string;   // ⭐ NUEVO: Cuándo se canceló
  tiempoPreparacion?: number;  // en minutos
  
  // ⭐ NUEVO: Geolocalización (Ya estoy aquí)
  geolocalizacionValidada?: boolean; // Si el cliente confirmó su llegada
  fechaGeolocalizacion?: string;     // Cuándo se validó la geolocalización
  
  // ⭐ NUEVO: Cancelación
  motivoCancelacion?: string;  // Motivo de cancelación
  canceladoPor?: string;       // Quién canceló (ID usuario)
  
  // Relaciones
  facturaId?: string;
  trabajadorId?: string; // Quien lo prepara
  
  // Metadatos
  createdAt: string;
  updatedAt: string;
}

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  opciones?: {
    tipo?: string;
    peso?: string;
    complementos?: string[];
    bebidas?: string[];
    extras?: Record<string, string[]>;
  };
  observaciones?: string;
}

// Alias para compatibilidad
export type PedidoItem = ItemPedido;

export interface CrearPedidoParams {
  // ⭐ JERARQUÍA MULTIEMPRESA (NUEVO - OBLIGATORIO)
  empresaId: string;
  empresaNombre: string;
  marcaId: string;
  marcaNombre: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  
  // Cliente
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono: string;
  clienteDireccion?: string;
  
  // Items
  items: CartItem[];
  
  // Importes
  subtotal: number;
  descuento: number;
  cuponAplicado?: string;
  iva: number;
  total: number;
  
  // Pago y entrega
  metodoPago: MetodoPago;
  tipoEntrega: TipoEntrega;
  observaciones?: string;
}

// ============================================================================
// STORAGE KEY
// ============================================================================

const STORAGE_KEY = 'udar-pedidos';

// ============================================================================
// HELPERS
// ============================================================================

const getPedidos = (): Pedido[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const pedidos = JSON.parse(data) as Pedido[];
    
    // ⭐ MIGRACIÓN: Asegurar que todos los pedidos tengan origenPedido
    return pedidos.map(pedido => {
      if (!pedido.origenPedido) {
        // Si no tiene origen, determinarlo según otros campos
        if (pedido.plataformaExterna) {
          // Es de una plataforma externa
          const plataforma = pedido.plataformaExterna.pedidoExternoId?.toLowerCase();
          if (plataforma?.includes('glovo')) return { ...pedido, origenPedido: 'glovo' as OrigenPedido };
          if (plataforma?.includes('justeat') || plataforma?.includes('just-eat')) return { ...pedido, origenPedido: 'justeat' as OrigenPedido };
          if (plataforma?.includes('uber')) return { ...pedido, origenPedido: 'ubereats' as OrigenPedido };
          if (plataforma?.includes('deliveroo')) return { ...pedido, origenPedido: 'deliveroo' as OrigenPedido };
        }
        // Por defecto, asumimos que es de la app
        return { ...pedido, origenPedido: 'app' as OrigenPedido };
      }
      return pedido;
    });
  } catch (error) {
    console.error('Error al cargar pedidos:', error);
    return [];
  }
};

const savePedidos = (pedidos: Pedido[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pedidos));
  } catch (error) {
    console.error('Error al guardar pedidos:', error);
  }
};

const generarIdPedido = (): string => {
  return `PED-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
};

const generarNumeroPedido = (): string => {
  const pedidos = getPedidos();
  const numero = (pedidos.length + 1).toString().padStart(6, '0');
  return `${new Date().getFullYear()}-${numero}`;
};

// ============================================================================
// API DEL SERVICIO
// ============================================================================

/**
 * Crear un nuevo pedido desde el carrito
 */
export const crearPedido = (params: CrearPedidoParams): Pedido => {
  const now = new Date().toISOString();
  
  // Calcular tiempo estimado de preparación
  const tiempoPreparacion = calcularTiempoPreparacion(params.items);
  const fechaEstimadaEntrega = new Date(Date.now() + tiempoPreparacion * 60 * 1000).toISOString();
  
  // Crear pedido
  const pedido: Pedido = {
    id: generarIdPedido(),
    numero: generarNumeroPedido(),
    fecha: now,
    
    // ⭐ JERARQUÍA MULTIEMPRESA
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    marcaId: params.marcaId,
    marcaNombre: params.marcaNombre,
    puntoVentaId: params.puntoVentaId,
    puntoVentaNombre: params.puntoVentaNombre,
    
    // ⭐ NUEVO: Origen y tipo de pedido
    origenPedido: 'app', // Por defecto, cambiar según el origen
    
    cliente: {
      id: params.clienteId,
      nombre: params.clienteNombre,
      email: params.clienteEmail,
      telefono: params.clienteTelefono,
      direccion: params.clienteDireccion,
    },
    
    items: params.items.map(item => ({
      productoId: item.productoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad,
      opciones: item.opciones,
      observaciones: item.observaciones,
    })),
    
    subtotal: params.subtotal,
    descuento: params.descuento,
    cuponAplicado: params.cuponAplicado,
    iva: params.iva,
    total: params.total,
    
    // ⭐ NUEVO: Pago mejorado
    metodoPago: params.metodoPago,
    estadoPago: params.metodoPago === 'efectivo' ? 'pendiente_cobro' : 'pagado',
    pagoEnEfectivo: params.metodoPago === 'efectivo',
    
    tipoEntrega: params.tipoEntrega,
    direccionEntrega: params.clienteDireccion,
    
    // ⭐ CAMBIO: Todos los pedidos empiezan directamente en "en_preparacion"
    estado: 'en_preparacion',
    estadoEntrega: 'preparando',
    
    observaciones: params.observaciones,
    
    fechaEstimadaEntrega: fechaEstimadaEntrega,
    tiempoPreparacion: tiempoPreparacion,
    
    createdAt: now,
    updatedAt: now,
  };
  
  // Guardar
  const pedidos = getPedidos();
  pedidos.unshift(pedido);
  savePedidos(pedidos);
  
  return pedido;
};

/**
 * Obtener un pedido por ID
 */
export const obtenerPedido = (id: string): Pedido | null => {
  const pedidos = getPedidos();
  return pedidos.find(p => p.id === id) || null;
};

/**
 * Obtener todos los pedidos
 */
export const obtenerTodosPedidos = (): Pedido[] => {
  return getPedidos();
};

/**
 * Obtener pedidos de un cliente
 */
export const obtenerPedidosCliente = (clienteId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => p.cliente.id === clienteId);
};

/**
 * Actualizar estado de un pedido
 */
export const actualizarEstadoPedido = (id: string, estado: EstadoPedido): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  pedidos[index].estado = estado;
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Actualizar estado de entrega de un pedido
 */
export const actualizarEstadoEntrega = (id: string, estadoEntrega: EstadoEntrega): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  pedidos[index].estadoEntrega = estadoEntrega;
  pedidos[index].updatedAt = new Date().toISOString();
  
  // Si se entregó, actualizar fecha
  if (estadoEntrega === 'entregado') {
    pedidos[index].fechaEntrega = new Date().toISOString();
  }
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Cancelar un pedido
 */
export const cancelarPedido = (pedidoId: string, motivo: string, canceladoPor: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  // No se puede cancelar si ya está entregado
  if (pedidos[index].estado === 'entregado') {
    console.warn(`No se puede cancelar el pedido ${pedidoId} - ya está entregado`);
    return null;
  }
  
  pedidos[index].estado = 'cancelado';
  pedidos[index].estadoEntrega = 'cancelado';
  pedidos[index].motivoCancelacion = motivo;
  pedidos[index].canceladoPor = canceladoPor;
  pedidos[index].fechaCancelacion = new Date().toISOString();
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Asignar trabajador a un pedido
 */
export const asignarTrabajador = (id: string, trabajadorId: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  pedidos[index].trabajadorId = trabajadorId;
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Asociar factura a un pedido
 */
export const asociarFactura = (pedidoId: string, facturaId: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].facturaId = facturaId;
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

// ============================================================================
// ⭐ CONSULTAS MULTIEMPRESA/MARCA/PDV (NUEVO)
// ============================================================================

/**
 * Obtener pedidos por empresa
 */
export const obtenerPedidosPorEmpresa = (empresaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => p.empresaId === empresaId);
};

/**
 * Obtener pedidos por marca
 */
export const obtenerPedidosPorMarca = (marcaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => p.marcaId === marcaId);
};

/**
 * Obtener pedidos por punto de venta
 */
export const obtenerPedidosPorPDV = (puntoVentaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => p.puntoVentaId === puntoVentaId);
};

/**
 * Obtener pedidos con filtros múltiples
 */
export interface FiltrosPedidos {
  empresaIds?: string[];
  marcaIds?: string[];
  puntoVentaIds?: string[];
  fechaDesde?: Date;
  fechaHasta?: Date;
  estados?: EstadoPedido[];
  metodoPago?: MetodoPago[];
}

export const obtenerPedidosFiltrados = (filtros: FiltrosPedidos): Pedido[] => {
  let pedidos = getPedidos();
  
  // Filtrar por empresas
  if (filtros.empresaIds && filtros.empresaIds.length > 0) {
    pedidos = pedidos.filter(p => filtros.empresaIds!.includes(p.empresaId));
  }
  
  // Filtrar por marcas
  if (filtros.marcaIds && filtros.marcaIds.length > 0) {
    pedidos = pedidos.filter(p => filtros.marcaIds!.includes(p.marcaId));
  }
  
  // Filtrar por PDVs
  if (filtros.puntoVentaIds && filtros.puntoVentaIds.length > 0) {
    pedidos = pedidos.filter(p => filtros.puntoVentaIds!.includes(p.puntoVentaId));
  }
  
  // Filtrar por fechas
  if (filtros.fechaDesde) {
    const fechaDesdeISO = filtros.fechaDesde.toISOString();
    pedidos = pedidos.filter(p => p.fecha >= fechaDesdeISO);
  }
  
  if (filtros.fechaHasta) {
    const fechaHastaISO = filtros.fechaHasta.toISOString();
    pedidos = pedidos.filter(p => p.fecha <= fechaHastaISO);
  }
  
  // Filtrar por estados
  if (filtros.estados && filtros.estados.length > 0) {
    pedidos = pedidos.filter(p => filtros.estados!.includes(p.estado));
  }
  
  // Filtrar por método de pago
  if (filtros.metodoPago && filtros.metodoPago.length > 0) {
    pedidos = pedidos.filter(p => filtros.metodoPago!.includes(p.metodoPago));
  }
  
  return pedidos;
};

/**
 * Obtener estadísticas de pedidos
 */
export const obtenerEstadisticas = () => {
  const pedidos = getPedidos();
  
  return {
    total: pedidos.length,
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    pagados: pedidos.filter(p => p.estado === 'pagado').length,
    enPreparacion: pedidos.filter(p => p.estado === 'en_preparacion').length,
    listos: pedidos.filter(p => p.estado === 'listo').length,
    entregados: pedidos.filter(p => p.estado === 'entregado').length,
    cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
    totalImporte: pedidos.reduce((acc, p) => acc + p.total, 0),
  };
};

/**
 * Calcular tiempo estimado de preparación según los items
 */
const calcularTiempoPreparacion = (items: CartItem[]): number => {
  // Tiempo base: 10 minutos
  let tiempo = 10;
  
  // +2 minutos por cada producto
  tiempo += items.reduce((acc, item) => acc + (item.cantidad * 2), 0);
  
  // Si hay productos personalizados: +5 minutos
  const tienePersonalizados = items.some(item => item.opciones && Object.keys(item.opciones).length > 0);
  if (tienePersonalizados) {
    tiempo += 5;
  }
  
  // Máximo 60 minutos
  return Math.min(tiempo, 60);
};

/**
 * Limpiar todos los pedidos (solo para desarrollo)
 */
export const limpiarPedidos = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// ============================================================================
// ⭐ NUEVAS FUNCIONES - GESTIÓN AVANZADA DE PEDIDOS
// ============================================================================

/**
 * Marcar pedido como "en reparto" (cuando el repartidor escanea el QR)
 */
export const marcarEnReparto = (pedidoId: string, repartidorId: string, repartidorNombre?: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].estadoEntrega = 'en_camino';
  pedidos[index].estado = 'en_preparacion';
  pedidos[index].repartidorId = repartidorId;
  pedidos[index].repartidorNombre = repartidorNombre;
  pedidos[index].repartidorTipo = 'propio';
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Marcar pedido como entregado
 */
export const marcarEntregado = (pedidoId: string, entregadoPor: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].estadoEntrega = 'entregado';
  pedidos[index].estado = 'entregado';
  pedidos[index].fechaEntrega = new Date().toISOString();
  
  // Si era pago en efectivo, marcarlo como pagado
  if (pedidos[index].pagoEnEfectivo) {
    pedidos[index].estadoPago = 'pagado';
  }
  
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Marcar pedido como "en preparación" (cocina empieza a preparar)
 */
export const marcarEnPreparacion = (pedidoId: string, preparadoPor?: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  // Solo se puede marcar en preparación si está pagado o pendiente
  if (pedidos[index].estado !== 'pagado' && pedidos[index].estado !== 'pendiente') {
    console.warn(`No se puede marcar en preparación el pedido ${pedidoId} - estado actual: ${pedidos[index].estado}`);
    return null;
  }
  
  pedidos[index].estado = 'en_preparacion';
  pedidos[index].estadoEntrega = 'en_preparacion';
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Marcar pedido como "listo" (terminado, esperando entrega)
 * ⭐ NUEVO: Genera factura automáticamente al marcar como listo SI YA ESTÁ PAGADO
 */
export const marcarComoListo = async (pedidoId: string, preparadoPor?: string): Promise<Pedido | null> => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  // Solo se puede marcar listo si está en preparación
  if (pedidos[index].estado !== 'en_preparacion') {
    console.warn(`No se puede marcar listo el pedido ${pedidoId} - debe estar en preparación primero`);
    return null;
  }
  
  pedidos[index].estado = 'listo';
  pedidos[index].estadoEntrega = 'listo';
  pedidos[index].fechaListo = new Date().toISOString();
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  
  // ⭐ NUEVO: Generar factura automáticamente SOLO SI YA ESTÁ PAGADO
  // (Para pedidos de efectivo, la factura se genera al entregar y cobrar)
  if (pedidos[index].estadoPago === 'pagado') {
    try {
      console.log(`🧾 Generando factura automática para pedido ${pedidoId}...`);
      
      // Convertir pedido a formato compatible con facturación
      const pedidoParaFacturacion = convertirPedidoParaFacturacion(pedidos[index]);
      const factura = await procesarPagoYFacturar(pedidoParaFacturacion);
      
      if (factura) {
        // Asociar factura al pedido
        pedidos[index].facturaId = factura.id;
        savePedidos(pedidos);
        console.log(`✅ Factura ${factura.numeroFactura} generada correctamente para pedido ${pedidoId}`);
      }
    } catch (error) {
      console.error(`❌ Error al generar factura para pedido ${pedidoId}:`, error);
      // No fallar el proceso si falla la facturación
    }
  } else {
    console.log(`ℹ️ Pedido ${pedidoId} marcado como listo. Factura se generará al cobrar (pago en efectivo)`);
  }
  
  return pedidos[index];
};

/**
 * Confirmar pago de pedido (para pedidos pendientes de pago)
 */
export const confirmarPago = (pedidoId: string, metodoPago: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].estadoPago = 'pagado';
  pedidos[index].metodoPago = metodoPago;
  pedidos[index].estado = 'pagado';
  pedidos[index].fechaPago = new Date().toISOString();
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Actualizar observaciones del pedido
 */
export const actualizarObservaciones = (pedidoId: string, observaciones: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].observaciones = observaciones;
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * ⭐ NUEVO: Validar geolocalización del cliente (Ya estoy aquí)
 */
export const validarGeolocalizacion = (pedidoId: string): Pedido | null => {
  const pedidos = getPedidos();
  const index = pedidos.findIndex(p => p.id === pedidoId);
  
  if (index === -1) return null;
  
  pedidos[index].geolocalizacionValidada = true;
  pedidos[index].fechaGeolocalizacion = new Date().toISOString();
  pedidos[index].updatedAt = new Date().toISOString();
  
  savePedidos(pedidos);
  return pedidos[index];
};

/**
 * Generar código QR para un pedido
 */
export const generarCodigoQR = (pedidoId: string): string => {
  // En producción, aquí se generaría un QR real con librería
  // Por ahora retornamos un código único
  return `QR-${pedidoId}-${Date.now()}`;
};

/**
 * Generar código de barras para un pedido
 */
export const generarCodigoBarras = (pedidoId: string): string => {
  // En producción, aquí se generaría un EAN-13 o similar
  // Por ahora retornamos un código único
  const timestamp = Date.now().toString().slice(-8);
  return `${timestamp}${pedidoId.slice(-4)}`;
};

/**
 * Obtener pedidos pendientes de reparto (para repartidores)
 */
export const obtenerPedidosPendientesReparto = (puntoVentaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => 
    p.puntoVentaId === puntoVentaId &&
    p.tipoEntrega === 'domicilio' &&
    (p.estadoEntrega === 'listo' || p.estadoEntrega === 'en_camino') &&
    p.estado !== 'cancelado' &&
    p.estado !== 'entregado'
  );
};

/**
 * Obtener pedidos listos para entregar en local (para cajeros)
 */
export const obtenerPedidosListosEntrega = (puntoVentaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => 
    p.puntoVentaId === puntoVentaId &&
    p.tipoEntrega === 'recogida' &&
    p.estadoEntrega === 'listo' &&
    p.estado !== 'cancelado' &&
    p.estado !== 'entregado'
  );
};

/**
 * Obtener pedidos activos del punto de venta (todos los que no están entregados ni cancelados)
 */
export const obtenerPedidosActivosPDV = (puntoVentaId: string): Pedido[] => {
  const pedidos = getPedidos();
  return pedidos.filter(p => 
    p.puntoVentaId === puntoVentaId &&
    p.estado !== 'cancelado' &&
    p.estado !== 'entregado'
  ).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
};

/**
 * Interface para crear pedido desde TPV
 */
export interface CrearPedidoTPVParams {
  empresaId: string;
  empresaNombre: string;
  marcaId: string;
  marcaNombre: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  tpvId: string;
  cajeroId: string;
  clienteNombre: string;
  clienteTelefono?: string;
  items: CartItem[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  metodoPago: MetodoPago;
  observaciones?: string;
}

/**
 * Crear pedido desde TPV (punto de venta físico)
 */
export const crearPedidoTPV = (params: CrearPedidoTPVParams): Pedido => {
  const now = new Date().toISOString();
  const tiempoPreparacion = calcularTiempoPreparacion(params.items);
  
  const pedido: Pedido = {
    id: generarIdPedido(),
    numero: generarNumeroPedido(),
    fecha: now,
    
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    marcaId: params.marcaId,
    marcaNombre: params.marcaNombre,
    puntoVentaId: params.puntoVentaId,
    puntoVentaNombre: params.puntoVentaNombre,
    
    origenPedido: 'tpv',
    
    cliente: {
      id: `CLI-TPV-${Date.now()}`,
      nombre: params.clienteNombre,
      email: '',
      telefono: params.clienteTelefono || '',
      direccion: '',
    },
    
    items: params.items.map(item => ({
      productoId: item.productoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad,
      opciones: item.opciones,
      observaciones: item.observaciones,
    })),
    
    subtotal: params.subtotal,
    descuento: params.descuento,
    cuponAplicado: undefined,
    iva: params.iva,
    total: params.total,
    
    metodoPago: params.metodoPago,
    estadoPago: 'pagado', // En TPV se cobra en el momento
    pagoEnEfectivo: params.metodoPago === 'efectivo',
    
    tipoEntrega: 'recogida',
    direccionEntrega: undefined,
    
    estado: 'pagado',
    estadoEntrega: 'pendiente',
    
    codigoQR: generarCodigoQR(`TPV-${Date.now()}`),
    codigoBarras: generarCodigoBarras(`TPV-${Date.now()}`),
    
    tpvId: params.tpvId,
    cajeroId: params.cajeroId,
    
    observaciones: params.observaciones,
    observacionesCocina: params.observaciones,
    
    fechaEstimadaEntrega: new Date(Date.now() + tiempoPreparacion * 60 * 1000).toISOString(),
    tiempoPreparacion: tiempoPreparacion,
    
    createdAt: now,
    updatedAt: now,
  };
  
  const pedidos = getPedidos();
  pedidos.unshift(pedido);
  savePedidos(pedidos);
  
  return pedido;
};

/**
 * Interface para crear pedido desde plataforma externa
 */
export interface CrearPedidoExternoParams {
  empresaId: string;
  empresaNombre: string;
  marcaId: string;
  marcaNombre: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  plataforma: 'glovo' | 'justeat' | 'ubereats' | 'deliveroo';
  pedidoExternoId: string;
  comisionPlataforma: number;
  clienteNombre: string;
  clienteTelefono: string;
  clienteDireccion: string;
  items: CartItem[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  tiempoEstimadoRecogida?: string;
  observaciones?: string;
}

/**
 * Crear pedido desde plataforma externa (Glovo, Just Eat, etc.)
 */
export const crearPedidoExterno = (params: CrearPedidoExternoParams): Pedido => {
  const now = new Date().toISOString();
  const tiempoPreparacion = calcularTiempoPreparacion(params.items);
  
  const pedido: Pedido = {
    id: generarIdPedido(),
    numero: generarNumeroPedido(),
    fecha: now,
    
    empresaId: params.empresaId,
    empresaNombre: params.empresaNombre,
    marcaId: params.marcaId,
    marcaNombre: params.marcaNombre,
    puntoVentaId: params.puntoVentaId,
    puntoVentaNombre: params.puntoVentaNombre,
    
    origenPedido: params.plataforma,
    
    cliente: {
      id: `CLI-${params.plataforma.toUpperCase()}-${Date.now()}`,
      nombre: params.clienteNombre,
      email: '',
      telefono: params.clienteTelefono,
      direccion: params.clienteDireccion,
    },
    
    items: params.items.map(item => ({
      productoId: item.productoId,
      nombre: item.nombre,
      cantidad: item.cantidad,
      precio: item.precio,
      subtotal: item.precio * item.cantidad,
      opciones: item.opciones,
      observaciones: item.observaciones,
    })),
    
    subtotal: params.subtotal,
    descuento: params.descuento,
    cuponAplicado: undefined,
    iva: params.iva,
    total: params.total,
    
    metodoPago: 'tarjeta', // Las plataformas cobran online
    estadoPago: 'pagado',
    pagoEnEfectivo: false,
    
    tipoEntrega: 'domicilio',
    direccionEntrega: params.clienteDireccion,
    
    estado: 'pagado',
    estadoEntrega: 'pendiente',
    
    codigoQR: generarCodigoQR(`${params.plataforma.toUpperCase()}-${params.pedidoExternoId}`),
    codigoBarras: generarCodigoBarras(`${params.plataforma.toUpperCase()}-${params.pedidoExternoId}`),
    
    plataformaExterna: {
      pedidoExternoId: params.pedidoExternoId,
      comisionPlataforma: params.comisionPlataforma,
      tiempoEstimadoRecogida: params.tiempoEstimadoRecogida,
    },
    
    repartidorTipo: 'externo', // El rider viene de la plataforma
    
    observaciones: params.observaciones,
    observacionesCocina: params.observaciones,
    
    fechaEstimadaEntrega: new Date(Date.now() + tiempoPreparacion * 60 * 1000).toISOString(),
    tiempoPreparacion: tiempoPreparacion,
    
    createdAt: now,
    updatedAt: now,
  };
  
  const pedidos = getPedidos();
  pedidos.unshift(pedido);
  savePedidos(pedidos);
  
  return pedido;
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  crearPedido,
  obtenerPedido,
  obtenerTodosPedidos,
  obtenerPedidosCliente,
  actualizarEstadoPedido,
  actualizarEstadoEntrega,
  cancelarPedido,
  asignarTrabajador,
  asociarFactura,
  obtenerEstadisticas,
  limpiarPedidos,
  // ⭐ NUEVAS FUNCIONES
  marcarEnReparto,
  marcarEntregado,
  generarCodigoQR,
  generarCodigoBarras,
  obtenerPedidosPendientesReparto,
  obtenerPedidosListosEntrega,
  obtenerPedidosActivosPDV,
  crearPedidoTPV,
  crearPedidoExterno,
  marcarEnPreparacion,
  marcarComoListo,
  confirmarPago,
  actualizarObservaciones,
  validarGeolocalizacion,
};

// ============================================================================
// ⭐ FUNCIONES AUXILIARES
// ============================================================================

/**
 * Convertir pedido de nuestro formato al formato que espera facturación-automatica.service
 */
function convertirPedidoParaFacturacion(pedido: Pedido): any {
  return {
    id: pedido.id,
    numero_pedido: pedido.numero || pedido.id,
    cliente_id: pedido.cliente.id,
    cliente: {
      id: pedido.cliente.id,
      nombre: pedido.cliente.nombre,
      email: pedido.cliente.email || 'cliente@ejemplo.com',
      nif: '', // TODO: Obtener NIF del cliente si está disponible
      telefono: pedido.cliente.telefono,
      direccion: pedido.cliente.direccion || '',
    },
    lineas: pedido.items.map((item, index) => ({
      id: `${pedido.id}-${index}`,
      producto_id: item.productoId,
      producto_nombre: item.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.precio,
      descuento: 0,
      tipo_iva: 21, // IVA estándar 21%
      subtotal: item.subtotal,
      iva_linea: item.subtotal * 0.21,
      total: item.subtotal * 1.21,
    })),
    subtotal: pedido.subtotal,
    iva: pedido.iva,
    total: pedido.total,
    metodo_pago: pedido.metodoPago,
    estado_pago: pedido.estadoPago === 'pagado' ? 'pagado' : 'pendiente',
    fecha_pago: pedido.fechaPago ? new Date(pedido.fechaPago) : new Date(),
    fecha_pedido: new Date(pedido.fecha),
  };
}