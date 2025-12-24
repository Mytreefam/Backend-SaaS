# 🎨 GUÍA WHITE-LABEL / MULTI-TENANT

## Cómo personalizar la app para cada cliente/empresa

---

## 🎯 ¿QUÉ ES ESTO?

Sistema que te permite tener **una misma app** pero con **branding diferente** para cada cliente:

- **Logo** diferente
- **Colores** diferentes
- **Textos** diferentes
- **Nombre** diferente
- **Features** diferentes por empresa

**Ejemplo:**
- Cliente 1 (Pizzería) → Logo 🍕, colores rojos, textos pizza
- Cliente 2 (Cafetería) → Logo ☕, colores marrones, textos café
- Cliente 3 (Retail) → Logo 👗, colores negro/rosa, textos fashion

**TODO en el mismo código base** 🚀

---

## 📁 ESTRUCTURA

```
/config/
  ├── branding.config.ts    # 🎨 Logo, colores
  ├── texts.config.ts       # 📝 Todos los textos
  └── tenant.config.ts      # 🏢 Configuración completa

/hooks/
  ├── useTenant.ts          # Hook principal
  └── useBranding.ts        # (exportado desde useTenant)

/types/
  └── tenant.types.ts       # Tipos TypeScript

/components/dev/
  └── TenantSwitcher.tsx    # Cambiar tenant en desarrollo
```

---

## 🚀 QUICKSTART - CAMBIAR BRANDING

### 1. Abrir `/config/branding.config.ts`

```typescript
export const ACTIVE_BRANDING: TenantBranding = BRANDING_UDAR_EDGE;
//                                              ↑
//                                          CAMBIAR AQUÍ
```

### 2. Opciones disponibles:

```typescript
// Opción 1: App genérica
BRANDING_UDAR_EDGE

// Opción 2: Pizzería
BRANDING_LA_PIZZERIA

// Opción 3: Cafetería
BRANDING_COFFEE_HOUSE

// Opción 4: Tienda de ropa
BRANDING_FASHION_STORE
```

### 3. Cambiar textos `/config/texts.config.ts`

```typescript
export const ACTIVE_TEXTS: TenantTexts = TEXTS_ES_GENERIC;
//                                        ↑
//                                    CAMBIAR AQUÍ
```

### 4. Cambiar tenant completo `/config/tenant.config.ts`

```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_UDAR_EDGE;
//                                          ↑
//                                      CAMBIAR AQUÍ
```

**¡YA ESTÁ!** La app cambia automáticamente.

---

## 🎨 CREAR NUEVO BRANDING

### 1. Crear en `/config/branding.config.ts`

```typescript
export const BRANDING_MI_EMPRESA: TenantBranding = {
  // Identidad
  appName: 'Mi Empresa App',
  companyName: 'Mi Empresa S.L.',
  tagline: 'El mejor servicio',
  
  // Logo (emoji o URL a imagen)
  logo: '🚀', // o '/logos/mi-empresa.png'
  logoSmall: '🚀',
  favicon: '/favicon-mi-empresa.ico',
  
  // Colores
  colors: {
    primary: '#ff5722',           // Color principal
    primaryForeground: '#ffffff', // Texto en botones
    secondary: '#fff3e0',         // Color secundario
    accent: '#ff6f00',            // Color de acento
    background: '#ffffff',        // Fondo
    foreground: '#1a1a1a',        // Texto
    muted: '#fafafa',             // Texto muted
    border: 'rgba(0, 0, 0, 0.1)', // Bordes
  },
  
  // Fuentes
  fonts: {
    heading: 'Poppins, sans-serif',
    body: 'Inter, sans-serif',
  },
  
  // Imágenes opcionales
  images: {
    loginBackground: '/images/mi-empresa-bg.jpg',
    onboardingSlides: [
      '/images/slide1.jpg',
      '/images/slide2.jpg',
    ],
    emptyStateImage: '/images/empty.svg',
  },
};
```

### 2. Agregar al final del archivo

```typescript
export const ALL_BRANDINGS = {
  'udar-edge': BRANDING_UDAR_EDGE,
  'la-pizzeria': BRANDING_LA_PIZZERIA,
  'coffee-house': BRANDING_COFFEE_HOUSE,
  'fashion-store': BRANDING_FASHION_STORE,
  'mi-empresa': BRANDING_MI_EMPRESA, // ← AGREGAR
};
```

### 3. Activar

```typescript
export const ACTIVE_BRANDING: TenantBranding = BRANDING_MI_EMPRESA;
```

---

## 📝 CREAR NUEVOS TEXTOS

### 1. Crear en `/config/texts.config.ts`

```typescript
export const TEXTS_ES_MI_EMPRESA: TenantTexts = {
  login: {
    title: 'Bienvenido a Mi Empresa',
    subtitle: 'Tu mejor experiencia',
    emailPlaceholder: 'correo@ejemplo.com',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Entrar',
    registerButton: 'Registrarse',
    forgotPassword: '¿Olvidaste tu contraseña?',
    orContinueWith: 'O entra con',
  },
  
  onboarding: {
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: 'Empezar',
    slides: [
      {
        title: 'Bienvenido',
        description: 'Descripción de tu empresa',
      },
      // ... más slides
    ],
  },
  
  cliente: {
    dashboard: {
      title: 'Inicio',
      welcomeMessage: '¡Hola {name}!',
    },
    orders: {
      title: 'Mis Pedidos',
      emptyState: 'No tienes pedidos',
      newOrderButton: 'Nuevo Pedido',
    },
    favorites: {
      title: 'Favoritos',
      emptyState: 'No tienes favoritos',
    },
    profile: {
      title: 'Mi Perfil',
      editButton: 'Editar',
    },
  },
  
  trabajador: {
    dashboard: {
      title: 'Panel de Trabajo',
      welcomeMessage: '¡Hola {name}!',
    },
    tasks: {
      title: 'Mis Tareas',
      emptyState: 'No tienes tareas',
    },
    schedule: {
      title: 'Mi Horario',
    },
  },
  
  gerente: {
    dashboard: {
      title: 'Dashboard',
      welcomeMessage: '¡Hola {name}!',
    },
    products: {
      title: 'Productos',
      newProductButton: 'Nuevo Producto',
      emptyState: 'No hay productos',
    },
    analytics: {
      title: 'Análisis',
    },
    integrations: {
      title: 'Integraciones',
    },
    users: {
      title: 'Usuarios',
      newUserButton: 'Nuevo Usuario',
    },
  },
  
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    logout: 'Salir',
    settings: 'Ajustes',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    actions: 'Acciones',
  },
};
```

### 2. Agregar a ALL_TEXTS

```typescript
export const ALL_TEXTS = {
  'es-generic': TEXTS_ES_GENERIC,
  'es-pizzeria': TEXTS_ES_PIZZERIA,
  'es-coffee': TEXTS_ES_COFFEE,
  'en-generic': TEXTS_EN_GENERIC,
  'es-mi-empresa': TEXTS_ES_MI_EMPRESA, // ← AGREGAR
};
```

### 3. Activar

```typescript
export const ACTIVE_TEXTS: TenantTexts = TEXTS_ES_MI_EMPRESA;
```

---

## 🏢 CREAR TENANT COMPLETO

Un tenant incluye branding + textos + configuración de features/módulos.

### 1. Crear en `/config/tenant.config.ts`

```typescript
export const TENANT_MI_EMPRESA: TenantConfig = {
  id: 'tenant-005',
  slug: 'mi-empresa',
  
  branding: BRANDING_MI_EMPRESA,
  texts: TEXTS_ES_MI_EMPRESA,
  
  config: {
    // Features habilitadas por rol
    features: {
      cliente: ['orders', 'favorites', 'profile', 'notifications'],
      trabajador: ['tasks', 'schedule', 'checkin'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'users'],
    },
    
    // Módulos disponibles
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: true,  // ← false para deshabilitar
      users: true,
      tasks: true,
      schedule: true,
    },
    
    // Integraciones habilitadas
    integrations: {
      monei: true,
      glovo: true,         // ← false para deshabilitar
      uberEats: false,     // Deshabilitado
      justEat: false,      // Deshabilitado
    },
    
    // OAuth providers
    oauth: {
      google: true,
      apple: true,
      facebook: false,     // Deshabilitado
    },
    
    // Regional
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};
```

### 2. Agregar a ALL_TENANTS

```typescript
export const ALL_TENANTS = {
  'udar-edge': TENANT_UDAR_EDGE,
  'la-pizzeria': TENANT_LA_PIZZERIA,
  'coffee-house': TENANT_COFFEE_HOUSE,
  'fashion-store': TENANT_FASHION_STORE,
  'mi-empresa': TENANT_MI_EMPRESA, // ← AGREGAR
};
```

### 3. Activar

```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_MI_EMPRESA;
```

---

## 💻 USAR EN COMPONENTES

### Hook principal: `useTenant()`

```typescript
import { useTenant } from '../hooks/useTenant';

function MiComponente() {
  const { tenant, branding, texts, config } = useTenant();
  
  return (
    <div>
      <h1>{branding.appName}</h1>
      <p>{texts.cliente.dashboard.title}</p>
    </div>
  );
}
```

### Hook de branding: `useBranding()`

```typescript
import { useBranding } from '../hooks/useTenant';

function Logo() {
  const branding = useBranding();
  
  return (
    <div 
      style={{
        color: branding.colors.primary,
        fontFamily: branding.fonts.heading,
      }}
    >
      {branding.logo} {branding.appName}
    </div>
  );
}
```

### Hook de textos: `useTexts()`

```typescript
import { useTexts } from '../hooks/useTenant';

function LoginButton() {
  const texts = useTexts();
  
  return (
    <button>{texts.login.loginButton}</button>
  );
}
```

### Hook de features: `useFeature()`

```typescript
import { useFeature } from '../hooks/useTenant';

function ClienteDashboard() {
  const hasOrders = useFeature('cliente', 'orders');
  const hasFavorites = useFeature('cliente', 'favorites');
  
  return (
    <div>
      {hasOrders && <OrdersSection />}
      {hasFavorites && <FavoritesSection />}
    </div>
  );
}
```

### Hook de módulos: `useModule()`

```typescript
import { useModule } from '../hooks/useTenant';

function GerenteDashboard() {
  const hasIntegrations = useModule('integrations');
  const hasAnalytics = useModule('analytics');
  
  return (
    <nav>
      <Link to="/products">Productos</Link>
      {hasAnalytics && <Link to="/analytics">Analytics</Link>}
      {hasIntegrations && <Link to="/integrations">Integraciones</Link>}
    </nav>
  );
}
```

### Hook de integraciones: `useIntegration()`

```typescript
import { useIntegration } from '../hooks/useTenant';

function IntegracionesPage() {
  const hasMonei = useIntegration('monei');
  const hasGlovo = useIntegration('glovo');
  const hasUberEats = useIntegration('uberEats');
  
  return (
    <div>
      {hasMonei && <MoneiCard />}
      {hasGlovo && <GlovoCard />}
      {hasUberEats && <UberEatsCard />}
    </div>
  );
}
```

---

## 🎨 EJEMPLOS DE USO

### Ejemplo 1: Header con branding

```typescript
import { useBranding, useTexts } from '../hooks/useTenant';

function Header() {
  const branding = useBranding();
  const texts = useTexts();
  
  return (
    <header 
      style={{
        backgroundColor: branding.colors.background,
        borderBottom: `1px solid ${branding.colors.border}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{branding.logo}</span>
        <h1 
          style={{
            color: branding.colors.primary,
            fontFamily: branding.fonts.heading,
          }}
        >
          {branding.appName}
        </h1>
      </div>
      
      <button>{texts.common.logout}</button>
    </header>
  );
}
```

### Ejemplo 2: Botón con colores del tenant

```typescript
import { useBranding } from '../hooks/useTenant';

function PrimaryButton({ children, onClick }) {
  const branding = useBranding();
  
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: branding.colors.primary,
        color: branding.colors.primaryForeground,
        padding: '12px 24px',
        borderRadius: '8px',
        fontFamily: branding.fonts.body,
      }}
    >
      {children}
    </button>
  );
}
```

### Ejemplo 3: Textos con variables

```typescript
import { useTexts } from '../hooks/useTenant';
import { replaceTextVars } from '../config/texts.config';

function Welcome({ userName }) {
  const texts = useTexts();
  
  const message = replaceTextVars(
    texts.cliente.dashboard.welcomeMessage,
    { name: userName }
  );
  
  return <h1>{message}</h1>;
  // Resultado: "¡Hola Juan!" o "¡Hola María! ¿Qué pizza te apetece hoy?"
}
```

---

## 🔄 CAMBIAR TENANT DINÁMICAMENTE

### En desarrollo (con TenantSwitcher):

1. Clic en botón flotante 🏢 (abajo derecha)
2. Seleccionar tenant
3. La app recarga automáticamente

### Por código:

```typescript
import { useTenant } from '../hooks/useTenant';

function Settings() {
  const { switchTenant } = useTenant();
  
  const handleChange = async () => {
    await switchTenant('la-pizzeria');
    window.location.reload(); // Recargar para aplicar cambios
  };
  
  return (
    <button onClick={handleChange}>
      Cambiar a La Pizzería
    </button>
  );
}
```

---

## 🎯 CASOS DE USO

### Caso 1: SaaS Multi-Tenant

**Cada empresa tiene su tenant:**
- Empresa A → `tenant-001` (Udar Edge)
- Empresa B → `tenant-002` (La Pizzería)
- Empresa C → `tenant-003` (Coffee House)

**La app detecta el tenant por:**
- Subdomain: `empresa-a.miapp.com`
- Path: `miapp.com/empresa-a`
- Header: `X-Tenant-ID: tenant-001`

```typescript
// En App.tsx
useEffect(() => {
  // Detectar tenant por subdomain
  const subdomain = window.location.hostname.split('.')[0];
  const tenant = getTenantBySlug(subdomain);
  
  if (tenant) {
    switchTenant(tenant.slug);
  }
}, []);
```

### Caso 2: White-Label

**Misma app, branding diferente:**
- Versión 1: Para pizzerías
- Versión 2: Para cafeterías
- Versión 3: Para tiendas de ropa

**Build separado por tenant:**

```bash
# .env.production.pizzeria
VITE_TENANT_SLUG=la-pizzeria

# .env.production.coffee
VITE_TENANT_SLUG=coffee-house

# Build
npm run build -- --mode production.pizzeria
npm run build -- --mode production.coffee
```

### Caso 3: A/B Testing

**Probar diferentes brandings:**

```typescript
// Asignar tenant aleatorio
const randomTenant = Math.random() > 0.5 
  ? 'la-pizzeria' 
  : 'coffee-house';

switchTenant(randomTenant);
```

---

## 🚀 DESPLEGAR MULTI-TENANT

### Opción 1: Build único, tenant por configuración

```bash
# .env.production
VITE_TENANT_SLUG=udar-edge

npm run build
# Deploy una vez, cambiar tenant desde admin panel
```

### Opción 2: Build por tenant

```bash
# Build pizzería
VITE_TENANT_SLUG=la-pizzeria npm run build
mv dist dist-pizzeria

# Build cafetería
VITE_TENANT_SLUG=coffee-house npm run build
mv dist dist-coffee

# Deploy separado
vercel --prod ./dist-pizzeria
vercel --prod ./dist-coffee
```

### Opción 3: Subdominios

```nginx
# nginx.conf

# Pizzería
server {
  server_name pizzeria.miapp.com;
  location / {
    proxy_pass http://app:3000;
    proxy_set_header X-Tenant-ID tenant-002;
  }
}

# Cafetería
server {
  server_name coffee.miapp.com;
  location / {
    proxy_pass http://app:3000;
    proxy_set_header X-Tenant-ID tenant-003;
  }
}
```

---

## 📋 CHECKLIST

### Para crear nuevo tenant:

- [ ] Crear branding en `/config/branding.config.ts`
- [ ] Crear textos en `/config/texts.config.ts`
- [ ] Crear tenant en `/config/tenant.config.ts`
- [ ] Agregar a `ALL_BRANDINGS`, `ALL_TEXTS`, `ALL_TENANTS`
- [ ] Activar en `ACTIVE_TENANT`
- [ ] Probar en desarrollo con TenantSwitcher
- [ ] Verificar todos los textos se muestran correctamente
- [ ] Verificar colores se aplican correctamente
- [ ] Verificar features habilitadas/deshabilitadas
- [ ] Probar en móvil (iOS/Android)
- [ ] Build y deploy

---

## 🎉 CONCLUSIÓN

**Sistema completo para:**
- ✅ Multi-tenant (múltiples empresas en una app)
- ✅ White-label (mismo código, branding diferente)
- ✅ Personalización completa (logo, colores, textos)
- ✅ Control de features por tenant
- ✅ Fácil de mantener (un solo código base)

**Ahora puedes:**
1. Cambiar logo/colores en 2 minutos
2. Crear nuevo tenant en 10 minutos
3. Desplegar para N clientes con brandings diferentes

**¡Tu app es ahora un SaaS multi-tenant!** 🚀

---

*Última actualización: 28 Noviembre 2025*
