# 🧪 GUÍA DE TESTING - FASE 2

**Sistema:** Udar Edge - Validación de Stock y Reservas  
**Fecha:** Diciembre 2025  
**Versión:** 2.2.0

---

## 📋 COMPONENTES CREADOS PARA TESTING

### 1. **StockMonitor.tsx** 📊
Monitor visual de stock en tiempo real

**Ubicación:** `/components/StockMonitor.tsx`

**Características:**
- ✅ Visualización de stock real vs reservado vs disponible
- ✅ Lista de reservas activas
- ✅ Productos más reservados
- ✅ Estadísticas en tiempo real
- ✅ Actualización automática multi-tab

**Modos de uso:**
```tsx
// Modo completo
<StockMonitor />

// Modo compacto
<StockMonitor compact />

// Para un producto específico
<StockMonitor productoId="prod-001" />
```

---

### 2. **ProductStockBadge.tsx** 🏷️
Badge pequeño de estado de stock

**Ubicación:** `/components/ProductStockBadge.tsx`

**Características:**
- ✅ Indicador visual de disponibilidad
- ✅ Colores según nivel de stock
- ✅ Versión simple o detallada
- ✅ Actualización en tiempo real

**Modos de uso:**
```tsx
// Badge simple (solo número)
<ProductStockBadge productoId="prod-001" />

// Badge con detalles
<ProductStockBadge productoId="prod-001" showDetails />
```

**Leyenda de colores:**
- 🟢 Verde: Stock disponible > 10
- 🟡 Amarillo: Stock disponible 5-10
- 🟠 Naranja: Stock disponible 1-5
- 🔴 Rojo: Sin stock

---

### 3. **ReservationManagerPanel.tsx** 🔧
Panel de administración de reservas

**Ubicación:** `/components/ReservationManagerPanel.tsx`

**Características:**
- ✅ Listado completo de reservas
- ✅ Filtros: todas/activas/confirmadas/expiradas
- ✅ Búsqueda por producto o sesión
- ✅ Liberar reservas manualmente
- ✅ Limpiar reservas expiradas
- ✅ Estadísticas detalladas

**Uso:**
```tsx
<ReservationManagerPanel />
```

---

### 4. **DevStockTest.tsx** 🧪
Página de testing completa

**Ubicación:** `/pages/DevStockTest.tsx`

**Características:**
- ✅ Visualización de StockMonitor
- ✅ Panel de gestión de reservas
- ✅ Simulador de productos
- ✅ Controles de stock (+5, -1, manual)
- ✅ Agregar al carrito con validación
- ✅ Vista del carrito actual

**⚠️ IMPORTANTE:** Esta página es solo para desarrollo. Eliminar antes de producción.

---

## 🧪 PLAN DE TESTING

### TEST 1: Validación Básica de Stock ✅

**Objetivo:** Verificar que no se pueden agregar más productos de los disponibles

**Pasos:**
1. Abrir la app en el perfil Cliente
2. Buscar un producto con stock limitado (ej: 3 unidades)
3. Intentar agregar 5 unidades al carrito
4. **Resultado esperado:**
   - ❌ No se agrega al carrito
   - 🔔 Toast: "Stock insuficiente - Solo hay 3 unidades disponibles"

**Verificación:**
```
✓ Toast de error mostrado
✓ Producto NO agregado al carrito
✓ Stock del producto sin cambios
```

---

### TEST 2: Reservas Multi-Usuario ✅

**Objetivo:** Verificar que las reservas previenen overselling

**Pasos:**
1. Abrir **Tab 1** - Cliente A
2. Abrir **Tab 2** - Cliente B
3. Seleccionar producto con stock: 10 unidades
4. **Tab 1:** Agregar 7 unidades al carrito
5. Esperar 2 segundos
6. **Tab 2:** Intentar agregar 5 unidades al carrito
7. **Resultado esperado:**
   - ✅ Tab 1: Producto agregado (7 unidades)
   - ✅ Tab 2: Stock disponible muestra 3 unidades
   - ❌ Tab 2: Error al agregar 5 (solo 3 disponibles)

**Verificación:**
```
✓ Tab 1: 7 unidades en carrito
✓ Tab 2: Ve stock disponible = 3
✓ Tab 2: No puede agregar 5
✓ Toast: "Solo hay 3 unidades disponibles"
✓ Overselling prevenido ✅
```

---

### TEST 3: Sincronización Multi-Tab ✅

**Objetivo:** Verificar que los cambios de stock se propagan instantáneamente

**Pasos:**
1. Abrir **Tab 1** - Gerente
2. Abrir **Tab 2** - Cliente
3. Abrir **Tab 3** - Trabajador
4. En **Tab 1 (Gerente):** Ir a gestión de productos
5. Actualizar stock de "Burger Típica" a 100 unidades
6. **Resultado esperado:**
   - ✅ Tab 2 (Cliente): Stock actualizado a 100 SIN refresh
   - ✅ Tab 3 (Trabajador): Stock actualizado a 100 SIN refresh
   - ⚡ Tiempo de propagación: < 50ms

**Verificación:**
```
✓ Tab 1: Stock = 100
✓ Tab 2: Stock = 100 (sin refresh)
✓ Tab 3: Stock = 100 (sin refresh)
✓ Sincronización instantánea ✅
```

---

### TEST 4: Limpieza Automática de Reservas ✅

**Objetivo:** Verificar que las reservas se liberan automáticamente tras 15 minutos

**Pasos:**
1. Agregar producto al carrito (esto crea una reserva)
2. Esperar 15+ minutos SIN completar la compra
3. **Resultado esperado:**
   - ✅ Reserva cambia a estado 'expirada'
   - ✅ Stock disponible se incrementa automáticamente
   - ✅ Otros usuarios pueden agregar ese stock

**Verificación (acelerada con código):**
```typescript
// En consola del navegador:
const reservas = stockReservationService.obtenerTodasLasReservas();
console.log('Reservas antes:', reservas.length);

// Forzar limpieza
stockReservationService.limpiarReservasExpiradas();

const reservasDespues = stockReservationService.obtenerTodasLasReservas();
console.log('Reservas después:', reservasDespues.length);
```

**Resultado:**
```
✓ Reservas expiradas eliminadas
✓ Stock liberado automáticamente
✓ Sin intervención manual necesaria ✅
```

---

### TEST 5: Producto Inactivo ✅

**Objetivo:** Verificar que no se pueden agregar productos inactivos

**Pasos:**
1. Como Gerente: Desactivar un producto (activo = false)
2. Como Cliente: Intentar agregar ese producto al carrito
3. **Resultado esperado:**
   - ❌ No se agrega al carrito
   - 🔔 Toast: "Este producto no está disponible actualmente"

**Verificación:**
```
✓ Toast de error mostrado
✓ Producto NO agregado al carrito
✓ Validación de producto.activo funcionando ✅
```

---

### TEST 6: Flujo Completo de Compra ✅

**Objetivo:** Verificar el ciclo completo: agregar → reservar → confirmar → stock actualizado

**Pasos:**
1. **Stock inicial:** Burger Típica = 50 unidades
2. **Cliente:** Agregar 3 unidades al carrito
3. **Verificar:** Reserva creada, stock disponible = 47
4. **Cliente:** Confirmar pedido
5. **Verificar:** 
   - Reserva confirmada
   - Stock real = 47
   - Carrito vaciado
   - Pedido creado

**Verificación:**
```
✓ Reserva creada: 3 unidades
✓ Stock disponible: 50 → 47
✓ Pedido confirmado
✓ Reserva estado: 'confirmada'
✓ Stock real: 50 → 47
✓ Carrito vacío
✓ Ciclo completo OK ✅
```

---

## 🎮 USO DE LA PÁGINA DE TESTING

### Acceso

**Ruta:** `/dev-stock-test`

**⚠️ Solo desarrollo:** Eliminar antes de producción

---

### Sección 1: Monitor de Stock

**Funcionalidades:**
- Ver stock real, reservado y disponible de todos los productos
- Lista de reservas activas con tiempo restante
- Top 3 productos más reservados
- Estadísticas globales

**Instrucciones:**
1. Abrir múltiples tabs de la página
2. En un tab: actualizar stock de un producto
3. Ver sincronización instantánea en todos los tabs

---

### Sección 2: Gestión de Reservas

**Funcionalidades:**
- Listado completo de reservas
- Filtros: todas/activas/confirmadas/expiradas
- Búsqueda por producto o sesión
- Liberar reservas manualmente
- Limpiar expiradas

**Instrucciones:**
1. Agregar productos al carrito en varios tabs
2. Ver reservas creadas en tiempo real
3. Probar filtros y búsqueda
4. Liberar alguna reserva manualmente
5. Verificar que el stock se libera

---

### Sección 3: Simulador de Productos

**Funcionalidades:**
- Grid de productos con badges de stock
- Agregar al carrito con validación
- Controles de stock:
  - **-1**: Simular venta
  - **+5**: Simular recepción
  - **✏️**: Establecer stock manual

**Instrucciones:**
1. Click en "Agregar al Carrito"
   - Ver validación de stock
   - Ver reserva creada
2. Click en "-1"
   - Stock decrementa
   - Cambio se propaga a todos los tabs
3. Click en "+5"
   - Stock incrementa
   - Cambio se propaga a todos los tabs
4. Click en "✏️"
   - Ingresar nuevo stock
   - Cambio se propaga a todos los tabs

---

## 📊 ESCENARIOS DE TESTING AVANZADOS

### Escenario 1: Múltiples Clientes Comprando el Mismo Producto

**Setup:**
- Producto: Pizza Margarita
- Stock inicial: 10 unidades
- 3 clientes simultáneos

**Ejecución:**
```
T=0s   Cliente A: Agrega 3 → Reserva creada
T=5s   Cliente B: Agrega 5 → Reserva creada  
T=10s  Cliente C: Intenta 3 → ERROR (solo 2 disponibles)
T=15s  Cliente A: Confirma pedido → Stock: 10 → 7
T=20s  Cliente C: Agrega 2 → OK
```

**Resultado Esperado:**
```
✓ Cliente A: 3 unidades (confirmado)
✓ Cliente B: 5 unidades (reservado)
✓ Cliente C: 2 unidades (reservado)
✓ Stock real: 7
✓ Stock disponible: 0
✓ Sin overselling ✅
```

---

### Escenario 2: Carrito Abandonado

**Setup:**
- Cliente agrega productos
- Abandona sin completar compra
- Esperar 15+ minutos

**Ejecución:**
```
T=0min   Cliente: Agrega 5 unidades al carrito
         → Reserva creada
         → Stock disponible: -5

T=15min  Limpieza automática ejecuta
         → Reserva expirada
         → Stock disponible: +5

T=16min  Otro cliente puede comprar esas 5 unidades
```

**Resultado Esperado:**
```
✓ Reserva se crea correctamente
✓ Stock se reserva
✓ Tras 15 min: Reserva expira
✓ Stock se libera automáticamente
✓ Disponible para otros clientes ✅
```

---

### Escenario 3: Actualización Masiva de Stock

**Setup:**
- Gerente actualiza stock de 10 productos
- 5 clientes navegando simultáneamente

**Ejecución:**
```
Gerente: Actualiza stock de 10 productos
         ↓
BroadcastChannel propaga cambios
         ↓
5 clientes ven actualizaciones instantáneas
```

**Resultado Esperado:**
```
✓ Todos los cambios se propagan
✓ Tiempo: < 100ms por cambio
✓ Sin pérdida de datos
✓ Sin necesidad de refresh ✅
```

---

## 🔍 DEBUGGING Y MONITOREO

### Consola del Navegador

**Ver reservas activas:**
```javascript
stockReservationService.obtenerTodasLasReservas()
```

**Ver estadísticas:**
```javascript
stockReservationService.obtenerEstadisticas()
```

**Ver stock reservado de un producto:**
```javascript
stockReservationService.obtenerStockReservado('prod-001')
```

**Limpiar reservas expiradas manualmente:**
```javascript
stockReservationService.limpiarReservasExpiradas()
```

**Ver productos:**
```javascript
// Desde componente que usa useProductos
const { productos, verificarDisponibilidad } = useProductos();
console.log(productos);
console.log(verificarDisponibilidad('prod-001', 5));
```

---

### Logs del Sistema

El sistema genera logs automáticos:

**Creación de reserva:**
```
✅ Reserva creada: RES-xxx - 3 unidades de burger-001
```

**Stock actualizado:**
```
✅ Stock actualizado: burger-001 → 47 unidades
```

**Reserva expirada:**
```
⏰ Reserva expirada: RES-xxx
🧹 1 reservas expiradas eliminadas
```

**Reserva liberada:**
```
✅ Reserva liberada: RES-xxx
✅ 2 reservas liberadas al vaciar carrito
```

---

## ✅ CHECKLIST DE TESTING

### Tests Básicos
- [ ] Validación de stock al agregar producto
- [ ] Mensaje de error con stock insuficiente
- [ ] Producto inactivo no se puede agregar
- [ ] Badge de stock muestra información correcta

### Tests de Reservas
- [ ] Reserva se crea al agregar al carrito
- [ ] Stock disponible considera reservas de otros
- [ ] Múltiples usuarios no pueden sobrepasar stock
- [ ] Reserva expira tras 15 minutos
- [ ] Limpieza automática funciona

### Tests de Sincronización
- [ ] Cambios de stock se propagan entre tabs
- [ ] Cambios de reservas se propagan entre tabs
- [ ] Tiempo de propagación < 100ms
- [ ] Sin pérdida de datos

### Tests de Integración
- [ ] Flujo completo: agregar → reservar → confirmar
- [ ] Stock se decrementa al confirmar pedido
- [ ] Carrito se vacía al confirmar
- [ ] Reservas se limpian correctamente

### Tests de UI
- [ ] StockMonitor muestra información correcta
- [ ] ProductStockBadge actualiza en tiempo real
- [ ] ReservationManagerPanel lista todas las reservas
- [ ] Filtros y búsqueda funcionan

---

## 🚀 TESTING EN PRODUCCIÓN

### Preparación

**1. Eliminar página de testing:**
```bash
rm /pages/DevStockTest.tsx
```

**2. Eliminar imports de testing en rutas**

**3. Mantener componentes útiles:**
- ✅ StockMonitor (para dashboard Gerente)
- ✅ ProductStockBadge (para TPV)
- ⚠️ ReservationManagerPanel (opcional para Gerente)

---

### Monitoreo

**Métricas a vigilar:**
- Número de reservas activas
- Tiempo promedio de reservas
- Productos con más reservas
- Tasa de expiración de reservas
- Errores de stock insuficiente

**Herramientas:**
```typescript
// En dashboard de Gerente
const stats = stockReservationService.obtenerEstadisticas();
console.log('Reservas activas:', stats.reservasActivas);
console.log('Productos populares:', stats.productosMasReservados);
```

---

## 📚 RECURSOS ADICIONALES

**Documentación:**
- `/IMPLEMENTACION_FASE2_COMPLETADA.md` - Documentación completa
- `/DIAGRAMA_SISTEMA_COMPLETO_FASE1_FASE2.md` - Diagramas visuales
- `/RESUMEN_FASE2.md` - Resumen ejecutivo

**Código:**
- `/services/stock-reservation.service.ts` - Servicio de reservas
- `/contexts/ProductosContext.tsx` - Context con validaciones
- `/contexts/CartContext.tsx` - Context con integración

---

## 🎯 CONCLUSIÓN

El sistema de validación de stock y reservas está completamente funcional y listo para testing exhaustivo. Los componentes creados facilitan la verificación de todas las funcionalidades.

**Próximos pasos:**
1. ✅ Ejecutar todos los tests del checklist
2. ✅ Verificar sincronización multi-tab
3. ✅ Probar escenarios de carga
4. ✅ Documentar bugs encontrados (si los hay)
5. ✅ Ajustar configuración si es necesario
6. ✅ Desplegar a producción

---

**Fecha:** Diciembre 2025  
**Versión:** 2.2.0  
**Estado:** ✅ Listo para testing completo
