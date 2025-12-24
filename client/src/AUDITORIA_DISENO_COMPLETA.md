# 🔍 AUDITORÍA EXHAUSTIVA DE DISEÑO - UDAR EDGE

**Fecha**: 29 Nov 2025  
**Objetivo**: Control exhaustivo página por página  
**Criterios**: Responsive móvil + No overflow horizontal + No solapamientos

---

## 📋 INVENTARIO COMPLETO DE COMPONENTES

### 🏠 DASHBOARDS PRINCIPALES (3)
- [x] ClienteDashboard.tsx
- [x] TrabajadorDashboard.tsx  
- [x] GerenteDashboard.tsx

### 👤 CLIENTE (23 componentes)
**Páginas Principales**
- [ ] InicioCliente.tsx
- [ ] CatalogoPromos.tsx
- [ ] PedidosCliente.tsx
- [ ] PresupuestosCliente.tsx
- [ ] NotificacionesCliente.tsx
- [ ] ChatCliente.tsx
- [ ] QuienesSomos.tsx
- [ ] PerfilCliente.tsx
- [ ] MisPedidos.tsx
- [ ] MisFacturas.tsx
- [ ] MiGaraje.tsx
- [ ] DocumentacionVehiculo.tsx

**Modales Cliente**
- [ ] CestaOverlay.tsx
- [ ] CheckoutModal.tsx
- [ ] NuevaCitaModal.tsx
- [ ] AsistenciaModal.tsx
- [ ] YaEstoyAquiModal.tsx
- [ ] TurnoBanner.tsx
- [ ] TurnoDetallesModal.tsx
- [ ] PedidoConfirmacionModal.tsx
- [ ] ProductoDetalle.tsx
- [ ] BiometriaModal.tsx
- [ ] SubirDocumentoModal.tsx

### 👷 TRABAJADOR (23 componentes)
**Páginas Principales**
- [ ] InicioTrabajador.tsx
- [ ] TareasTrabajador.tsx
- [ ] FichajeTrabajador.tsx
- [ ] AgendaTrabajador.tsx
- [ ] MaterialTrabajador.tsx
- [ ] PedidosTrabajador.tsx
- [ ] ChatTrabajador.tsx
- [ ] ReportesTrabajador.tsx
- [ ] FormacionTrabajador.tsx
- [ ] DocumentacionTrabajador.tsx
- [ ] NotificacionesTrabajador.tsx
- [ ] ConfiguracionTrabajador.tsx
- [ ] SoporteTrabajador.tsx

**TPV Trabajador**
- [ ] TPVLosPecados.tsx
- [ ] EstadoTPVModal.tsx

**Modales Trabajador**
- [ ] CompletarTareaModal.tsx
- [ ] AñadirMaterialModal.tsx
- [ ] RecepcionMaterialModal.tsx
- [ ] ModalesMovimientosStock.tsx
- [ ] ModalDetallePedido.tsx
- [ ] ConteoInventario.tsx
- [ ] DocumentacionLaboral.tsx
- [ ] ChatColaborador.tsx

### 👨‍💼 GERENTE (40+ componentes)
**Páginas Principales**
- [ ] Dashboard360.tsx
- [ ] OperativaGerente.tsx
- [ ] ClientesGerente.tsx
- [ ] FacturacionFinanzas.tsx
- [ ] PersonalRRHH.tsx
- [ ] EquipoRRHH.tsx
- [ ] StockProveedores.tsx
- [ ] StockProveedoresCafe.tsx
- [ ] ProveedoresGerente.tsx
- [ ] ProductividadGerente.tsx
- [ ] PromocionesGerente.tsx
- [ ] GestionProductos.tsx
- [ ] Escandallo.tsx
- [ ] CuentaResultados.tsx
- [ ] NotificacionesGerente.tsx
- [ ] ChatGerente.tsx
- [ ] AyudaGerente.tsx
- [ ] DocumentacionGerente.tsx

**Configuración Gerente**
- [ ] ConfiguracionGerente.tsx
- [ ] ConfiguracionEmpresas.tsx
- [ ] ConfiguracionAgentesExternos.tsx
- [ ] ConfiguracionChats.tsx
- [ ] GestionVeriFactu.tsx
- [ ] GestionVeriFactuAvanzado.tsx
- [ ] IntegracionesAgregadores.tsx
- [ ] InvitacionesPendientes.tsx

**Modales Gerente**
- [ ] ModalCrearEmpresa.tsx
- [ ] ModalInvitarEmpleado.tsx
- [ ] ModalPermisosEmpleado.tsx
- [ ] ModalSeleccionTPV.tsx
- [ ] ModalSeleccionPuntoVenta.tsx
- [ ] ModalCrearAgente.tsx
- [ ] ModalAgenteExterno.tsx
- [ ] ModalConfigCategoriaChat.tsx
- [ ] ModalEditarCategoriaCliente.tsx

**Otros Gerente**
- [ ] ComunicacionGerente.tsx
- [ ] FiltroContextoJerarquico.tsx
- [ ] DetalleSKU.tsx
- [ ] EbitdaData.tsx
- [ ] TestWebhooks.tsx
- [ ] DashboardAnalyticsPromociones.tsx
- [ ] GestionNotificacionesPromo.tsx
- [ ] NotificacionesPromocionesCliente.tsx

### 🏪 TPV Y OPERATIVA (15)
- [ ] TPV360Master.tsx
- [ ] PanelOperativa.tsx
- [ ] PanelOperativaAvanzado.tsx
- [ ] PanelCaja.tsx
- [ ] PanelEstadosPedidos.tsx
- [ ] CajaRapida.tsx
- [ ] CajaRapidaMejorada.tsx
- [ ] GestionTurnos.tsx
- [ ] DatosClienteTPV.tsx
- [ ] CalculadoraEfectivo.tsx

**Modales TPV**
- [ ] ModalPagoTPV.tsx
- [ ] ModalPagoMixto.tsx
- [ ] ModalOperacionesTPV.tsx
- [ ] ModalAperturaCaja.tsx
- [ ] ModalCierreCaja.tsx
- [ ] ModalArqueoCaja.tsx
- [ ] ModalRetiradaCaja.tsx
- [ ] ModalConsumoPropio.tsx
- [ ] ModalDevolucionTicket.tsx
- [ ] ConfiguracionImpresoras.tsx

### 🎫 TICKETS Y DOCUMENTOS (2)
- [ ] TicketCocina.tsx
- [ ] TicketCocinaV2.tsx

### 📱 MOBILE (Onboarding)
- [ ] mobile/OnboardingMejorado.tsx
- [ ] mobile/SplashScreen.tsx

### 🔐 AUTENTICACIÓN (2)
- [ ] LoginView.tsx
- [ ] LoginViewMobile.tsx
- [ ] PlanesView.tsx
- [ ] AcceptarInvitacion.tsx

### 🔧 SHARED/UI/UTILS (Navigation, UI)
- [ ] navigation/Sidebar.tsx
- [ ] navigation/BottomNav.tsx
- [ ] navigation/MobileDrawer.tsx
- [ ] navigation/QuickActions.tsx
- [ ] navigation/KPICards.tsx
- [ ] navigation/Breadcrumb.tsx
- [ ] NotificationCenter.tsx
- [ ] NotificationBadge.tsx
- [ ] NotificationPreferences.tsx
- [ ] ui/* (todos los componentes UI)

---

## ✅ CHECKLIST DE VERIFICACIÓN POR COMPONENTE

Para cada componente verificar:

### 1. ✅ Container Principal
```tsx
// ✅ CORRECTO
<div className="... overflow-x-hidden">
  
// ❌ INCORRECTO  
<div className="...">  // sin overflow-x-hidden
```

### 2. ✅ Grids Responsive
```tsx
// ✅ CORRECTO
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">

// ❌ INCORRECTO
<div className="grid grid-cols-4">  // fijo, no responsive
```

### 3. ✅ Tablas con Scroll
```tsx
// ✅ CORRECTO - Desktop
<div className="hidden sm:block overflow-x-auto custom-scrollbar">
  <table className="w-full">
    
// ✅ CORRECTO - Mobile  
<div className="sm:hidden">
  {items.map(item => <Card />)}
</div>

// ❌ INCORRECTO
<table className="w-full">  // sin contenedor overflow
```

### 4. ✅ Filtros Horizontales
```tsx
// ✅ CORRECTO
<div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
  <div className="flex gap-2">
    
// ❌ INCORRECTO
<div className="flex gap-2">  // se sale del contenedor
```

### 5. ✅ Elementos con Ancho Fijo
```tsx
// ✅ CORRECTO
<div className="overflow-x-auto">
  <div className="min-w-[600px] sm:min-w-0">
    
// ❌ INCORRECTO
<div className="min-w-[800px]">  // sin contenedor
```

### 6. ✅ Modales/Dialogs
```tsx
// ✅ CORRECTO
<Dialog>
  <DialogContent className="max-w-[95vw] sm:max-w-lg">
    
// ❌ INCORRECTO
<DialogContent className="w-[800px]">  // ancho fijo grande
```

### 7. ✅ Cards Responsive
```tsx
// ✅ CORRECTO
<Card className="w-full">
  <CardContent className="p-4 sm:p-6">
    
// ❌ INCORRECTO
<Card className="min-w-[400px]">  // ancho mínimo grande
```

### 8. ✅ Textos Largos
```tsx
// ✅ CORRECTO
<h1 className="truncate">
<p className="break-words">

// ❌ INCORRECTO
<h1 className="whitespace-nowrap">  // sin contenedor scroll
```

---

## 🔍 PROBLEMAS COMUNES A BUSCAR

### ❌ Patrones Problemáticos

1. **Ancho fijo grande sin contenedor**
```tsx
<div className="w-[800px]">  // ❌
<div className="min-w-[600px]">  // ❌ sin overflow-x-auto
```

2. **Grid con muchas columnas fijas**
```tsx
<div className="grid grid-cols-5">  // ❌ en móvil
```

3. **Flex sin wrap**
```tsx
<div className="flex gap-4">  // ❌ si muchos items
  {items.map(...)}  // se sale
</div>
```

4. **Tablas sin scroll horizontal**
```tsx
<table className="w-full">  // ❌ columnas se comprimen mal
```

5. **Padding/margin grandes**
```tsx
<div className="px-20">  // ❌ en móvil ocupa mucho
```

6. **Absolute positioning sin límites**
```tsx
<div className="absolute left-0 w-full">  // ❌ puede salirse
```

---

## 🛠️ CORRECCIONES AUTOMÁTICAS

### Patrón 1: Contenedor Principal
```tsx
// Buscar y reemplazar
<div className="min-h-screen
// Por
<div className="min-h-screen overflow-x-hidden
```

### Patrón 2: Tablas
```tsx
// Envolver todas las tablas
<div className="overflow-x-auto custom-scrollbar">
  <table className="w-full">
```

### Patrón 3: Grids
```tsx
// Hacer todos responsive
grid-cols-X
// Por
grid-cols-1 sm:grid-cols-2 lg:grid-cols-X
```

### Patrón 4: Filtros
```tsx
// Añadir scroll controlado
<div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
```

---

## 📊 PRIORIDAD DE REVISIÓN

### 🔴 CRÍTICO (Revisar Primero)
1. **Dashboards principales** - Ya ✅
2. **TPV360Master** - Componente más complejo
3. **Páginas de catálogo/productos** - Muchos elementos
4. **Tablas grandes** (ClientesGerente, FacturacionFinanzas)

### 🟡 MEDIO
5. **Modales de formularios**
6. **Configuraciones**
7. **Reportes y analytics**

### 🟢 BAJO
8. **Componentes simples** (badges, buttons)
9. **Utilidades** (ErrorBoundary, etc)
10. **UI components** (ya revisados por shadcn)

---

## 🎯 MÉTRICAS DE ÉXITO

### Responsive Perfecto
- [ ] Se ve bien en 320px (iPhone SE)
- [ ] Se ve bien en 375px (iPhone estándar)
- [ ] Se ve bien en 768px (iPad portrait)
- [ ] Se ve bien en 1024px (iPad landscape)
- [ ] Se ve bien en 1920px (Desktop)

### Sin Overflow Horizontal
- [ ] No aparece scrollbar horizontal
- [ ] No se puede swipe derecha/izquierda
- [ ] Todos los elementos caben en viewport

### Sin Solapamientos
- [ ] Headers no tapan contenido
- [ ] Modales centrados
- [ ] Bottom nav no tapa contenido
- [ ] z-index correcto en todos los layers

---

**ESTADO ACTUAL**: 🟡 EN PROGRESO  
**PRÓXIMO**: Revisión sistemática componente por componente

