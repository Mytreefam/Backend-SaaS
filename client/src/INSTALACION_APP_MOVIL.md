# 📱 INSTALACIÓN Y CONFIGURACIÓN - APP MÓVIL UDAR EDGE

**Versión:** 1.0.0  
**Fecha:** 27 Noviembre 2025  
**Estado:** ✅ Completado - Listo para instalar

---

## 🎉 LO QUE SE HA CREADO

### ✅ **Componentes Móviles Completos:**

1. **SplashScreen.tsx** - Pantalla de carga animada (estilo Netflix/Uber)
2. **Onboarding.tsx** - Tutorial de 4 pantallas con animaciones
3. **PermissionsRequest.tsx** - Solicitud de permisos nativos paso a paso
4. **LoginViewMobile.tsx** - Login + Registro completo con OAuth preparado
5. **App.mobile.tsx** - Punto de entrada que orquesta todo el flujo

### ✅ **Configuración:**

6. **white-label.config.ts** - Configuración por cliente (nombre, logo, colores)
7. **i18n.config.ts** - Multi-idioma (Español, Catalán, Inglés)
8. **capacitor.config.ts** - Configuración de Capacitor

### ✅ **Servicios:**

9. **permissions.service.ts** - Gestión completa de permisos nativos
   - Cámara (foto, documentos, OCR, QR)
   - Ubicación (verificación de fichaje, "Estoy en tienda")
   - Notificaciones push
   - Almacenamiento

---

## 🚀 PASOS DE INSTALACIÓN

### **PASO 1: Instalar Dependencias de Capacitor**

```bash
# Instalar Capacitor CLI y Core
npm install @capacitor/cli @capacitor/core

# Instalar plugins nativos
npm install @capacitor/camera
npm install @capacitor/geolocation
npm install @capacitor/push-notifications
npm install @capacitor/app
npm install @capacitor/splash-screen
npm install @capacitor/haptics
npm install @capacitor/status-bar

# Plugin de biometría (comunidad)
npm install @capacitor-community/native-biometric

# Instalar Motion (ya debería estar)
npm install motion

# Instalar librerías adicionales para UI
npm install react-router-dom
```

---

### **PASO 2: Inicializar Capacitor**

```bash
# Inicializar Capacitor
npx cap init "Udar Edge" "com.udaredge.app"

# Esto creará el archivo capacitor.config.ts (ya está creado)
```

---

### **PASO 3: Añadir Plataformas**

#### **Android:**
```bash
npm install @capacitor/android
npx cap add android
```

#### **iOS:**
```bash
npm install @capacitor/ios
npx cap add ios
```

---

### **PASO 4: Configurar Permisos**

#### **Android - `android/app/src/main/AndroidManifest.xml`**

Añadir estos permisos DENTRO del tag `<manifest>`:

```xml
<!-- Permisos de Cámara -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Permisos de Ubicación -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Permisos de Notificaciones -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- Permisos de Almacenamiento (Android <13) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Internet -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Vibración -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- Biometría -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

#### **iOS - `ios/App/App/Info.plist`**

Añadir estas claves:

```xml
<!-- Cámara -->
<key>NSCameraUsageDescription</key>
<string>Necesitamos acceso a tu cámara para escanear documentos, códigos QR y tomar fotos de perfil.</string>

<!-- Galería de fotos -->
<key>NSPhotoLibraryUsageDescription</key>
<string>Necesitamos acceso a tus fotos para que puedas seleccionar imágenes.</string>

<!-- Ubicación cuando se usa la app -->
<key>NSLocationWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para verificar que estás en el punto de venta al fichar.</string>

<!-- Ubicación siempre (opcional) -->
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Necesitamos tu ubicación para rastrear pedidos de delivery.</string>

<!-- Notificaciones (no requiere permiso en Info.plist, pero es bueno documentar) -->

<!-- Biometría -->
<key>NSFaceIDUsageDescription</key>
<string>Usa Face ID para iniciar sesión de forma rápida y segura.</string>
```

---

### **PASO 5: Build del Frontend**

```bash
# Build de producción
npm run build

# Esto generará la carpeta /dist con todo el código optimizado
```

---

### **PASO 6: Sincronizar con Capacitor**

```bash
# Copiar el build a las plataformas nativas
npx cap sync

# O sincronizar solo una plataforma
npx cap sync android
npx cap sync ios
```

---

### **PASO 7: Abrir en IDE Nativo**

#### **Android (Android Studio):**
```bash
npx cap open android
```

Esto abrirá Android Studio. Luego:
1. Espera a que Gradle termine de sincronizar
2. Conecta un dispositivo Android o inicia un emulador
3. Click en el botón verde "Run" ▶️
4. ¡La app se instalará y abrirá!

#### **iOS (Xcode) - Solo en Mac:**
```bash
npx cap open ios
```

Esto abrirá Xcode. Luego:
1. Selecciona un dispositivo iOS o simulador
2. Click en el botón "Play" ▶️
3. ¡La app se instalará y abrirá!

---

## 🎨 PERSONALIZACIÓN WHITE-LABEL

### **Cambiar Nombre, Logo y Colores para un Cliente**

Edita el archivo `/config/white-label.config.ts`:

```typescript
export const WHITE_LABEL_CONFIG: WhiteLabelConfig = {
  // CAMBIAR ESTOS VALORES PARA CADA CLIENTE
  appName: 'Nombre del Cliente',
  appSlogan: 'Su slogan personalizado',
  companyName: 'Empresa del Cliente S.L.',
  
  // Logo (colocar en /public/)
  logo: '/logo-cliente.svg',
  logoLight: '/logo-cliente-light.svg',
  icon: '/icon-512.png',
  
  // Colores (Tailwind CSS)
  colors: {
    primary: '#0d9488',    // Cambiar por color principal del cliente
    secondary: '#14b8a6',
    accent: '#2dd4bf',
    background: '#ffffff',
    text: '#1f2937',
  },
  
  // Contacto
  contact: {
    email: 'soporte@cliente.com',
    phone: '+34 XXX XXX XXX',
    website: 'https://cliente.com',
    address: 'Dirección del cliente',
  },
  
  // ... resto de configuración
};
```

**Después de cambiar:**
```bash
npm run build
npx cap sync
```

---

## 🔐 CONFIGURAR OAUTH (Google, Facebook, Apple)

### **Google OAuth**

1. **Crear proyecto en Google Cloud Console:**
   - Ir a: https://console.cloud.google.com
   - Crear nuevo proyecto
   - Ir a "APIs & Services" → "Credentials"
   - Crear "OAuth 2.0 Client ID"
   - Tipo: "Web application"
   - Authorized redirect URIs: `https://tudominio.com/auth/google/callback`

2. **Obtener credenciales:**
   - Client ID: `xxxxx.apps.googleusercontent.com`
   - Client Secret: `xxxxx`

3. **Configurar en backend:**
   ```typescript
   GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=xxxxx
   ```

---

### **Facebook OAuth**

1. **Crear app en Facebook Developers:**
   - Ir a: https://developers.facebook.com
   - Crear nueva app
   - Tipo: "Consumer"
   - Ir a "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs: `https://tudominio.com/auth/facebook/callback`

2. **Obtener credenciales:**
   - App ID: `1234567890`
   - App Secret: `xxxxx`

3. **Configurar en backend:**
   ```typescript
   FACEBOOK_APP_ID=1234567890
   FACEBOOK_APP_SECRET=xxxxx
   ```

---

### **Apple Sign In** (Obligatorio para App Store)

1. **Crear App ID:**
   - Ir a: https://developer.apple.com/account
   - Certificates, Identifiers & Profiles
   - Identifiers → App IDs
   - Crear nuevo App ID
   - Habilitar "Sign in with Apple"

2. **Crear Service ID:**
   - Identifiers → Services IDs
   - Return URLs: `https://tudominio.com/auth/apple/callback`

3. **Crear Key:**
   - Keys → Create new key
   - Habilitar "Sign in with Apple"
   - Descargar `.p8` file

4. **Configurar en backend:**
   ```typescript
   APPLE_CLIENT_ID=com.udaredge.service
   APPLE_TEAM_ID=XXXXXXXXXX
   APPLE_KEY_ID=XXXXXXXXXX
   APPLE_PRIVATE_KEY=contenido del archivo .p8
   ```

---

## 📲 NOTIFICACIONES PUSH

### **Firebase Cloud Messaging (FCM)**

1. **Crear proyecto en Firebase:**
   - Ir a: https://console.firebase.google.com
   - Crear nuevo proyecto
   - Ir a "Project settings" → "Cloud Messaging"
   - Copiar "Server key"

2. **Configurar Android:**
   - Descargar `google-services.json`
   - Colocar en `android/app/`
   
3. **Configurar iOS:**
   - Descargar `GoogleService-Info.plist`
   - Colocar en `ios/App/App/`

4. **Configurar en backend:**
   ```typescript
   FIREBASE_SERVER_KEY=xxxxx
   ```

5. **Registrar dispositivo en el frontend:**
   ```typescript
   // Ya está implementado en permissions.service.ts
   await PushNotifications.register();
   
   // Obtener token
   PushNotifications.addListener('registration', (token) => {
     console.log('Push token:', token.value);
     // Enviar al backend
     fetch('/api/devices/register-token', {
       method: 'POST',
       body: JSON.stringify({ token: token.value, userId: currentUser.id }),
     });
   });
   ```

---

## 🔄 FLUJO COMPLETO DE LA APP

### **Primera vez que abre la app:**

```
1. Splash Screen (2 segundos)
   ↓
2. Onboarding (4 pantallas)
   ↓
3. Login/Registro
   ↓
4. Solicitud de permisos (Cámara, Ubicación, Notificaciones)
   ↓
5. Dashboard principal
```

### **Segunda vez en adelante:**

```
1. Splash Screen (2 segundos)
   ↓
2. Login (o automático si guardó sesión)
   ↓
3. Dashboard principal
```

### **Con biometría activada:**

```
1. Splash Screen (2 segundos)
   ↓
2. Biometría (huella/Face ID)
   ↓
3. Dashboard principal
```

---

## 🧪 TESTING

### **Probar en navegador (desarrollo):**

```bash
npm run dev
```

**Nota:** Algunas funciones nativas no estarán disponibles en navegador:
- Cámara → Simulada
- Ubicación → Coordenadas de prueba
- Notificaciones push → No disponibles
- Biometría → No disponible

### **Probar en dispositivo real:**

#### **Android:**
1. Habilitar "Opciones de desarrollador" en tu Android
2. Habilitar "Depuración USB"
3. Conectar por USB
4. En Android Studio → Run

#### **iOS:**
1. Conectar iPhone por cable
2. En Xcode → Seleccionar tu dispositivo
3. Run (necesitas cuenta de Apple Developer)

---

## 📦 GENERAR APK/AAB PARA PUBLICAR

### **Android APK (Debug):**

En Android Studio:
1. Build → Build Bundle(s) / APK(s) → Build APK(s)
2. Esperar a que compile
3. APK generado en: `android/app/build/outputs/apk/debug/app-debug.apk`

### **Android AAB (Release - Google Play):**

```bash
# En Android Studio:
# Build → Generate Signed Bundle / APK
# Seleccionar "Android App Bundle"
# Crear o usar keystore existente
# AAB generado en: android/app/build/outputs/bundle/release/
```

### **iOS IPA (Release - App Store):**

En Xcode:
1. Product → Archive
2. Esperar a que compile
3. Distribute App → App Store Connect
4. Seguir wizard de publicación

---

## 🌍 VARIABLES DE ENTORNO

Crear archivo `.env` en la raíz:

```bash
# API Backend
VITE_API_URL=https://api.udaredge.com/v1
VITE_API_URL_DEV=http://localhost:3000/api

# OAuth
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=1234567890
VITE_APPLE_CLIENT_ID=com.udaredge.service

# Firebase
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_PROJECT_ID=udar-edge

# Make.com Webhooks
VITE_MAKE_WEBHOOK_NEW_ORDER=https://hook.eu2.make.com/xxx
```

Acceder en código:
```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Plugin not implemented"**

Significa que el plugin nativo no está instalado correctamente.

**Solución:**
```bash
npm install @capacitor/nombre-plugin
npx cap sync
```

---

### **Error: "Gradle build failed"**

**Solución:**
```bash
cd android
./gradlew clean
cd ..
npx cap sync android
```

---

### **Error: "CocoaPods not installed" (iOS)**

**Solución:**
```bash
sudo gem install cocoapods
cd ios/App
pod install
cd ../..
```

---

### **La app no se actualiza después de cambios**

**Solución:**
```bash
npm run build
npx cap sync
# Luego recompilar en Android Studio o Xcode
```

---

## 📋 CHECKLIST ANTES DE PUBLICAR

### **Funcionalidad:**
- [ ] Login funciona correctamente
- [ ] Registro crea usuarios correctamente
- [ ] OAuth (Google, Facebook, Apple) funciona
- [ ] Biometría funciona en dispositivos reales
- [ ] Permisos se solicitan correctamente
- [ ] Cámara toma fotos
- [ ] Ubicación detecta coordenadas
- [ ] Notificaciones push llegan
- [ ] Offline mode funciona
- [ ] App no crashea

### **Diseño:**
- [ ] Logo del cliente está en `/public/`
- [ ] Colores configurados en `white-label.config.ts`
- [ ] Textos de onboarding personalizados
- [ ] Splash screen con logo correcto
- [ ] Iconos de app generados (ver siguiente sección)

### **Configuración:**
- [ ] `capacitor.config.ts` con appId correcto
- [ ] Permisos en AndroidManifest.xml
- [ ] Permisos en Info.plist (iOS)
- [ ] Variables de entorno configuradas
- [ ] Firebase configurado (si se usan push)
- [ ] OAuth configurado en consolas

### **Build:**
- [ ] APK/AAB generado sin errores
- [ ] IPA generado sin errores (iOS)
- [ ] Probado en dispositivo real Android
- [ ] Probado en dispositivo real iOS

---

## 🎨 GENERAR ICONOS Y SPLASH SCREENS

### **Opción 1: Herramienta Online**

1. Ir a: https://capacitor ionic.com/docs/guides/splash-screens-and-icons
2. Subir logo de 1024x1024px (PNG con fondo transparente)
3. Descargar assets generados
4. Colocar en:
   - Android: `android/app/src/main/res/`
   - iOS: `ios/App/App/Assets.xcassets/`

### **Opción 2: CLI de Capacitor**

```bash
# Instalar herramienta
npm install -g @capacitor/assets

# Colocar tu logo en:
# - /resources/icon.png (1024x1024)
# - /resources/splash.png (2732x2732)

# Generar assets
npx capacitor-assets generate
```

---

## 📞 SOPORTE

¿Problemas con la instalación?

1. Revisar `/GUIA_BACKEND_DEVELOPER.md`
2. Revisar documentación oficial: https://capacitorjs.com/docs
3. Contactar al equipo de desarrollo

---

## ✅ ¡LISTO!

Tu app móvil Udar Edge está completamente configurada y lista para:

- ✅ Instalarse en Android y iOS
- ✅ Funcionar offline
- ✅ Enviar notificaciones push
- ✅ Usar cámara y ubicación
- ✅ Autenticación con biometría
- ✅ OAuth con Google, Facebook y Apple
- ✅ White-label para múltiples clientes
- ✅ Multi-idioma (ES, CA, EN)

**¡Ahora solo falta conectar el backend y publicar en las tiendas!** 🚀

---

**Versión:** 1.0.0  
**Última actualización:** 27 Noviembre 2025
