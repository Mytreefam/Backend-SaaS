/**
 * 🛒 CONTEXTO GLOBAL DEL CARRITO DE COMPRA
 * 
 * Gestiona el estado del carrito en toda la aplicación.
 * Incluye:
 * - Agregar/eliminar/actualizar productos
 * - Cálculos automáticos (subtotal, IVA, total)
 * - Persistencia en localStorage
 * - Cupones de descuento con validación real
 * - ✅ NUEVO: Validación de stock en tiempo real
 * - ✅ FASE 3: Creación de pedidos con API backend
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import type { Cupon as CuponReal } from '../types/cupon.types';
import { useProductos } from './ProductosContext';
import { stockReservationService } from '../services/stock-reservation.service';
import { pedidosApi, type PedidoCreate } from '../services/api/pedidos.api';
import { cuponesApi } from '../services/api/cupones.api';

// ============================================================================
// TIPOS
// ============================================================================

export interface CartItem {
  id: string;
  productoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  observaciones?: string;
  
  // 🎯 Opciones de personalización (para productos personalizables)
  // NUEVA ESTRUCTURA: Guardamos las opciones elegidas con su precio adicional
  opcionesPersonalizadas?: Array<{
    grupoId: string;
    grupoTitulo: string;
    opciones: Array<{
      opcionId: string;
      nombre: string;
      precioAdicional: number;
    }>;
  }>;
  
  // Metadatos
  categoria?: string;
  stock?: number;
  activo?: boolean; // ✅ NUEVO: Para validar si producto está activo
}

export interface Cupon {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number; // % o € según tipo
  descripcion?: string;
}

interface CartContextType {
  // Estado
  items: CartItem[];
  cuponAplicado: Cupon | null;
  
  // Acciones
  addItem: (item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number }) => string;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, cantidad: number) => void;
  updateObservaciones: (itemId: string, observaciones: string) => void;
  updateItemOptions: (itemId: string, opciones: any) => void;
  clearCart: () => void;
  aplicarCupon: (codigo: string) => Promise<boolean>;
  eliminarCupon: () => void;
  
  // ✅ NUEVO: Crear pedido con API backend
  crearPedido: (datosAdicionales: {
    clienteId: number;
    tipoEntrega?: 'recogida' | 'domicilio';
    direccionEntrega?: string;
    metodoPago?: 'tarjeta' | 'efectivo' | 'bizum';
    puntoVentaId?: string;
  }) => Promise<any | null>;
  
  // Cálculos
  subtotal: number;
  descuentoCupon: number;
  iva: number;
  total: number;
  totalItems: number;
}

// ============================================================================
// CONTEXTO
// ============================================================================

const CartContext = createContext<CartContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cuponAplicado, setCuponAplicado] = useState<Cupon | null>(null);
  const [sessionId] = useState(() => `CART-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // ✅ FASE 2: Integración con ProductosContext (opcional para evitar errores de inicialización)
  let obtenerProducto, verificarDisponibilidad;
  try {
    const productosContext = useProductos();
    obtenerProducto = productosContext.obtenerProducto;
    verificarDisponibilidad = productosContext.verificarDisponibilidad;
  } catch (error) {
    // Si ProductosContext no está disponible, usar funciones dummy
    obtenerProducto = () => null;
    verificarDisponibilidad = () => ({ disponible: true, stockReal: 0, stockReservado: 0, stockDisponible: 0 });
    console.warn('CartProvider: ProductosContext no disponible, usando funciones dummy');
  }

  // ============================================================================
  // PERSISTENCIA: Cargar del localStorage al iniciar
  // ============================================================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('udar-cart');
      const savedCupon = localStorage.getItem('udar-cart-cupon');
      
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      }
      
      if (savedCupon) {
        const parsed = JSON.parse(savedCupon);
        setCuponAplicado(parsed);
      }
    } catch (error) {
      console.error('Error al cargar carrito desde localStorage:', error);
    }
  }, []);

  // ============================================================================
  // PERSISTENCIA: Guardar en localStorage cada vez que cambia
  // ============================================================================

  useEffect(() => {
    try {
      localStorage.setItem('udar-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar carrito en localStorage:', error);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (cuponAplicado) {
        localStorage.setItem('udar-cart-cupon', JSON.stringify(cuponAplicado));
      } else {
        localStorage.removeItem('udar-cart-cupon');
      }
    } catch (error) {
      console.error('Error al guardar cupón en localStorage:', error);
    }
  }, [cuponAplicado]);

  // ============================================================================
  // ✅ LIBERAR RESERVAS AL DESMONTAR (FASE 2)
  // ============================================================================

  useEffect(() => {
    // Cleanup: Liberar reservas cuando se cierra la ventana/tab
    return () => {
      stockReservationService.liberarReservasPorSesion(sessionId);
    };
  }, [sessionId]);

  // ============================================================================
  // AGREGAR PRODUCTO AL CARRITO - ✅ CON VALIDACIÓN DE STOCK (FASE 2)
  // ============================================================================

  const addItem = useCallback((item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number }): string => {
    const cantidad = item.cantidad || 1;
    
    // ✅ 1. Obtener producto desde ProductosContext
    const producto = obtenerProducto ? obtenerProducto(item.productoId) : null;
    
    // ✅ 2. Manejar caso sin ProductosContext o producto no encontrado
    if (!producto) {
      if (!obtenerProducto) {
        // ProductosContext no disponible, continuar con datos básicos del item
        console.warn('CartProvider: ProductosContext no disponible, usando datos del item directamente');
      } else {
        toast.error('Producto no encontrado');
        return '';
      }
    }

    // ✅ 3. Verificar que el producto esté activo (solo si tenemos el producto completo)
    if (producto && producto.activo === false) {
      toast.error('Este producto no está disponible actualmente');
      return '';
    }

    // ✅ 3. Calcular cantidad total en carrito (existente + nueva)
    const cantidadEnCarrito = items
      .filter(i => i.productoId === item.productoId)
      .reduce((sum, i) => sum + i.cantidad, 0);
    
    const cantidadTotal = cantidadEnCarrito + cantidad;

    // ✅ 4. Verificar disponibilidad considerando reservas
    const disponibilidad = verificarDisponibilidad ? 
      verificarDisponibilidad(item.productoId, cantidadTotal, sessionId) :
      { disponible: true, stockReal: 999, stockReservado: 0, stockDisponible: 999 };
    
    if (!disponibilidad.disponible) {
      toast.error('Stock insuficiente', {
        description: `Solo hay ${disponibilidad.stockDisponible} unidades disponibles`,
      });
      return '';
    }

    // ✅ 5. Si todo OK, agregar al carrito
    let returnId = '';
    
    setItems(prev => {
      // Buscar si ya existe el mismo producto con las mismas opciones
      const existingIndex = prev.findIndex(i => 
        i.productoId === item.productoId && 
        JSON.stringify(i.opcionesPersonalizadas) === JSON.stringify(item.opcionesPersonalizadas)
      );

      if (existingIndex >= 0) {
        // Ya existe: aumentar cantidad
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + cantidad,
        };
        
        returnId = updated[existingIndex].id;
        
        toast.success('Cantidad actualizada', {
          description: `${producto.nombre} (${updated[existingIndex].cantidad} unidades)`,
        });
        
        return updated;
      } else {
        // No existe: agregar nuevo
        const newItem: CartItem = {
          ...item,
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          cantidad,
          stock: producto.stock, // Guardar stock actual
          activo: producto.activo,
        };
        
        returnId = newItem.id;
        
        toast.success('Agregado al carrito', {
          description: producto.nombre,
        });
        
        return [...prev, newItem];
      }
    });

    // ✅ 6. Crear reserva temporal de stock
    stockReservationService.crearReserva(
      item.productoId,
      cantidad,
      'CLIENTE-SESSION', // TODO: Usar ID de cliente real
      sessionId,
      { carritoId: returnId }
    );
    
    return returnId;
  }, [obtenerProducto, verificarDisponibilidad, items, sessionId]);

  // ============================================================================
  // ELIMINAR PRODUCTO DEL CARRITO
  // ============================================================================

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === itemId);
      if (item) {
        toast.success(`${item.nombre} eliminado del carrito`);
      }
      return prev.filter(i => i.id !== itemId);
    });
  }, []);

  // ============================================================================
  // ACTUALIZAR CANTIDAD - ✅ CON VALIDACIÓN DE STOCK (FASE 2)
  // ============================================================================

  const updateQuantity = useCallback((itemId: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prev => {
      return prev.map(item => {
        if (item.id === itemId) {
          // ✅ Verificar disponibilidad con sistema de reservas
          const disponibilidad = verificarDisponibilidad(item.productoId, cantidad, sessionId);
          
          if (!disponibilidad.disponible) {
            toast.error(`Stock insuficiente. Solo hay ${disponibilidad.stockDisponible} unidades disponibles`);
            return item;
          }
          
          return { ...item, cantidad };
        }
        return item;
      });
    });
  }, [removeItem]);

  // ============================================================================
  // ACTUALIZAR OBSERVACIONES
  // ============================================================================

  const updateObservaciones = useCallback((itemId: string, observaciones: string) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, observaciones } : item
      )
    );
  }, []);

  // ============================================================================
  // ACTUALIZAR OPCIONES DE PRODUCTO
  // ============================================================================

  const updateItemOptions = useCallback((itemId: string, opciones: any) => {
    setItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, opciones } : item
      )
    );
  }, []);

  // ============================================================================
  // LIMPIAR CARRITO - ✅ CON LIBERACIÓN DE RESERVAS (FASE 2)
  // ============================================================================

  const clearCart = useCallback(() => {
    // ✅ Liberar todas las reservas de esta sesión
    const liberadas = stockReservationService.liberarReservasPorSesion(sessionId);
    
    if (liberadas > 0) {
      console.info(`✅ ${liberadas} reservas liberadas al vaciar carrito`);
    }
    
    setItems([]);
    setCuponAplicado(null);
    toast.success('Carrito vaciado');
  }, [sessionId]);

  // ============================================================================
  // APLICAR CUPÓN
  // ============================================================================

  // ============================================================================
  // CÁLCULOS (deben ir antes de callbacks que los usan)
  // ============================================================================

  // 🎯 FUNCIÓN AUXILIAR: Calcular precio unitario de un item (precio base + extras)
  const calcularPrecioUnitarioItem = (item: CartItem): number => {
    let precioUnitario = item.precio;
    
    // Sumar los preciosAdicionales de las opciones personalizadas
    if (item.opcionesPersonalizadas) {
      item.opcionesPersonalizadas.forEach(grupo => {
        grupo.opciones.forEach(opcion => {
          if (opcion.precioAdicional) {
            precioUnitario += opcion.precioAdicional;
          }
        });
      });
    }
    
    return precioUnitario;
  };

  // ✅ SUBTOTAL: precio base + extras de TODOS los items
  const subtotal = items.reduce((acc, item) => {
    const precioUnitario = calcularPrecioUnitarioItem(item);
    return acc + (precioUnitario * item.cantidad);
  }, 0);
  
  const descuentoCupon = cuponAplicado 
    ? cuponAplicado.tipo === 'porcentaje'
      ? subtotal * (cuponAplicado.valor / 100)
      : cuponAplicado.valor
    : 0;
  
  const subtotalConDescuento = subtotal - descuentoCupon;
  const iva = subtotalConDescuento * 0.21; // IVA 21%
  const total = subtotalConDescuento + iva;
  
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  const aplicarCupon = useCallback(async (codigo: string): Promise<boolean> => {
    const code = (codigo || '').trim();
    if (!code) {
      toast.error('Cupón no válido');
      return false;
    }

    if (cuponAplicado?.codigo?.toLowerCase() === code.toLowerCase()) {
      toast.info('Este cupón ya está aplicado');
      return false;
    }

    const result = await cuponesApi.validar({ codigo: code, total: subtotal });
    if (!result?.valido) return false;

    const descuento = Number(result.descuentoCalculado ?? 0);
    const descuentoSafe = Number.isFinite(descuento) ? descuento : 0;

    setCuponAplicado({
      codigo: code.toUpperCase(),
      tipo: 'fijo',
      valor: Math.max(0, descuentoSafe),
      descripcion: result.mensaje || result.cupon?.descripcion || 'Descuento aplicado',
    });
    return true;
  }, [cuponAplicado, subtotal]);

  // ============================================================================
  // ELIMINAR CUPÓN
  // ============================================================================

  const eliminarCupon = useCallback(() => {
    setCuponAplicado(null);
    toast.info('Cupón eliminado');
  }, []);

  // ============================================================================
  // FUNCIÓN: Crear pedido con API backend
  // ============================================================================

  const crearPedido = useCallback(async (datosAdicionales: {
    clienteId: number;
    tipoEntrega?: 'recogida' | 'domicilio';
    direccionEntrega?: string;
    metodoPago?: 'tarjeta' | 'efectivo' | 'bizum';
    puntoVentaId?: string;
  }) => {
    try {
      if (items.length === 0) {
        toast.error('El carrito está vacío');
        return null;
      }

      // Preparar los items para el pedido
      const itemsPedido = items.map(item => ({
        productoId: parseInt(item.productoId),
        cantidad: item.cantidad,
        precio: calcularPrecioUnitarioItem(item),
      }));

      // Crear el pedido en el backend
      const pedidoData: PedidoCreate = {
        clienteId: datosAdicionales.clienteId,
        items: itemsPedido,
        total: total,
        estado: 'pendiente',
        tipoEntrega: datosAdicionales.tipoEntrega || 'recogida',
        direccionEntrega: datosAdicionales.direccionEntrega,
        metodoPago: datosAdicionales.metodoPago || 'tarjeta',
        puntoVentaId: datosAdicionales.puntoVentaId,
      };

      const pedidoCreado = await pedidosApi.create(pedidoData);

      if (pedidoCreado) {
        // Limpiar carrito después de crear el pedido
        clearCart();
        
        // Liberar reservas de stock
        stockReservationService.liberarReservasPorSesion(sessionId);
        
        toast.success('¡Pedido creado correctamente!');
        return pedidoCreado;
      }

      return null;
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Error al crear el pedido');
      return null;
    }
  }, [items, total, sessionId]);

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const value: CartContextType = {
    // Estado
    items,
    cuponAplicado,
    
    // Acciones
    addItem,
    removeItem,
    updateQuantity,
    updateObservaciones,
    updateItemOptions,
    clearCart,
    aplicarCupon,
    eliminarCupon,
    
    // ✅ NUEVO: Crear pedido
    crearPedido,
    
    // Cálculos
    subtotal,
    descuentoCupon,
    iva,
    total,
    totalItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// ============================================================================
// HOOK PARA USAR EL CARRITO
// ============================================================================

export function useCart() {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  
  return context;
}

// ============================================================================
// EXPORTAR TIPOS
// ============================================================================

export type { CartContextType };