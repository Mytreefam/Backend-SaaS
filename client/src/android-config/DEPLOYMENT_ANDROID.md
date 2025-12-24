# 🚀 Guía de Despliegue Android - UDAR EDGE

**Fecha:** 27 de noviembre de 2024  
**Versión:** 1.0.0  
**Estado:** ✅ Listo para producción

---

## 📋 ÍNDICE

1. [Prerequisitos](#prerequisitos)
2. [Configuración Inicial](#configuración-inicial)
3. [Generar APK de Producción](#generar-apk-de-producción)
4. [Generar AAB para Play Store](#generar-aab-para-play-store)
5. [Firmar la Aplicación](#firmar-la-aplicación)
6. [Google Play Console](#google-play-console)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 1️⃣ PREREQUISITOS

### ✅ Software Necesario

- [ ] **Node.js** v18+ y npm
- [ ] **Android Studio** Flamingo o superior
- [ ] **JDK** 11 o 17
- [ ] **Android SDK** (API 33+)
- [ ] **Capacitor CLI** v5+

```bash
# Verificar versiones
node -v                    # >= v18.0.0
npm -v                     # >= 9.0.0
java -version             # 11 o 17
./gradlew --version       # >= 7.5
```

### ✅ Cuentas Necesarias

- [ ] **Google Play Console** (cuenta de desarrollador, $25 único)
- [ ] **Firebase** (proyecto creado)
- [ ] **Google Cloud Console** (para OAuth)
- [ ] **Signing Key** (keystore generado)

---

## 2️⃣ CONFIGURACIÓN INICIAL

### Paso 1: Copiar Archivos de Configuración

```bash
# Desde la raíz del proyecto
cd /tu-proyecto/

# Copiar archivos de configuración
cp android-config/proguard-rules.pro android/app/proguard-rules.pro
cp android-config/build.gradle.template android/app/build.gradle
cp android-config/AndroidManifest.template.xml android/app/src/main/AndroidManifest.xml

# Copiar recursos
cp -r android-config/res/* android/app/src/main/res/

# Copiar google-services.json (después de configurarlo)
cp android-config/google-services.json android/app/google-services.json
```

### Paso 2: Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Variables críticas para Android:**

```bash
# Firebase
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_PROJECT_ID=udar-edge
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:android:xxxxxxxxxxxxxxxx

# Google OAuth
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com

# API
VITE_API_URL=https://api.udaredge.com/v1
```

### Paso 3: Configurar Firebase

1. **Ir a [Firebase Console](https://console.firebase.google.com/)**

2. **Crear proyecto** (si no existe):
   - Nombre: `udar-edge`
   - Habilitar Google Analytics (opcional)

3. **Añadir app Android**:
   - Package name: `com.udaredge.app`
   - Nickname: `Udar Edge Android`
   - SHA-1: Obtener con `keytool` (ver más abajo)

4. **Descargar `google-services.json`**:
   ```bash
   # Colocar en:
   android/app/google-services.json
   ```

5. **Habilitar servicios**:
   - [ ] Cloud Messaging (Push Notifications)
   - [ ] Analytics (opcional)
   - [ ] Crashlytics (recomendado)

### Paso 4: Generar SHA-1 para Firebase

```bash
# Debug SHA-1 (para desarrollo)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release SHA-1 (para producción)
keytool -list -v -keystore android/app/udar-edge-release.keystore -alias udar-edge-key
```

Copiar el SHA-1 y añadirlo en Firebase Console.

### Paso 5: Configurar Keystore (Signing)

Crear archivo `android/keystore.properties`:

```properties
storePassword=tu_password_super_seguro
keyPassword=tu_password_super_seguro
keyAlias=udar-edge-key
storeFile=udar-edge-release.keystore
```

⚠️ **IMPORTANTE:** Añadir `keystore.properties` a `.gitignore`

---

## 3️⃣ GENERAR APK DE PRODUCCIÓN

### Opción A: Script Automatizado (Recomendado)

```bash
# Desde la raíz del proyecto
npm run build:android
```

### Opción B: Manual

```bash
# 1. Build del frontend
npm run build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Copiar assets
npx cap copy android

# 4. Abrir Android Studio
npx cap open android
```

En Android Studio:

1. **Build > Generate Signed Bundle / APK**
2. Seleccionar **APK**
3. Elegir keystore y alias
4. Build Type: **release**
5. Signature Versions: **V1 y V2** ✅
6. Click **Finish**

**APK generado en:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Verificar APK

```bash
# Instalar en dispositivo conectado
adb install android/app/build/outputs/apk/release/app-release.apk

# Ver logs
adb logcat | grep Capacitor
```

---

## 4️⃣ GENERAR AAB PARA PLAY STORE

### ¿Por qué AAB?

- ✅ **Requerido** por Google Play Store desde 2021
- ✅ App más pequeña (Google optimiza por dispositivo)
- ✅ Dynamic Delivery
- ✅ App Bundles

### Generar AAB

```bash
# Desde Android Studio:
# Build > Generate Signed Bundle / APK > Android App Bundle

# O desde terminal:
cd android
./gradlew bundleRelease
```

**AAB generado en:**
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Verificar AAB

```bash
# Instalar bundletool
# https://github.com/google/bundletool/releases

# Generar APKs desde AAB
java -jar bundletool.jar build-apks \
  --bundle=app-release.aab \
  --output=app.apks \
  --ks=udar-edge-release.keystore \
  --ks-pass=pass:tu_password \
  --ks-key-alias=udar-edge-key \
  --key-pass=pass:tu_password

# Instalar en dispositivo
java -jar bundletool.jar install-apks --apks=app.apks
```

---

## 5️⃣ FIRMAR LA APLICACIÓN

### Crear Keystore (Primera vez)

```bash
keytool -genkey -v \
  -keystore android/app/udar-edge-release.keystore \
  -alias udar-edge-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass tu_password_super_seguro \
  -keypass tu_password_super_seguro \
  -dname "CN=Udar Edge, OU=Mobile, O=Udar Technologies, L=Madrid, ST=Madrid, C=ES"
```

### ⚠️ BACKUP del Keystore

```bash
# CRÍTICO: Hacer backup en lugar seguro
# Si pierdes el keystore, NO PODRÁS actualizar la app en Play Store

# Opción 1: Google Drive encriptado
# Opción 2: 1Password / Bitwarden
# Opción 3: USB encriptado

# Backup recomendado:
cp android/app/udar-edge-release.keystore ~/Backups/
zip -e udar-edge-keystore-backup.zip android/app/udar-edge-release.keystore
```

### Configurar Signing en Gradle

Editar `android/app/build.gradle`:

```gradle
android {
    ...
    
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("keystore.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 6️⃣ GOOGLE PLAY CONSOLE

### Paso 1: Crear Aplicación

1. **Ir a [Play Console](https://play.google.com/console/)**

2. **Crear aplicación**:
   - Nombre: `Udar Edge`
   - Idioma predeterminado: `Español (España)`
   - App o Juego: `App`
   - Gratis o de pago: `Gratis`

3. **Configurar ficha**:
   - Descripción corta (80 caracteres)
   - Descripción completa (4000 caracteres)
   - Capturas de pantalla (mínimo 2 por tipo)
   - Icono (512x512 PNG)
   - Imagen de funciones (1024x500)

### Paso 2: Subir AAB

1. **Producción > Crear nueva versión**
2. **Subir** `app-release.aab`
3. **Nombre de versión**: `1.0.0`
4. **Código de versión**: `1` (auto-incrementa)
5. **Notas de la versión** (en español e inglés)

### Paso 3: Configurar Contenido

- [ ] **Clasificación de contenido** (cuestionario)
- [ ] **Público objetivo** (Adultos)
- [ ] **Política de privacidad** (URL)
- [ ] **Categoría** (Productividad / Negocios)
- [ ] **Información de contacto**

### Paso 4: Publicar

1. **Revisar**:
   - [ ] Todas las secciones completadas
   - [ ] Sin errores ni warnings

2. **Enviar a revisión**:
   - Tiempo estimado: 1-7 días
   - Google revisará manualmente

3. **Seguimiento**:
   - Recibir emails de Google
   - Estado en Play Console

---

## 7️⃣ TESTING

### Testing Local

```bash
# Instalar en emulador
npm run android

# Instalar en dispositivo físico
adb devices
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Testing Interno (Play Console)

1. **Crear track de prueba interna**
2. **Añadir testers** (emails)
3. **Subir AAB**
4. **Compartir link** de descarga

### Testing Cerrado

- **Alpha Track**: 20-50 testers
- **Beta Track**: 100-1000 testers

### Testing Abierto

- Disponible para cualquiera con el link
- Máximo 20,000 testers

---

## 8️⃣ TROUBLESHOOTING

### ❌ Error: "google-services.json not found"

```bash
# Verificar ubicación
ls -la android/app/google-services.json

# Copiar desde template
cp android-config/google-services.json.example android-config/google-services.json
# Editar con datos reales
# Copiar a android/app/
```

### ❌ Error: "Keystore not found"

```bash
# Verificar keystore.properties
cat android/keystore.properties

# Verificar que existe el keystore
ls -la android/app/udar-edge-release.keystore

# Si no existe, generar uno nuevo (ver sección Signing)
```

### ❌ Error: "Invalid package name"

Verificar en:
- `capacitor.config.ts`: `appId: "com.udaredge.app"`
- `android/app/build.gradle`: `applicationId "com.udaredge.app"`
- `AndroidManifest.xml`: `package="com.udaredge.app"`

### ❌ Error: "ProGuard fails"

```bash
# Verificar sintaxis
cat android/app/proguard-rules.pro

# Desactivar temporalmente (solo para debug)
# En build.gradle:
buildTypes {
    release {
        minifyEnabled false
    }
}
```

### ❌ Error: "Firebase initialization failed"

1. Verificar `google-services.json` tiene datos correctos
2. Verificar package name coincide
3. Verificar SHA-1 añadido en Firebase

### ❌ APK muy pesada (>100MB)

```bash
# Habilitar ProGuard (ya está en build.gradle)
# Habilitar App Bundle (AAB) en lugar de APK

# Verificar tamaño
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Analizar con Android Studio:
# Build > Analyze APK
```

### ❌ Crash al abrir la app

```bash
# Ver logs de Capacitor
adb logcat | grep Capacitor

# Ver logs de Firebase Crashlytics
# Firebase Console > Crashlytics

# Verificar ProGuard no eliminó clases necesarias
# Añadir reglas en proguard-rules.pro
```

---

## 📦 RESUMEN DE ARCHIVOS

| Archivo | Ubicación | Descripción |
|---------|-----------|-------------|
| `proguard-rules.pro` | `android/app/` | Reglas de ofuscación |
| `google-services.json` | `android/app/` | Config Firebase |
| `keystore.properties` | `android/` | Credenciales signing |
| `udar-edge-release.keystore` | `android/app/` | Keystore producción |
| `build.gradle` | `android/app/` | Config Gradle |
| `AndroidManifest.xml` | `android/app/src/main/` | Manifest Android |
| `strings.xml` | `android/app/src/main/res/values/` | Strings app |
| `colors.xml` | `android/app/src/main/res/values/` | Colores app |
| `file_paths.xml` | `android/app/src/main/res/xml/` | Rutas de archivos |
| `network_security_config.xml` | `android/app/src/main/res/xml/` | Config seguridad red |

---

## 📚 RECURSOS ADICIONALES

### Documentación Oficial

- [Capacitor Android](https://capacitorjs.com/docs/android)
- [Firebase Android](https://firebase.google.com/docs/android/setup)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [ProGuard](https://www.guardsquare.com/manual/configuration/usage)

### Herramientas

- [Bundletool](https://developer.android.com/studio/command-line/bundletool)
- [Android Studio](https://developer.android.com/studio)
- [Fastlane](https://fastlane.tools/) (para CI/CD)

### Guías Internas

- `/GUIA_GENERACION_APK_PRODUCCION.md` - Guía detallada APK
- `/RESUMEN_APKS_PRODUCCION.md` - Resumen configuración
- `/FUNCIONALIDADES_NATIVAS_APK.md` - Features nativas

---

## ✅ CHECKLIST FINAL

Antes de publicar en Play Store:

- [ ] ✅ Keystore generado y respaldado
- [ ] ✅ `google-services.json` configurado
- [ ] ✅ ProGuard configurado y probado
- [ ] ✅ Variables de entorno en producción
- [ ] ✅ AAB generado y firmado
- [ ] ✅ Testing en dispositivos reales
- [ ] ✅ Capturas de pantalla creadas
- [ ] ✅ Descripción Play Store completa
- [ ] ✅ Política de privacidad publicada
- [ ] ✅ Icono y assets preparados
- [ ] ✅ Versión y código de versión correctos
- [ ] ✅ Firebase Analytics configurado
- [ ] ✅ Crashlytics configurado (recomendado)

---

**¡Listo para producción!** 🎉

Si tienes dudas, revisa la [guía completa](/GUIA_GENERACION_APK_PRODUCCION.md) o contacta al equipo de desarrollo.
