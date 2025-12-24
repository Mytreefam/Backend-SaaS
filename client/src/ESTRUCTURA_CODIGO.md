# 📂 ESTRUCTURA DEL CÓDIGO - UDAR EDGE

> Organización clara por prioridad: Core → Features → Admin → Shared

---

## 🎯 FILOSOFÍA DE ORGANIZACIÓN

```
🔥 CORE       → Features críticas, usadas constantemente
⚡ FEATURES   → Features importantes, uso frecuente
🔧 ADMIN      → Herramientas admin, auditorías, reportes
🤝 SHARED     → Componentes reutilizables
```

---

## 📁 ESTRUCTURA ACTUAL

### **/ (Raíz del Proyecto)**

```
/
├── 📄 README.md                    ← 🔥 README principal (LEER PRIMERO)
├── 📄 START_HERE.md                ← 🚀 Quick start
├── 📄 QUICKSTART.md                ← Guía rápida
│
├── 📁 docs/                        ← 📚 TODA LA DOCUMENTACIÓN
│   └── README_DOCS.md              ← Índice de 200+ documentos
│
├── 📁 components/                  ← 🎨 COMPONENTES REACT
│   ├── 📁 cliente/                 ← Dashboard Cliente (Core)
│   ├── 📁 trabajador/              ← Dashboard Trabajador (Core)
│   ├── 📁 gerente/                 ← Dashboard Gerente (Core)
│   ├── 📁 shared/                  ← Componentes compartidos
│   ├── 📁 ui/                      ← UI primitives (shadcn/ui)
│   ├── 📁 navigation/              ← Navegación
│   ├── 📁 mobile/                  ← Componentes móvil
│   ├── 📁 legal/                   ← Términos, privacidad
│   ├── 📁 filtros/                 ← Filtros universales
│   ├── 📁 demo/                    ← Demos
│   ├── 📁 dev/                     ← Dev tools
│   └── [otros archivos sueltos]   ← A reorganizar
│
├── 📁 contexts/                    ← React Contexts
│   ├── CartContext.tsx
│   ├── StockContext.tsx
│   ├── FiltroUniversalContext.tsx
│   └── ConfiguracionChatsContext.tsx
│
├── 📁 hooks/                       ← Custom Hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useNotifications.ts
│   └── ...
│
├── 📁 services/                    ← Servicios y APIs
│   ├── api.service.ts
│   ├── notifications.service.ts
│   ├── facturacion-automatica.service.ts
│   └── aggregators/                ← Agregadores (Glovo, Uber, etc)
│
├── 📁 lib/                         ← Utilidades
│   ├── utils.ts
│   ├── validations.ts
│   ├── rbac.ts                     ← Permisos
│   └── ...
│
├── 📁 types/                       ← TypeScript Types
│   ├── global.d.ts
│   ├── producto.types.ts
│   ├── notifications.types.ts
│   └── ...
│
├── 📁 config/                      ← Configuración
│   ├── tenant.config.ts            ← White-label
│   ├── features.config.ts          ← Feature flags
│   ├── branding.config.ts
│   └── ...
│
├── 📁 data/                        ← Data mock (temporal)
│   ├── productos-cafe.ts
│   ├── proveedores.ts
│   └── ...
│
├── 📁 styles/                      ← Estilos globales
│   └── globals.css
│
├── 📁 android-config/              ← Config Android
├── 📁 scripts/                     ← Scripts utilidad
├── 📁 pages/                       ← Pages (Next.js routing)
│
└── App.tsx                         ← 🔥 ENTRY POINT
```

---

## 🔥 COMPONENTES CORE (Prioridad Alta)

### **Ubicación:** `/components/[rol]/`

#### **Cliente** (`/components/cliente/`)
```
InicioCliente.tsx           ← Dashboard principal
MisPedidos.tsx              ← Lista pedidos
MisFacturas.tsx             ← Facturas
PerfilCliente.tsx           ← Perfil
CheckoutModal.tsx           ← Checkout
ProductoDetalle.tsx         ← Detalle producto
CatalogoPromos.tsx          ← Catálogo promociones
```

#### **Trabajador** (`/components/trabajador/`)
```
InicioTrabajador.tsx        ← Dashboard principal
PedidosTrabajador.tsx       ← Gestión pedidos
FichajeTrabajador.tsx       ← Fichajes
TPVLosPecados.tsx           ← TPV del trabajador
MaterialTrabajador.tsx      ← Materiales
DocumentacionTrabajador.tsx ← Documentos
```

#### **Gerente** (`/components/gerente/`)
```
Dashboard360.tsx            ← Dashboard principal
EBITDAInteractivo.tsx       ← EBITDA (core business)
VentasKPIs.tsx              ← KPIs ventas
GestionProductos.tsx        ← Productos CRUD
EquipoRRHH.tsx              ← RRHH
StockProveedores.tsx        ← Stock
FacturacionFinanzas.tsx     ← Facturación
ClientesGerente.tsx         ← Clientes
```

---

## ⚡ FEATURES (Prioridad Media)

### **Ubicación:** `/components/gerente/` (features avanzadas)

```
PromocionesGerente.tsx              ← Sistema promociones
IntegracionesAgregadores.tsx        ← Glovo, Uber Eats, etc
GestionVeriFactuAvanzado.tsx        ← Verifactu AEAT
ReportesMultiempresa.tsx            ← Reportes consolidados
CronJobsMonitor.tsx                 ← Monitorización cron jobs
DashboardOnboarding.tsx             ← Onboarding empleados
Escandallo.tsx                      ← Escandallos productos
```

---

## 🔧 ADMIN & HERRAMIENTAS (Prioridad Baja)

### **Auditoría y Históricos**

```
/components/gerente/
├── HistorialMovimientosStock.tsx   ← Histórico stock
├── HistorialRecepciones.tsx        ← Histórico recepciones
└── DashboardCompras.tsx            ← Histórico compras

/components/shared/
└── ActividadReciente.tsx           ← Log actividad
```

### **Testing y Debug**

```
/components/gerente/
├── TestWebhooks.tsx                ← Test webhooks
└── ValidacionVisualTPV.tsx         ← Validación visual

/components/dev/
├── NavigationDebug.tsx             ← Debug navegación
├── BreakpointIndicator.tsx         ← Debug responsive
└── ImagePerformanceMonitor.tsx     ← Monitor imágenes
```

### **Demos**

```
/components/demo/
├── DemoFlujosMultimarca.tsx
├── DemoNotificacionesAgrupadas.tsx
└── SyncDemoIndicator.tsx
```

---

## 🤝 SHARED (Componentes Reutilizables)

### **UI Primitives** (`/components/ui/`)

```
Componentes base shadcn/ui:
├── button.tsx                  ← Botón
├── card.tsx                    ← Card
├── dialog.tsx                  ← Modal
├── table.tsx                   ← Tabla
├── badge.tsx                   ← Badge
└── ... (50+ componentes)

Componentes custom:
├── empty-state.tsx             ← Estado vacío
├── skeleton-card.tsx           ← Skeleton loading
├── stats-card.tsx              ← Card de estadísticas
├── timeline.tsx                ← Timeline
└── responsive-table.tsx        ← Tabla responsive
```

### **Navegación** (`/components/navigation/`)

```
Sidebar.tsx                     ← Sidebar principal
BottomNav.tsx                   ← Navegación móvil inferior
MobileDrawer.tsx                ← Drawer móvil
Breadcrumb.tsx                  ← Breadcrumb
QuickActions.tsx                ← Acciones rápidas
KPICards.tsx                    ← Cards KPI
```

### **Compartidos** (`/components/shared/`)

```
BrandedHeader.tsx               ← Header con branding
DashboardMetricas.tsx           ← Métricas dashboard
ExportadorDatos.tsx             ← Exportar Excel/PDF/CSV
ImageOptimized.tsx              ← Imagen optimizada
LazyImage.tsx                   ← Lazy load imagen
CommandPalette.tsx              ← Command palette (⌘K)
```

---

## 🗂️ ORGANIZACIÓN POR DOMINIO

### **Pedidos**
```
/components/cliente/
├── MisPedidos.tsx              ← Ver pedidos
├── CheckoutModal.tsx           ← Hacer pedido
└── PedidoConfirmacionModal.tsx

/components/trabajador/
├── PedidosTrabajador.tsx       ← Gestionar pedidos
└── ModalDetallePedido.tsx

/components/gerente/
├── OperativaGerente.tsx        ← Ver todos los pedidos
└── PanelEstadosPedidos.tsx     ← Estados en tiempo real
```

### **Productos**
```
/components/cliente/
├── TiendaProductos.tsx         ← Catálogo
└── ProductoDetalle.tsx         ← Detalle

/components/trabajador/
└── MaterialTrabajador.tsx      ← Ver productos

/components/gerente/
└── GestionProductos.tsx        ← CRUD productos
```

### **TPV**
```
/components/
├── TPV360Master.tsx            ← TPV principal (gerente)
├── ModalAperturaCaja.tsx
├── ModalCierreCaja.tsx
├── ModalArqueoCaja.tsx
└── ModalPagoTPV.tsx

/components/trabajador/
└── TPVLosPecados.tsx           ← TPV trabajador
```

### **Stock**
```
/components/gerente/
├── StockProveedores.tsx        ← Gestión stock
├── AlertasStock.tsx            ← Alertas
├── HistorialMovimientosStock.tsx
└── GestionProveedores.tsx

/contexts/
└── StockContext.tsx            ← Context global stock
```

### **RRHH**
```
/components/gerente/
├── EquipoRRHH.tsx              ← Gestión equipo
├── PersonalRRHH.tsx            ← Personal
├── DashboardOnboarding.tsx     ← Onboarding
└── GestionTurnos.tsx           ← Turnos

/components/trabajador/
├── FichajeTrabajador.tsx       ← Fichajes
├── DocumentacionLaboral.tsx    ← Documentos
└── OnboardingChecklist.tsx     ← Checklist onboarding
```

---

## 🔀 FLUJO DE IMPORTS

### **Reglas:**

```typescript
// ✅ CORRECTO: Import desde shared/ui
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// ✅ CORRECTO: Import desde shared
import { ImageOptimized } from "@/components/shared/ImageOptimized";

// ✅ CORRECTO: Import de contexto
import { useCart } from "@/contexts/CartContext";

// ✅ CORRECTO: Import de hook
import { useNotifications } from "@/hooks/useNotifications";

// ✅ CORRECTO: Import de service
import { pedidosService } from "@/services/pedidos.service";

// ❌ EVITAR: Import circular entre features del mismo nivel
// Cliente NO debería importar de Trabajador directamente
```

### **Jerarquía de Imports:**

```
ui/ (nivel más bajo)
  ↑
shared/ (usa ui)
  ↑
features/ (usa shared y ui)
  ↑
pages/dashboards (usa todo)
```

---

## 📦 ARCHIVOS PRINCIPALES

### **Entry Points**

```
App.tsx                         ← 🔥 Main app component
src/main.tsx                    ← React entry point
index.html                      ← HTML root
```

### **Configuración**

```
/config/
├── tenant.config.ts            ← 🔥 White-label config
├── features.config.ts          ← Feature flags
├── app.config.ts               ← App config
└── branding.config.ts          ← Branding

/constants/
└── empresaConfig.ts            ← Empresa config
```

### **Estilos**

```
/styles/
└── globals.css                 ← 🔥 Estilos globales + Tailwind
```

---

## 🎨 COMPONENTES POR CATEGORÍA

### **Por Complejidad**

#### **Simple** (< 100 líneas)
```
Badge, Button, Avatar, Separator
EmptyState, LoadingSpinner
```

#### **Media** (100-300 líneas)
```
Card con lógica, Modales simples
Forms, Tables
Dashboard cards (KPIs, Stats)
```

#### **Compleja** (300-1000 líneas)
```
TPV360Master (800 líneas)
EBITDAInteractivo (600 líneas)
Dashboard360 (500 líneas)
StockProveedores (700 líneas)
```

#### **Muy Compleja** (1000+ líneas)
```
GerenteDashboard (principal)
TrabajadorDashboard (principal)
ClienteDashboard (principal)
```

> **Nota:** Componentes muy complejos son candidatos para refactorizar en subcomponentes

---

## 🔍 ENCONTRAR COMPONENTES RÁPIDO

### **Por Funcionalidad**

```bash
# Pedidos
grep -r "Pedido" components/

# TPV
grep -r "TPV" components/

# Stock
grep -r "Stock" components/

# EBITDA
grep -r "EBITDA" components/
```

### **Por Rol**

```bash
# Cliente
ls components/cliente/

# Trabajador
ls components/trabajador/

# Gerente
ls components/gerente/
```

---

## 📊 ESTADÍSTICAS DEL CÓDIGO

```
Total Componentes:          150+
├── UI Primitives:          50+
├── Features Core:          40+
├── Features Avanzadas:     30+
├── Admin/Herramientas:     20+
└── Shared:                 10+

Líneas de Código:           ~50,000
├── Components:             ~35,000
├── Services:               ~5,000
├── Utils/Lib:              ~3,000
├── Types:                  ~2,000
└── Config:                 ~1,000

Documentación:              200+ archivos .md
```

---

## 🎯 REGLAS DE ORGANIZACIÓN

### **1. Un componente, un archivo**
```
✅ ProductoDetalle.tsx
❌ productos.tsx (con múltiples componentes)
```

### **2. Coloca por funcionalidad, no por tipo**
```
✅ /components/gerente/GestionProductos.tsx
❌ /components/forms/ProductoForm.tsx
```

### **3. Shared solo para código realmente compartido**
```
✅ ImageOptimized (usado en 10+ lugares)
❌ ProductoCard (solo en catálogo)
```

### **4. UI para primitives puros**
```
✅ Button, Card, Dialog (sin lógica negocio)
❌ ProductoCard (tiene lógica específica)
```

---

## 🚀 MEJORAS FUTURAS

### **Propuesta Reorganización** (opcional):

```
/components/
├── 📁 core/                    ← 🔥 Features críticas
│   ├── pedidos/
│   ├── productos/
│   ├── tpv/
│   └── clientes/
│
├── 📁 features/                ← Features importantes
│   ├── facturacion/
│   ├── stock/
│   ├── rrhh/
│   └── proveedores/
│
├── 📁 admin/                   ← Herramientas admin
│   ├── auditoria/
│   ├── reportes/
│   └── historicos/
│
└── 📁 shared/                  ← Compartidos
    ├── ui/
    ├── navigation/
    └── layouts/
```

**Beneficio:** Más claro qué es core vs secundario

---

## 📖 DOCUMENTACIÓN RELACIONADA

- [README.md](../README.md) - README principal
- [docs/README_DOCS.md](../docs/README_DOCS.md) - Índice documentación
- [CODE_STRUCTURE.md](../CODE_STRUCTURE.md) - Estructura detallada
- [GUIA_DESARROLLO.md](../GUIA_DESARROLLO.md) - Guía desarrollo

---

**🎯 Estructura organizada y escalable | Fácil de navegar y mantener**

*Última actualización: Diciembre 2025*
