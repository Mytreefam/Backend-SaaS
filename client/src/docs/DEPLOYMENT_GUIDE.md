# 🚀 Guía de Despliegue - Udar Edge

Guía completa para desplegar Udar Edge para un nuevo cliente en **menos de 10 minutos**.

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Clonar y Configurar](#paso-1-clonar-y-configurar)
3. [Paso 2: Configurar Supabase](#paso-2-configurar-supabase)
4. [Paso 3: Configurar Tenant](#paso-3-configurar-tenant)
5. [Paso 4: Personalización](#paso-4-personalización)
6. [Paso 5: Desplegar](#paso-5-desplegar)
7. [Troubleshooting](#troubleshooting)

---

## ✅ Requisitos Previos

Antes de empezar, asegúrate de tener:

- [ ] Node.js 18+ instalado
- [ ] Cuenta en Supabase (gratis)
- [ ] Git instalado
- [ ] Editor de código (VS Code recomendado)

**Servicios opcionales** (según plan del cliente):
- [ ] Cuenta Firebase (notificaciones push)
- [ ] Google Cloud Console (OAuth Google)
- [ ] Facebook Developers (OAuth Facebook)
- [ ] Apple Developer (OAuth Apple)
- [ ] Stripe/PayPal (pagos)

---

## 📦 Paso 1: Clonar y Configurar

### 1.1 Clonar el repositorio

```bash
git clone https://github.com/tu-org/udar-edge.git
cd udar-edge
```

### 1.2 Instalar dependencias

```bash
npm install
```

### 1.3 Copiar archivo de entorno

```bash
cp .env.example .env
```

### 1.4 Limpiar caché (si hay problemas)

```bash
rm -rf node_modules/.vite .vite dist
npm run dev
```

---

## 🗄️ Paso 2: Configurar Supabase

### 2.1 Crear proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Click en "New Project"
3. Completa:
   - **Name**: `udar-edge-cliente-xyz`
   - **Database Password**: (guarda esto seguro)
   - **Region**: Europe West (London) - más cercano a España
4. Click "Create new project" (tarda 1-2 minutos)

### 2.2 Obtener credenciales

1. En el dashboard, ve a **Settings** → **API**
2. Copia estos valores a tu `.env`:

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.3 Crear estructura de base de datos

1. Ve a **SQL Editor** en Supabase
2. Ejecuta los siguientes scripts **EN ORDEN**:

#### A. Estructura base
```sql
-- Copia y pega el contenido completo de:
-- docs/DATABASE_SCHEMA_TPV360.sql
-- docs/DATABASE_SCHEMA_DATOS_CLIENTE.sql
```

#### B. Crear tenant
```sql
-- Edita scripts/setup-tenant.sql con los datos del cliente
-- Luego copia y pega el contenido completo
```

#### C. Datos de demostración (OPCIONAL)
```sql
-- Solo para testing/demo
-- scripts/seed-demo-data.sql
```

### 2.4 Configurar autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (obligatorio)
3. Habilita **Google** (opcional):
   - Client ID: (de Google Cloud Console)
   - Client Secret: (de Google Cloud Console)
4. Habilita **Facebook** (opcional)
5. Habilita **Apple** (opcional)

### 2.5 Crear usuario gerente

1. Ve a **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Completa:
   - **Email**: gerente@cliente.com
   - **Password**: (contraseña temporal)
   - **Auto Confirm User**: ✅ Yes
4. Click "Create user"

---

## ⚙️ Paso 3: Configurar Tenant

### 3.1 Editar `config/tenant.config.ts`

Busca la sección para crear un nuevo tenant:

```typescript
export const TENANT_TU_CLIENTE: TenantConfig = {
  id: '1',
  slug: 'tu-cliente',
  name: 'Tu Restaurante',
  legalName: 'Tu Restaurante S.L.',
  taxId: 'B12345678',
  
  plan: 'profesional',  // basico | profesional | premium
  billingCycle: 'monthly',
  subscriptionStatus: 'active',
  
  branding: {
    logo: '/clients/tu-cliente/logo.svg',
    favicon: '/clients/tu-cliente/favicon.ico',
    primaryColor: '#0d9488',
    secondaryColor: '#14b8a6',
    accentColor: '#2dd4bf',
  },
  
  contact: {
    email: 'info@tucliente.com',
    phone: '+34 612 345 678',
    website: 'https://tucliente.com',
    address: {
      street: 'Calle Principal 123',
      city: 'Barcelona',
      state: 'Barcelona',
      postalCode: '08001',
      country: 'España',
    },
  },
  
  locale: {
    language: 'es',
    timezone: 'Europe/Madrid',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
  },
  
  // ... resto de configuración
};
```

### 3.2 Activar el tenant

Al final del archivo, cambia:

```typescript
export let ACTIVE_TENANT: TenantConfig = TENANT_TU_CLIENTE;
```

O en `.env`:

```bash
VITE_TENANT_SLUG=tu-cliente
```

### 3.3 Configurar plan y features

Edita `config/features.config.ts`:

```typescript
// Opción 1: Usar plan predefinido
export let ACTIVE_FEATURES: FeaturesConfig = PLAN_PROFESIONAL;

// Opción 2: Personalizar
export let ACTIVE_FEATURES: FeaturesConfig = {
  ...PLAN_PROFESIONAL,
  modules: {
    ...PLAN_PROFESIONAL.modules,
    agentesExternos: false,  // Desactivar módulo
  },
};
```

O en `.env`:

```bash
VITE_PLAN=profesional
```

---

## 🎨 Paso 4: Personalización

### 4.1 Añadir logo y branding

```bash
# Crear carpeta para el cliente
mkdir -p public/clients/tu-cliente

# Copiar archivos
cp logo-cliente.svg public/clients/tu-cliente/logo.svg
cp favicon.ico public/clients/tu-cliente/favicon.ico
```

### 4.2 Personalizar colores (opcional)

Edita `styles/globals.css`:

```css
:root {
  --color-primary: #0d9488;    /* Color principal */
  --color-secondary: #14b8a6;  /* Color secundario */
  --color-accent: #2dd4bf;     /* Color de acento */
}
```

O usa la configuración del tenant (se aplica automáticamente).

### 4.3 Configurar OAuth (opcional)

Si el cliente quiere login social:

#### Google
1. Ve a [Google Cloud Console](https://console.cloud.google.com)
2. Crear proyecto → Habilitar Google+ API
3. Credentials → Create OAuth Client ID
4. Añadir a `.env`:
```bash
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=GOCSPX-abcdefg
```

#### Facebook
1. Ve a [Facebook Developers](https://developers.facebook.com)
2. Create App → Consumer
3. Settings → Basic → Copiar App ID y Secret
4. Añadir a `.env`:
```bash
VITE_FACEBOOK_APP_ID=1234567890
VITE_FACEBOOK_APP_SECRET=abcdefg
```

### 4.4 Configurar Firebase Push (opcional)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Add Project
3. Project Settings → General → Your apps → Web app
4. Copiar config a `.env`:
```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_PROJECT_ID=tu-proyecto
# ... resto de config
```

---

## 🚀 Paso 5: Desplegar

### 5.1 Probar localmente

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

**Login de prueba:**
- Email: gerente@cliente.com
- Password: (la que creaste en Supabase)

### 5.2 Build de producción

```bash
npm run build
```

Esto crea la carpeta `dist/` con los archivos optimizados.

### 5.3 Desplegar en Vercel (recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configurar variables de entorno en dashboard de Vercel
# Settings → Environment Variables → Añadir todas las de .env
```

### 5.4 Desplegar en Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configurar variables de entorno en dashboard de Netlify
```

### 5.5 Otros hostings

- **AWS Amplify**: Conectar repo de GitHub
- **Firebase Hosting**: `firebase deploy`
- **Cloudflare Pages**: Conectar repo
- **Render**: Conectar repo

### 5.6 Configurar dominio personalizado

En el dashboard de tu hosting:

1. Añadir dominio: `app.tucliente.com`
2. Configurar DNS:
   ```
   CNAME  app  tu-proyecto.vercel.app
   ```
3. Esperar propagación (5-30 min)

---

## 📱 Paso 6: App Móvil (Opcional)

### 6.1 Configurar Capacitor

```bash
# Instalar dependencias nativas
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios

# Inicializar
npx cap init

# Configurar capacitor.config.ts
```

### 6.2 Build Android

```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```

En Android Studio: Build → Generate Signed Bundle/APK

### 6.3 Build iOS

```bash
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

En Xcode: Product → Archive → Distribute App

Ver [MOBILE_BUILD_GUIDE.md](./MOBILE_BUILD_GUIDE.md) para más detalles.

---

## 🔧 Troubleshooting

### Error: "Invalid Supabase credentials"

✅ Verifica que copiaste bien las credenciales de Supabase  
✅ Asegúrate de que el `.env` está en la raíz del proyecto  
✅ Reinicia el servidor: `Ctrl+C` y `npm run dev`

### Error: "Biometric plugin not found"

✅ Es normal en desarrollo web  
✅ Solo afecta a la app nativa  
✅ Puedes ignorarlo o comentar el código

### Error de compilación de Vite

```bash
# Limpiar caché
rm -rf node_modules/.vite .vite dist
npm run dev
```

### No se ven los datos del tenant

✅ Verifica que ejecutaste `setup-tenant.sql`  
✅ Verifica que `VITE_TENANT_SLUG` en `.env` coincide  
✅ Revisa la consola del navegador para errores

### Los colores no se aplican

✅ El tenant carga los colores al iniciar  
✅ Verifica `tenant.config.ts` → `branding.primaryColor`  
✅ Limpia caché del navegador: `Ctrl+Shift+R`

---

## 📚 Recursos Adicionales

- [Documentación completa](./INDEX_DOCUMENTACION.md)
- [Guía de API](./GUIA_INTEGRACION_API.md)
- [Guía backend](./GUIA_BACKEND_DEVELOPER.md)
- [Guía app móvil](./GUIA_COMPLETA_APP_MOVIL.md)
- [Sistema de permisos](./SISTEMA_PERMISOS_EMPLEADO.md)

---

## ✅ Checklist Final

Antes de entregar al cliente:

- [ ] Supabase configurado y funcionando
- [ ] Usuario gerente creado
- [ ] Datos base insertados (empresas, categorías, etc.)
- [ ] Tenant configurado en `tenant.config.ts`
- [ ] Plan configurado en `features.config.ts`
- [ ] Logo y branding personalizados
- [ ] Variables de entorno en `.env` completas
- [ ] OAuth configurado (si aplica)
- [ ] Push notifications configuradas (si aplica)
- [ ] App testeada en local
- [ ] App desplegada en producción
- [ ] Dominio personalizado configurado
- [ ] SSL/HTTPS funcionando
- [ ] Datos de prueba/demo añadidos (opcional)
- [ ] Documentación entregada al cliente
- [ ] Training/onboarding programado

---

## 🎯 Siguientes Pasos

Después del despliegue:

1. **Onboarding del cliente** (1-2 horas)
   - Mostrar dashboard
   - Crear primeros productos
   - Explicar sistema de permisos
   - Crear empleados

2. **Configuración específica**
   - Importar productos desde Excel
   - Configurar impresoras
   - Integrar con contabilidad (opcional)
   - Configurar delivery (opcional)

3. **Soporte continuo**
   - Canal de Slack/WhatsApp
   - Revisiones semanales
   - Updates mensuales

---

## 💰 Planes y Facturación

| Plan | Usuarios | Empresas | Precio/mes |
|------|----------|----------|------------|
| Básico | 3 | 1 | 49€ |
| Profesional | 15 | 1 | 149€ |
| Premium | ∞ | ∞ | 399€ |

**Trial**: 14 días gratis en todos los planes

---

## 📞 Soporte

- **Email**: soporte@udaredge.com
- **Teléfono**: +34 XXX XXX XXX
- **Slack**: [workspace-soporte]
- **Documentación**: https://docs.udaredge.com

---

## 📝 Changelog

### v1.0.0 (2024-11-27)
- ✅ Release inicial
- ✅ Sistema completo multiempresa
- ✅ App móvil con Capacitor
- ✅ Offline-first con Service Worker
- ✅ Sistema de permisos v2.0

---

**¡Listo! Tu cliente ya tiene Udar Edge funcionando** 🎉
