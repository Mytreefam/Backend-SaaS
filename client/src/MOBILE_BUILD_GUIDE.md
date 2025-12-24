# Guía de Conversión a APK - Taller 360

## 📱 Información del Proyecto

**Nombre:** Taller 360 - Sistema de Gestión Integral  
**Versión:** 1.0.0  
**Tipo:** Aplicación Web Móvil (PWA/Híbrida)  
**Framework:** React + TypeScript + Tailwind CSS  
**Target:** Android APK (iOS compatible)

---

## 🎯 Características Principales

### Perfiles de Usuario
1. **Cliente** - Pedidos, seguimiento, facturación
2. **Trabajador** - Tareas, fichaje, reportes, formación
3. **Gerente** - Dashboard 360, operativa completa, gestión integral

### Módulos del Gerente (11 secciones)
- Dashboard 360 (KPIs, SLA, alertas)
- Operativa (órdenes, calendario, cuellos de botella)
- Clientes (ficha 360, contratos, churn)
- Facturación y Finanzas (MRR/ARR, cobros, tesorería)
- Personal y RR.HH. (turnos, fichajes, desempeño)
- Proveedores (tarifas, pedidos, SLA)
- Productividad (OKRs, eficiencia)
- Comunicación (chat, tablón, encuestas)
- Tienda (catálogo, precios, promociones)
- Ayuda (base de conocimiento, tickets)
- Configuración (integraciones, automatizaciones, RGPD)

---

## 🛠️ Opciones de Conversión a APK

### Opción 1: Capacitor (Recomendado)

**Ventajas:**
- Integración nativa con plugins
- Acceso a APIs del dispositivo
- Mejor rendimiento
- Mantenimiento activo por Ionic Team

**Instalación:**
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Taller 360" "com.taller360.app"
npm install @capacitor/android
npx cap add android
```

**Build:**
```bash
npm run build
npx cap copy
npx cap sync
npx cap open android
```

**Configuración (capacitor.config.json):**
```json
{
  "appId": "com.taller360.app",
  "appName": "Taller 360",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "android": {
    "minWebViewVersion": 55,
    "backgroundColor": "#0d9488"
  }
}
```

### Opción 2: Cordova

**Instalación:**
```bash
npm install -g cordova
cordova create taller360 com.taller360.app Taller360
cd taller360
cordova platform add android
```

**Build:**
```bash
cordova build android --release
```

### Opción 3: PWA con TWA (Trusted Web Activity)

**Herramienta:** Bubblewrap
```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=/public/manifest.json
bubblewrap build
```

---

## 📦 Estructura del Proyecto

```
/
├── App.tsx                          # Punto de entrada principal
├── components/
│   ├── GerenteDashboard.tsx         # Dashboard principal del gerente
│   ├── TrabajadorDashboard.tsx      # Dashboard del trabajador
│   ├── ClienteDashboard.tsx         # Dashboard del cliente
│   ├── LoginView.tsx                # Pantalla de login
│   ├── gerente/                     # Módulos del gerente
│   │   ├── Dashboard360.tsx
│   │   ├── OperativaGerente.tsx
│   │   ├── ClientesGerente.tsx
│   │   ├── FacturacionFinanzas.tsx
│   │   ├── PersonalRRHH.tsx
│   │   ├── ProveedoresGerente.tsx
│   │   ├── ProductividadGerente.tsx
│   │   ├── ComunicacionGerente.tsx
│   │   ├── TiendaGerente.tsx
│   │   ├── AyudaGerente.tsx
│   │   └── ConfiguracionGerente.tsx
│   ├── ui/                          # Componentes UI (ShadCN)
│   └── figma/
│       └── ImageWithFallback.tsx
├── styles/
│   └── globals.css                  # Estilos globales + Mobile optimizations
├── public/
│   └── manifest.json                # PWA manifest
└── MOBILE_BUILD_GUIDE.md            # Este archivo
```

---

## ⚙️ Configuración de Build

### package.json - Scripts necesarios
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "android:dev": "npx cap run android",
    "android:build": "npm run build && npx cap sync && npx cap open android"
  }
}
```

### vite.config.ts (si usas Vite)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

---

## 🎨 Optimizaciones Mobile Implementadas

### CSS (globals.css)
- ✅ `-webkit-tap-highlight-color: transparent` - Elimina highlight en tap
- ✅ `overscroll-behavior: none` - Previene pull-to-refresh
- ✅ `touch-action: manipulation` - Optimiza respuesta táctil
- ✅ Safe area insets para dispositivos con notch
- ✅ Fuentes: Poppins (títulos) + Open Sans (texto)

### JavaScript (App.tsx)
- ✅ Viewport configuration para prevenir zoom
- ✅ Gestión de overscroll behavior
- ✅ Optimización de touch events

### UI/UX
- ✅ Botones mínimo 48px de altura (accesibilidad táctil)
- ✅ Sheet lateral para menú (mejor UX móvil)
- ✅ Active states con `active:scale-95`
- ✅ Badges de notificaciones visibles
- ✅ Búsqueda global accesible
- ✅ Header fijo (sticky)
- ✅ Navegación optimizada para pulgar

---

## 🔐 Configuración de Seguridad para APK

### AndroidManifest.xml (si usas Capacitor/Cordova)
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    
    <application
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">
    </application>
</manifest>
```

### Generar Keystore para firma (Producción)
```bash
keytool -genkey -v -keystore taller360.keystore \
  -alias taller360 \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Build con firma
```bash
# Capacitor
npx cap build android --release

# Cordova
cordova build android --release -- \
  --keystore=taller360.keystore \
  --storePassword=*** \
  --alias=taller360 \
  --password=***
```

---

## 📊 Datos Mock vs Backend Real

### Actual: Datos Mock (Frontend)
Todos los componentes usan datos mock para demostración:
```typescript
const kpis = [
  { titulo: 'MRR', valor: '€45,890', cambio: '+12.5%', ... },
  // ...
];
```

### Para Producción: Integrar Backend
```typescript
// Ejemplo con fetch/axios
const { data } = await fetch('/api/gerente/kpis').then(r => r.json());
setKpis(data);
```

**Endpoints necesarios:**
- `/api/auth/login` - Autenticación
- `/api/gerente/dashboard` - Dashboard 360
- `/api/gerente/operativa` - Operativa
- `/api/gerente/clientes` - Gestión clientes
- `/api/gerente/facturacion` - Finanzas
- Etc...

---

## 🚀 Pasos para Publicar en Google Play

1. **Crear cuenta de desarrollador** ($25 USD único)
2. **Generar APK firmado** (ver sección anterior)
3. **Crear listing en Play Console**
   - Título: Taller 360
   - Descripción corta/larga
   - Screenshots (4-8 capturas)
   - Icono: 512x512px
   - Feature graphic: 1024x500px
4. **Configurar precios y distribución**
5. **Subir APK/AAB**
6. **Completar cuestionario de contenido**
7. **Enviar para revisión**

---

## 🔧 Plugins Recomendados (Capacitor)

### Esenciales
```bash
npm install @capacitor/status-bar
npm install @capacitor/splash-screen
npm install @capacitor/keyboard
npm install @capacitor/network
npm install @capacitor/haptics
```

### Funcionalidad Extra
```bash
npm install @capacitor/camera          # Cámara para OCR
npm install @capacitor/push-notifications  # Notificaciones push
npm install @capacitor/local-notifications # Notificaciones locales
npm install @capacitor/filesystem      # Gestión de archivos
npm install @capacitor/share          # Compartir contenido
```

---

## 📝 Checklist Pre-Build

- [ ] Cambiar colores/logos según marca
- [ ] Configurar URLs de backend real
- [ ] Añadir autenticación JWT/OAuth
- [ ] Implementar almacenamiento local (SQLite/IndexedDB)
- [ ] Configurar notificaciones push
- [ ] Testear en dispositivos reales (múltiples resoluciones)
- [ ] Optimizar imágenes y assets
- [ ] Configurar Analytics (Firebase, Mixpanel)
- [ ] Implementar manejo de errores robusto
- [ ] Añadir splash screen personalizada
- [ ] Configurar deep linking
- [ ] Implementar actualización automática

---

## 🐛 Debugging en Dispositivo

### Chrome DevTools
```bash
chrome://inspect
```
Conecta dispositivo Android por USB y habilita USB debugging

### Android Studio Logcat
```bash
adb logcat | grep Chromium
```

---

## 📚 Recursos Adicionales

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [PWA to APK Guide](https://web.dev/progressive-web-apps/)
- [Google Play Console](https://play.google.com/console/)

---

## ⚡ Performance Tips

1. **Lazy Loading** - Cargar componentes bajo demanda
2. **Code Splitting** - Separar bundles por rutas
3. **Image Optimization** - WebP, lazy loading
4. **Service Workers** - Cache offline
5. **Minimize Bundle** - Tree shaking, minification
6. **CDN** - Assets estáticos en CDN

---

## 📞 Soporte

Para dudas sobre la conversión a APK, consultar:
- Capacitor Community: https://ionic.io/community
- Stack Overflow: #capacitor #android-app

---

**¡Listo para convertir a APK!** 🎉
