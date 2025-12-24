# 🚀 Guía Completa: Generación de APK de Producción - Udar Edge

**Versión:** 1.0.0  
**Fecha:** 27 de noviembre de 2024  
**Estado:** ✅ Lista para seguir

---

## 📑 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Paso 1: Crear Iconos Adaptativos Android](#paso-1-crear-iconos-adaptativos-android)
3. [Paso 2: Configurar AndroidManifest.xml](#paso-2-configurar-androidmanifestxml)
4. [Paso 3: Generar Keystore para Firma](#paso-3-generar-keystore-para-firma)
5. [Paso 4: Configurar build.gradle](#paso-4-configurar-buildgradle)
6. [Paso 5: Crear Endpoint de Versiones](#paso-5-crear-endpoint-de-versiones)
7. [Paso 6: Build Final y Testing](#paso-6-build-final-y-testing)
8. [Paso 7: Publicar en Google Play](#paso-7-publicar-en-google-play)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

### Software Necesario
- ✅ **Node.js** v18+ y npm
- ✅ **Android Studio** (última versión estable)
- ✅ **JDK 11** o superior
- ✅ **Capacitor CLI** instalado globalmente
- ✅ **Git** para control de versiones

### Verificar Instalación
```bash
# Verificar versiones
node --version        # Debe ser v18+
npm --version         # Debe ser v8+
java -version         # Debe ser 11+
npx cap --version     # Debe estar instalado

# Si Capacitor no está instalado:
npm install -g @capacitor/cli
```

### Estructura del Proyecto
```
udar-edge/
├── android/                      # ⚠️ Este directorio se creará con `npx cap add android`
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── res/
│   │   │   │   ├── drawable/
│   │   │   │   ├── mipmap-mdpi/
│   │   │   │   ├── mipmap-hdpi/
│   │   │   │   ├── mipmap-xhdpi/
│   │   │   │   ├── mipmap-xxhdpi/
│   │   │   │   └── mipmap-xxxhdpi/
│   │   └── build.gradle
│   └── gradle.properties
├── capacitor.config.ts           # ✅ Ya existe
├── package.json
└── dist/                         # Se genera con `npm run build`
```

---

## 📱 Paso 1: Crear Iconos Adaptativos Android

Android requiere iconos en múltiples resoluciones para diferentes densidades de pantalla.

### 1.1. Preparar el Icono Original

**Requisitos del icono:**
- **Formato:** PNG con transparencia
- **Tamaño:** 1024x1024px (alta resolución)
- **Zona segura:** Mantener contenido importante dentro de un círculo de 640px de diámetro
- **Fondo:** Transparente o color sólido

**Ubicación del icono original:**
```
/assets/icons/icon-1024.png
```

### 1.2. Generar Iconos Automáticamente (MÉTODO RECOMENDADO)

**Opción A: Usar Capacitor Assets Generator**

```bash
# Instalar generador oficial de Capacitor
npm install -D @capacitor/assets

# Crear estructura de carpetas
mkdir -p assets/icons

# Colocar icono original en assets/icons/icon-1024.png

# Generar todos los iconos automáticamente
npx capacitor-assets generate --iconBackgroundColor '#0d9488' --iconBackgroundColorDark '#0d9488'
```

**Opción B: Usar script personalizado**

He creado un script Node.js para generar iconos:

```bash
# El script está en /scripts/generate-icons.js
node scripts/generate-icons.js
```

**Opción C: Online (más rápido pero menos control)**

1. Ir a https://easyappicon.com/ o https://icon.kitchen/
2. Subir tu icono de 1024x1024
3. Seleccionar "Android"
4. Descargar el ZIP
5. Extraer las carpetas mipmap-* a `android/app/src/main/res/`

### 1.3. Verificar Resoluciones Generadas

Después de generar, debes tener estos archivos:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png         (48x48)
├── mipmap-hdpi/
│   └── ic_launcher.png         (72x72)
├── mipmap-xhdpi/
│   └── ic_launcher.png         (96x96)
├── mipmap-xxhdpi/
│   └── ic_launcher.png         (144x144)
├── mipmap-xxxhdpi/
│   └── ic_launcher.png         (192x192)
└── mipmap-anydpi-v26/
    ├── ic_launcher.xml          (Adaptive icon foreground)
    └── ic_launcher_round.xml    (Adaptive icon round)
```

### 1.4. Crear Iconos Adaptativos (Android 8.0+)

Crear archivos XML para iconos adaptativos:

**Archivo:** `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

**Archivo:** `android/app/src/main/res/values/colors.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0d9488</color>
</resources>
```

✅ **Checkpoint 1:** Verifica que los iconos se vean bien en Android Studio:
```bash
npx cap sync android
npx cap open android
# En Android Studio: Run > Run 'app'
```

---

## ⚙️ Paso 2: Configurar AndroidManifest.xml

El AndroidManifest.xml define permisos, deep links y configuración de la app.

### 2.1. Ubicación del Archivo
```
android/app/src/main/AndroidManifest.xml
```

### 2.2. Abrir y Editar el Archivo

En Android Studio o tu editor de código, busca `AndroidManifest.xml` y añade:

### 2.3. Permisos Necesarios

Añadir **ANTES** de la etiqueta `<application>`:

```xml
<!-- ========== PERMISOS BÁSICOS ========== -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />

<!-- ========== VIBRACIÓN (Haptics) ========== -->
<uses-permission android:name="android.permission.VIBRATE" />

<!-- ========== CÁMARA (OCR de gastos, escaneo QR) ========== -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- ========== GEOLOCALIZACIÓN (Fichaje con geofencing) ========== -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- ========== NOTIFICACIONES PUSH ========== -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

<!-- ========== ALMACENAMIENTO (Documentos, fotos) ========== -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
    android:maxSdkVersion="32" />

<!-- ========== BIOMETRÍA ========== -->
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### 2.4. Configurar Deep Links

Dentro de `<activity>` (buscar la actividad principal), añadir:

```xml
<activity
    android:name=".MainActivity"
    android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
    android:label="@string/app_name"
    android:launchMode="singleTask"
    android:theme="@style/AppTheme.NoActionBarLaunch">

    <!-- Intent filter existente -->
    <intent-filter>
        <action android:name="android.intent.action.MAIN" />
        <category android:name="android.intent.category.LAUNCHER" />
    </intent-filter>

    <!-- ✅ AÑADIR: Deep Links (udaredge://) -->
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="udaredge" />
    </intent-filter>

    <!-- ✅ AÑADIR: App Links (https://app.udaredge.com) -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data 
            android:scheme="https" 
            android:host="app.udaredge.com" 
            android:pathPrefix="/" />
    </intent-filter>

</activity>
```

### 2.5. Configurar Seguridad de Red

Añadir dentro de `<application>`:

```xml
<application
    ...
    android:usesCleartextTraffic="false"
    android:networkSecurityConfig="@xml/network_security_config">
```

Crear archivo `android/app/src/main/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Producción: Solo HTTPS -->
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
    
    <!-- Desarrollo: Permitir localhost -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

✅ **Checkpoint 2:** Compila la app para verificar que no hay errores:
```bash
npx cap sync android
# En Android Studio: Build > Make Project
```

---

## 🔐 Paso 3: Generar Keystore para Firma

El keystore es el archivo que firma tu APK y le da identidad única.

### 3.1. ⚠️ IMPORTANTE: Seguridad del Keystore

**🚨 EL KEYSTORE ES CRÍTICO:**
- Si lo pierdes, **NO podrás actualizar tu app en Google Play**
- Guárdalo en un lugar **MUY seguro** (1Password, AWS Secrets, etc.)
- Haz **backups en múltiples ubicaciones**
- **NO lo subas a Git** (añadirlo a `.gitignore`)

### 3.2. Generar el Keystore

Ejecutar en la terminal (desde la raíz del proyecto):

```bash
# Crear carpeta para keystores (si no existe)
mkdir -p android/keystores

# Generar keystore
keytool -genkey -v -keystore android/keystores/udar-edge-release.keystore \
  -alias udar-edge \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**Se te pedirá:**
```
Enter keystore password: [Crear contraseña segura - GUÁRDALA]
Re-enter new password: [Confirmar]

What is your first and last name?
  [Nombre de tu empresa o tu nombre]

What is the name of your organizational unit?
  [Departamento, ej: "Development"]

What is the name of your organization?
  [Nombre legal de la empresa]

What is the name of your City or Locality?
  [Ciudad]

What is the name of your State or Province?
  [Provincia/Estado]

What is the two-letter country code for this unit?
  [ES para España]

Is CN=..., OU=..., O=..., L=..., ST=..., C=... correct?
  [yes]

Enter key password for <udar-edge>
  [Presionar ENTER para usar la misma contraseña]
```

### 3.3. Verificar que el Keystore se Creó

```bash
ls -lh android/keystores/
# Deberías ver: udar-edge-release.keystore
```

### 3.4. Guardar Credenciales de Forma Segura

**Crear archivo:** `android/keystore.properties`

```properties
storeFile=keystores/udar-edge-release.keystore
storePassword=TU_PASSWORD_AQUI
keyAlias=udar-edge
keyPassword=TU_PASSWORD_AQUI
```

### 3.5. Añadir a .gitignore

**MUY IMPORTANTE:** Evitar subir credenciales a Git

```bash
# Añadir al .gitignore (raíz del proyecto)
echo "android/keystores/*.keystore" >> .gitignore
echo "android/keystore.properties" >> .gitignore
echo "android/gradle.properties" >> .gitignore
```

✅ **Checkpoint 3:** Verifica que el keystore existe:
```bash
keytool -list -v -keystore android/keystores/udar-edge-release.keystore
# Ingresa la contraseña cuando te la pida
# Deberías ver información del certificado
```

---

## 📝 Paso 4: Configurar build.gradle

Configurar Gradle para usar el keystore en builds de release.

### 4.1. Editar app/build.gradle

**Ubicación:** `android/app/build.gradle`

### 4.2. Cargar Propiedades del Keystore

Añadir **AL INICIO** del archivo (después de `plugins {}`):

```gradle
// ========== CARGAR KEYSTORE PROPERTIES ==========
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

### 4.3. Configurar signingConfigs

Dentro de `android { ... }`, añadir **ANTES** de `buildTypes`:

```gradle
android {
    ...
    
    // ========== SIGNING CONFIGS ==========
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
    
    ...
}
```

### 4.4. Configurar versionCode y versionName

Buscar dentro de `defaultConfig { ... }`:

```gradle
defaultConfig {
    applicationId "com.udaredge.app"
    minSdkVersion 22
    targetSdkVersion 34
    versionCode 1           // ✅ Incrementar con cada release
    versionName "1.0.0"     // ✅ Versión visible para usuarios
    testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    aaptOptions {
         noCompress "tflite"
         noCompress "lite"
    }
}
```

**⚠️ Importante:**
- `versionCode`: Número entero que **SIEMPRE debe incrementarse** con cada actualización
- `versionName`: Versión legible (ej: "1.0.0", "1.0.1", "1.1.0")

### 4.5. Optimizaciones de Build

Añadir dentro de `android { ... }`:

```gradle
android {
    ...
    
    // ========== OPTIMIZACIONES ==========
    buildFeatures {
        buildConfig true
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }
    
    packagingOptions {
        resources {
            excludes += ['META-INF/DEPENDENCIES', 'META-INF/LICENSE', 'META-INF/LICENSE.txt', 'META-INF/license.txt', 'META-INF/NOTICE', 'META-INF/NOTICE.txt', 'META-INF/notice.txt', 'META-INF/ASL2.0']
        }
    }
}
```

✅ **Checkpoint 4:** Build de prueba:
```bash
cd android
./gradlew assembleRelease

# Si hay errores, revisa los logs
./gradlew assembleRelease --stacktrace
```

---

## 🌐 Paso 5: Crear Endpoint de Versiones

Para que la funcionalidad de `useAppUpdate()` funcione, necesitas un endpoint en el backend.

### 5.1. Especificación del Endpoint

**URL:** `https://api.udaredge.com/v1/app/version`  
**Método:** `GET`  
**Headers:** Ninguno (público)

### 5.2. Respuesta del Endpoint (JSON)

```json
{
  "version": "1.0.0",
  "versionCode": 1,
  "required": false,
  "changelog": [
    "🎉 Primera versión de Udar Edge",
    "✅ Sistema TPV 360 completo",
    "✅ Gestión de clientes y productos",
    "✅ Módulo de stock y proveedores",
    "✅ Sistema de fichaje con geofencing",
    "✅ Documentación laboral con OCR",
    "✅ Chats de pedidos en tiempo real"
  ],
  "downloadUrl": {
    "android": "https://play.google.com/store/apps/details?id=com.udaredge.app",
    "ios": "https://apps.apple.com/app/udar-edge/id123456789"
  },
  "minSupportedVersion": "1.0.0",
  "minSupportedVersionCode": 1
}
```

### 5.3. Lógica del Backend

**Ejemplo en Node.js (Express):**

```javascript
// routes/app.js
const express = require('express');
const router = express.Router();

// Endpoint de versión
router.get('/v1/app/version', (req, res) => {
  const latestVersion = {
    version: "1.0.0",
    versionCode: 1,
    required: false, // Si es true, fuerza actualización
    changelog: [
      "🎉 Primera versión de Udar Edge",
      "✅ Sistema TPV 360 completo",
      "✅ Gestión de clientes y productos"
    ],
    downloadUrl: {
      android: "https://play.google.com/store/apps/details?id=com.udaredge.app",
      ios: "https://apps.apple.com/app/udar-edge/id123456789"
    },
    minSupportedVersion: "1.0.0",
    minSupportedVersionCode: 1
  };
  
  res.json(latestVersion);
});

module.exports = router;
```

**Ejemplo en Python (FastAPI):**

```python
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class VersionInfo(BaseModel):
    version: str
    versionCode: int
    required: bool
    changelog: List[str]
    downloadUrl: dict
    minSupportedVersion: str
    minSupportedVersionCode: int

@router.get("/v1/app/version", response_model=VersionInfo)
async def get_app_version():
    return VersionInfo(
        version="1.0.0",
        versionCode=1,
        required=False,
        changelog=[
            "🎉 Primera versión de Udar Edge",
            "✅ Sistema TPV 360 completo",
            "✅ Gestión de clientes y productos"
        ],
        downloadUrl={
            "android": "https://play.google.com/store/apps/details?id=com.udaredge.app",
            "ios": "https://apps.apple.com/app/udar-edge/id123456789"
        },
        minSupportedVersion="1.0.0",
        minSupportedVersionCode=1
    )
```

### 5.4. Configurar URL en el Frontend

**Editar:** `/hooks/useAppUpdate.ts`

Buscar la línea donde se hace el fetch y actualizar:

```typescript
const response = await fetch('https://api.udaredge.com/v1/app/version');
```

### 5.5. Testing del Endpoint

```bash
# Probar el endpoint
curl https://api.udaredge.com/v1/app/version

# Debería devolver el JSON con la información de versión
```

✅ **Checkpoint 5:** Verifica que el hook funciona:
```bash
# En la app, simula una actualización cambiando la versión en el backend
# La app debería mostrar el modal de actualización
```

---

## 🏗️ Paso 6: Build Final y Testing

### 6.1. Preparar el Build de Producción

```bash
# 1. Limpiar builds anteriores
npm run build
rm -rf android/app/build

# 2. Sincronizar con Capacitor
npx cap sync android

# 3. Copiar archivos web a Android
npx cap copy android
```

### 6.2. Generar APK de Release (Firmado)

**Opción A: Desde la Terminal**

```bash
cd android
./gradlew assembleRelease

# El APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

**Opción B: Desde Android Studio (RECOMENDADO)**

```bash
# Abrir Android Studio
npx cap open android

# En Android Studio:
# 1. Build > Generate Signed Bundle / APK
# 2. Seleccionar "APK"
# 3. Next
# 4. Seleccionar keystore: android/keystores/udar-edge-release.keystore
# 5. Ingresar contraseñas
# 6. Next
# 7. Seleccionar "release"
# 8. Marcar "V1 (Jar Signature)" y "V2 (Full APK Signature)"
# 9. Finish
```

### 6.3. Generar AAB (Android App Bundle) para Google Play

**⚠️ Google Play requiere AAB desde agosto 2021:**

```bash
cd android
./gradlew bundleRelease

# El AAB estará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 6.4. Verificar el APK/AAB Generado

```bash
# Información del APK
aapt dump badging android/app/build/outputs/apk/release/app-release.apk | grep version

# Debería mostrar:
# versionCode='1' versionName='1.0.0'
```

### 6.5. Testing del APK

```bash
# Instalar APK en dispositivo físico conectado
adb install android/app/build/outputs/apk/release/app-release.apk

# Ver logs en tiempo real
adb logcat | grep -i "udar\|capacitor\|chromium"
```

### 6.6. Checklist de Testing

**Funcionalidades Críticas:**
- [ ] Login con OAuth (Google, Facebook, Apple)
- [ ] Login con biometría
- [ ] Onboarding se muestra solo la primera vez
- [ ] Deep Links funcionan (`udaredge://pedidos/123`)
- [ ] Push notifications se reciben
- [ ] Geofencing detecta entrada/salida del trabajo
- [ ] OCR de gastos funciona
- [ ] Sincronización offline → online
- [ ] Pull to refresh en listas
- [ ] Haptics en botones
- [ ] Share de pedidos/productos
- [ ] Rotación bloqueada en portrait
- [ ] Modal de actualización aparece si hay nueva versión

**Navegación:**
- [ ] Bottom navigation funciona
- [ ] Drawer lateral se abre correctamente
- [ ] Breadcrumbs muestran rutas correctas
- [ ] Back button de Android funciona

**Permisos:**
- [ ] Se solicitan permisos al momento correcto (no al inicio)
- [ ] La app funciona si se deniegan permisos no críticos
- [ ] Se puede abrir configuración para habilitar permisos

**Rendimiento:**
- [ ] La app carga en <3 segundos
- [ ] No hay stuttering al hacer scroll
- [ ] Las animaciones son fluidas (60fps)
- [ ] No hay memory leaks (probar 15+ minutos de uso)

---

## 🚀 Paso 7: Publicar en Google Play

### 7.1. Crear Cuenta de Desarrollador

1. Ir a https://play.google.com/console/signup
2. Pagar tarifa única de **$25 USD**
3. Completar información de cuenta
4. Verificar identidad

### 7.2. Crear la App en Play Console

1. **Create App**
   - Nombre: "Udar Edge"
   - Idioma predeterminado: Español (España)
   - Tipo: App
   - Gratis o de pago: Gratis

2. **Política de Privacidad**
   - URL: `https://udaredge.com/privacy`
   - (Asegúrate de tener este documento legal)

### 7.3. Preparar Assets de Marketing

**Capturas de Pantalla (obligatorias):**
- Teléfono: Mínimo 2 capturas (1080x1920 o superior)
- Tablet 7": Mínimo 2 capturas (1920x1200)

**Iconos:**
- Icono de alta resolución: 512x512px (PNG)

**Gráficos destacados:**
- Feature Graphic: 1024x500px

**Video (opcional pero recomendado):**
- URL de YouTube con demo de la app

### 7.4. Completar Listado de la Tienda

**Título:**
```
Udar Edge - Gestión de Negocios
```

**Descripción Corta (80 caracteres):**
```
Sistema completo de gestión para talleres, cafeterías y restaurantes
```

**Descripción Larga:**
```
Udar Edge es la solución completa para digitalizar tu negocio.

🎯 FUNCIONALIDADES PRINCIPALES:

📊 TPV 360° Unificado
✅ Gestión completa de punto de venta
✅ Múltiples métodos de pago
✅ Tickets y facturas automáticas
✅ Control de caja en tiempo real

👥 Gestión de Clientes
✅ Ficha 360° de cada cliente
✅ Historial de pedidos
✅ Chat directo con el negocio
✅ Notificaciones push

📦 Stock y Proveedores
✅ Control de inventario en tiempo real
✅ Alertas de stock mínimo
✅ Gestión de pedidos a proveedores
✅ OCR para documentos

👔 Recursos Humanos
✅ Fichaje con geofencing
✅ Gestión de turnos
✅ Documentación laboral
✅ Control de desempeño

📱 Diseñado para móvil
✅ Funciona offline
✅ Sincronización automática
✅ Biometría para seguridad
✅ Notificaciones en tiempo real

Ideal para: Talleres mecánicos, Cafeterías, Restaurantes, Panaderías y más.
```

**Categoría:**
- Categoría principal: Negocios
- Categoría secundaria: Productividad

**Tags:**
```
tpv, punto de venta, gestión, negocios, taller, cafetería, restaurante
```

### 7.5. Completar Cuestionario de Contenido

**Clasificación de contenido:**
- Responder preguntas sobre:
  - Violencia
  - Contenido sexual
  - Lenguaje ofensivo
  - etc.

(Para Udar Edge, todo debería ser "No")

**Público Objetivo:**
- Adultos (18+)

### 7.6. Subir el AAB

1. **Production > Create new release**
2. **Upload AAB:** `android/app/build/outputs/bundle/release/app-release.aab`
3. **Release name:** "1.0.0"
4. **Release notes:**
   ```
   🎉 Primera versión de Udar Edge
   
   Funcionalidades incluidas:
   ✅ Sistema TPV 360 completo
   ✅ Gestión de clientes y productos
   ✅ Control de stock y proveedores
   ✅ Módulo de RR.HH. con fichaje
   ✅ Documentación laboral con OCR
   ✅ Chats de pedidos en tiempo real
   ```

### 7.7. Configurar Países y Precios

- **Países:** Seleccionar países donde estará disponible
- **Precio:** Gratis
- **Compras in-app:** Si tienes suscripciones, marcar "Sí"

### 7.8. Enviar para Revisión

1. Revisar que todo esté completo
2. **Send for Review**
3. Esperar aprobación (1-7 días)

### 7.9. Después de la Aprobación

- Google enviará email cuando esté aprobada
- La app estará disponible en Play Store en ~2-4 horas
- Puedes hacer rollout gradual (10% → 50% → 100%)

---

## 🐛 Troubleshooting

### Error: "Keystore file not found"

```bash
# Verificar que el archivo existe
ls -la android/keystores/udar-edge-release.keystore

# Verificar que keystore.properties tiene la ruta correcta
cat android/keystore.properties
```

### Error: "Execution failed for task ':app:validateSigningRelease'"

```bash
# Verificar que las contraseñas son correctas
keytool -list -v -keystore android/keystores/udar-edge-release.keystore
```

### Error: "Duplicate resources"

```bash
# Limpiar builds anteriores
cd android
./gradlew clean
./gradlew assembleRelease
```

### Error: "Failed to install APK: INSTALL_PARSE_FAILED_NO_CERTIFICATES"

```bash
# El APK no está firmado correctamente
# Regenerar con las instrucciones del Paso 4
```

### APK muy pesado (>100MB)

```bash
# Habilitar ProGuard para minificación
# En android/app/build.gradle:
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

### Deep Links no funcionan

```bash
# Verificar intent filters en AndroidManifest.xml
adb shell am start -W -a android.intent.action.VIEW -d "udaredge://test"

# Ver logs
adb logcat | grep -i "intent"
```

---

## 📚 Recursos Adicionales

- **Capacitor Docs:** https://capacitorjs.com/docs/android
- **Android Developer Guide:** https://developer.android.com/distribute
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Signing App:** https://developer.android.com/studio/publish/app-signing

---

## 🎉 ¡Listo!

Si has completado todos los pasos, tu APK está lista para publicación.

**Próximos pasos:**
1. ✅ Monitorear descargas en Play Console
2. ✅ Configurar Firebase Crashlytics para reportes de errores
3. ✅ Configurar A/B testing
4. ✅ Preparar actualizaciones con nuevo versionCode

---

**Última actualización:** 27 de noviembre de 2024  
**Versión del documento:** 1.0.0  
**Autor:** Udar Edge Development Team
