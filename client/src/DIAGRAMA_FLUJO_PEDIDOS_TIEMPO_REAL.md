# 🔄 DIAGRAMA DE FLUJO - Sistema de Pedidos en Tiempo Real

## 📊 ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Cliente   │    │ Trabajador  │    │   Gerente   │            │
│  │  Dashboard  │    │  Dashboard  │    │  Dashboard  │            │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘            │
│         │                  │                   │                    │
└─────────┼──────────────────┼───────────────────┼────────────────────┘
          │                  │                   │
          │    ┌────────────┴────────────┐       │
          │    │   HOOKS PERSONALIZADOS  │       │
          │    │  useNotificacionesPedidos│      │
          └────┼─────────────┬───────────┼───────┘
               │             │           │
┌──────────────┼─────────────┼───────────┼────────────────────────────┐
│              │   CAPA DE CONTEXTOS     │                            │
│              │             │           │                            │
│         ┌────▼────┐   ┌────▼────┐   ┌─▼──────┐                    │
│         │  Cart   │   │ Pedidos │   │ Stock  │                    │
│         │ Context │   │ Context │   │Context │                    │
│         └────┬────┘   └────┬────┘   └────┬───┘                    │
│              │             │             │                         │
│              └─────────────┼─────────────┘                         │
│                            │                                        │
│              ┌─────────────▼─────────────┐                         │
│              │  BroadcastChannel API     │                         │
│              │  'udar-pedidos-sync'      │                         │
│              └─────────────┬─────────────┘                         │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────────┐
│                CAPA DE PERSISTENCIA                                 │
│                            │                                        │
│              ┌─────────────▼─────────────┐                         │
│              │      localStorage         │                         │
│              │  'udar-pedidos'           │                         │
│              └───────────────────────────┘                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO: Cliente Crea Pedido

### Paso a Paso con Timestamps

```
T=0ms    CLIENTE: Click en "Confirmar Pedido"
         │
         ├─▶ CartContext obtiene items del carrito
         │
         ├─▶ Validaciones previas:
         │   ├─ ¿Carrito tiene items? ✅
         │   ├─ ¿Dirección válida? ✅
         │   └─ ¿Método pago válido? ✅
         │
T=5ms    ├─▶ PedidosContext.crearPedido()
         │   │
         │   ├─ 1. Calcular totales
         │   │   ├─ Subtotal: items.reduce()
         │   │   ├─ Descuento: cupón aplicado
         │   │   ├─ IVA: 21%
         │   │   └─ Total: subtotal - descuento + IVA
         │   │
         │   ├─ 2. Generar número secuencial
         │   │   └─ obtenerSiguienteNumero() → #0042
         │   │
         │   ├─ 3. Crear objeto Pedido
         │   │   {
         │   │     id: 'PED-1701890123456-abc123',
         │   │     numero: 42,
         │   │     clienteId: 'CLI-001',
         │   │     clienteNombre: 'Juan Pérez',
         │   │     items: [...],
         │   │     estado: 'pendiente',
         │   │     total: 45.50,
         │   │     ...
         │   │   }
         │   │
T=10ms   │   ├─ 4. Guardar en estado local
         │   │   setPedidos(prev => [nuevoPedido, ...prev])
         │   │
T=12ms   │   ├─ 5. Persistir en localStorage
         │   │   localStorage.setItem('udar-pedidos', JSON.stringify(pedidos))
         │   │
T=15ms   │   ├─ 6. ✨ BROADCAST a otros tabs
         │   │   pedidosChannel.postMessage({
         │   │     type: 'PEDIDO_CREADO',
         │   │     pedido: nuevoPedido
         │   │   })
         │   │
T=17ms   │   ├─ 7. Notificar suscriptores locales
         │   │   notificarSuscriptores(nuevoPedido, 'creado')
         │   │
T=20ms   │   └─ 8. Toast de confirmación
         │       toast.success('Pedido creado correctamente')
         │
T=25ms   └─▶ CLIENTE: Recibe confirmación
              ├─ Carrito se limpia
              ├─ Navega a /mis-pedidos
              └─ Ve pedido #0042 en la lista

─────────────────────────────────────────────────────────────────────

T=15ms   TRABAJADOR (otro tab): Recibe broadcast
         │
         ├─▶ pedidosChannel.onmessage(event)
         │   │
         │   ├─ event.data.type === 'PEDIDO_CREADO' ✅
         │   │
T=16ms   │   ├─ setPedidos(prev => [event.data.pedido, ...prev])
         │   │
T=18ms   │   └─ notificarSuscriptores(event.data.pedido, 'creado')
         │
T=20ms   ├─▶ useNotificacionesPedidos detecta cambio
         │   │
         │   ├─ Rol === 'trabajador' ✅
         │   │
T=22ms   │   ├─ toast.success('🔔 Nuevo pedido recibido', {
         │   │   description: 'Pedido #0042 - Juan Pérez',
         │   │   action: { label: 'Ver', onClick: navigate }
         │   │ })
         │   │
T=25ms   │   └─ 🔊 audioRef.current.play()
         │
T=30ms   └─▶ TRABAJADOR: Ve notificación + escucha sonido
              ├─ Lista de pedidos se actualiza automáticamente
              ├─ Pedido #0042 aparece en primer lugar
              └─ Puede hacer click en "Ver" para abrir detalle

─────────────────────────────────────────────────────────────────────

T=15ms   GERENTE (otro tab): Recibe broadcast
         │
         ├─▶ pedidosChannel.onmessage(event)
         │   │
T=16ms   │   ├─ setPedidos(prev => [event.data.pedido, ...prev])
         │   │
T=18ms   │   └─ notificarSuscriptores(event.data.pedido, 'creado')
         │
T=20ms   ├─▶ Dashboard recalcula estadísticas automáticamente
         │   │
         │   ├─ Total pedidos: 15 → 16
         │   ├─ Pendientes: 3 → 4
         │   ├─ Venta total: 450.00€ → 495.50€
         │   └─ Ticket medio: 30.00€ → 30.97€
         │
T=25ms   └─▶ GERENTE: Ve actualización en tiempo real
              ├─ KPIs se actualizan sin refresh
              ├─ Gráficas se redibujan
              └─ Lista de pedidos muestra #0042
```

---

## 🔄 FLUJO: Trabajador Actualiza Estado del Pedido

```
T=0ms    TRABAJADOR: Click en "Marcar como Listo"
         │
         ├─▶ PedidosContext.actualizarEstado(pedidoId, 'listo', userId, userName)
         │   │
         │   ├─ 1. Buscar pedido actual
         │   │   const pedidoActual = pedidos.find(p => p.id === pedidoId)
         │   │
         │   ├─ 2. Crear pedido actualizado
         │   │   {
         │   │     ...pedidoActual,
         │   │     estado: 'listo',
         │   │     fechaActualizacion: new Date().toISOString(),
         │   │     actualizadoPor: {
         │   │       userId: 'EMP-005',
         │   │       userName: 'María García',
         │   │       timestamp: '2025-12-03T10:30:45.123Z'
         │   │     },
         │   │     historialEstados: [
         │   │       ...historialAnterior,
         │   │       {
         │   │         estado: 'listo',
         │   │         timestamp: '2025-12-03T10:30:45.123Z',
         │   │         userId: 'EMP-005',
         │   │         userName: 'María García'
         │   │       }
         │   │     ]
         │   │   }
         │   │
T=5ms    │   ├─ 3. Actualizar estado local
         │   │   setPedidos(prev => prev.map(p => 
         │   │     p.id === pedidoId ? pedidoActualizado : p
         │   │   ))
         │   │
T=8ms    │   ├─ 4. ✨ BROADCAST
         │   │   pedidosChannel.postMessage({
         │   │     type: 'PEDIDO_ACTUALIZADO',
         │   │     pedido: pedidoActualizado
         │   │   })
         │   │
T=10ms   │   ├─ 5. Notificar suscriptores
         │   │   notificarSuscriptores(pedidoActualizado, 'actualizado')
         │   │
T=12ms   │   └─ 6. Toast
         │       toast.success('Pedido #0042 actualizado', {
         │         description: 'Nuevo estado: listo'
         │       })
         │
T=15ms   └─▶ TRABAJADOR: Ve confirmación
              └─ Pedido cambia de color/sección en la UI

─────────────────────────────────────────────────────────────────────

T=8ms    CLIENTE (otro tab): Recibe broadcast
         │
         ├─▶ pedidosChannel.onmessage(event)
         │   │
         │   ├─ event.data.type === 'PEDIDO_ACTUALIZADO' ✅
         │   │
T=9ms    │   ├─ setPedidos(prev => prev.map(...))
         │   │
T=11ms   │   └─ notificarSuscriptores(event.data.pedido, 'actualizado')
         │
T=13ms   ├─▶ useNotificacionesPedidos detecta cambio
         │   │
         │   ├─ Rol === 'cliente' ✅
         │   ├─ pedido.clienteId === currentUserId ✅
         │   ├─ estado === 'listo' ✅
         │   │
T=15ms   │   ├─ toast.info('🎉 ¡Pedido listo!', {
         │   │   description: 'Pedido #0042 - Tu pedido está listo para recoger'
         │   │ })
         │   │
T=18ms   │   └─ 🔊 audioRef.current.play()
         │
T=20ms   └─▶ CLIENTE: Recibe notificación
              ├─ Toast: "🎉 ¡Pedido listo!"
              ├─ Sonido de notificación
              └─ Estado del pedido actualizado en "Mis Pedidos"

─────────────────────────────────────────────────────────────────────

T=8ms    GERENTE (otro tab): Recibe broadcast
         │
T=9ms    ├─▶ setPedidos actualizado
         │
T=11ms   ├─▶ KPIs recalculados
         │   ├─ En preparación: 5 → 4
         │   └─ Listos: 2 → 3
         │
T=15ms   └─▶ GERENTE: Dashboard actualizado en tiempo real
```

---

## 📱 NOTIFICACIONES POR ROL - Matriz Completa

| Evento | Cliente | Trabajador | Gerente |
|--------|---------|------------|---------|
| **Pedido creado** | ✅ "Pedido realizado correctamente" | 🔔 "Nuevo pedido recibido" + 🔊 | ℹ️ Actualización silenciosa |
| **Confirmado** | ✅ "Pedido confirmado" | - | - |
| **Preparando** | 👨‍🍳 "Preparando tu pedido" | - | - |
| **Listo** | 🎉 "¡Pedido listo!" + 🔊 | - | - |
| **Enviado** | 🚗 "En camino" + 🔊 | - | - |
| **Entregado** | ✅ "Pedido entregado" | - | - |
| **Cancelado** | ❌ "Pedido cancelado" | ⚠️ "Pedido cancelado" | ⚠️ "Pedido cancelado" |

**Leyenda:**
- ✅ = Toast éxito
- 🔔 = Toast con acción
- 🔊 = Sonido de notificación
- ℹ️ = Sin notificación visual (solo actualización de datos)
- - = Sin notificación

---

## 🔐 PROTECCIÓN DE RUTAS - Flujo de Validación

```
Usuario intenta acceder a /gerente/configuracion
                │
                ▼
    ┌───────────────────────────┐
    │   withRoleGuard HOC       │
    │   allowedRoles: ['gerente']│
    └───────────┬───────────────┘
                │
                ▼
    ┌───────────────────────────┐
    │ ¿Hay usuario logueado?    │
    └───────┬───────────────────┘
            │
      ┌─────┴─────┐
      │           │
     NO          SÍ
      │           │
      ▼           ▼
  ┌────────┐  ┌──────────────────────┐
  │ Mostrar│  │ ¿Rol permitido?       │
  │ "Acceso│  │ user.role in          │
  │ Restrin│  │ allowedRoles?         │
  │ gido"  │  └──────┬───────────────┘
  │        │         │
  │ + Botón│   ┌─────┴─────┐
  │ "Login"│   │           │
  └────────┘  NO          SÍ
              │           │
              ▼           ▼
          ┌────────┐  ┌──────────────┐
          │ Mostrar│  │ Renderizar   │
          │ "Acceso│  │ Componente   │
          │ Denegad│  │ Protegido ✅ │
          │ o"     │  └──────────────┘
          │        │
          │ Muestra│
          │ rol    │
          │ actual │
          │ vs     │
          │ requerid│
          │        │
          │ + Botones│
          │ "Volver"│
          │ "Cambiar│
          │ usuario"│
          └────────┘
```

---

## 🔄 SINCRONIZACIÓN MULTI-TAB - Ejemplo Visual

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TIMELINE                                  │
└─────────────────────────────────────────────────────────────────────┘

T=0s
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Tab 1       │  │  Tab 2       │  │  Tab 3       │
│  Cliente     │  │  Trabajador  │  │  Gerente     │
│              │  │              │  │              │
│ 📦 Carrito:  │  │ 📋 Pedidos   │  │ 📊 Dashboard │
│ 3 items      │  │ Pendientes:2 │  │ Total: 15    │
└──────────────┘  └──────────────┘  └──────────────┘

T=1s
┌──────────────┐
│  Tab 1       │
│ [ACCIÓN] ────┼──▶ Click "Confirmar Pedido"
└──────────────┘

T=2s
┌──────────────┐
│  Tab 1       │
│ crearPedido()│
│ 💾 localStorage
│ 📡 Broadcast ─┼──▶ ✉️ PEDIDO_CREADO
└──────────────┘

T=2.5s
                   ┌──────────────┐  ┌──────────────┐
                   │  Tab 2       │  │  Tab 3       │
    ✉️ ────────────▶│ 📨 Recibe    │  │ 📨 Recibe    │
                   │ mensaje      │  │ mensaje      │
                   └──────────────┘  └──────────────┘

T=3s
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Tab 1       │  │  Tab 2       │  │  Tab 3       │
│              │  │              │  │              │
│ ✅ Confirmado│  │ 🔔 "Nuevo    │  │ 📈 Stats     │
│              │  │    pedido"   │  │    actualizadas│
│ 🧹 Carrito   │  │              │  │              │
│    limpio    │  │ 🔊 Sonido    │  │ Total: 16 ✨ │
│              │  │              │  │              │
│ 📋 Pedidos   │  │ 📋 Pedidos   │  │ 📋 Lista     │
│ Pendientes:1 │  │ Pendientes:3 │  │ actualizada  │
│ #0042 ✨     │  │ #0042 ✨     │  │ #0042 ✨     │
└──────────────┘  └──────────────┘  └──────────────┘

TODOS LOS TABS SINCRONIZADOS ✅
```

---

## 📈 PERFORMANCE - Optimizaciones Implementadas

### 1. BroadcastChannel (Nativo del Navegador)
```
✅ Sin polling
✅ Sin timers
✅ Sin HTTP requests
✅ Comunicación instantánea
✅ Bajo consumo de memoria
```

### 2. Persistencia Inteligente
```typescript
// Solo guardar cuando cambia el estado
useEffect(() => {
  if (!loading) {
    localStorage.setItem('udar-pedidos', JSON.stringify(pedidos));
  }
}, [pedidos, loading]); // ✅ Dependencias específicas
```

### 3. Notificaciones Inteligentes
```typescript
// Evitar spam de notificaciones
const mutedEstados = ['preparando']; // No notificar este estado

// Diferentes notificaciones según rol
if (rol === 'trabajador' && tipo === 'creado') {
  // Solo notificar nuevos pedidos al staff
  toast.success(...);
}
```

### 4. Cálculos Memoizados
```typescript
const estadisticas = useMemo(() => {
  return obtenerEstadisticas(filtros);
}, [pedidos, filtros]); // ✅ Solo recalcular cuando cambian pedidos o filtros
```

---

## 🎯 CASOS DE USO AVANZADOS

### Caso 1: Cliente ve su pedido actualizarse en tiempo real

```
Cliente está en /mis-pedidos viendo su pedido #0042
         │
         │ (en otro tab)
         │ Trabajador marca pedido como "listo"
         │
         ▼
BroadcastChannel notifica
         │
         ▼
useNotificacionesPedidos detecta cambio
         │
         ├─▶ Verifica: ¿Es pedido del cliente actual? ✅
         ├─▶ Verifica: ¿Estado importante? (listo) ✅
         │
         ▼
Toast: "🎉 ¡Pedido listo!"
Audio: notification.mp3
         │
         ▼
Cliente ve:
- Badge del pedido cambia de "Preparando" a "Listo"
- Color cambia de naranja a verde
- Botón "Recoger" se activa
```

### Caso 2: Gerente monitorea todo en tiempo real

```
Gerente está en Dashboard viendo KPIs
         │
         │ (múltiples clientes/trabajadores activos)
         │
         ├─▶ Cliente 1 crea pedido #0043
         ├─▶ Trabajador marca #0042 como listo
         ├─▶ Cliente 2 crea pedido #0044
         │
         ▼
BroadcastChannel recibe 3 eventos en 10 segundos
         │
         ▼
PedidosContext actualiza estado
         │
         ▼
Dashboard recalcula automáticamente:
- Total pedidos: 15 → 17 ✨
- Pendientes: 3 → 5 ✨
- En preparación: 5 → 4 ✨
- Listos: 2 → 3 ✨
- Venta total: 450.00€ → 545.50€ ✨
         │
         ▼
Gráficas se redibujan sin intervención
```

### Caso 3: Múltiples trabajadores coordinados

```
Trabajador A (Tab 1) ve pedido #0042
Trabajador B (Tab 2) ve pedido #0042
         │
         │
Trabajador A: Click "Confirmar"
         │
         ├─▶ actualizarEstado('confirmado')
         ├─▶ BroadcastChannel notifica
         │
         ▼
Trabajador B recibe actualización
         │
         ├─▶ Pedido cambia a "confirmado"
         ├─▶ Botón "Confirmar" se deshabilita ✅
         │
         ▼
Evita conflictos: No pueden confirmar el mismo pedido dos veces
```

---

## 🚀 VENTAJAS DEL SISTEMA IMPLEMENTADO

### ✅ Sincronización Instantánea
- Sin necesidad de refrescar página
- Sin polling al servidor
- Sin WebSockets (por ahora)
- Funciona offline (localStorage)

### ✅ Experiencia de Usuario Mejorada
- Notificaciones contextuales
- Sonidos opcionales
- Acciones directas desde notificaciones
- Estado siempre actualizado

### ✅ Escalabilidad
- BroadcastChannel nativo del navegador
- Bajo consumo de recursos
- Preparado para migración a WebSockets
- Compatible con backend futuro

### ✅ Mantenibilidad
- Código centralizado en contextos
- Lógica de negocio separada de UI
- Fácil debugging
- Testing sencillo

---

**Diagrama creado:** Diciembre 2025  
**Sistema:** Udar Edge v2.1.0  
**Documentación completa:** /IMPLEMENTACION_SINCRONIZACION_COMPLETADA.md
