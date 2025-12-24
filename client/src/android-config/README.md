# 📱 Configuraciones Android - Udar Edge

Esta carpeta contiene todos los archivos de configuración necesarios para generar la APK de producción.

---

## 📂 Contenido de esta Carpeta

```
/android-config/
├── res/
│   ├── values/
│   │   ├── colors.xml              ✅ Colores de la app
│   │   └── strings.xml             ✅ Textos y traducciones
│   └── xml/
│       ├── network_security_config.xml  ✅ Configuración de seguridad de red
│       └── file_paths.xml               ✅ Rutas para FileProvider
├── AndroidManifest.template.xml    ✅ Template del manifest
├── build.gradle.template           ✅ Template de build.gradle
├── keystore.properties.example     ✅ Ejemplo de credenciales
└── README.md                       📄 Este archivo
```

---

## 🚀 Instrucciones de Uso

### **1. Generar la Carpeta Android con Capacitor**

Si aún no has añadido Android a tu proyecto:

```bash
# Asegúrate de estar en la raíz del proyecto
npx cap add android
```

Esto creará la carpeta `android/` con la estructura básica.

---

### **2. Copiar Archivos de Configuración**

Una vez que tienes la carpeta `android/`, copia los archivos:

#### **A. Archivos XML de Recursos**

```bash
# Crear carpetas si no existen
mkdir -p android/app/src/main/res/values
mkdir -p android/app/src/main/res/xml

# Copiar colors.xml
cp android-config/res/values/colors.xml android/app/src/main/res/values/

# Copiar strings.xml
cp android-config/res/values/strings.xml android/app/src/main/res/values/

# Copiar network_security_config.xml
cp android-config/res/xml/network_security_config.xml android/app/src/main/res/xml/

# Copiar file_paths.xml
cp android-config/res/xml/file_paths.xml android/app/src/main/res/xml/
```

#### **B. AndroidManifest.xml**

```bash
# ⚠️ IMPORTANTE: Esto sobrescribirá el manifest existente
# Haz backup primero si ya has hecho cambios
cp android/app/src/main/AndroidManifest.xml android/app/src/main/AndroidManifest.xml.backup

# Copiar el template
cp android-config/AndroidManifest.template.xml android/app/src/main/AndroidManifest.xml
```

**Revisa el archivo** y asegúrate de que:
- El `package` sea correcto: `com.udaredge.app`
- Los `<intent-filter>` de deep links tengan tus dominios
- Todos los permisos sean los que necesitas

#### **C. build.gradle**

```bash
# Backup del build.gradle original
cp android/app/build.gradle android/app/build.gradle.backup

# Copiar el template
cp android-config/build.gradle.template android/app/build.gradle
```

**Revisa el archivo** y verifica:
- `applicationId` sea: `com.udaredge.app`
- `versionCode` y `versionName` sean correctos
- Las dependencias coincidan con tu `package.json`

#### **D. keystore.properties**

```bash
# Copiar ejemplo
cp android-config/keystore.properties.example android/keystore.properties

# Editar con tus credenciales reales
nano android/keystore.properties
# O usa tu editor favorito: code android/keystore.properties
```

**⚠️ NUNCA subas `keystore.properties` a Git**

Añádelo a `.gitignore`:
```bash
echo "android/keystore.properties" >> .gitignore
echo "android/keystores/*.keystore" >> .gitignore
```

---

### **3. Generar Keystore (Si no lo has hecho)**

```bash
# Crear carpeta para keystores
mkdir -p android/keystores

# Generar keystore
keytool -genkey -v -keystore android/keystores/udar-edge-release.keystore \
  -alias udar-edge \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Seguir las instrucciones en pantalla
# ⚠️ GUARDA LA CONTRASEÑA EN LUGAR SEGURO
```

---

### **4. Verificar Configuración**

```bash
# Sincronizar con Capacitor
npx cap sync android

# Abrir Android Studio para verificar
npx cap open android

# En Android Studio:
# - Verifica que no haya errores
# - Build > Make Project
# - Si no hay errores, estás listo
```

---

## 📋 Checklist de Configuración

Marca cada item cuando lo hayas completado:

- [ ] Carpeta `android/` generada con `npx cap add android`
- [ ] `colors.xml` copiado a `android/app/src/main/res/values/`
- [ ] `strings.xml` copiado a `android/app/src/main/res/values/`
- [ ] `network_security_config.xml` copiado a `android/app/src/main/res/xml/`
- [ ] `file_paths.xml` copiado a `android/app/src/main/res/xml/`
- [ ] `AndroidManifest.xml` copiado y personalizado
- [ ] `build.gradle` copiado y personalizado
- [ ] Keystore generado en `android/keystores/udar-edge-release.keystore`
- [ ] `keystore.properties` creado con credenciales reales
- [ ] `keystore.properties` y `*.keystore` añadidos a `.gitignore`
- [ ] `npx cap sync android` ejecutado sin errores
- [ ] Proyecto abierto en Android Studio sin errores

---

## 🎨 Personalización

### Cambiar Colores

Edita `android/app/src/main/res/values/colors.xml`:

```xml
<!-- Color principal (actualmente teal #0d9488) -->
<color name="colorPrimary">#TU_COLOR_AQUI</color>
```

### Cambiar Nombre de la App

Edita `android/app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">Tu Nombre Aqui</string>
```

### Añadir/Quitar Permisos

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Añadir nuevo permiso -->
<uses-permission android:name="android.permission.NUEVO_PERMISO" />
```

### Configurar Deep Links Personalizados

Edita `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
    <data android:scheme="tu-scheme-personalizado" />
</intent-filter>
```

---

## 🔐 Seguridad

### Archivos que NO debes subir a Git:

- ❌ `android/keystore.properties`
- ❌ `android/keystores/*.keystore`
- ❌ `android/app/google-services.json` (si contiene claves reales)
- ❌ `android/local.properties`

### Archivos que SÍ puedes subir:

- ✅ `android/app/src/main/AndroidManifest.xml`
- ✅ `android/app/build.gradle`
- ✅ `android/app/src/main/res/**/*.xml`
- ✅ `android/build.gradle`
- ✅ `android/settings.gradle`

---

## 🐛 Troubleshooting

### Error: "Keystore not found"

```bash
# Verifica que el keystore existe
ls -la android/keystores/

# Verifica que keystore.properties tiene la ruta correcta
cat android/keystore.properties
```

### Error: "AAPT: error: resource xml/network_security_config not found"

```bash
# Verifica que el archivo existe
ls -la android/app/src/main/res/xml/network_security_config.xml

# Si no existe, cópialo de nuevo
cp android-config/res/xml/network_security_config.xml android/app/src/main/res/xml/
```

### Error: "Duplicate resources"

```bash
# Limpiar y reconstruir
cd android
./gradlew clean
./gradlew assembleDebug
```

### Error: "Failed to apply plugin 'com.google.gms.google-services'"

```bash
# Asegúrate de tener google-services.json
# Si no usas Firebase, comenta estas líneas en build.gradle:
# apply plugin: 'com.google.gms.google-services'
# apply plugin: 'com.google.firebase.crashlytics'
```

---

## 📚 Recursos Adicionales

- **Capacitor Android Docs:** https://capacitorjs.com/docs/android
- **Android Developer Guide:** https://developer.android.com/guide
- **Material Design:** https://material.io/develop/android

---

## ✅ Próximos Pasos

Una vez completada la configuración:

1. **Generar iconos:** `node scripts/generate-icons.js`
2. **Build de prueba:** `cd android && ./gradlew assembleDebug`
3. **Build de release:** `cd android && ./gradlew assembleRelease`
4. **Generar AAB:** `cd android && ./gradlew bundleRelease`

Ver guía completa en: `/GUIA_GENERACION_APK_PRODUCCION.md`

---

**Última actualización:** 27 de noviembre de 2024  
**Versión:** 1.0.0  
**Autor:** Udar Edge Development Team
