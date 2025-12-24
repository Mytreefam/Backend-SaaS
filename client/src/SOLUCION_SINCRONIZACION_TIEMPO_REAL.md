# 🔄 SOLUCIÓN: SINCRONIZACIÓN EN TIEMPO REAL

**Problema:** Los cambios en un rol no se reflejan automáticamente en otros roles  
**Solución:** Sistema de eventos con BroadcastChannel API + PedidosContext centralizado

---

## 📦 IMPLEMENTACIÓN - PedidosContext

```typescript
/**
 * /contexts/PedidosContext.tsx
 * 
 * Contexto centralizado para gestión de pedidos
 * Flujo completo: Cliente → Trabajador → Gerente
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner@2.0.3';
import { useStock } from './StockContext';
import { useProductos } from './ProductosContext';

// ============================================================================
// TIPOS
// ============================================================================

export type EstadoPedido = 
  | 'pendiente'    // Cliente creó el pedido
  | 'confirmado'   // Trabajador confirmó
  | 'preparando'   // En preparación
  | 'listo'        // Listo para entrega
  | 'enviado'      // En camino
  | 'entregado'    // Completado
  | 'cancelado';   // Cancelado

export interface ItemPedido {
  productoId: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  opciones?: any;
}

export interface Pedido {
  id: string;
  numero: number; // Número secuencial visible
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  items: ItemPedido[];
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;
  estado: EstadoPedido;
  tipoEntrega: 'tienda' | 'domicilio';
  direccionEntrega?: string;
  metodoPago: 'tarjeta' | 'efectivo' | 'bizum';
  observaciones?: string;
  cuponAplicado?: {
    codigo: string;
    descuento: number;
  };
  fechaCreacion: string;
  fechaActualizacion: string;
  actualizadoPor?: string; // ID del usuario que actualizó
  marcaId: string;
  puntoVentaId: string;
}

interface PedidosContextType {
  // Estado
  pedidos: Pedido[];
  loading: boolean;
  
  // Acciones
  crearPedido: (datos: CrearPedidoRequest) => Promise<Pedido>;
  obtenerPedidos: (filtros?: FiltrosPedidos) => Pedido[];
  obtenerPedido: (id: string) => Pedido | undefined;
  actualizarEstado: (pedidoId: string, nuevoEstado: EstadoPedido, userId: string) => void;
  cancelarPedido: (pedidoId: string, motivo: string, userId: string) => void;
  
  // Suscripciones
  suscribirseACambios: (callback: (pedido: Pedido) => void) => () => void;
  
  // Estadísticas
  obtenerEstadisticas: () => EstadisticasPedidos;
}

interface CrearPedidoRequest {
  clienteId: string;
  clienteNombre: string;
  clienteEmail: string;
  items: ItemPedido[];
  tipoEntrega: 'tienda' | 'domicilio';
  direccionEntrega?: string;
  metodoPago: 'tarjeta' | 'efectivo' | 'bizum';
  observaciones?: string;
  cuponAplicado?: {
    codigo: string;
    descuento: number;
  };
  marcaId: string;
  puntoVentaId: string;
}

interface FiltrosPedidos {
  estado?: EstadoPedido[];
  clienteId?: string;
  marcaId?: string;
  puntoVentaId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

interface EstadisticasPedidos {
  total: number;
  pendientes: number;
  completados: number;
  cancelados: number;
  ventaTotal: number;
  ticketMedio: number;
}

// ============================================================================
// BROADCAST CHANNEL - Comunicación entre tabs/roles
// ============================================================================

const pedidosChannel = new BroadcastChannel('pedidos-updates');

// ============================================================================
// CONTEXTO
// ============================================================================

const PedidosContext = createContext<PedidosContextType | undefined>(undefined);

export function PedidosProvider({ children }: { children: React.ReactNode }) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [suscriptores, setSuscriptores] = useState<Array<(pedido: Pedido) => void>>([]);
  
  const { descontarStock, devolverStock } = useStock();
  const { obtenerProducto } = useProductos();

  // ============================================================================
  // CARGAR DATOS INICIALES
  // ============================================================================

  useEffect(() => {
    try {
      const pedidosGuardados = localStorage.getItem('udar-pedidos');
      if (pedidosGuardados) {
        setPedidos(JSON.parse(pedidosGuardados));
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // PERSISTIR EN LOCALSTORAGE
  // ============================================================================

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('udar-pedidos', JSON.stringify(pedidos));
    }
  }, [pedidos, loading]);

  // ============================================================================
  // ESCUCHAR EVENTOS DE OTROS TABS/ROLES
  // ============================================================================

  useEffect(() => {
    pedidosChannel.onmessage = (event) => {
      const { type, pedido } = event.data;

      switch (type) {
        case 'PEDIDO_CREADO':
          setPedidos(prev => [pedido, ...prev]);
          notificarSuscriptores(pedido);
          toast.success(`Nuevo pedido #${pedido.numero}`, {
            description: `Cliente: ${pedido.clienteNombre}`,
          });
          break;

        case 'PEDIDO_ACTUALIZADO':
          setPedidos(prev => 
            prev.map(p => p.id === pedido.id ? pedido : p)
          );
          notificarSuscriptores(pedido);
          break;

        case 'PEDIDO_CANCELADO':
          setPedidos(prev => 
            prev.map(p => p.id === pedido.id ? pedido : p)
          );
          notificarSuscriptores(pedido);
          break;
      }
    };

    return () => {
      pedidosChannel.close();
    };
  }, []);

  // ============================================================================
  // NOTIFICAR SUSCRIPTORES
  // ============================================================================

  const notificarSuscriptores = useCallback((pedido: Pedido) => {
    suscriptores.forEach(callback => callback(pedido));
  }, [suscriptores]);

  // ============================================================================
  // CREAR PEDIDO
  // ============================================================================

  const crearPedido = useCallback(async (datos: CrearPedidoRequest): Promise<Pedido> => {
    // 1. Validar stock disponible para todos los items
    for (const item of datos.items) {
      const producto = obtenerProducto(item.productoId);
      if (!producto) {
        throw new Error(`Producto ${item.productoId} no encontrado`);
      }

      if (producto.stock && producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}. Solo hay ${producto.stock} unidades`);
      }
    }

    // 2. Calcular totales
    const subtotal = datos.items.reduce((sum, item) => sum + item.subtotal, 0);
    const descuento = datos.cuponAplicado?.descuento || 0;
    const subtotalConDescuento = subtotal - descuento;
    const iva = subtotalConDescuento * 0.21;
    const total = subtotalConDescuento + iva;

    // 3. Generar número de pedido secuencial
    const ultimoPedido = pedidos[0];
    const numero = ultimoPedido ? ultimoPedido.numero + 1 : 1;

    // 4. Crear pedido
    const nuevoPedido: Pedido = {
      id: `PED-${Date.now()}`,
      numero,
      clienteId: datos.clienteId,
      clienteNombre: datos.clienteNombre,
      clienteEmail: datos.clienteEmail,
      items: datos.items,
      subtotal,
      descuento,
      iva,
      total,
      estado: 'pendiente',
      tipoEntrega: datos.tipoEntrega,
      direccionEntrega: datos.direccionEntrega,
      metodoPago: datos.metodoPago,
      observaciones: datos.observaciones,
      cuponAplicado: datos.cuponAplicado,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: datos.clienteId,
      marcaId: datos.marcaId,
      puntoVentaId: datos.puntoVentaId,
    };

    // 5. Descontar stock automáticamente
    datos.items.forEach(item => {
      descontarStock(item.productoId, item.cantidad, `Pedido #${numero}`);
    });

    // 6. Guardar pedido localmente
    setPedidos(prev => [nuevoPedido, ...prev]);

    // 7. Notificar a otros tabs/roles
    pedidosChannel.postMessage({
      type: 'PEDIDO_CREADO',
      pedido: nuevoPedido,
    });

    // 8. Notificar suscriptores
    notificarSuscriptores(nuevoPedido);

    toast.success('Pedido creado correctamente', {
      description: `Pedido #${numero} - Total: ${total.toFixed(2)}€`,
    });

    return nuevoPedido;
  }, [pedidos, obtenerProducto, descontarStock, notificarSuscriptores]);

  // ============================================================================
  // OBTENER PEDIDOS CON FILTROS
  // ============================================================================

  const obtenerPedidos = useCallback((filtros?: FiltrosPedidos): Pedido[] => {
    let resultado = [...pedidos];

    if (filtros?.estado) {
      resultado = resultado.filter(p => filtros.estado!.includes(p.estado));
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

    if (filtros?.fechaDesde) {
      resultado = resultado.filter(p => p.fechaCreacion >= filtros.fechaDesde!);
    }

    if (filtros?.fechaHasta) {
      resultado = resultado.filter(p => p.fechaCreacion <= filtros.fechaHasta!);
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

  const actualizarEstado = useCallback((pedidoId: string, nuevoEstado: EstadoPedido, userId: string) => {
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoActual) {
      toast.error('Pedido no encontrado');
      return;
    }

    const pedidoActualizado: Pedido = {
      ...pedidoActual,
      estado: nuevoEstado,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: userId,
    };

    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? pedidoActualizado : p)
    );

    // Notificar a otros tabs/roles
    pedidosChannel.postMessage({
      type: 'PEDIDO_ACTUALIZADO',
      pedido: pedidoActualizado,
    });

    notificarSuscriptores(pedidoActualizado);

    toast.success(`Pedido #${pedidoActual.numero} actualizado`, {
      description: `Nuevo estado: ${nuevoEstado}`,
    });
  }, [pedidos, notificarSuscriptores]);

  // ============================================================================
  // CANCELAR PEDIDO
  // ============================================================================

  const cancelarPedido = useCallback((pedidoId: string, motivo: string, userId: string) => {
    const pedidoActual = pedidos.find(p => p.id === pedidoId);
    if (!pedidoActual) {
      toast.error('Pedido no encontrado');
      return;
    }

    // Si el pedido está en estado pendiente/confirmado, devolver stock
    if (['pendiente', 'confirmado'].includes(pedidoActual.estado)) {
      pedidoActual.items.forEach(item => {
        devolverStock(item.productoId, item.cantidad, `Cancelación pedido #${pedidoActual.numero}`);
      });
    }

    const pedidoCancelado: Pedido = {
      ...pedidoActual,
      estado: 'cancelado',
      observaciones: `${pedidoActual.observaciones || ''}\n\nCANCELADO: ${motivo}`,
      fechaActualizacion: new Date().toISOString(),
      actualizadoPor: userId,
    };

    setPedidos(prev => 
      prev.map(p => p.id === pedidoId ? pedidoCancelado : p)
    );

    // Notificar a otros tabs/roles
    pedidosChannel.postMessage({
      type: 'PEDIDO_CANCELADO',
      pedido: pedidoCancelado,
    });

    notificarSuscriptores(pedidoCancelado);

    toast.info(`Pedido #${pedidoActual.numero} cancelado`, {
      description: motivo,
    });
  }, [pedidos, devolverStock, notificarSuscriptores]);

  // ============================================================================
  // SUSCRIBIRSE A CAMBIOS
  // ============================================================================

  const suscribirseACambios = useCallback((callback: (pedido: Pedido) => void) => {
    setSuscriptores(prev => [...prev, callback]);

    // Retornar función para desuscribirse
    return () => {
      setSuscriptores(prev => prev.filter(cb => cb !== callback));
    };
  }, []);

  // ============================================================================
  // ESTADÍSTICAS
  // ============================================================================

  const obtenerEstadisticas = useCallback((): EstadisticasPedidos => {
    return {
      total: pedidos.length,
      pendientes: pedidos.filter(p => ['pendiente', 'confirmado', 'preparando'].includes(p.estado)).length,
      completados: pedidos.filter(p => p.estado === 'entregado').length,
      cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
      ventaTotal: pedidos
        .filter(p => p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0),
      ticketMedio: pedidos.filter(p => p.estado === 'entregado').length > 0
        ? pedidos.filter(p => p.estado === 'entregado').reduce((sum, p) => sum + p.total, 0) / 
          pedidos.filter(p => p.estado === 'entregado').length
        : 0,
    };
  }, [pedidos]);

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
    suscribirseACambios,
    obtenerEstadisticas,
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
```

---

## 🔄 SINCRONIZACIÓN STOCK ↔ PRODUCTOS

```typescript
/**
 * /contexts/StockContext.tsx (ACTUALIZADO)
 * 
 * Sincronización bidireccional con ProductosContext
 */

import { useProductos } from './ProductosContext';

export function StockProvider({ children }: { children: React.ReactNode }) {
  const { actualizarStock: actualizarStockProducto } = useProductos();
  
  // ============================================================================
  // REGISTRAR MOVIMIENTO (ACTUALIZADO)
  // ============================================================================
  
  const registrarMovimiento = useCallback((movimiento: MovimientoStock) => {
    // 1. Guardar movimiento en historial
    const nuevoMovimiento = {
      ...movimiento,
      id: `MOV-${Date.now()}`,
      fecha: new Date().toISOString(),
      usuario: movimiento.usuario || 'Sistema',
    };
    
    setMovimientos(prev => [nuevoMovimiento, ...prev]);
    
    // 2. Calcular nuevo stock
    const stockActual = calcularStockProducto(movimiento.productoId);
    
    // 3. ✅ SINCRONIZAR con ProductosContext automáticamente
    actualizarStockProducto(movimiento.productoId, stockActual);
    
    // 4. ✅ NOTIFICAR a otros tabs/roles
    const stockChannel = new BroadcastChannel('stock-updates');
    stockChannel.postMessage({
      type: 'STOCK_ACTUALIZADO',
      productoId: movimiento.productoId,
      stockNuevo: stockActual,
      movimiento: nuevoMovimiento,
    });
    
    toast.success('Stock actualizado', {
      description: `${movimiento.tipo}: ${movimiento.cantidad} unidades`,
    });
    
    return nuevoMovimiento;
  }, [actualizarStockProducto]);
  
  // ... resto del contexto
}
```

---

## ✅ VALIDACIÓN DE STOCK EN CARRITO

```typescript
/**
 * /contexts/CartContext.tsx (ACTUALIZADO)
 * 
 * Validar stock en tiempo real antes de agregar
 */

import { useProductos } from './ProductosContext';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { obtenerProducto } = useProductos();
  
  // ============================================================================
  // AGREGAR ITEM (ACTUALIZADO)
  // ============================================================================
  
  const addItem = useCallback((item: Omit<CartItem, 'id' | 'cantidad'> & { cantidad?: number }): string => {
    const cantidad = item.cantidad || 1;
    
    // ✅ VALIDAR STOCK en tiempo real
    const producto = obtenerProducto(item.productoId);
    
    if (!producto) {
      toast.error('Producto no encontrado');
      return '';
    }
    
    if (!producto.activo) {
      toast.error('Este producto ya no está disponible');
      return '';
    }
    
    if (producto.stock !== undefined && producto.stock < cantidad) {
      toast.error(`Stock insuficiente`, {
        description: `Solo hay ${producto.stock} unidades disponibles`,
      });
      return '';
    }
    
    // Verificar si ya existe en el carrito
    const itemExistente = items.find(i => 
      i.productoId === item.productoId && 
      JSON.stringify(i.opcionesPersonalizadas) === JSON.stringify(item.opcionesPersonalizadas)
    );
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      
      // ✅ VALIDAR stock total (existente + nuevo)
      if (producto.stock !== undefined && producto.stock < nuevaCantidad) {
        toast.error(`Stock insuficiente`, {
          description: `Ya tienes ${itemExistente.cantidad} en el carrito. Solo hay ${producto.stock} disponibles`,
        });
        return '';
      }
      
      // Actualizar cantidad
      updateQuantity(itemExistente.id, nuevaCantidad);
      return itemExistente.id;
    }
    
    // Agregar nuevo item
    const newItem: CartItem = {
      ...item,
      id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      cantidad,
      // Actualizar precio desde producto (por si cambió)
      precio: producto.precio,
    };
    
    setItems(prev => [...prev, newItem]);
    toast.success(`${producto.nombre} añadido al carrito`);
    
    return newItem.id;
  }, [items, obtenerProducto, updateQuantity]);
  
  // ... resto del contexto
}
```

---

## 🔔 NOTIFICACIONES EN TIEMPO REAL

```typescript
/**
 * Hook para notificaciones de pedidos
 * Se suscribe a cambios y muestra toast
 */

import { useEffect } from 'react';
import { usePedidos } from '../contexts/PedidosContext';
import { toast } from 'sonner@2.0.3';

export function useNotificacionesPedidos(rol: 'cliente' | 'trabajador' | 'gerente') {
  const { suscribirseACambios } = usePedidos();
  
  useEffect(() => {
    // Suscribirse a cambios de pedidos
    const unsuscribe = suscribirseACambios((pedido) => {
      // Mostrar notificación según rol
      switch (rol) {
        case 'trabajador':
        case 'gerente':
          if (pedido.estado === 'pendiente') {
            // Nuevo pedido
            toast.success('🔔 Nuevo pedido recibido', {
              description: `Pedido #${pedido.numero} - ${pedido.clienteNombre}`,
              duration: 10000,
              action: {
                label: 'Ver',
                onClick: () => {
                  // Navegar al pedido
                  window.location.hash = `#/pedidos/${pedido.id}`;
                },
              },
            });
            
            // Sonido de notificación (opcional)
            const audio = new Audio('/notification.mp3');
            audio.play().catch(() => {});
          }
          break;
          
        case 'cliente':
          // Notificar al cliente cambios en SUS pedidos
          toast.info(`Estado del pedido #${pedido.numero}`, {
            description: `Nuevo estado: ${pedido.estado}`,
          });
          break;
      }
    });
    
    // Cleanup: desuscribirse al desmontar
    return unsuscribe;
  }, [rol, suscribirseACambios]);
}

// USO en componentes:

// En TrabajadorDashboard:
function TrabajadorDashboard() {
  useNotificacionesPedidos('trabajador');
  // ...
}

// En GerenteDashboard:
function GerenteDashboard() {
  useNotificacionesPedidos('gerente');
  // ...
}

// En ClienteDashboard:
function ClienteDashboard() {
  useNotificacionesPedidos('cliente');
  // ...
}
```

---

## 🛡️ ROUTE GUARDS - Protección de Rutas

```typescript
/**
 * /lib/route-guards.tsx
 * 
 * HOC para proteger rutas por rol
 */

import React from 'react';
import { UserRole } from '../App';

interface GuardProps {
  currentUser: { role: UserRole } | null;
  allowedRoles: UserRole[];
}

export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: UserRole[]
) {
  return function GuardedComponent(props: P & { currentUser: { role: UserRole } | null }) {
    const { currentUser, ...restProps } = props;
    
    // No hay usuario logueado
    if (!currentUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🔒 Acceso Restringido
            </h2>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión para acceder a esta página
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-[#ED1C24] text-white rounded-lg hover:bg-[#D11820]"
            >
              Ir al Login
            </button>
          </div>
        </div>
      );
    }
    
    // Usuario no tiene permiso
    if (!allowedRoles.includes(currentUser.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ⛔ Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección.
              <br />
              <span className="text-sm text-gray-500">
                Tu rol: <strong>{currentUser.role}</strong>
                <br />
                Roles permitidos: <strong>{allowedRoles.join(', ')}</strong>
              </span>
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
    
    // Usuario tiene permiso, renderizar componente
    return <Component {...(restProps as P)} />;
  };
}

// ============================================================================
// USO EN App.tsx
// ============================================================================

// Proteger dashboards
const ClienteDashboardProtected = withRoleGuard(ClienteDashboard, ['cliente']);
const TrabajadorDashboardProtected = withRoleGuard(TrabajadorDashboard, ['trabajador']);
const GerenteDashboardProtected = withRoleGuard(GerenteDashboard, ['gerente']);

// En el render:
function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  return (
    <>
      {currentUser?.role === 'cliente' && (
        <ClienteDashboardProtected currentUser={currentUser} />
      )}
      {currentUser?.role === 'trabajador' && (
        <TrabajadorDashboardProtected currentUser={currentUser} />
      )}
      {currentUser?.role === 'gerente' && (
        <GerenteDashboardProtected currentUser={currentUser} />
      )}
    </>
  );
}
```

---

## 📊 RESUMEN DE CAMBIOS

### Archivos Nuevos a Crear:

```
/contexts/PedidosContext.tsx              ← NUEVO
/hooks/usePedidos.ts                      ← NUEVO
/hooks/useNotificacionesPedidos.ts        ← NUEVO
/lib/route-guards.tsx                     ← NUEVO
```

### Archivos a Actualizar:

```
/contexts/StockContext.tsx                ← ACTUALIZAR
/contexts/CartContext.tsx                 ← ACTUALIZAR
/App.tsx                                  ← ACTUALIZAR (agregar PedidosProvider)
```

### Pasos de Implementación:

1. ✅ Crear PedidosContext
2. ✅ Actualizar StockContext con sincronización
3. ✅ Actualizar CartContext con validación de stock
4. ✅ Crear route guards
5. ✅ Agregar PedidosProvider en App.tsx
6. ✅ Testing completo del flujo

---

**Estimación total:** 6-8 horas  
**Prioridad:** 🔴 CRÍTICA  
**Impacto:** Alto - Soluciona problemas core del sistema

