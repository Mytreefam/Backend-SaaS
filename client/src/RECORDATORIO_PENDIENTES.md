# 📋 RECORDATORIO: Lo que Falta para APK de Producción

## 🔴 **URGENTE - Para poder generar APK firmada**

### 1. **Iconos Adaptativos Android** ⏱️ 30min
```
Necesitas crear iconos en estas resoluciones:
📁 android/app/src/main/res/
  ├── mipmap-mdpi/ic_launcher.png (48x48)
  ├── mipmap-hdpi/ic_launcher.png (72x72)
  ├── mipmap-xhdpi/ic_launcher.png (96x96)
  ├── mipmap-xxhdpi/ic_launcher.png (144x144)
  └── mipmap-xxxhdpi/ic_launcher.png (192x192)

🛠️ Herramienta recomendada:
https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html
```

### 2. **Configurar AndroidManifest.xml** ⏱️ 15min
```
📁 android/app/src/main/AndroidManifest.xml

Añadir dentro de <activity>:
- Intent filter para deep links (udaredge://)
- Intent filter para app links (https://app.udaredge.com)

Añadir permisos antes de <application>:
- INTERNET
- VIBRATE
- CAMERA
- ACCESS_FINE_LOCATION
```

### 3. **Generar Keystore** ⏱️ 10min
```bash
# Ejecutar en terminal:
keytool -genkey -v -keystore udar-edge-release.keystore \
  -alias udar-edge \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# ⚠️ IMPORTANTE: Guardar el keystore en lugar SEGURO
# ⚠️ NO perder la contraseña (no se puede recuperar)

# Crear archivo: android/gradle.properties
MYAPP_RELEASE_STORE_FILE=udar-edge-release.keystore
MYAPP_RELEASE_KEY_ALIAS=udar-edge
MYAPP_RELEASE_STORE_PASSWORD=tu_password
MYAPP_RELEASE_KEY_PASSWORD=tu_password
```

### 4. **Configurar Firma en build.gradle** ⏱️ 10min
```gradle
// android/app/build.gradle

android {
    ...
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 5. **Crear Endpoint de Versiones** ⏱️ 20min
```typescript
// Backend: Crear endpoint
GET /api/v1/app/version

// Respuesta:
{
  "version": "1.0.0",
  "required": false,
  "changelog": ["..."],
  "downloadUrl": {
    "android": "https://play.google.com/...",
    "ios": "https://apps.apple.com/..."
  }
}
```

---

## 🟡 **IMPORTANTE - Antes de publicar**

### 6. **Configurar iOS Info.plist** ⏱️ 15min
```xml
📁 ios/App/App/Info.plist

Añadir:
- CFBundleURLTypes (deep links)
- NSCameraUsageDescription
- NSLocationWhenInUseUsageDescription
- NSFaceIDUsageDescription
```

### 7. **Integrar Firebase Analytics** ⏱️ 30min
```bash
npm install @capacitor-community/firebase-analytics
# Seguir guía: https://github.com/capacitor-community/firebase-analytics
```

### 8. **Splash Screens** ⏱️ 20min
```bash
# Automático:
npx capacitor-assets generate

# O manual:
Crear splash.png para Android y iOS
```

### 9. **Actualizar Datos Legales** ⏱️ 30min
```
Editar:
- /components/legal/PoliticaPrivacidad.tsx
- /components/legal/TerminosCondiciones.tsx

Actualizar:
- Emails reales (privacidad@udaredge.com, legal@udaredge.com)
- Dirección física real
- CIF/NIF real
- Teléfono real
- Datos del Registro Mercantil
```

---

## 🟢 **OPCIONAL - Mejoras adicionales**

### 10. **Integrar en Más Componentes** ⏱️ 2h
- Pull to Refresh en más listados
- Haptics en más botones importantes
- Share en más contenidos
- Analytics en más acciones

### 11. **Optimizaciones** ⏱️ 3h
- Code splitting
- Lazy loading
- Memoización
- Cache agresivo

### 12. **Testing Completo** ⏱️ 4h
- Test en 3+ dispositivos Android
- Test en 2+ dispositivos iOS
- Test de todas las funcionalidades
- Test de deep links
- Test offline → online

---

## 📦 **Comandos de Build (Cuando Tengas Todo Listo)**

### **Build APK Debug**
```bash
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Build > Build APK
```

### **Build APK Release (Firmada)**
```bash
npm run build
npx cap sync android
npx cap open android
# En Android Studio: Build > Generate Signed Bundle/APK > APK > Release
```

### **Build iOS**
```bash
npm run build
npx cap sync ios
npx cap open ios
# En Xcode: Product > Archive
```

---

## ⏰ **Tiempo Estimado Total**

| Prioridad | Tiempo Total |
|-----------|--------------|
| 🔴 URGENTE | ~1h 25min |
| 🟡 IMPORTANTE | ~1h 35min |
| 🟢 OPCIONAL | ~9h |

**Mínimo para APK funcional:** ~3 horas
**Para APK lista para producción:** ~12 horas

---

## ✅ **Checklist Rápida**

```
[ ] 1. Iconos Android (todas las resoluciones)
[ ] 2. AndroidManifest.xml configurado
[ ] 3. Keystore generado y guardado
[ ] 4. build.gradle configurado para firma
[ ] 5. Endpoint de versiones creado
[ ] 6. iOS Info.plist configurado
[ ] 7. Firebase Analytics integrado
[ ] 8. Splash screens creados
[ ] 9. Datos legales actualizados
[ ] 10. Testing completo realizado
```

---

## 🚨 **IMPORTANTE: NO Olvidar**

1. **Guardar el Keystore en lugar seguro** (Google Drive, 1Password, etc.)
2. **Anotar la contraseña del Keystore** (no se puede recuperar)
3. **Incrementar versión en capacitor.config.ts** antes de cada release
4. **Probar APK firmada en dispositivo real** antes de publicar
5. **Backup de la base de datos** antes de subir a producción

---

## 📞 **Recursos Útiles**

- [Guía oficial Capacitor Android](https://capacitorjs.com/docs/android)
- [Guía oficial Capacitor iOS](https://capacitorjs.com/docs/ios)
- [Google Play Console](https://play.google.com/console)
- [Apple App Store Connect](https://appstoreconnect.apple.com)
- [Generador de iconos Android](https://romannurik.github.io/AndroidAssetStudio/)
- [Generador de splash screens](https://apetools.webprofusion.com/app/#/tools/imagegorilla)

---

**Última actualización:** 27 de noviembre de 2024

**¡Ánimo! Ya tienes el 80% hecho, solo falta la configuración de build! 🚀**
