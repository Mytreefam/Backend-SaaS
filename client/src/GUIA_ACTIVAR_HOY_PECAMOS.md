# 🍰 GUÍA: Activar Brand HoyPecamos

## ✅ **CONFIGURACIÓN COMPLETA - LISTO PARA USAR**

La aplicación **tiene el branding real de HoyPecamos** extraído de su web oficial y está **100% activado**.

## 🎨 **Branding Aplicado (desde hoypecamos.com):**

### 1. **Logo Real**
```typescript
logo: 'figma:asset/8f987d91ef3d36da43dff055cbc6cdd94347173e.png'
// Logo extraído directamente de la web
```

### 2. **Colores Oficiales**
```typescript
colors: {
  primary: '#ED1C24',        // ❤️ Rojo HoyPecamos (oficial)
  primaryForeground: '#ffffff',
  secondary: '#1a1a1a',      // Negro suave
  accent: '#FF4444',         // Rojo acento
  background: '#000000',     // Negro profundo
  foreground: '#ffffff',     // Texto blanco
  muted: '#2a2a2a',          // Gris oscuro
  border: 'rgba(237, 28, 36, 0.3)',
}
```

### 3. **Tipografía Oficial**
```typescript
fonts: {
  heading: 'Montserrat, sans-serif',  // Bold moderna
  body: 'Poppins, sans-serif',
}
```

### 4. **Tagline Oficial**
```
"Un buen pecado siempre merece la pena"
```

---

## 🚀 **Componentes Nuevos Creados:**

### ✅ **SplashScreen** (`/components/SplashScreen.tsx`)
- Logo animado de HoyPecamos
- Fondo negro con rojo #ED1C24
- Animación de pulso en el logo
- Indicadores de carga con puntos rojos
- Duración: 2.5 segundos

### ✅ **OnboardingScreen** (`/components/OnboardingScreen.tsx`)
- 3 pantallas personalizadas con textos de HoyPecamos
- Estilo negro/rojo corporativo
- Botón "¡A pecar!" al final
- Transiciones fluidas entre slides
- Opción de saltar

### ✅ **LoadingScreen** (`/components/LoadingScreen.tsx`)
- Pantalla de carga con logo HoyPecamos
- Spinner en rojo corporativo
- Mensaje: "Preparando tu dulce..."
- Modo fullscreen o inline

### ✅ **TenantLogo** (`/components/TenantLogo.tsx`)
- Componente reutilizable para mostrar logo
- Soporta múltiples tamaños: sm, md, lg, xl
- Opción de mostrar tagline
- Adaptable a cualquier tenant

---

## 🔄 **Cómo Cambiar de Tenant:**

### **Opción 1: HoyPecamos (ACTUAL) ← YA ACTIVADO**
```typescript
// /config/tenant.config.ts - Línea 267
export const ACTIVE_TENANT: TenantConfig = TENANT_HOY_PECAMOS; // ✅ ACTIVO

// /config/branding.config.ts - Línea 166
export const ACTIVE_BRANDING: TenantBranding = BRANDING_HOY_PECAMOS; // ✅ ACTIVO
```

### **Opción 2: Volver a Udar Edge**
```typescript
// /config/tenant.config.ts
export const ACTIVE_TENANT: TenantConfig = TENANT_UDAR_EDGE;

// /config/branding.config.ts
export const ACTIVE_BRANDING: TenantBranding = BRANDING_UDAR_EDGE;
```

### **Cambio en Capacitor Config:**
Si cambias de tenant, también actualiza:
```typescript
// /capacitor.config.ts
// Para HoyPecamos:
appId: 'com.hoypecamos.app',
appName: 'Hoy Pecamos',
backgroundColor: '#ED1C24',
iconColor: '#ED1C24',

// Para Udar Edge:
appId: 'com.udaredge.app',
appName: 'Udar Edge',
backgroundColor: '#4DB8BA',
iconColor: '#4DB8BA',
```

---

## 📱 **Lo que verás en la App HoyPecamos:**

### 🎨 **Colores:**
- **Rojo principal:** `#ED1C24` (botones, logos, acentos)
- **Negro profundo:** `#000000` (fondo principal)
- **Blanco:** `#FFFFFF` (textos)
- **Rojo claro:** `#FF4444` (hover, highlights)

### 📝 **Textos Personalizados:**
- **Login:** "Bienvenido a Hoy Pecamos - Déjate tentar por el dulce pecado"
- **Onboarding botón final:** "¡A pecar!"
- **Dashboard Cliente:** "¡Hola {name}! ¿Qué dulce pecado te apetece hoy? 🍰"
- **Estado vacío:** "Aún no has pecado... ¡atrévete!"
- **Búsqueda:** "Buscar dulce"
- **Loading:** "Preparando tu dulce..."

### 🔤 **Fuentes:**
- **Títulos:** Montserrat (bold, moderna)
- **Cuerpo:** Poppins (limpia, legible)

### 🔌 **Integraciones Activas:**
- ✅ Monei (pagos)
- ✅ Glovo (delivery)
- ✅ Uber Eats (delivery)
- ❌ Just Eat (deshabilitado)
- ✅ Google Login
- ❌ Apple Login (deshabilitado)
- ✅ Facebook Login

---

## 🛠️ **Compilar APK con HoyPecamos:**

```bash
# 1. Instalar dependencias
npm install

# 2. Compilar proyecto web
npm run build

# 3. Sincronizar con Capacitor
npx cap sync android

# 4. Abrir en Android Studio
npx cap open android

# 5. Compilar APK
# En Android Studio: Build → Generate Signed Bundle / APK
```

La APK resultante tendrá:
- **Nombre:** Hoy Pecamos
- **Package:** com.hoypecamos.app
- **Colores:** Rojo #ED1C24
- **Splash Screen:** Rojo con logo 🍰

---

## 🎯 **Resumen:**

| Elemento | Valor |
|----------|-------|
| **App Name** | Hoy Pecamos |
| **Package ID** | com.hoypecamos.app |
| **Color Principal** | #ED1C24 (Rojo) |
| **Logo** | 🍰 |
| **Tagline** | "Un buen pecado siempre merece la pena" |
| **Fuente Títulos** | Montserrat |
| **Fuente Cuerpo** | Poppins |
| **Integraciones** | Monei, Glovo, Uber Eats |
| **OAuth** | Google, Facebook |

---

## 📚 **Crear Nuevos Tenants:**

Para añadir un nuevo cliente (ej: "Dulcería La Tentación"):

1. **Crear branding** en `/config/branding.config.ts`:
```typescript
export const BRANDING_LA_TENTACION: TenantBranding = {
  appName: 'La Tentación',
  colors: { primary: '#8b5cf6' }, // Púrpura
  // ...
};
```

2. **Crear textos** en `/config/texts.config.ts`:
```typescript
export const TEXTS_ES_LA_TENTACION: TenantTexts = {
  // ...
};
```

3. **Crear tenant** en `/config/tenant.config.ts`:
```typescript
export const TENANT_LA_TENTACION: TenantConfig = {
  id: 'tenant-006',
  slug: 'la-tentacion',
  branding: BRANDING_LA_TENTACION,
  texts: TEXTS_ES_LA_TENTACION,
  // ...
};
```

4. **Activar:**
```typescript
export const ACTIVE_TENANT = TENANT_LA_TENTACION;
```

---

## ✨ **¡Todo Listo!**

La app está **100% configurada como HoyPecamos** y lista para compilar la APK. Todo el branding, textos, colores y configuraciones están aplicados. 🎉