# 🧪 GUÍA DE TESTS FUNCIONALES - UDAR EDGE

**Fecha:** Diciembre 2024  
**Versión:** Post-Optimizaciones v2.0  
**Estado:** ✅ Lista para Testing

---

## 📋 ÍNDICE

1. [Pre-requisitos](#pre-requisitos)
2. [Tests de Carga y Performance](#tests-de-carga-y-performance)
3. [Tests por Dashboard](#tests-por-dashboard)
4. [Tests de Funcionalidades Críticas](#tests-de-funcionalidades-críticas)
5. [Tests de Optimizaciones](#tests-de-optimizaciones)
6. [Checklist Final](#checklist-final)

---

## 🔧 PRE-REQUISITOS

### Entorno de Desarrollo
```bash
# 1. Verificar que el proyecto compile
npm run build

# 2. Ejecutar en modo desarrollo
npm run dev

# 3. Abrir en navegador
http://localhost:5173
```

### Herramientas Necesarias
- ✅ Chrome DevTools (Network, Performance, Lighthouse)
- ✅ Navegador moderno (Chrome, Firefox, Safari, Edge)
- ✅ Dispositivo móvil o emulador para tests móviles
- ✅ React DevTools (extensión de navegador)

### Limpiar Caché Antes de Empezar
```bash
# Limpiar LocalStorage y SessionStorage
localStorage.clear();
sessionStorage.clear();

# O desde DevTools: Application > Storage > Clear site data
```

---

## ⚡ TESTS DE CARGA Y PERFORMANCE

### Test 1: Tiempo de Carga Inicial
**Objetivo:** Verificar que el bundle inicial sea ~800 KB

**Pasos:**
1. Abrir DevTools > Network
2. Recargar la página (Ctrl/Cmd + Shift + R)
3. Verificar que:
   - ✅ Bundle inicial `app.js` sea ≤ 1 MB
   - ✅ Time to Interactive (TTI) sea < 2s
   - ✅ First Contentful Paint (FCP) sea < 1s

**Resultado Esperado:**
```
✅ app.js: ~800 KB
✅ TTI: ~1.2s
✅ FCP: ~0.8s
```

### Test 2: Lazy Loading de Dashboards
**Objetivo:** Verificar que solo se cargue el dashboard del rol actual

**Pasos:**
1. Login como **Cliente**
2. Abrir DevTools > Network
3. Filtrar por "chunk"
4. Verificar que solo se cargue:
   - ✅ `ClienteDashboard.chunk.js`
   - ❌ NO debe cargar TrabajadorDashboard.chunk.js
   - ❌ NO debe cargar GerenteDashboard.chunk.js

**Resultado Esperado:**
```
✅ Solo 1 chunk de dashboard cargado (~600 KB)
✅ Total cargado: ~1.4 MB (core + dashboard)
```

### Test 3: Lazy Loading de Modales
**Objetivo:** Verificar que los modales se carguen bajo demanda

**Pasos:**
1. Login como **Cliente**
2. DevTools > Network > Filtrar "chunk"
3. Click en "Nueva Cita" (botón sidebar)
4. Verificar que se carga:
   - ✅ `NuevaCitaModal.chunk.js`

**Resultado Esperado:**
```
✅ Modal se carga SOLO al abrirlo (no en inicio)
✅ Tiempo de carga del modal: < 500ms
```

### Test 4: Lazy Loading de TPV360Master
**Objetivo:** Verificar carga bajo demanda del TPV

**Pasos:**
1. Login como **Gerente**
2. DevTools > Network > Filtrar "chunk"
3. Click en "TPV 360 - Base" en el menú
4. Verificar que se carga:
   - ✅ `TPV360Master.chunk.js`

**Resultado Esperado:**
```
✅ TPV se carga SOLO al acceder a la sección
✅ Tamaño del chunk: ~700 KB
✅ Loading fallback visible durante carga
```

### Test 5: Lighthouse Performance
**Objetivo:** Score de performance > 80

**Pasos:**
1. DevTools > Lighthouse
2. Seleccionar "Performance" + "Mobile"
3. Click "Analyze page load"

**Resultado Esperado:**
```
✅ Performance: > 80
✅ First Contentful Paint: < 1.5s
✅ Speed Index: < 2.5s
✅ Time to Interactive: < 2.5s
✅ Total Blocking Time: < 300ms
```

---

## 👤 TESTS POR DASHBOARD

### 🔵 CLIENTE DASHBOARD

#### Test C1: Login y Carga Inicial
**Pasos:**
1. Abrir la app
2. Seleccionar rol "Cliente"
3. Hacer login con credenciales de prueba

**Verificar:**
- ✅ SplashScreen aparece primero
- ✅ Login screen funciona correctamente
- ✅ ClienteDashboard se carga con LoadingFallback
- ✅ Dashboard se muestra correctamente
- ✅ Sidebar visible en desktop
- ✅ BottomNav visible en móvil

**Resultado Esperado:**
```
✅ Navegación fluida
✅ Sin errores en consola
✅ LoadingFallback visible ~1s
```

#### Test C2: Navegación entre Secciones
**Pasos:**
1. Click en cada sección del menú:
   - Inicio
   - Elige tu producto
   - Pedidos
   - ¿Quiénes somos?
   - Chat y Soporte
   - Notificaciones
   - Configuración

**Verificar:**
- ✅ Cada sección se carga correctamente
- ✅ Breadcrumbs se actualizan (desktop)
- ✅ BottomNav muestra sección activa
- ✅ Sin errores en consola

#### Test C3: Sistema de Carrito
**Pasos:**
1. Ir a "Elige tu producto"
2. Añadir 3 productos al carrito
3. Click en icono de carrito (top-right)
4. Verificar CestaOverlay

**Verificar:**
- ✅ Badge del carrito se actualiza (+3)
- ✅ CestaOverlay se abre con lazy loading
- ✅ Productos se muestran correctamente
- ✅ Totales calculados correctamente
- ✅ Botón "Proceder al pago" funciona

**Resultado Esperado:**
```
✅ CestaOverlay.chunk.js se carga bajo demanda
✅ Sin errores en consola
✅ Context API funciona (totalItems actualizado)
```

#### Test C4: Sistema de Pedidos
**Pasos:**
1. Completar un pedido desde el carrito
2. Ir a "Pedidos"
3. Ver lista de pedidos

**Verificar:**
- ✅ Modal de confirmación aparece (lazy loaded)
- ✅ Pedido aparece en "Mis Pedidos"
- ✅ Estados del pedido visibles
- ✅ Badge "Pedidos Activos" actualizado

#### Test C5: Modales y Overlays
**Pasos:**
1. Click "Nueva Cita" (sidebar)
2. Click "Ya estoy aquí" (sidebar)
3. Click campana de notificaciones

**Verificar:**
- ✅ NuevaCitaModal se abre (lazy loaded)
- ✅ YaEstoyAquiModal se abre (lazy loaded)
- ✅ NotificationCenter funciona
- ✅ Modales se cierran correctamente
- ✅ LoadingFallback visible durante carga

#### Test C6: Responsive Mobile
**Pasos:**
1. DevTools > Toggle device toolbar (Ctrl/Cmd + Shift + M)
2. Seleccionar iPhone 12 Pro
3. Navegar por todas las secciones

**Verificar:**
- ✅ BottomNav fijo en la parte inferior
- ✅ Drawer móvil funciona (click en menú hamburguesa)
- ✅ Botones touch-friendly (min 44x44px)
- ✅ Textos legibles
- ✅ No hay scroll horizontal

---

### 🟢 TRABAJADOR DASHBOARD

#### Test T1: Login y Carga
**Pasos:**
1. Login como "Trabajador"
2. Verificar carga del dashboard

**Verificar:**
- ✅ TrabajadorDashboard.chunk.js se carga
- ✅ LoadingFallback visible durante carga
- ✅ Dashboard muestra contenido correcto
- ✅ Sin imports duplicados (verificar consola)

#### Test T2: Navegación
**Pasos:**
1. Navegar por todas las secciones:
   - Inicio
   - Mis Tareas
   - Pedidos Activos
   - Formación
   - Mi Rendimiento
   - Chat
   - Fichaje
   - Configuración

**Verificar:**
- ✅ Todas las secciones cargan
- ✅ Sin errores en consola
- ✅ Breadcrumbs actualizados
- ✅ BottomNav funciona

#### Test T3: Sistema de Fichaje
**Pasos:**
1. Ir a "Fichaje"
2. Hacer fichaje de entrada
3. Verificar estado

**Verificar:**
- ✅ FichajeColaborador carga correctamente
- ✅ Botón de fichaje funciona
- ✅ Toast de confirmación aparece
- ✅ Estado actualizado

#### Test T4: Gestión de Pedidos
**Pasos:**
1. Ir a "Pedidos Activos"
2. Ver pedidos pendientes
3. Marcar pedido como "Listo"

**Verificar:**
- ✅ Lista de pedidos visible
- ✅ Filtros funcionan
- ✅ Cambio de estado funciona
- ✅ Toast de confirmación

---

### 🟣 GERENTE DASHBOARD

#### Test G1: Login y Carga
**Pasos:**
1. Login como "Gerente"
2. Verificar carga del dashboard

**Verificar:**
- ✅ GerenteDashboard.chunk.js se carga
- ✅ LoadingFallback visible
- ✅ Dashboard 360 muestra KPIs
- ✅ QuickActions visibles

#### Test G2: TPV 360 Master
**Pasos:**
1. Click en "TPV 360 - Base"
2. Seleccionar Punto de Venta (modal)
3. Verificar carga del TPV

**Verificar:**
- ✅ ModalSeleccionPDV aparece
- ✅ TPV360Master.chunk.js se carga (lazy)
- ✅ LoadingFallback visible durante carga
- ✅ TPV se muestra correctamente
- ✅ Permisos de gerente aplicados

**Resultado Esperado:**
```
✅ TPV360Master solo se carga al acceder
✅ Modal de selección funciona
✅ Sin errores en consola
```

#### Test G3: Apertura de Caja
**Pasos:**
1. Dentro del TPV
2. Click "Abrir Caja"
3. Ingresar monto inicial
4. Confirmar apertura

**Verificar:**
- ✅ ModalAperturaCaja funciona
- ✅ Validación de monto
- ✅ Caja se abre correctamente
- ✅ Toast de confirmación

#### Test G4: Operativa Completa TPV
**Pasos:**
1. Añadir productos al ticket
2. Aplicar descuento
3. Cobrar (efectivo/tarjeta)
4. Imprimir ticket

**Verificar:**
- ✅ Productos se añaden correctamente
- ✅ Cálculos de totales correctos
- ✅ Modal de pago funciona
- ✅ Ticket se genera
- ✅ Caja se actualiza

#### Test G5: Gestión de Personal
**Pasos:**
1. Ir a "Equipo y RRHH"
2. Ver lista de empleados
3. Acceder a detalles de un empleado

**Verificar:**
- ✅ EquipoRRHH carga correctamente
- ✅ Lista de empleados visible
- ✅ Onboarding visible para nuevos
- ✅ Sistema de nóminas accesible

#### Test G6: Dashboard 360 y Reportes
**Pasos:**
1. Ir a "Dashboard 360"
2. Verificar KPIs
3. Ver gráficas de rendimiento

**Verificar:**
- ✅ KPIs se muestran correctamente
- ✅ QuickActions funcionan
- ✅ Gráficas de recharts cargan
- ✅ Datos actualizados

---

## 🎯 TESTS DE FUNCIONALIDADES CRÍTICAS

### Test F1: Sistema Multiempresa
**Pasos:**
1. Login como Gerente
2. Acceder a TPV
3. Cambiar entre marcas (Modomio / Blackburguer)

**Verificar:**
- ✅ Modal de selección de marca funciona
- ✅ Marca activa se muestra en TPV
- ✅ Productos filtrados por marca
- ✅ Toast de confirmación

### Test F2: Sistema de Notificaciones Push
**Pasos:**
1. Login como Cliente
2. Realizar una acción (nuevo pedido)
3. Verificar notificación

**Verificar:**
- ✅ Toast aparece (sonner)
- ✅ Badge de notificaciones incrementa
- ✅ NotificationCenter muestra historial

### Test F3: Gestión de Stock
**Pasos:**
1. Login como Gerente
2. Ir a "Stock y Proveedores"
3. Ver inventario

**Verificar:**
- ✅ StockProvider context funciona
- ✅ Lista de productos visible
- ✅ Niveles de stock correctos
- ✅ Alertas de stock bajo

### Test F4: Sistema EBITDA
**Pasos:**
1. Login como Gerente
2. Ir a "Facturación y Finanzas"
3. Ver cálculos de EBITDA

**Verificar:**
- ✅ Cálculos correctos
- ✅ Integración con nóminas
- ✅ Gráficas visibles
- ✅ Sin errores

### Test F5: Onboarding de Empleados
**Pasos:**
1. Login como Gerente
2. Ir a "Equipo y RRHH"
3. Crear nuevo empleado
4. Verificar onboarding

**Verificar:**
- ✅ 7 fases visibles
- ✅ Progreso trackeable
- ✅ Documentos cargables
- ✅ Estado actualizado

---

## 🚀 TESTS DE OPTIMIZACIONES

### Test O1: Verificar Code Splitting
**Pasos:**
1. DevTools > Network > Clear
2. Login como cada rol
3. Verificar chunks cargados

**Resultado Esperado:**
```
CLIENTE:
✅ app.js (~800 KB)
✅ ClienteDashboard.chunk.js (~600 KB)
❌ NO otros dashboards

TRABAJADOR:
✅ app.js (~800 KB)
✅ TrabajadorDashboard.chunk.js (~650 KB)
❌ NO otros dashboards

GERENTE:
✅ app.js (~800 KB)
✅ GerenteDashboard.chunk.js (~700 KB)
❌ NO otros dashboards
```

### Test O2: Verificar Lazy Loading de Modales
**Pasos:**
1. Login como Cliente
2. Network > Clear
3. Abrir cada modal:
   - Nueva Cita
   - Ya estoy aquí
   - Cesta
   - Confirmación Pedido

**Verificar:**
- ✅ Cada modal carga su chunk SOLO al abrirse
- ✅ LoadingFallback visible ~500ms
- ✅ Sin errores

### Test O3: Verificar Lazy Loading de Imágenes
**Pasos:**
1. Ir a catálogo de productos
2. Scroll lento hacia abajo
3. DevTools > Network > Img

**Verificar:**
- ✅ Imágenes cargan bajo demanda (lazy)
- ✅ `loading="lazy"` en tags img
- ✅ No todas las imágenes cargan al inicio

### Test O4: Cache de Navegación
**Pasos:**
1. Navegar entre secciones varias veces
2. Verificar velocidad de carga

**Resultado Esperado:**
```
✅ Primera carga: ~1-2s
✅ Cargas posteriores: <500ms (cacheado)
✅ Transiciones suaves
```

### Test O5: Performance en Móvil
**Pasos:**
1. DevTools > Lighthouse > Mobile
2. Ejecutar auditoría
3. Revisar métricas

**Resultado Esperado:**
```
✅ Performance: > 80
✅ Accessibility: > 90
✅ Best Practices: > 90
✅ SEO: > 80
```

---

## ✅ CHECKLIST FINAL

### Pre-Optimización vs Post-Optimización

| Métrica | Antes | Después | ✅/❌ |
|---------|-------|---------|------|
| **Bundle Inicial** | 2.5 MB | ~800 KB | ✅ |
| **TTI** | ~4.5s | ~1.2s | ✅ |
| **FCP** | ~2.1s | ~0.8s | ✅ |
| **Chunks Dinámicos** | 1 | 4+ | ✅ |
| **Lazy Loading** | ❌ No | ✅ Sí | ✅ |
| **Modales Optimizados** | ❌ No | ✅ Sí | ✅ |
| **Imágenes Lazy** | ❌ No | ✅ Sí | ✅ |

### Funcionalidades Críticas

| Funcionalidad | Estado | ✅/❌ |
|---------------|--------|------|
| Login 3 Roles | ⏳ Pendiente | ⏳ |
| Navegación Dashboards | ⏳ Pendiente | ⏳ |
| Sistema Carrito | ⏳ Pendiente | ⏳ |
| Sistema Pedidos | ⏳ Pendiente | ⏳ |
| TPV360Master | ⏳ Pendiente | ⏳ |
| Modales Funcionan | ⏳ Pendiente | ⏳ |
| Multiempresa | ⏳ Pendiente | ⏳ |
| Notificaciones | ⏳ Pendiente | ⏳ |
| Stock Integration | ⏳ Pendiente | ⏳ |
| EBITDA | ⏳ Pendiente | ⏳ |
| Onboarding | ⏳ Pendiente | ⏳ |

### Optimizaciones Implementadas

| Optimización | Estado | ✅/❌ |
|--------------|--------|------|
| Lazy Loading Dashboards | ✅ Implementado | ✅ |
| Lazy Loading TPV | ✅ Implementado | ✅ |
| Lazy Loading Modales | ✅ Implementado | ✅ |
| LoadingFallback | ✅ Creado | ✅ |
| Code Splitting | ✅ Activado | ✅ |
| Image Lazy Loading | ✅ Implementado | ✅ |
| Suspense Boundaries | ✅ Configurados | ✅ |

---

## 📊 REPORTE DE TESTS

### Plantilla de Reporte

```markdown
# Test Report - [Fecha]

## Tester: [Nombre]
## Navegador: [Chrome/Firefox/Safari/Edge + Versión]
## Dispositivo: [Desktop/Mobile/Tablet + Modelo]

### Tests Ejecutados
- [ ] Login 3 Roles
- [ ] Navegación Cliente
- [ ] Sistema Carrito
- [ ] Sistema Pedidos
- [ ] TPV360Master
- [ ] Lazy Loading
- [ ] Performance

### Resultados
✅ Passed: X/Y
❌ Failed: X/Y
⏳ Pending: X/Y

### Issues Encontrados
1. [Descripción del issue]
   - Severidad: Alta/Media/Baja
   - Pasos para reproducir
   - Screenshot/Console errors

### Performance Metrics
- Bundle Inicial: X KB
- TTI: X s
- FCP: X s
- Lighthouse Score: X/100

### Conclusión
[Resumen general del estado de la app]
```

---

## 🎯 CRITERIOS DE ACEPTACIÓN

Para considerar los tests **COMPLETADOS**, se debe cumplir:

✅ **Performance:**
- Bundle inicial ≤ 1 MB
- TTI < 2.5s
- Lighthouse Performance > 80

✅ **Funcionalidad:**
- 3 dashboards funcionan correctamente
- Sistema de carrito completo
- Sistema de pedidos completo
- TPV360Master operativo
- Todos los modales funcionan

✅ **Optimizaciones:**
- Lazy loading funciona en dashboards
- Lazy loading funciona en modales
- Code splitting activo
- Imágenes lazy load

✅ **Calidad:**
- Sin errores en consola
- Sin referencias rotas
- Responsive funciona en móvil
- Navegación fluida

---

## 📞 CONTACTO

**Responsable:** Equipo Desarrollo Udar Edge  
**Última Actualización:** Diciembre 2024  
**Estado:** ✅ LISTA PARA TESTING

---

**🚀 ¡Todo listo para comenzar los tests funcionales! 🧪**
