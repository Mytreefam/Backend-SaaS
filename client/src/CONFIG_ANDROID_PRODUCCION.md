# 📱 Configuraciones Android de Producción - Udar Edge

**Versión:** 1.0.0  
**Última actualización:** 27 de noviembre de 2024

---

## 📋 Índice

1. [AndroidManifest.xml Completo](#androidmanifestxml-completo)
2. [build.gradle Completo](#buildgradle-completo)
3. [network_security_config.xml](#network_security_configxml)
4. [Adaptive Icons XML](#adaptive-icons-xml)
5. [Configuración de Firebase](#configuración-de-firebase)
6. [Variables de Entorno](#variables-de-entorno)

---

## 📄 AndroidManifest.xml Completo

**Ubicación:** `android/app/src/main/AndroidManifest.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.udaredge.app">

    <!-- ========================================== -->
    <!-- PERMISOS NECESARIOS                        -->
    <!-- ========================================== -->
    
    <!-- Conectividad básica -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- Haptics / Vibración -->
    <uses-permission android:name="android.permission.VIBRATE" />
    
    <!-- Cámara (OCR de gastos, escaneo QR) -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    
    <!-- Geolocalización (Fichaje con geofencing) -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    
    <!-- Notificaciones Push (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Almacenamiento -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" 
        android:maxSdkVersion="32" />
    
    <!-- Biometría (huella, face unlock) -->
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.USE_FINGERPRINT" />
    
    <!-- Foreground Services (para sincronización en background) -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />

    <!-- ========================================== -->
    <!-- APPLICATION                                -->
    <!-- ========================================== -->
    
    <application
        android:name=".UdarEdgeApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config"
        android:requestLegacyExternalStorage="true"
        android:hardwareAccelerated="true"
        android:largeHeap="true">

        <!-- ========================================== -->
        <!-- MAIN ACTIVITY                              -->
        <!-- ========================================== -->
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:label="@string/app_name"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:screenOrientation="portrait"
            android:windowSoftInputMode="adjustResize">

            <!-- Launcher -->
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Deep Links: udaredge:// -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="udaredge" />
            </intent-filter>

            <!-- App Links: https://app.udaredge.com -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data 
                    android:scheme="https" 
                    android:host="app.udaredge.com" 
                    android:pathPrefix="/" />
            </intent-filter>

            <!-- Universal Links adicionales -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data 
                    android:scheme="https" 
                    android:host="*.udaredge.com" 
                    android:pathPrefix="/app" />
            </intent-filter>

        </activity>

        <!-- ========================================== -->
        <!-- FIREBASE MESSAGING SERVICE                 -->
        <!-- ========================================== -->
        
        <service
            android:name=".FCMService"
            android:exported="false">
            <intent-filter>
                <action android:name="com.google.firebase.MESSAGING_EVENT" />
            </intent-filter>
        </service>

        <!-- Metadata de Firebase -->
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_icon"
            android:resource="@drawable/ic_stat_notification" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_color"
            android:resource="@color/notification_color" />
        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="@string/default_notification_channel_id" />

        <!-- ========================================== -->
        <!-- FILE PROVIDER (para compartir archivos)    -->
        <!-- ========================================== -->
        
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

        <!-- ========================================== -->
        <!-- GEOFENCING BROADCAST RECEIVER              -->
        <!-- ========================================== -->
        
        <receiver
            android:name=".GeofenceBroadcastReceiver"
            android:enabled="true"
            android:exported="false" />

    </application>

</manifest>
```

---

## 🔧 build.gradle Completo

**Ubicación:** `android/app/build.gradle`

```gradle
apply plugin: 'com.android.application'

// ========================================
// CARGAR KEYSTORE PROPERTIES
// ========================================

def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    namespace "com.udaredge.app"
    compileSdkVersion rootProject.ext.compileSdkVersion
    
    // ========================================
    // DEFAULT CONFIG
    // ========================================
    
    defaultConfig {
        applicationId "com.udaredge.app"
        minSdkVersion 22
        targetSdkVersion rootProject.ext.targetSdkVersion
        
        // ⚠️ IMPORTANTE: Incrementar con cada release
        versionCode 1
        versionName "1.0.0"
        
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        
        // Opciones adicionales
        multiDexEnabled true
        vectorDrawables.useSupportLibrary = true
        
        // Optimizaciones de recursos
        aaptOptions {
            noCompress "tflite"
            noCompress "lite"
        }
    }

    // ========================================
    // SIGNING CONFIGS
    // ========================================
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                
                // v1: Firma JAR (compatibilidad antigua)
                // v2: Firma APK completa (Android 7.0+)
                v1SigningEnabled true
                v2SigningEnabled true
            }
        }
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }

    // ========================================
    // BUILD TYPES
    // ========================================
    
    buildTypes {
        release {
            // Usar configuración de firma
            signingConfig signingConfigs.release
            
            // Minificación y ofuscación
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            
            // Optimizaciones
            debuggable false
            jniDebuggable false
            renderscriptDebuggable false
            zipAlignEnabled true
            
            // Build config fields
            buildConfigField "String", "API_URL", "\"https://api.udaredge.com\""
            buildConfigField "String", "ENVIRONMENT", "\"production\""
        }
        
        debug {
            signingConfig signingConfigs.debug
            applicationIdSuffix ".debug"
            debuggable true
            minifyEnabled false
            
            buildConfigField "String", "API_URL", "\"https://api-dev.udaredge.com\""
            buildConfigField "String", "ENVIRONMENT", "\"development\""
        }
    }

    // ========================================
    // BUILD FEATURES
    // ========================================
    
    buildFeatures {
        buildConfig true
    }

    // ========================================
    // COMPILE OPTIONS
    // ========================================
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    // ========================================
    // PACKAGING OPTIONS
    // ========================================
    
    packagingOptions {
        resources {
            excludes += [
                'META-INF/DEPENDENCIES',
                'META-INF/LICENSE',
                'META-INF/LICENSE.txt',
                'META-INF/license.txt',
                'META-INF/NOTICE',
                'META-INF/NOTICE.txt',
                'META-INF/notice.txt',
                'META-INF/ASL2.0',
                'META-INF/*.kotlin_module'
            ]
        }
    }

    // ========================================
    // LINT OPTIONS
    // ========================================
    
    lintOptions {
        checkReleaseBuilds false
        abortOnError false
        disable 'MissingTranslation'
    }

    // ========================================
    // DEX OPTIONS (Optimización de compilación)
    // ========================================
    
    dexOptions {
        javaMaxHeapSize "4g"
    }
}

// ========================================
// REPOSITORIES
// ========================================

repositories {
    google()
    mavenCentral()
    flatDir {
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

// ========================================
// DEPENDENCIES
// ========================================

dependencies {
    // Core Android
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    
    // Capacitor
    implementation project(':capacitor-android')
    implementation project(':capacitor-app')
    implementation project(':capacitor-haptics')
    implementation project(':capacitor-keyboard')
    implementation project(':capacitor-status-bar')
    implementation project(':capacitor-share')
    implementation project(':capacitor-network')
    implementation project(':capacitor-geolocation')
    implementation project(':capacitor-camera')
    implementation project(':capacitor-local-notifications')
    implementation project(':capacitor-push-notifications')
    implementation project(':capacitor-splash-screen')
    
    // Firebase
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.google.firebase:firebase-messaging'
    implementation 'com.google.firebase:firebase-crashlytics'
    
    // Biometrics
    implementation 'androidx.biometric:biometric:1.1.0'
    
    // Material Design
    implementation 'com.google.android.material:material:1.11.0'
    
    // Testing
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
}

// ========================================
// APPLY PLUGINS
// ========================================

// Firebase (debe ir al final)
apply plugin: 'com.google.gms.google-services'
apply plugin: 'com.google.firebase.crashlytics'
```

---

## 🔒 network_security_config.xml

**Ubicación:** `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    
    <!-- ========================================== -->
    <!-- CONFIGURACIÓN BASE (HTTPS obligatorio)     -->
    <!-- ========================================== -->
    
    <base-config cleartextTrafficPermitted="false">
        <trust-anchors>
            <!-- Certificados del sistema -->
            <certificates src="system" />
            <!-- Certificados personalizados (si tienes) -->
            <!-- <certificates src="@raw/my_ca" /> -->
        </trust-anchors>
    </base-config>

    <!-- ========================================== -->
    <!-- EXCEPCIÓN PARA DESARROLLO LOCAL            -->
    <!-- ========================================== -->
    
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">192.168.1.1</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>

    <!-- ========================================== -->
    <!-- DOMINIOS DE PRODUCCIÓN (HTTPS)             -->
    <!-- ========================================== -->
    
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">udaredge.com</domain>
        <domain includeSubdomains="true">api.udaredge.com</domain>
        <domain includeSubdomains="true">app.udaredge.com</domain>
        <domain includeSubdomains="true">cdn.udaredge.com</domain>
        
        <!-- Supabase -->
        <domain includeSubdomains="true">supabase.co</domain>
        
        <!-- Firebase -->
        <domain includeSubdomains="true">firebaseio.com</domain>
        <domain includeSubdomains="true">googleapis.com</domain>
        
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </domain-config>

</network-security-config>
```

---

## 🎨 Adaptive Icons XML

### ic_launcher.xml

**Ubicación:** `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

### ic_launcher_round.xml

**Ubicación:** `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
```

### colors.xml

**Ubicación:** `android/app/src/main/res/values/colors.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Icono de la app -->
    <color name="ic_launcher_background">#0d9488</color>
    
    <!-- Notificaciones -->
    <color name="notification_color">#0d9488</color>
    
    <!-- Splash Screen -->
    <color name="splash_background">#0d9488</color>
    
    <!-- Status Bar -->
    <color name="colorPrimaryDark">#0a6b61</color>
</resources>
```

### strings.xml

**Ubicación:** `android/app/src/main/res/values/strings.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Udar Edge</string>
    <string name="title_activity_main">Udar Edge</string>
    <string name="package_name">com.udaredge.app</string>
    <string name="custom_url_scheme">udaredge</string>
    
    <!-- Notificaciones -->
    <string name="default_notification_channel_id">udar_edge_default</string>
    <string name="default_notification_channel_name">Notificaciones Generales</string>
    <string name="default_notification_channel_description">Notificaciones de la app Udar Edge</string>
    
    <!-- Permisos -->
    <string name="camera_permission_rationale">Necesitamos acceso a la cámara para escanear códigos QR y documentos</string>
    <string name="location_permission_rationale">Necesitamos tu ubicación para fichaje automático con geofencing</string>
    <string name="biometric_permission_rationale">Usa huella digital o Face ID para acceso rápido y seguro</string>
</resources>
```

---

## 🔥 Configuración de Firebase

### google-services.json

**Ubicación:** `android/app/google-services.json`

```json
{
  "project_info": {
    "project_number": "TU_PROJECT_NUMBER",
    "project_id": "udar-edge-production",
    "storage_bucket": "udar-edge-production.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:TU_APP_ID:android:TU_CLIENT_ID",
        "android_client_info": {
          "package_name": "com.udaredge.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "TU_CLIENT_ID.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "TU_API_KEY"
        }
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": []
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

**⚠️ IMPORTANTE:**
1. Descargar el archivo real desde Firebase Console
2. Reemplazar `TU_PROJECT_NUMBER`, `TU_APP_ID`, etc. con tus valores reales
3. **NO subir este archivo a Git público** (añadir a `.gitignore`)

### Añadir a .gitignore

```bash
# Firebase
android/app/google-services.json
ios/App/GoogleService-Info.plist
```

---

## 🌍 Variables de Entorno

### .env.production

**Ubicación:** `.env.production`

```bash
# API
VITE_API_URL=https://api.udaredge.com
VITE_API_VERSION=v1

# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui

# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=udar-edge-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=udar-edge-production
VITE_FIREBASE_STORAGE_BUCKET=udar-edge-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_MEASUREMENT_ID=tu_measurement_id

# OAuth
VITE_GOOGLE_CLIENT_ID=tu_google_client_id
VITE_FACEBOOK_APP_ID=tu_facebook_app_id
VITE_APPLE_CLIENT_ID=tu_apple_client_id

# App
VITE_APP_NAME=Udar Edge
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Deep Links
VITE_DEEP_LINK_SCHEME=udaredge
VITE_APP_LINK_DOMAIN=app.udaredge.com

# Analytics
VITE_ANALYTICS_ENABLED=true
VITE_CRASHLYTICS_ENABLED=true

# Features
VITE_OFFLINE_MODE_ENABLED=true
VITE_BIOMETRIC_ENABLED=true
VITE_GEOFENCING_ENABLED=true
VITE_PUSH_NOTIFICATIONS_ENABLED=true
```

### .env.development

**Ubicación:** `.env.development`

```bash
# API
VITE_API_URL=https://api-dev.udaredge.com
VITE_API_VERSION=v1

# Supabase
VITE_SUPABASE_URL=https://tu-proyecto-dev.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_dev

# Firebase (proyecto de desarrollo)
VITE_FIREBASE_API_KEY=tu_api_key_dev
VITE_FIREBASE_AUTH_DOMAIN=udar-edge-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=udar-edge-dev
# ... resto de configuración de desarrollo

# App
VITE_APP_NAME=Udar Edge DEV
VITE_APP_VERSION=1.0.0-dev
VITE_ENVIRONMENT=development

# Analytics (deshabilitado en dev)
VITE_ANALYTICS_ENABLED=false
VITE_CRASHLYTICS_ENABLED=false
```

---

## 📝 file_paths.xml (FileProvider)

**Ubicación:** `android/app/src/main/res/xml/file_paths.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Cache interna -->
    <cache-path name="cache" path="." />
    
    <!-- Archivos internos -->
    <files-path name="files" path="." />
    
    <!-- Almacenamiento externo (si está disponible) -->
    <external-path name="external" path="." />
    <external-files-path name="external_files" path="." />
    <external-cache-path name="external_cache" path="." />
</paths>
```

---

## 🚀 Comandos de Build Rápidos

```bash
# Build de desarrollo (debug)
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug

# Build de producción (release firmado)
npm run build
npx cap sync android
cd android && ./gradlew assembleRelease

# Build de AAB para Google Play
cd android && ./gradlew bundleRelease

# Limpiar builds anteriores
cd android && ./gradlew clean

# Ver logs en tiempo real
adb logcat | grep -i "udar\|capacitor\|chromium"

# Instalar APK en dispositivo
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 📦 Ubicaciones de Archivos Generados

### APK
```
android/app/build/outputs/apk/
├── debug/
│   └── app-debug.apk
└── release/
    └── app-release.apk
```

### AAB (Android App Bundle)
```
android/app/build/outputs/bundle/
└── release/
    └── app-release.aab
```

### Logs
```
android/app/build/outputs/logs/
└── manifest-merger-release-report.txt
```

---

## ✅ Checklist de Configuración

- [ ] AndroidManifest.xml configurado con todos los permisos
- [ ] Deep Links añadidos (udaredge:// y https://app.udaredge.com)
- [ ] build.gradle configurado con signing configs
- [ ] Keystore generado y guardado de forma segura
- [ ] keystore.properties creado (y en .gitignore)
- [ ] network_security_config.xml creado
- [ ] Iconos adaptativos en todas las resoluciones
- [ ] colors.xml con colores de marca
- [ ] strings.xml con textos de la app
- [ ] google-services.json de Firebase añadido
- [ ] Variables de entorno configuradas (.env.production)
- [ ] file_paths.xml configurado para FileProvider
- [ ] .gitignore actualizado (keystores, google-services.json)

---

**Última actualización:** 27 de noviembre de 2024  
**Versión:** 1.0.0  
**Autor:** Udar Edge Development Team
