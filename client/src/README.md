# 🚀 UDAR EDGE - SaaS Multiempresa

> Sistema TPV 360° + Gestión Completa de Negocios  
> **Frontend React 85-90% completado** | Mobile iOS/Android/Web | White-Label Ready

---

## ⚡ QUICK START

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables
cp .env.example .env.local

# 3. Iniciar desarrollo
npm run dev

# 4. Abrir
http://localhost:3000
```

**📖 Guía completa:** [START_HERE.md](START_HERE.md)

---

## 🎯 ¿QUÉ ES UDAR EDGE?

Plataforma SaaS completa para digitalizar negocios con:

### ✅ **3 Roles de Usuario**
- 👤 **Cliente**: Pedidos, productos, seguimiento
- 👷 **Trabajador**: TPV, fichajes, tareas
- 👔 **Gerente**: Dashboard, EBITDA, gestión completa

### ✅ **Funcionalidades Core** (100% Frontend)
- 🛒 Sistema de pedidos multicanal
- 💰 TPV 360 Master (caja, arqueos, turnos)
- 📊 Dashboard EBITDA interactivo
- 👥 RRHH completo (fichajes, nóminas, onboarding)
- 📦 Gestión stock y proveedores
- 🧾 Facturación (preparado para Verifactu)
- 📱 App móvil nativa (iOS/Android)

### ✅ **Características Técnicas**
- ⚡ **Bundle optimizado**: 800 KB (reducción 68%)
- 🎨 **9 componentes base**: EmptyState, SkeletonCard, StatsCard, Timeline...
- 🔄 **Lazy loading** en todos los módulos
- 📱 **100% responsive** (mobile-first)
- 🎨 **White-label** (multi-tenant listo)
- 🌐 **Multi-idioma** (i18n configurado)

---

## 📚 DOCUMENTACIÓN ORGANIZADA

### 🎯 **Empezar Ahora**
| Documento | Descripción | Tiempo |
|-----------|-------------|--------|
| [START_HERE.md](START_HERE.md) | 🚀 Inicio rápido | 5 min |
| [QUICKSTART.md](QUICKSTART.md) | Guía de uso | 10 min |
| [GUIA_DESARROLLO.md](GUIA_DESARROLLO.md) | Setup desarrollo | 15 min |

### 💻 **Para Backend Developer**
| Documento | Descripción |
|-----------|-------------|
| [GUIA_BACKEND_DEVELOPER.md](GUIA_BACKEND_DEVELOPER.md) | ⭐ Guía completa backend |
| [ESTRUCTURA_BBDD_COMPLETA.md](ESTRUCTURA_BBDD_COMPLETA.md) | Schema database completo |
| [CHECKLIST_INTEGRACION_BACKEND.md](CHECKLIST_INTEGRACION_BACKEND.md) | Checklist implementación |
| [docs/DATABASE_SCHEMA_TPV360.sql](docs/DATABASE_SCHEMA_TPV360.sql) | SQL TPV listo |

### 🎨 **Para Frontend Developer**
| Documento | Descripción |
|-----------|-------------|
| [CODE_STRUCTURE.md](CODE_STRUCTURE.md) | Estructura del código |
| [GUIA_TESTS_FUNCIONALES.md](GUIA_TESTS_FUNCIONALES.md) | Testing guide |
| [OPTIMIZACIONES_PERFORMANCE.md](OPTIMIZACIONES_PERFORMANCE.md) | Performance |

### 📱 **Para Mobile Developer**
| Documento | Descripción |
|-----------|-------------|
| [GUIA_COMPLETA_APP_MOVIL.md](GUIA_COMPLETA_APP_MOVIL.md) | Guía móvil completa |
| [MOBILE_BUILD_GUIDE.md](MOBILE_BUILD_GUIDE.md) | Build iOS/Android |
| [GUIA_GENERACION_APK_PRODUCCION.md](GUIA_GENERACION_APK_PRODUCCION.md) | APK producción |

### 📖 **Toda la Documentación**
📁 **[Ver índice completo →](docs/README_DOCS.md)** (200+ documentos organizados)

---

## 🏗️ ARQUITECTURA

```
Udar Edge (Frontend React + TypeScript)
│
├─ 🎨 UI/UX
│  ├─ 3 Dashboards (Cliente, Trabajador, Gerente)
│  ├─ 50+ componentes reutilizables
│  └─ Design system completo
│
├─ 🔐 Auth & Roles
│  ├─ Login/Register
│  ├─ Permisos por rol
│  └─ Multiempresa (Familia > Marca > PDV)
│
├─ 💼 Módulos Core
│  ├─ Pedidos (multicanal)
│  ├─ TPV 360 Master
│  ├─ EBITDA Dashboard
│  ├─ RRHH (fichajes, nóminas)
│  ├─ Stock & Proveedores
│  └─ Facturación
│
├─ 🔌 Integraciones (preparadas)
│  ├─ Verifactu (AEAT)
│  ├─ Agregadores (Glovo, Uber Eats, Just Eat)
│  ├─ Pagos (Stripe, Monei)
│  └─ Notificaciones (Email, SMS, Push)
│
└─ 📱 Mobile Native
   ├─ iOS (Capacitor)
   ├─ Android (Capacitor)
   └─ Funcionalidades nativas (biometría, geolocalización)
```

---

## 🎨 ESTRUCTURA DEL CÓDIGO

```
/
├── 📁 components/            ← Componentes React
│   ├── 📁 core/             ← 🔥 Features principales (pedidos, TPV, productos)
│   ├── 📁 cliente/          ← Dashboard cliente
│   ├── 📁 trabajador/       ← Dashboard trabajador
│   ├── 📁 gerente/          ← Dashboard gerente
│   ├── 📁 shared/           ← Componentes compartidos
│   ├── 📁 ui/               ← UI primitives (shadcn/ui)
│   └── 📁 navigation/       ← Navegación
│
├── 📁 contexts/             ← React Contexts (Cart, Stock, Filtros)
├── 📁 hooks/                ← Custom hooks
├── 📁 services/             ← Servicios (APIs, integraciones)
├── 📁 lib/                  ← Utilidades
├── 📁 types/                ← TypeScript types
├── 📁 config/               ← Configuración (white-label, features)
│
├── 📁 docs/                 ← 📚 TODA LA DOCUMENTACIÓN
│   └── README_DOCS.md       ← Índice organizado
│
├── 📁 android-config/       ← Config Android
└── App.tsx                  ← Entry point
```

---

## 🎨 WHITE-LABEL (Multi-Tenant)

**Cambiar marca/empresa en 2 minutos:**

```typescript
// config/tenant.config.ts
export const ACTIVE_TENANT = TENANT_LA_PIZZERIA; // 🍕

// Incluye:
- Logo personalizado
- Colores corporativos
- Textos (nombre empresa, eslogan)
- Configuración específica
```

**4 tenants incluidos:**
- 🎨 Udar Edge (defecto)
- 🍕 La Pizzería
- ☕ Cafetería Artisan
- 👗 Fashion Boutique

**📖 Guía:** [GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)

---

## ✅ ESTADO ACTUAL

### **Frontend: 85-90% Completo** ✅

```
✅ Auth & Login
✅ Dashboard Cliente (100%)
✅ Dashboard Trabajador (100%)
✅ Dashboard Gerente (100%)
✅ Sistema Pedidos
✅ TPV 360 Master
✅ EBITDA Interactivo
✅ RRHH Completo
✅ Stock & Proveedores
✅ Facturación UI
✅ App Móvil (iOS/Android)
✅ White-Label
✅ Performance optimizado (800KB bundle)
```

### **Backend: 0% - Necesita desarrollo** ⚠️

```
❌ Base de datos
❌ APIs REST
❌ Autenticación real
❌ Lógica de negocio
❌ Integraciones externas
```

**📖 Guía para backend:** [GUIA_BACKEND_DEVELOPER.md](GUIA_BACKEND_DEVELOPER.md)

---

## 🚀 ROADMAP IMPLEMENTACIÓN

### **Fase 1: MVP (Mes 1-2)**
- Auth + Multitenancy básico
- Pedidos básicos
- Productos CRUD
- Dashboard simple

### **Fase 2: Core Business (Mes 3-4)**
- TPV completo
- Stock básico
- Empleados
- Realtime

### **Fase 3: Advanced (Mes 5-6)**
- Facturación + Verifactu
- EBITDA completo
- Fichajes
- Nóminas

### **Fase 4: Enterprise (Mes 7+)**
- Multiempresa avanzado
- API pública
- Analytics avanzado

**📖 Plan detallado:** Documentación completa en [docs/](docs/)

---

## 🛠️ STACK TECNOLÓGICO

### **Frontend**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS 4.0
- 🧩 shadcn/ui components
- 📊 Recharts (gráficos)
- 🔄 React Query (data fetching)
- 📱 Capacitor (mobile native)

### **Backend Recomendado** (preparado)
- 🗄️ Supabase (PostgreSQL + Auth + Realtime)
- ⚡ Edge Functions (Deno)
- 🔐 Row Level Security (multitenancy)
- 📦 Storage (archivos)

### **Integraciones**
- 💳 Stripe (pagos)
- 📧 SendGrid (email)
- 📲 OneSignal (push notifications)
- 🧾 Verifactu (AEAT)

---

## 📦 SCRIPTS DISPONIBLES

```bash
# Desarrollo
npm run dev                    # Iniciar dev server

# Build
npm run build                  # Build producción
npm run preview                # Preview build

# Mobile
npm run build:mobile           # Build móvil
npx cap open android           # Abrir Android Studio
npx cap open ios               # Abrir Xcode

# Tests
npm run test                   # Tests unitarios
npm run test:e2e               # Tests E2E

# Utilidades
npm run type-check             # Verificar TypeScript
npm run lint                   # Linter
```

---

## 🧪 TESTING

```bash
# Tests funcionales incluidos
npm run test

# Ver guía completa de testing
cat GUIA_TESTS_FUNCIONALES.md
```

---

## 📱 APP MÓVIL

### **Features Nativas Implementadas:**
- 📸 Cámara (escaneo QR)
- 🔐 Biometría (Face ID / Touch ID)
- 📍 Geolocalización (fichajes)
- 📲 Push notifications
- 💾 Almacenamiento local
- 📶 Detección online/offline

**📖 Guía completa:** [GUIA_COMPLETA_APP_MOVIL.md](GUIA_COMPLETA_APP_MOVIL.md)

---

## 🎯 FEATURES DESTACADAS

### **TPV 360 Master** 💰
- Apertura/cierre caja
- Arqueos automáticos
- Turnos y retiradas
- Métodos de pago múltiples
- Devoluciones
- Tickets y facturas

### **EBITDA Interactivo** 📊
- 3 vistas (Mensual, Trimestral, Anual)
- Gráficas Recharts
- KPIs con trends
- Comparativas períodos
- Exportación PDF/Excel
- Integración nóminas

### **RRHH Completo** 👥
- Fichajes con geolocalización
- Cronómetro en vivo
- Onboarding 7 fases
- Documentación laboral
- Nóminas
- Vacaciones y ausencias

---

## 🔧 CONFIGURACIÓN

### **Variables de Entorno**

```env
# .env.local (ejemplo)

# App
NEXT_PUBLIC_APP_NAME="Udar Edge"
NEXT_PUBLIC_APP_VERSION="2.0.0"

# API (cuando backend esté listo)
NEXT_PUBLIC_API_URL=https://api.udaredge.com
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Features
NEXT_PUBLIC_ENABLE_MOBILE=true
NEXT_PUBLIC_ENABLE_WHITE_LABEL=true

# Integraciones
STRIPE_PUBLIC_KEY=
MONEI_API_KEY=
SENDGRID_API_KEY=
```

---

## 🤝 CONTRIBUIR

Este proyecto está listo para recibir el backend. Si eres el desarrollador backend:

1. 📖 Lee [GUIA_BACKEND_DEVELOPER.md](GUIA_BACKEND_DEVELOPER.md)
2. 📋 Revisa [CHECKLIST_INTEGRACION_BACKEND.md](CHECKLIST_INTEGRACION_BACKEND.md)
3. 🗄️ Implementa schema: [ESTRUCTURA_BBDD_COMPLETA.md](ESTRUCTURA_BBDD_COMPLETA.md)
4. 🔌 Conecta APIs a componentes existentes

---

## 📞 SOPORTE

**Problemas comunes:**
- Build error → `npm clean-install`
- TypeScript errors → `npm run type-check`
- Mobile no compila → Ver [MOBILE_BUILD_GUIDE.md](MOBILE_BUILD_GUIDE.md)

**Documentación completa:** [docs/README_DOCS.md](docs/README_DOCS.md)

---

## 📊 MÉTRICAS DEL PROYECTO

```
📦 Bundle size:           800 KB (optimizado)
📄 Componentes:           150+
📝 Líneas de código:      ~50,000
📱 Plataformas:           Web + iOS + Android
🎨 Design system:         100% completo
✅ TypeScript coverage:   100%
📚 Documentación:         200+ archivos
🧪 Tests:                 Funcionales listos
```

---

## 🎯 PRÓXIMOS PASOS

### **Para Producto:**
1. Definir prioridades backend (Fase 1-4)
2. Contratar equipo backend
3. Planificar integración

### **Para Desarrollo Backend:**
1. Leer documentación backend
2. Setup Supabase
3. Implementar schema DB
4. Crear APIs

### **Para Deployment:**
1. Build frontend: `npm run build`
2. Deploy a Vercel/Netlify
3. Configurar dominios
4. Setup backend en Supabase

---

## 📜 LICENCIA

Proyecto privado - Udar Edge  
© 2025 Todos los derechos reservados

---

## 🌟 CARACTERÍSTICAS PREMIUM

- ✅ **100% TypeScript** - Type safety completo
- ✅ **Mobile Native** - iOS + Android reales
- ✅ **White-Label** - Multi-tenant listo
- ✅ **Optimizado** - Bundle 68% más pequeño
- ✅ **Documentado** - 200+ docs técnicos
- ✅ **Escalable** - Arquitectura enterprise
- ✅ **Responsive** - Mobile-first design
- ✅ **Accesible** - WCAG 2.1 AA

---

**🚀 Frontend Production-Ready | Backend Ready-to-Connect**

*Última actualización: Diciembre 2025*

---

## 📌 ENLACES RÁPIDOS

- 🚀 [Inicio Rápido](START_HERE.md)
- 📖 [Documentación Completa](docs/README_DOCS.md)
- 🎯 [Mapa de Prioridades](MAPA_PRIORIDADES.md) - ⭐ **NUEVO** Ver qué es CORE vs secundario
- 📂 [Estructura del Código](ESTRUCTURA_CODIGO.md) - Organización detallada
- 💻 [Guía Backend](GUIA_BACKEND_DEVELOPER.md)
- 📱 [Guía Mobile](GUIA_COMPLETA_APP_MOVIL.md)
- 🎨 [White-Label](GUIA_WHITE_LABEL.md)
- 🧪 [Testing](GUIA_TESTS_FUNCIONALES.md)

---

**¿Tienes preguntas?** Revisa la [documentación completa](docs/README_DOCS.md) 📚