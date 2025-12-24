# 🎨 SISTEMA WHITE LABEL - UDAR EDGE

## ✅ **ESTADO ACTUAL: 100% CONFIGURADO**

### 🍰 **TENANT ACTIVO: HOY PECAMOS**

---

## 📋 **RESUMEN EJECUTIVO**

El sistema White Label está **completamente implementado** y permite cambiar la app entre diferentes clientes (tenants) en **30 segundos**, modificando solo 2 líneas de código.

### **Tenants Disponibles:**

1. **🍰 Hoy Pecamos** ← **ACTIVO**
   - Color: Rojo `#ED1C24`
   - Estilo: Moderno, negro/rojo
   - Logo: Real (extraído de hoypecamos.com)
   - Textos: Personalizados ("¡A pecar!", "Preparando tu dulce...")

2. **🎨 Udar Edge**
   - Color: Teal `#4DB8BA`
   - Estilo: Corporativo, profesional
   - Logo: Emoji 🎨
   - Textos: Genéricos

3. **🍕 La Pizzería**
   - Color: Rojo italiano `#d32f2f`
   - Estilo: Italiano, cálido
   - Logo: Emoji 🍕
   - Textos: Pizzería

4. **☕ Coffee House**
   - Color: Marrón café `#5d4037`
   - Estilo: Premium, artesanal
   - Logo: Emoji ☕
   - Textos: Café

5. **👗 Fashion Store**
   - Color: Negro `#000000`
   - Estilo: Elegante, minimalista
   - Logo: Emoji 👗
   - Textos: Genéricos

---

## 🚀 **COMPONENTES CREADOS**

### 1. **SplashScreen** (`/components/SplashScreen.tsx`)
Pantalla de carga inicial con animación del logo del tenant.

**Características:**
- ✅ Logo animado (pulso)
- ✅ Fondo corporativo
- ✅ Puntos de carga animados
- ✅ Nombre y tagline de la app
- ✅ Duración configurable

### 2. **OnboardingScreen** (`/components/OnboardingScreen.tsx`)
Tutorial de bienvenida personalizado por tenant.

**Características:**
- ✅ 3 slides personalizadas
- ✅ Botón "Saltar"
- ✅ Indicadores de progreso
- ✅ Transiciones fluidas
- ✅ Textos y colores del tenant

### 3. **LoadingScreen** (`/components/LoadingScreen.tsx`)
Pantalla de carga para procesos largos.

**Características:**
- ✅ Logo con animación
- ✅ Spinner corporativo
- ✅ Mensaje personalizable
- ✅ Modo fullscreen o inline

### 4. **TenantLogo** (`/components/TenantLogo.tsx`)
Componente reutilizable para mostrar logo.

**Características:**
- ✅ 4 tamaños (sm, md, lg, xl)
- ✅ Opción de mostrar tagline
- ✅ Adaptable a cualquier tenant
- ✅ Soporta imagen o emoji

---

## 📁 **ARCHIVOS DE CONFIGURACIÓN**

### 1. **`/config/branding.config.ts`**
Define colores, fuentes, logos por tenant.

```typescript
export const BRANDING_HOY_PECAMOS: TenantBranding = {
  appName: 'Hoy Pecamos',
  logo: 'figma:asset/...',
  colors: { primary: '#ED1C24', ... },
  fonts: { heading: 'Montserrat', body: 'Poppins' },
};
```

### 2. **`/config/texts.config.ts`**
Define TODOS los textos de la app por tenant.

```typescript
export const TEXTS_ES_HOY_PECAMOS: TenantTexts = {
  login: { title: 'Bienvenido a Hoy Pecamos', ... },
  onboarding: { getStarted: '¡A pecar!', ... },
  cliente: { ... },
  // ... todos los textos
};
```

### 3. **`/config/tenant.config.ts`**
Combina branding + textos + configuración.

```typescript
export const TENANT_HOY_PECAMOS: TenantConfig = {
  id: 'tenant-005',
  slug: 'hoy-pecamos',
  branding: BRANDING_HOY_PECAMOS,
  texts: TEXTS_ES_HOY_PECAMOS,
  config: {
    features: { ... },
    modules: { ... },
    integrations: { glovo: true, ... },
  },
};

// ⚡ CAMBIAR AQUÍ PARA ALTERNAR TENANT
export const ACTIVE_TENANT = TENANT_HOY_PECAMOS;
```

### 4. **`/capacitor.config.ts`**
Configuración para APK móvil.

```typescript
appId: 'com.hoypecamos.app',
appName: 'Hoy Pecamos',
backgroundColor: '#ED1C24',
iconColor: '#ED1C24',
```

---

## 🔄 **CAMBIO RÁPIDO DE TENANT**

### **De HoyPecamos a Udar Edge:**

**1. Editar `/config/tenant.config.ts` (línea 267):**
```typescript
// Cambiar de:
export const ACTIVE_TENANT = TENANT_HOY_PECAMOS;

// A:
export const ACTIVE_TENANT = TENANT_UDAR_EDGE;
```

**2. Editar `/capacitor.config.ts` (líneas 4-5, 12, 20):**
```typescript
// Cambiar de:
appId: 'com.hoypecamos.app',
appName: 'Hoy Pecamos',
backgroundColor: '#ED1C24',
iconColor: '#ED1C24',

// A:
appId: 'com.udaredge.app',
appName: 'Udar Edge',
backgroundColor: '#4DB8BA',
iconColor: '#4DB8BA',
```

**3. Reiniciar:**
```bash
npm run dev
```

**¡Listo!** La app ahora es Udar Edge con todos sus colores, textos y branding.

---

## 🎯 **LO QUE CAMBIA AUTOMÁTICAMENTE:**

Al cambiar `ACTIVE_TENANT`, se actualizan:

✅ **Logo** (splash, onboarding, header)  
✅ **Colores** (botones, fondos, acentos)  
✅ **Textos** (login, onboarding, mensajes)  
✅ **Fuentes** (títulos, cuerpo)  
✅ **Nombre app** (título ventana)  
✅ **Tagline** (eslogan)  
✅ **Features** (módulos habilitados/deshabilitados)  
✅ **Integraciones** (Glovo, Uber Eats, etc.)  
✅ **OAuth** (Google, Apple, Facebook)  

---

## 📱 **COMPILAR APK**

### **Para HoyPecamos:**

```bash
# 1. Asegúrate que ACTIVE_TENANT = TENANT_HOY_PECAMOS
# 2. Compilar
npm install
npm run build
npx cap sync android
npx cap open android

# 3. En Android Studio:
Build → Generate Signed Bundle / APK
```

**Resultado:**
- Nombre: "Hoy Pecamos"
- Package: com.hoypecamos.app
- Colores: Rojo #ED1C24
- Splash: Negro con logo HoyPecamos

### **Para Udar Edge:**

```bash
# 1. Cambiar ACTIVE_TENANT = TENANT_UDAR_EDGE
# 2. Cambiar capacitor.config.ts (appId, colores)
# 3. Compilar
npm install
npm run build
npx cap sync android
npx cap open android
```

**Resultado:**
- Nombre: "Udar Edge"
- Package: com.udaredge.app
- Colores: Teal #4DB8BA
- Splash: Blanco con logo UdarEdge

---

## 🆕 **CREAR NUEVO TENANT**

### **Ejemplo: "Burger King Clone"**

**1. Crear branding en `/config/branding.config.ts`:**
```typescript
export const BRANDING_BURGER_KING: TenantBranding = {
  appName: 'Burger King',
  companyName: 'Burger King España',
  tagline: 'A fuego lento',
  
  logo: '/logos/burger-king.png', // Tu logo
  logoSmall: '/logos/burger-king-small.png',
  favicon: '/favicon-bk.ico',
  
  colors: {
    primary: '#D62300', // Rojo BK
    primaryForeground: '#ffffff',
    secondary: '#F5EBDC', // Beige
    accent: '#FFC72C', // Amarillo
    background: '#ffffff',
    foreground: '#502314', // Marrón oscuro
    muted: '#F5F5F5',
    border: 'rgba(214, 35, 0, 0.2)',
  },
  
  fonts: {
    heading: 'Flame, sans-serif', // Fuente BK
    body: 'Arial, sans-serif',
  },
  
  images: {
    loginBackground: '/images/bk-bg.jpg',
    onboardingSlides: [
      '/images/bk-slide1.jpg',
      '/images/bk-slide2.jpg',
      '/images/bk-slide3.jpg',
    ],
    emptyStateImage: '/images/bk-empty.svg',
  },
};
```

**2. Crear textos en `/config/texts.config.ts`:**
```typescript
export const TEXTS_ES_BURGER_KING: TenantTexts = {
  login: {
    title: 'Bienvenido a Burger King',
    subtitle: 'Tu hamburguesa te espera',
    loginButton: 'Entrar',
    registerButton: 'Crear cuenta',
    // ...
  },
  onboarding: {
    skip: 'Saltar',
    next: 'Siguiente',
    getStarted: '¡Pedir ahora!',
    slides: [
      {
        title: 'A fuego lento',
        description: 'Carne 100% vacuno a la parrilla',
      },
      {
        title: 'Como tú quieras',
        description: 'Personaliza tu Whopper',
      },
      {
        title: '¡Haz tu pedido!',
        description: 'Recógelo o recíbelo en casa',
      },
    ],
  },
  // ... más textos
};
```

**3. Crear tenant en `/config/tenant.config.ts`:**
```typescript
export const TENANT_BURGER_KING: TenantConfig = {
  id: 'tenant-006',
  slug: 'burger-king',
  
  branding: BRANDING_BURGER_KING,
  texts: TEXTS_ES_BURGER_KING,
  
  config: {
    features: {
      cliente: ['orders', 'favorites', 'profile', 'loyalty'],
      trabajador: ['tasks', 'schedule', 'checkin'],
      gerente: ['dashboard', 'products', 'orders', 'analytics', 'integrations', 'users'],
    },
    
    modules: {
      products: true,
      orders: true,
      analytics: true,
      integrations: true,
      users: true,
      tasks: true,
      schedule: true,
    },
    
    integrations: {
      monei: true,
      glovo: true,
      uberEats: true,
      justEat: true,
    },
    
    oauth: {
      google: true,
      apple: true,
      facebook: true,
    },
    
    locale: 'es-ES',
    currency: 'EUR',
    timezone: 'Europe/Madrid',
  },
};

// Añadir a ALL_TENANTS
export const ALL_TENANTS = {
  'udar-edge': TENANT_UDAR_EDGE,
  'la-pizzeria': TENANT_LA_PIZZERIA,
  'coffee-house': TENANT_COFFEE_HOUSE,
  'fashion-store': TENANT_FASHION_STORE,
  'hoy-pecamos': TENANT_HOY_PECAMOS,
  'burger-king': TENANT_BURGER_KING, // ← Nuevo
};
```

**4. Activar:**
```typescript
export const ACTIVE_TENANT = TENANT_BURGER_KING;
```

**5. Actualizar Capacitor:**
```typescript
appId: 'com.burgerking.app',
appName: 'Burger King',
backgroundColor: '#D62300',
iconColor: '#D62300',
```

**¡Listo!** Ahora tienes Burger King funcionando. 🍔

---

## 📚 **DOCUMENTACIÓN ADICIONAL**

- **`/GUIA_ACTIVAR_HOY_PECAMOS.md`** - Guía detallada de HoyPecamos
- **`/CAMBIO_RAPIDO_TENANT.md`** - Instrucciones rápidas de cambio
- **`/EJEMPLO_USO_COMPONENTES.md`** - Ejemplos de código

---

## 🎉 **BENEFICIOS DEL SISTEMA**

✅ **1 App → Múltiples Clientes**  
✅ **Cambio en 30 segundos**  
✅ **100% Personalizable**  
✅ **Sin duplicar código**  
✅ **Compilación independiente**  
✅ **APKs únicas por cliente**  
✅ **Mantenimiento centralizado**  

---

## 🔒 **GUARDADO Y SEGURO**

Cada configuración está en su propio archivo:
- ✅ BRANDING_HOY_PECAMOS guardado
- ✅ BRANDING_UDAR_EDGE guardado
- ✅ TEXTS_ES_HOY_PECAMOS guardado
- ✅ TENANT_HOY_PECAMOS guardado

**Cambiar de tenant NO borra configuraciones anteriores.** Solo cambia cuál está activo.

---

## ✨ **ESTADO FINAL**

```
🍰 TENANT ACTIVO: HOY PECAMOS
📱 APP ID: com.hoypecamos.app  
🎨 COLOR: #ED1C24 (Rojo)
📝 TEXTOS: Personalizados
🚀 COMPONENTES: SplashScreen, OnboardingScreen, LoadingScreen, TenantLogo
✅ LISTO PARA COMPILAR APK
```

**Para volver a Udar Edge:** Cambia 1 línea en `tenant.config.ts` y 4 líneas en `capacitor.config.ts`. ¡Eso es todo! 🎯
