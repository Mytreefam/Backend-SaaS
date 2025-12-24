# 🎯 DIAGRAMA COMPLETO DEL SISTEMA - FASE 1 + FASE 2

**Sistema:** Udar Edge - Sincronización en Tiempo Real  
**Fecha:** Diciembre 2025  
**Versión:** 2.2.0

---

## 🏗️ ARQUITECTURA COMPLETA

```
┌───────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE PRESENTACIÓN                              │
│                                                                           │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐             │
│  │   Cliente   │      │ Trabajador  │      │   Gerente   │             │
│  │  Dashboard  │      │  Dashboard  │      │  Dashboard  │             │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘             │
│         │                    │                     │                     │
│         │                    │                     │                     │
└─────────┼────────────────────┼─────────────────────┼─────────────────────┘
          │                    │                     │
          │         ┌──────────┴────────────┐        │
          │         │   HOOKS               │        │
          └─────────┼──────────┬────────────┼────────┘
                    │          │            │
                    ▼          ▼            ▼
          ┌─────────────────────────────────────────┐
          │  useNotificacionesPedidos               │
          │  useProductos                           │
          └─────────────────────────────────────────┘
                    │          │            │
┌───────────────────┼──────────┼────────────┼─────────────────────────────┐
│                   │   CAPA DE CONTEXTOS   │                             │
│                   │          │            │                             │
│         ┌─────────▼──┐  ┌────▼─────┐  ┌──▼────────┐                   │
│         │  Pedidos   │  │ Productos │  │   Cart    │                   │
│         │  Context   │  │  Context  │  │ Context   │                   │
│         └─────┬──────┘  └────┬─────┘  └──┬────────┘                   │
│               │              │            │                             │
│               │    ┌─────────▼────────────▼──┐                         │
│               │    │  Stock Reservation      │                         │
│               │    │      Service            │                         │
│               │    └─────────┬───────────────┘                         │
│               │              │                                          │
│         ┌─────▼──────────────▼────────────┐                           │
│         │  BROADCAST CHANNELS              │                           │
│         │  • udar-pedidos-sync             │                           │
│         │  • udar-stock-sync               │                           │
│         │  • udar-stock-reservations       │                           │
│         └──────────────┬───────────────────┘                           │
│                        │                                                │
└────────────────────────┼────────────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────────────┐
│                 CAPA DE PERSISTENCIA                                    │
│                        │                                                │
│         ┌──────────────▼──────────────┐                                │
│         │     localStorage             │                                │
│         │  • udar-pedidos              │                                │
│         │  • udar-cart                 │                                │
│         │  • udar-reservas-stock       │                                │
│         └──────────────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO: De Carrito a Pedido Completado

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 1: CLIENTE AGREGA PRODUCTO AL CARRITO                             │
└─────────────────────────────────────────────────────────────────────────┘

T=0ms     Cliente: Click "Agregar al Carrito"
          │
          ├─▶ CartContext.addItem({ productoId, cantidad })
          │   │
T=5ms     │   ├─▶ obtenerProducto(productoId)
          │   │   │
          │   │   └─▶ ProductosContext busca producto
          │   │       └─▶ Retorna: {
          │   │             id: 'burger-001',
          │   │             nombre: 'Burger Típica',
          │   │             stock: 50,
          │   │             activo: true,
          │   │             precio: 12.90
          │   │           }
          │   │
T=8ms     │   ├─▶ Validar producto.activo === true ✅
          │   │
T=10ms    │   ├─▶ verificarDisponibilidad('burger-001', 1, sessionId)
          │   │   │
          │   │   ├─▶ stockReal = 50
          │   │   │
          │   │   ├─▶ stockReservationService.obtenerStockReservado()
          │   │   │   ├─▶ Buscar reservas activas de 'burger-001'
          │   │   │   ├─▶ Excluir sessionId actual
          │   │   │   └─▶ Retorna: 10 (otros clientes tienen reservas)
          │   │   │
          │   │   ├─▶ stockDisponible = 50 - 10 = 40
          │   │   │
          │   │   └─▶ Retorna: {
          │   │         disponible: true,
          │   │         stockReal: 50,
          │   │         stockReservado: 10,
          │   │         stockDisponible: 40
          │   │       }
          │   │
T=12ms    │   ├─▶ disponible === true ✅
          │   │
T=15ms    │   ├─▶ setItems(prev => [...prev, newItem])
          │   │   └─▶ Item agregado al carrito ✅
          │   │
T=18ms    │   ├─▶ toast.success('Agregado al carrito')
          │   │
T=20ms    │   └─▶ stockReservationService.crearReserva(
          │         'burger-001',
          │         1,
          │         'CLI-001',
          │         'SESSION-ABC123',
          │         { carritoId: 'cart-item-001' }
          │       )
          │       │
T=22ms    │       ├─▶ Crear ReservaStock {
          │       │     id: 'RES-001',
          │       │     productoId: 'burger-001',
          │       │     cantidad: 1,
          │       │     creadaEn: '2025-12-03T10:00:00Z',
          │       │     expiraEn: '2025-12-03T10:15:00Z', // +15min
          │       │     estado: 'activa',
          │       │     sessionId: 'SESSION-ABC123'
          │       │   }
          │       │
T=25ms    │       ├─▶ Guardar en Map local
T=27ms    │       ├─▶ localStorage.setItem('udar-reservas-stock', ...)
          │       │
T=30ms    │       ├─▶ BroadcastChannel.postMessage({
          │       │     type: 'RESERVA_CREADA',
          │       │     reserva: {...}
          │       │   })
          │       │
T=32ms    │       └─▶ Notificar listeners
          │
T=35ms    └─▶ CLIENTE: Ve producto en carrito ✅

┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 2: OTROS TABS RECIBEN ACTUALIZACIÓN DE RESERVA                    │
└─────────────────────────────────────────────────────────────────────────┘

T=30ms    TAB 2 (Otro Cliente): Escucha broadcast
          │
          ├─▶ stockReservationChannel.onmessage(event)
          │   │
          │   ├─▶ event.data = {
          │   │     type: 'RESERVA_CREADA',
          │   │     reserva: {
          │   │       id: 'RES-001',
          │   │       productoId: 'burger-001',
          │   │       cantidad: 1,
          │   │       ...
          │   │     }
          │   │   }
          │   │
T=32ms    │   ├─▶ reservas.set('RES-001', reserva)
          │   │
T=34ms    │   └─▶ notificarListeners()
          │       │
          │       └─▶ UI se actualiza: Stock disponible = 39 ✅
          │
T=35ms    └─▶ TAB 2: Ve stock actualizado automáticamente

┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 3: CLIENTE CONFIRMA PEDIDO                                        │
└─────────────────────────────────────────────────────────────────────────┘

T=5min    Cliente: Click "Confirmar Pedido"
          │
          ├─▶ PedidosContext.crearPedido({
          │     clienteId: 'CLI-001',
          │     items: [
          │       {
          │         productoId: 'burger-001',
          │         cantidad: 1,
          │         precio: 12.90,
          │         subtotal: 12.90
          │       }
          │     ],
          │     tipoEntrega: 'domicilio',
          │     metodoPago: 'tarjeta',
          │     ...
          │   })
          │   │
          │   ├─▶ Calcular totales
          │   │   ├─▶ subtotal = 12.90
          │   │   ├─▶ iva = 2.71
          │   │   └─▶ total = 15.61
          │   │
          │   ├─▶ Generar número secuencial
          │   │   └─▶ numero = 42 (#0042)
          │   │
          │   ├─▶ Crear Pedido {
          │   │     id: 'PED-xxx',
          │   │     numero: 42,
          │   │     estado: 'pendiente',
          │   │     total: 15.61,
          │   │     ...
          │   │   }
          │   │
          │   ├─▶ setPedidos(prev => [nuevoPedido, ...prev])
          │   │
          │   ├─▶ localStorage.setItem('udar-pedidos', ...)
          │   │
          │   ├─▶ BroadcastChannel.postMessage({
          │   │     type: 'PEDIDO_CREADO',
          │   │     pedido: {...}
          │   │   })
          │   │
          │   └─▶ toast.success('Pedido creado correctamente')
          │
          ├─▶ stockReservationService.confirmarReserva('RES-001', 'PED-xxx')
          │   │
          │   ├─▶ reserva.estado = 'confirmada'
          │   ├─▶ reserva.metadata.pedidoId = 'PED-xxx'
          │   │
          │   └─▶ BroadcastChannel.postMessage({
          │         type: 'RESERVA_CONFIRMADA',
          │         reservaId: 'RES-001',
          │         pedidoId: 'PED-xxx'
          │       })
          │
          ├─▶ ProductosContext.decrementarStock('burger-001', 1)
          │   │
          │   ├─▶ nuevoStock = 50 - 1 = 49
          │   │
          │   ├─▶ setProductos(prev => 
          │   │     prev.map(p => 
          │   │       p.id === 'burger-001' 
          │   │         ? { ...p, stock: 49 }
          │   │         : p
          │   │     )
          │   │   )
          │   │
          │   └─▶ stockChannel.postMessage({
          │         type: 'STOCK_ACTUALIZADO',
          │         productoId: 'burger-001',
          │         stock: 49
          │       })
          │
          ├─▶ CartContext.clearCart()
          │   │
          │   ├─▶ stockReservationService.liberarReservasPorSesion('SESSION-ABC123')
          │   │   │
          │   │   ├─▶ Buscar reservas con sessionId
          │   │   ├─▶ reservas.delete('RES-001') // Ya confirmada
          │   │   │
          │   │   └─▶ BroadcastChannel.postMessage({
          │   │         type: 'RESERVA_LIBERADA',
          │   │         reservaId: 'RES-001'
          │   │       })
          │   │
          │   ├─▶ setItems([])
          │   │
          │   └─▶ toast.success('Carrito vaciado')
          │
          └─▶ CLIENTE: Pedido confirmado ✅

┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 4: TRABAJADOR RECIBE NOTIFICACIÓN                                 │
└─────────────────────────────────────────────────────────────────────────┘

          TRABAJADOR (Tab 2): Escucha broadcast de pedido
          │
          ├─▶ pedidosChannel.onmessage(event)
          │   │
          │   ├─▶ event.data = {
          │   │     type: 'PEDIDO_CREADO',
          │   │     pedido: {
          │   │       id: 'PED-xxx',
          │   │       numero: 42,
          │   │       estado: 'pendiente',
          │   │       ...
          │   │     }
          │   │   }
          │   │
          │   ├─▶ setPedidos(prev => [event.data.pedido, ...prev])
          │   │
          │   └─▶ notificarSuscriptores(pedido, 'creado')
          │
          ├─▶ useNotificacionesPedidos detecta cambio
          │   │
          │   ├─▶ rol === 'trabajador' ✅
          │   │
          │   ├─▶ toast.success('🔔 Nuevo pedido recibido', {
          │   │     description: 'Pedido #0042 - Cliente XXX',
          │   │     action: {
          │   │       label: 'Ver',
          │   │       onClick: () => navigate('/pedido/PED-xxx')
          │   │     }
          │   │   })
          │   │
          │   └─▶ 🔊 audioRef.current.play()
          │
          └─▶ TRABAJADOR: Escucha notificación y ve pedido ✅

┌─────────────────────────────────────────────────────────────────────────┐
│ PASO 5: GERENTE VE DASHBOARD ACTUALIZADO                               │
└─────────────────────────────────────────────────────────────────────────┘

          GERENTE (Tab 3): Escucha broadcast
          │
          ├─▶ pedidosChannel.onmessage(event)
          │   │
          │   └─▶ setPedidos(prev => [event.data.pedido, ...prev])
          │
          ├─▶ stockChannel.onmessage(event)
          │   │
          │   └─▶ setProductos(prev => 
          │         prev.map(p => 
          │           p.id === 'burger-001' 
          │             ? { ...p, stock: 49 }
          │             : p
          │         )
          │       )
          │
          ├─▶ obtenerEstadisticas() recalcula automáticamente
          │   │
          │   └─▶ {
          │         total: 16,
          │         pendientes: 4,
          │         ventaTotal: 495.50€,
          │         ticketMedio: 30.97€
          │       }
          │
          └─▶ GERENTE: Dashboard actualizado en tiempo real ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTADO FINAL:
  ✅ Pedido creado: #0042
  ✅ Stock actualizado: Burger Típica (50 → 49)
  ✅ Reserva confirmada: RES-001
  ✅ Carrito vaciado
  ✅ Trabajador notificado
  ✅ Gerente informado
  ✅ Todos los tabs sincronizados
  ✅ Tiempo total: < 1 segundo
```

---

## ⏰ FLUJO DE LIMPIEZA AUTOMÁTICA DE RESERVAS

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ESCENARIO: Cliente abandona carrito sin completar compra               │
└─────────────────────────────────────────────────────────────────────────┘

T=0min    Cliente agrega producto al carrito
          ├─▶ Reserva RES-002 creada
          ├─▶ expiraEn: T+15min
          └─▶ Stock reservado: +2 unidades

T=1min    Limpieza automática ejecuta
          ├─▶ stockReservationService.limpiarReservasExpiradas()
          ├─▶ ahora < expiraEn ✅ (faltanespecíficamente 14 min)
          └─▶ Reserva mantiene estado 'activa'

T=5min    Cliente navega por la app
          └─▶ Reserva aún válida (faltan 10 min)

T=10min   Cliente se distrae
          └─▶ Reserva aún válida (faltan 5 min)

T=15min   ⏰ Reserva expira - Limpieza automática ejecuta
          │
          ├─▶ limpiarReservasExpiradas()
          │   │
          │   ├─▶ FOR EACH reserva in reservas
          │   │   │
          │   │   ├─▶ RES-002: estado === 'activa' ✅
          │   │   ├─▶ RES-002: ahora >= expiraEn ✅
          │   │   │
          │   │   ├─▶ reserva.estado = 'expirada'
          │   │   ├─▶ reservas.delete('RES-002')
          │   │   ├─▶ guardarReservasEnStorage()
          │   │   │
          │   │   ├─▶ BroadcastChannel.postMessage({
          │   │   │     type: 'RESERVA_EXPIRADA',
          │   │   │     reservaId: 'RES-002'
          │   │   │   })
          │   │   │
          │   │   └─▶ console.info('⏰ Reserva expirada: RES-002')
          │   │
          │   └─▶ notificarListeners()
          │
          └─▶ Stock liberado: -2 unidades reservadas ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OTROS TABS ACTUALIZAN:
  ├─▶ Tab 1: Stock disponible: 47 → 49 ✅
  ├─▶ Tab 2: Stock disponible: 47 → 49 ✅
  └─▶ Tab 3: Stock disponible: 47 → 49 ✅

RESULTADO:
  ✅ Reserva expirada automáticamente
  ✅ Stock liberado para otros clientes
  ✅ Sin intervención manual
  ✅ Todos los tabs sincronizados
```

---

## 🔀 FLUJO: Múltiples Clientes Comprando Simultáneamente

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PRODUCTO: Pizza Margarita                                              │
│ STOCK INICIAL: 10 unidades                                             │
└─────────────────────────────────────────────────────────────────────────┘

T=0s      CLIENTE A (Tab 1): Agrega 3 unidades
          │
          ├─▶ verificarDisponibilidad('pizza-001', 3, 'SESSION-A')
          │   │
          │   ├─▶ stockReal: 10
          │   ├─▶ stockReservado: 0
          │   ├─▶ stockDisponible: 10
          │   └─▶ disponible: true ✅
          │
          ├─▶ crearReserva('pizza-001', 3, 'CLI-A', 'SESSION-A')
          │   │
          │   └─▶ RES-A creada: 3 unidades
          │
          └─▶ BroadcastChannel notifica a todos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTADO: Stock real = 10, Reservado = 3, Disponible = 7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T=10s     CLIENTE B (Tab 2): Escucha broadcast + Agrega 5 unidades
          │
          ├─▶ stockReservationChannel.onmessage()
          │   └─▶ Recibe: RES-A (3 unidades)
          │
          ├─▶ verificarDisponibilidad('pizza-001', 5, 'SESSION-B')
          │   │
          │   ├─▶ stockReal: 10
          │   ├─▶ stockReservado: 3 (RES-A)
          │   ├─▶ stockDisponible: 7
          │   └─▶ disponible: true ✅
          │
          ├─▶ crearReserva('pizza-001', 5, 'CLI-B', 'SESSION-B')
          │   │
          │   └─▶ RES-B creada: 5 unidades
          │
          └─▶ BroadcastChannel notifica a todos

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ESTADO: Stock real = 10, Reservado = 8 (RES-A + RES-B), Disponible = 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T=20s     CLIENTE C (Tab 3): Escucha broadcasts + Agrega 3 unidades
          │
          ├─▶ stockReservationChannel.onmessage()
          │   ├─▶ Recibe: RES-A (3 unidades)
          │   └─▶ Recibe: RES-B (5 unidades)
          │
          ├─▶ verificarDisponibilidad('pizza-001', 3, 'SESSION-C')
          │   │
          │   ├─▶ stockReal: 10
          │   ├─▶ stockReservado: 8 (RES-A + RES-B)
          │   ├─▶ stockDisponible: 2
          │   └─▶ disponible: false ❌
          │
          └─▶ toast.error('Stock insuficiente', {
                description: 'Solo hay 2 unidades disponibles'
              })

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULTADO:
  ✅ Cliente A: 3 unidades reservadas
  ✅ Cliente B: 5 unidades reservadas
  ❌ Cliente C: Bloqueado - Solo 2 disponibles
  ✅ Overselling prevenido!
  ✅ Sistema mantiene integridad de inventario

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T=5min    CLIENTE A confirma pedido
          │
          ├─▶ confirmarReserva('RES-A', 'PED-001')
          ├─▶ decrementarStock('pizza-001', 3)
          │   └─▶ Stock: 10 → 7
          │
          └─▶ BroadcastChannel notifica stock actualizado

ESTADO: Stock real = 7, Reservado = 5 (RES-B), Disponible = 2

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

T=8min    CLIENTE C intenta de nuevo: Agrega 2 unidades
          │
          ├─▶ verificarDisponibilidad('pizza-001', 2, 'SESSION-C')
          │   │
          │   ├─▶ stockReal: 7
          │   ├─▶ stockReservado: 5 (RES-B)
          │   ├─▶ stockDisponible: 2
          │   └─▶ disponible: true ✅
          │
          └─▶ crearReserva('pizza-001', 2, 'CLI-C', 'SESSION-C')
              │
              └─▶ RES-C creada: 2 unidades

ESTADO: Stock real = 7, Reservado = 7 (RES-B + RES-C), Disponible = 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RESULTADO FINAL:
  ✅ Stock inicial: 10
  ✅ Cliente A: Compró 3 (confirmado)
  ✅ Cliente B: Reservó 5 (pendiente)
  ✅ Cliente C: Reservó 2 (pendiente)
  ✅ Sin overselling
  ✅ Stock disponible: 0
  ✅ Sistema perfecto ✨
```

---

## 📊 COMPARACIÓN: Sistema Antiguo vs Nuevo

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SISTEMA ANTIGUO (SIN SINCRONIZACIÓN)                                   │
└─────────────────────────────────────────────────────────────────────────┘

Cliente A (Tab 1):
  ├─▶ Ve stock: 10 unidades
  ├─▶ Agrega 8 al carrito
  └─▶ Stock local: 10 (sin actualizar)

Cliente B (Tab 2):
  ├─▶ Ve stock: 10 unidades (desactualizado ❌)
  ├─▶ Agrega 7 al carrito
  └─▶ Stock local: 10 (sin actualizar)

Cliente A completa compra:
  └─▶ Stock: 10 → 2

Cliente B completa compra:
  └─▶ Stock: 2 → -5 ❌❌❌ OVERSELLING!

PROBLEMAS:
  ❌ Overselling
  ❌ Stock negativo
  ❌ Pedidos sin stock
  ❌ Clientes insatisfechos
  ❌ Pérdida de dinero

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────────────────────┐
│ SISTEMA NUEVO (CON SINCRONIZACIÓN FASE 1 + FASE 2)                     │
└─────────────────────────────────────────────────────────────────────────┘

Cliente A (Tab 1):
  ├─▶ Ve stock: 10 unidades
  ├─▶ Agrega 8 al carrito
  │   ├─▶ verificarDisponibilidad() ✅
  │   └─▶ crearReserva(8)
  ├─▶ BroadcastChannel notifica
  └─▶ Stock: 10, Reservado: 8, Disponible: 2

Cliente B (Tab 2):
  ├─▶ Recibe broadcast ✅
  ├─▶ Ve stock disponible: 2 unidades ✅
  ├─▶ Agrega 7 al carrito
  │   ├─▶ verificarDisponibilidad()
  │   └─▶ disponible: false ❌
  └─▶ toast.error('Solo hay 2 unidades disponibles')

Cliente A completa compra:
  ├─▶ confirmarReserva()
  ├─▶ decrementarStock(8)
  ├─▶ Stock: 10 → 2 ✅
  └─▶ BroadcastChannel notifica

Cliente B ajusta cantidad:
  ├─▶ Reduce a 2 unidades
  ├─▶ verificarDisponibilidad() ✅
  └─▶ crearReserva(2)

Cliente B completa compra:
  ├─▶ confirmarReserva()
  ├─▶ decrementarStock(2)
  └─▶ Stock: 2 → 0 ✅

BENEFICIOS:
  ✅ Sin overselling
  ✅ Stock siempre correcto
  ✅ Validación en tiempo real
  ✅ Clientes satisfechos
  ✅ Sistema confiable
```

---

**Diagrama creado:** Diciembre 2025  
**Sistema:** Udar Edge v2.2.0  
**Documentación completa:**  
- /IMPLEMENTACION_FASE2_COMPLETADA.md  
- /RESUMEN_IMPLEMENTACION_FASE1.md  
- /DIAGRAMA_FLUJO_PEDIDOS_TIEMPO_REAL.md
