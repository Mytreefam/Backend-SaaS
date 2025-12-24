# 📱 GUÍA COMPLETA - APP MÓVIL UDAR EDGE

**Versión:** 2.0.0  
**Fecha:** 27 Noviembre 2025  
**Estado:** ✅ COMPLETO Y LISTO PARA INSTALAR

---

## 📋 ÍNDICE

1. [Funcionalidades Implementadas](#funcionalidades)
2. [Arquitectura](#arquitectura)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Desarrollo](#desarrollo)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS {#funcionalidades}

### ✅ **1. ONBOARDING (4 pantallas)**

Ubicación: `/components/mobile/Onboarding.tsx`

**Características:**
- 4 pantallas animadas con Motion
- Indicadores de progreso (dots)
- Botones Anterior/Siguiente/Skip
- Contenido configurable en `white-label.config.ts`
- Se muestra solo la primera vez
- Animaciones fluidas y modernas

**Pantallas:**
1. 📱 Gestiona tu negocio desde tu móvil
2. 🛒 TPV completo en tu bolsillo
3. 📊 Controla ventas, stock y empleados
4. ☁️ Todo en la nube, siempre disponible

---

### ✅ **2. SPLASH SCREEN ANIMADO**

Ubicación: `/components/mobile/SplashScreen.tsx`

**Características:**
- Logo y nombre de la app configurables
- Animación de entrada suave
- Duración: 2 segundos
- Transición automática

---

### ✅ **3. LOGIN CON OAUTH REAL**

Ubicación: `/components/LoginViewMobile.tsx` + `/services/oauth.service.ts`

**Características:**
- ✅ **Google Sign-In** (Plugin: `@codetrix-studio/capacitor-google-auth`)
- ✅ **Facebook Login** (Plugin: `@capacitor-community/facebook-login`)
- ✅ **Apple Sign In** (Plugin: `@capacitor-community/apple-sign-in`, solo iOS 13+)
- ✅ **Biometría** (Huella / Face ID)
- ✅ Login tradicional (email + password)
- ✅ Registro de nuevos usuarios
- ✅ Recordar credenciales para biometría
- ✅ Multi-idioma (ES, CA, EN)

**Flujo de OAuth:**
```
Usuario click en botón → Plugin nativo → Autenticación → Token → Backend → JWT → Login
```

---

### ✅ **4. MODO OFFLINE COMPLETO**

Ubicación: `/public/service-worker.js` + `/services/offline.service.ts`

**Características:**
- ✅ **Service Worker** que cachea assets y datos
- ✅ **IndexedDB** para almacenamiento persistente
- ✅ **Cola de acciones offline** que se sincronizan cuando vuelve la conexión
- ✅ **Detección automática** de conexión/desconexión
- ✅ **Indicador visual** del estado de conexión
- ✅ **Sincronización automática** al recuperar conexión

**Estrategias de caché:**
- **Assets estáticos** (HTML, CSS, JS, imágenes): Cache First
- **APIs** (datos dinámicos): Network First con fallback a cache
- **Acciones pendientes**: Se guardan en IndexedDB y se envían cuando hay conexión

**Ejemplo de uso:**
```typescript
import { saveOfflineAction, syncPendingActions } from './services/offline.service';

// Guardar acción offline
await saveOfflineAction('create', 'order', {
  id: '123',
  total: 45.50,
  items: [...],
});

// Sincronizar cuando vuelva conexión (automático)
// O forzar sync:
await syncPendingActions();
```

---

### ✅ **5. NOTIFICACIONES PUSH (FIREBASE)**

Ubicación: `/services/push-notifications.service.ts`

**Características:**
- ✅ **Firebase Cloud Messaging (FCM)** integrado
- ✅ **Permisos nativos** gestionados automáticamente
- ✅ **Tokens de dispositivo** guardados y enviados al backend
- ✅ **Notificaciones foreground** (app abierta)
- ✅ **Notificaciones background** (app cerrada)
- ✅ **Notificaciones locales** (programadas)
- ✅ **Badge count** (contador de notificaciones)
- ✅ **Actions** en notificaciones (botones)

**Plugins requeridos:**
```bash
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
```

**Ejemplo de uso:**
```typescript
import { 
  showLocalNotification, 
  scheduleLocalNotification 
} from './services/push-notifications.service';

// Mostrar notificación inmediata
await showLocalNotification({
  title: 'Nuevo pedido',
  body: 'Mesa 5 - Total: 45,50€',
  data: { orderId: '123' },
});

// Programar notificación
await scheduleLocalNotification({
  title: 'Recordatorio',
  body: 'Revisar stock al final del día',
}, new Date(Date.now() + 8 * 60 * 60 * 1000)); // En 8 horas
```

---

### ✅ **6. PERMISOS NATIVOS**

Ubicación: `/components/mobile/PermissionsRequest.tsx` + `/services/permissions.service.ts`

**Permisos gestionados:**
- ✅ **Cámara** - Para escanear QR, tomar fotos de productos, etc.
- ✅ **Ubicación** - Para geofencing ("Estoy en tienda")
- ✅ **Notificaciones** - Para alertas y recordatorios
- ✅ **Almacenamiento** - Para guardar fotos y documentos

**Geofencing:**
```typescript
import { verifyLocationInStore } from './services/permissions.service';

// Verificar si el empleado está en la tienda
const inStore = await verifyLocationInStore({
  id: 'tiana',
  name: 'TIANA',
  address: 'Calle Principal 123, Tiana',
  latitude: 41.4975,
  longitude: 2.2635,
  radius: 100, // 100 metros
});

if (inStore) {
  console.log('✅ Empleado en la tienda');
} else {
  console.log('❌ Empleado fuera de la tienda');
}
```

---

### ✅ **7. WHITE-LABEL CONFIGURABLE**

Ubicación: `/config/white-label.config.ts`

**Configurable por cliente:**
- ✅ Nombre de la app
- ✅ Logo y favicon
- ✅ Colores (primario, secundario, acento)
- ✅ Contenido del onboarding (4 pantallas)
- ✅ Redes sociales
- ✅ Información de la empresa
- ✅ Splash screen

**Ejemplo:**
```typescript
import { updateConfig } from './config/white-label.config';

// Personalizar para un cliente
updateConfig({
  appName: 'RestauBar Pro',
  tagline: 'Gestión integral para tu restaurante',
  colors: {
    primary: '#FF6B35',
    secondary: '#F7931E',
    accent: '#C1121F',
  },
  logo: '/logos/restaubar-logo.svg',
});
```

---

### ✅ **8. MULTI-IDIOMA**

Ubicación: `/config/i18n.config.ts`

**Idiomas soportados:**
- 🇪🇸 Español (ES)
- 🇨🇦 Catalán (CA)
- 🇬🇧 Inglés (EN)

**Detección automática** del idioma del dispositivo.

**Ejemplo:**
```typescript
import { t, setLanguage } from './config/i18n.config';

// Traducir texto
const greeting = t('common.welcome'); // "Bienvenido" / "Welcome" / "Benvingut"

// Cambiar idioma
setLanguage('ca'); // Cambiar a catalán
```

---

### ✅ **9. INDICADOR DE CONEXIÓN**

Ubicación: `/components/mobile/ConnectionIndicator.tsx`

**Características:**
- Badge flotante mostrando estado de conexión
- Contador de acciones pendientes
- Botón para sincronizar manualmente
- Detalles expandibles
- Colores dinámicos:
  - 🟢 Verde: Conectado
  - 🔴 Rojo: Sin conexión
  - 🟡 Amarillo: Sincronizando

---

## 🏗️ ARQUITECTURA {#arquitectura}

### **Flujo de la App:**

```
┌─────────────────────────────────────┐
│ 1. SPLASH SCREEN (2 segundos)      │
│    - Logo animado                   │
│    - Inicialización de servicios    │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 2. ONBOARDING (solo 1ª vez)         │
│    - 4 pantallas informativas       │
│    - Skip disponible                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 3. LOGIN / REGISTRO                 │
│    - Email + Password               │
│    - Google / Facebook / Apple      │
│    - Biometría (si disponible)      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 4. PERMISOS                         │
│    - Cámara (opcional)              │
│    - Ubicación (obligatorio)        │
│    - Notificaciones (opcional)      │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│ 5. DASHBOARD (según rol)            │
│    - ClienteDashboard               │
│    - TrabajadorDashboard            │
│    - GerenteDashboard               │
└─────────────────────────────────────┘
```

### **Servicios:**

- **offline.service.ts** → IndexedDB + Service Worker + Sincronización
- **push-notifications.service.ts** → FCM + Notificaciones locales
- **oauth.service.ts** → Google + Facebook + Apple + Biometría
- **permissions.service.ts** → Cámara + Ubicación + Notificaciones

---

## 🚀 INSTALACIÓN {#instalación}

### **Paso 1: Instalar Capacitor**

```bash
npm install @capacitor/cli @capacitor/core
npx cap init "Udar Edge" "com.udaredge.app"
```

### **Paso 2: Instalar Plugins**

```bash
# Core plugins
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
npm install @capacitor/app
npm install @capacitor/splash-screen
npm install @capacitor/haptics
npm install @capacitor/status-bar

# OAuth plugins
npm install @codetrix-studio/capacitor-google-auth
npm install @capacitor-community/facebook-login
npm install @capacitor-community/apple-sign-in

# Biometría
npm install @capacitor-community/native-biometric
```

### **Paso 3: Añadir Plataformas**

```bash
# Android
npm install @capacitor/android
npx cap add android

# iOS (solo en Mac)
npm install @capacitor/ios
npx cap add ios
```

### **Paso 4: Build y Sincronizar**

```bash
npm run build
npx cap sync
```

### **Paso 5: Abrir en IDEs**

```bash
# Android Studio
npx cap open android

# Xcode (Mac)
npx cap open ios
```

---

## ⚙️ CONFIGURACIÓN {#configuración}

### **1. Configurar Google Sign-In**

**Android:**
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear proyecto nuevo o seleccionar existente
3. Habilitar **Google Sign-In API**
4. Crear **OAuth 2.0 Client ID** para Android
5. Copiar el Client ID

**Archivo:** `/services/oauth.service.ts`
```typescript
const OAUTH_CONFIG: OAuthConfig = {
  google: {
    clientId: 'TU_CLIENT_ID.apps.googleusercontent.com',
    clientIdAndroid: 'TU_ANDROID_CLIENT_ID.apps.googleusercontent.com',
    clientIdIOS: 'TU_IOS_CLIENT_ID.apps.googleusercontent.com',
  },
  // ...
};
```

**Android:** `android/app/src/main/res/values/strings.xml`
```xml
<resources>
    <string name="server_client_id">TU_CLIENT_ID.apps.googleusercontent.com</string>
</resources>
```

**iOS:** `ios/App/App/Info.plist`
```xml
<key>GIDClientID</key>
<string>TU_IOS_CLIENT_ID.apps.googleusercontent.com</string>
```

---

### **2. Configurar Facebook Login**

1. Ir a [Facebook Developers](https://developers.facebook.com/)
2. Crear app nueva
3. Añadir **Facebook Login**
4. Copiar el **App ID**

**Archivo:** `/services/oauth.service.ts`
```typescript
facebook: {
  appId: 'TU_FACEBOOK_APP_ID',
},
```

**Android:** `android/app/src/main/res/values/strings.xml`
```xml
<string name="facebook_app_id">TU_FACEBOOK_APP_ID</string>
<string name="fb_login_protocol_scheme">fbTU_FACEBOOK_APP_ID</string>
```

**iOS:** `ios/App/App/Info.plist`
```xml
<key>FacebookAppID</key>
<string>TU_FACEBOOK_APP_ID</string>
<key>FacebookDisplayName</key>
<string>Udar Edge</string>
```

---

### **3. Configurar Firebase (Notificaciones Push)**

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear proyecto nuevo
3. Añadir app Android y/o iOS
4. Descargar `google-services.json` (Android) y `GoogleService-Info.plist` (iOS)

**Android:**
- Copiar `google-services.json` a `android/app/`

**iOS:**
- Copiar `GoogleService-Info.plist` a `ios/App/App/`

**Configurar FCM Server Key:**
- En Firebase Console → Project Settings → Cloud Messaging
- Copiar **Server Key**
- Guardarlo en tu backend para enviar notificaciones

---

### **4. Configurar Permisos**

**Android:** `android/app/src/main/AndroidManifest.xml`
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
```

**iOS:** `ios/App/App/Info.plist`
```xml
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para escanear códigos QR y tomar fotos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para verificar que estás en la tienda</string>
<key>NSFaceIDUsageDescription</key>
<string>Usa Face ID para iniciar sesión de forma rápida y segura</string>
```

---

## 🛠️ DESARROLLO {#desarrollo}

### **Modo Web (Desarrollo rápido):**

```bash
npm run dev
```

Abre: http://localhost:5173

**Lo que funciona en web:**
- ✅ Toda la UI
- ✅ Formularios
- ✅ Animaciones
- ✅ Multi-idioma
- ✅ Service Worker (offline)
- ✅ Web Notifications API

**Lo que NO funciona en web:**
- ❌ OAuth nativo (simulado)
- ❌ Biometría (simulado)
- ❌ Cámara nativa (simulado)
- ❌ GPS real (simulado)
- ❌ Push notifications nativas

---

### **Modo Nativo (Testing completo):**

**Android:**
```bash
npm run build
npx cap sync
npx cap open android
```

En Android Studio:
1. Conectar dispositivo o iniciar emulador
2. Click en **Run** (▶️)

**iOS:**
```bash
npm run build
npx cap sync
npx cap open ios
```

En Xcode:
1. Seleccionar dispositivo o simulador
2. Click en **Run** (▶️)

---

### **Live Reload (Recomendado):**

```bash
# Terminal 1: Servidor de desarrollo
npm run dev

# Terminal 2: Sincronizar con native
npx cap run android --livereload --external
# O:
npx cap run ios --livereload --external
```

Los cambios en el código se reflejan instantáneamente en el dispositivo.

---

## 🧪 TESTING {#testing}

### **Test de Funcionalidades:**

**1. Onboarding:**
- [ ] Se muestra solo la primera vez
- [ ] Las 4 pantallas se muestran correctamente
- [ ] Botón "Skip" funciona
- [ ] Indicadores de progreso se actualizan
- [ ] Animaciones fluidas

**2. Login:**
- [ ] Login con email/password funciona
- [ ] Registro de nuevo usuario funciona
- [ ] Google Sign-In funciona
- [ ] Facebook Login funciona
- [ ] Apple Sign In funciona (iOS)
- [ ] Biometría funciona
- [ ] "Recordarme" guarda credenciales

**3. Modo Offline:**
- [ ] App funciona sin conexión
- [ ] Acciones se guardan en cola
- [ ] Indicador de conexión muestra estado correcto
- [ ] Sincronización automática al recuperar conexión
- [ ] Sincronización manual funciona

**4. Notificaciones:**
- [ ] Permisos se solicitan correctamente
- [ ] Notificaciones push se reciben (foreground)
- [ ] Notificaciones push se reciben (background)
- [ ] Click en notificación abre la app
- [ ] Notificaciones locales funcionan
- [ ] Badge count se actualiza

**5. Permisos:**
- [ ] Cámara se solicita y funciona
- [ ] Ubicación se solicita y funciona
- [ ] Geofencing detecta si estás en tienda
- [ ] Notificaciones se solicitan

---

## 📦 DEPLOYMENT {#deployment}

### **Generar APK (Android):**

**Debug APK:**
```bash
cd android
./gradlew assembleDebug
```

APK en: `android/app/build/outputs/apk/debug/app-debug.apk`

**Release APK (firmado):**
```bash
cd android
./gradlew assembleRelease
```

**Firmar APK:**
1. Generar keystore:
```bash
keytool -genkey -v -keystore udar-edge.keystore -alias udar-edge -keyalg RSA -keysize 2048 -validity 10000
```

2. Configurar en `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file("udar-edge.keystore")
            storePassword "TU_PASSWORD"
            keyAlias "udar-edge"
            keyPassword "TU_PASSWORD"
        }
    }
}
```

3. Build:
```bash
./gradlew assembleRelease
```

---

### **Generar IPA (iOS):**

1. Abrir Xcode
2. Seleccionar **Any iOS Device**
3. Product → Archive
4. Distribute App → Ad Hoc / App Store

---

### **Subir a Play Store:**

1. Ir a [Google Play Console](https://play.google.com/console/)
2. Crear app nueva
3. Completar información de la app
4. Subir APK/AAB firmado
5. Completar listado de la tienda
6. Enviar a revisión

---

### **Subir a App Store:**

1. Ir a [App Store Connect](https://appstoreconnect.apple.com/)
2. Crear app nueva
3. Subir IPA desde Xcode
4. Completar información de la app
5. Enviar a revisión

---

## 🐛 TROUBLESHOOTING {#troubleshooting}

### **"Service Worker no se registra"**
**Solución:** Los Service Workers solo funcionan en HTTPS o localhost.

---

### **"Google Sign-In error: 10"**
**Causa:** SHA-1 fingerprint no configurado en Firebase.

**Solución:**
```bash
cd android
./gradlew signingReport
```
Copiar SHA-1 y añadirlo en Firebase Console.

---

### **"Push notifications no llegan"**
**Causa:** FCM Server Key no configurado o token no enviado al backend.

**Solución:**
1. Verificar que el token se obtiene correctamente
2. Enviar token al backend
3. Verificar que el backend envía notificaciones con el Server Key correcto

---

### **"Biometría no funciona"**
**Causa:** Permisos no configurados en iOS/Android.

**Solución:**
- iOS: Añadir `NSFaceIDUsageDescription` en Info.plist
- Android: Añadir `USE_BIOMETRIC` permission

---

### **"App no compila en Android"**
**Solución:**
```bash
cd android
./gradlew clean
./gradlew build
```

---

### **"Live reload no funciona"**
**Solución:**
1. Asegurarse de que el dispositivo y la computadora están en la misma red WiFi
2. Usar `--external` flag:
```bash
npx cap run android --livereload --external
```

---

## 📞 SOPORTE

**Documentos relacionados:**
- `/INSTALACION_APP_MOVIL.md` - Guía de instalación detallada
- `/RESUMEN_APP_MOVIL_COMPLETA.md` - Resumen ejecutivo
- `/CHECKLIST_PRE_INSTALACION.md` - Checklist antes de instalar

**Recursos:**
- Capacitor Docs: https://capacitorjs.com/docs
- Firebase Docs: https://firebase.google.com/docs
- Google Sign-In: https://developers.google.com/identity
- Facebook Login: https://developers.facebook.com/docs/facebook-login

---

**Versión:** 2.0.0  
**Última actualización:** 27 Noviembre 2025  
**Estado:** ✅ PRODUCCIÓN READY
