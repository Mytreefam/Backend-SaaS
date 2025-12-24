# 📱 Funcionalidades Nativas para APK - Udar Edge

Documentación completa de todas las funcionalidades nativas implementadas para la aplicación móvil.

---

## 📋 **Índice de Funcionalidades**

### 🔗 **1. Deep Links / App Links**
**Archivo:** `/hooks/useDeepLinks.ts`

Permite abrir la app desde URLs externas (emails, SMS, notificaciones).

**Esquemas soportados:**
- `udaredge://pedido/123`
- `udaredge://chat/456`
- `udaredge://producto/789`
- `udaredge://reset-password?token=abc`
- `udaredge://invitacion?token=xyz&empresa=123`

**Uso:**
```tsx
import { useDeepLinks } from '@/hooks/useDeepLinks';

function MyComponent() {
  const { generateDeepLink } = useDeepLinks();
  
  const link = generateDeepLink('pedido/123');
  // Resultado: udaredge://pedido/123
}
```

**Configuración requerida en `capacitor.config.ts`:**
```typescript
appId: 'com.udar.edge',
// Añadir en Android/iOS:
// Android: AndroidManifest.xml - intent-filter con scheme
// iOS: Info.plist - CFBundleURLTypes
```

---

### 📤 **2. Share API Nativo**
**Archivo:** `/hooks/useShare.ts`

Compartir contenido usando el panel nativo de compartir del sistema.

**Funcionalidades:**
- ✅ Compartir texto
- ✅ Compartir enlaces
- ✅ Compartir pedidos
- ✅ Compartir productos
- ✅ Compartir invitaciones de equipo
- ✅ Compartir tickets/facturas
- ✅ Fallback a portapapeles en web

**Uso:**
```tsx
import { useShare } from '@/hooks/useShare';

function ProductCard({ producto }) {
  const { shareProducto } = useShare();
  
  const handleShare = () => {
    shareProducto(producto.id, producto.nombre, producto.precio);
  };
  
  return <Button onClick={handleShare}>Compartir</Button>;
}
```

---

### 📳 **3. Haptics / Vibración**
**Archivo:** `/hooks/useHaptics.ts`

Feedback táctil para mejorar la UX en acciones importantes.

**Tipos de feedback:**
- `light()` - Selección de items, cambio de tabs
- `medium()` - Botones, acciones normales
- `heavy()` - Acciones importantes, confirmaciones
- `success()` - Operación exitosa
- `warning()` - Advertencia
- `error()` - Error
- `selection()` - Efecto de picker (iOS)

**Uso:**
```tsx
import { useHaptics } from '@/hooks/useHaptics';

function DeleteButton() {
  const haptics = useHaptics();
  
  const handleDelete = () => {
    haptics.onDelete(); // Vibración fuerte
    // ... lógica de eliminación
  };
  
  return <Button onClick={handleDelete}>Eliminar</Button>;
}
```

**Casos de uso recomendados:**
- Botón presionado → `medium()`
- Operación exitosa → `success()`
- Error → `error()`
- Swipe para eliminar → `heavy()`
- Cambio de tab → `light()`

---

### 🔄 **4. Pull to Refresh**
**Archivos:** 
- `/hooks/usePullToRefresh.ts`
- `/components/mobile/PullToRefreshIndicator.tsx`

Gesto de arrastrar hacia abajo para refrescar contenido.

**Características:**
- ✅ Detecta gesto solo en el top de la página
- ✅ Threshold configurable (default 80px)
- ✅ Resistencia ajustable
- ✅ Feedback háptico
- ✅ Indicador visual animado
- ✅ Auto-habilitado solo en móvil

**Uso:**
```tsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/mobile/PullToRefreshIndicator';

function PedidosList() {
  const refreshData = async () => {
    // Recargar datos desde API
    await fetchPedidos();
  };
  
  const { pullIndicatorRef } = usePullToRefresh(refreshData, {
    threshold: 80,
    resistance: 2.5,
  });
  
  return (
    <>
      <PullToRefreshIndicator indicatorRef={pullIndicatorRef} />
      {/* Tu contenido */}
    </>
  );
}
```

---

### 🔄 **5. Update Checker**
**Archivos:**
- `/hooks/useAppUpdate.ts`
- `/components/mobile/UpdateModal.tsx`

Sistema de verificación de actualizaciones disponibles.

**Características:**
- ✅ Comparación de versiones semánticas
- ✅ Verificación automática cada 24h
- ✅ Notificación toast de actualización
- ✅ Modal con changelog
- ✅ Diferenciación entre actualización opcional/crítica
- ✅ Redirección a Play Store/App Store

**Uso:**
```tsx
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { UpdateModal } from '@/components/mobile/UpdateModal';

function App() {
  const { versionInfo, goToStore, checkForUpdate } = useAppUpdate();
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    if (versionInfo?.updateAvailable) {
      setShowModal(true);
    }
  }, [versionInfo]);
  
  return (
    <>
      <UpdateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        currentVersion={versionInfo?.current || '1.0.0'}
        latestVersion={versionInfo?.latest || '1.0.0'}
        changelog={versionInfo?.changelog}
        isRequired={versionInfo?.updateRequired}
        onUpdate={goToStore}
      />
    </>
  );
}
```

**TODO:** Conectar con endpoint de API:
```typescript
// Crear endpoint en backend:
GET /api/v1/app/version
Response: {
  version: "1.2.0",
  required: false,
  changelog: ["...", "..."]
}
```

---

### 📱 **6. Orientación de Pantalla**
**Archivo:** `/hooks/useOrientation.ts`

Control de orientación portrait/landscape.

**Funcionalidades:**
- `lockPortrait()` - Bloquear en vertical
- `lockLandscape()` - Bloquear en horizontal
- `unlock()` - Permitir rotación
- `getCurrentOrientation()` - Obtener orientación actual

**Uso:**
```tsx
import { useLockPortrait, useLockLandscape } from '@/hooks/useOrientation';

// Forzar portrait en toda la app
function App() {
  useLockPortrait();
  return <div>...</div>;
}

// Forzar landscape solo en una pantalla
function VideoPlayer() {
  useLockLandscape(); // Se auto-limpia al desmontar
  return <video>...</video>;
}
```

---

### ⌨️ **7. Gestión del Teclado**
**Archivo:** `/hooks/useKeyboard.ts`

Detectar y controlar el teclado virtual.

**Características:**
- ✅ Detectar cuando se muestra/oculta
- ✅ Obtener altura del teclado
- ✅ Ocultar/mostrar manualmente
- ✅ Configurar accessory bar
- ✅ Configurar resize mode

**Uso:**
```tsx
import { useKeyboard } from '@/hooks/useKeyboard';

function ChatInput() {
  const { isKeyboardVisible, keyboardHeight, hideKeyboard } = useKeyboard();
  
  return (
    <div style={{ paddingBottom: keyboardHeight }}>
      <input />
      {isKeyboardVisible && (
        <Button onClick={hideKeyboard}>Cerrar teclado</Button>
      )}
    </div>
  );
}
```

---

### 📊 **8. Analytics Service**
**Archivo:** `/services/analytics.service.ts`

Tracking de eventos y analytics.

**Eventos predefinidos:**
- `logScreenView(screenName)` - Vista de pantalla
- `logLogin(method)` - Login de usuario
- `logSignUp(method)` - Registro
- `logPurchase(id, value, currency)` - Compra
- `logAddToCart(itemId, name, price)` - Añadir al carrito
- `logViewItem(itemId, name, category)` - Ver producto
- `logShare(contentType, itemId)` - Compartir
- `logSearch(searchTerm)` - Búsqueda
- `logButtonClick(buttonName, location)` - Click en botón
- `logFeatureUsed(featureName, context)` - Uso de funcionalidad
- `logError(errorType, message, location)` - Error
- `logOfflineEvent(action)` - Acción offline

**Uso:**
```tsx
import { useAnalytics } from '@/services/analytics.service';

function ProductDetail({ producto }) {
  const analytics = useAnalytics();
  
  useEffect(() => {
    analytics.logViewItem(producto.id, producto.nombre, producto.categoria);
  }, [producto]);
  
  const handleAddToCart = () => {
    analytics.logAddToCart(producto.id, producto.nombre, producto.precio);
    // ...
  };
}
```

**TODO:** Integrar con Firebase Analytics:
```typescript
// En analytics.service.ts:
import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

async logEvent(event: AnalyticsEvent) {
  await FirebaseAnalytics.logEvent({ 
    name: event.name, 
    params: event.params 
  });
}
```

---

### 📜 **9. Política de Privacidad**
**Archivo:** `/components/legal/PoliticaPrivacidad.tsx`

Componente completo con política de privacidad conforme GDPR.

**Secciones incluidas:**
- ✅ Datos que recopilamos
- ✅ Cómo usamos tus datos
- ✅ Base legal (GDPR)
- ✅ Compartir datos
- ✅ Tus derechos (acceso, rectificación, supresión, etc.)
- ✅ Seguridad de datos
- ✅ Retención de datos
- ✅ Cookies
- ✅ Menores de edad
- ✅ Transferencias internacionales
- ✅ Contacto y DPO

**Uso:**
```tsx
import { PoliticaPrivacidad } from '@/components/legal/PoliticaPrivacidad';

// En configuración o footer:
<Link href="/privacidad">
  <PoliticaPrivacidad />
</Link>
```

**Requerido para:**
- ✅ Google Play Store
- ✅ Apple App Store
- ✅ Cumplimiento GDPR (UE)
- ✅ Cumplimiento LOPDGDD (España)

---

### 📄 **10. Términos y Condiciones**
**Archivo:** `/components/legal/TerminosCondiciones.tsx`

Contrato legal de uso completo.

**Secciones incluidas:**
- ✅ Aceptación de términos
- ✅ Descripción del servicio
- ✅ Registro y cuenta
- ✅ Planes y pagos
- ✅ Uso aceptable
- ✅ Propiedad intelectual
- ✅ Disponibilidad del servicio (SLA 99.9%)
- ✅ Limitación de responsabilidad
- ✅ Indemnización
- ✅ Modificaciones
- ✅ Terminación
- ✅ Ley aplicable (España)
- ✅ Disposiciones varias

**Uso:**
```tsx
import { TerminosCondiciones } from '@/components/legal/TerminosCondiciones';

// En onboarding o registro:
<Checkbox id="terms" />
<Label htmlFor="terms">
  Acepto los <Link href="/terminos">Términos y Condiciones</Link>
</Label>
```

---

### 📲 **11. Update Modal**
**Archivo:** `/components/mobile/UpdateModal.tsx`

Modal visual para mostrar actualizaciones disponibles.

**Características:**
- ✅ Badge de versión actual → nueva
- ✅ Lista de cambios (changelog)
- ✅ Diferenciación visual crítica/opcional
- ✅ Bloqueo si es crítica (no se puede cerrar)
- ✅ Botón "Más tarde" o "Actualizar ahora"

---

### 📱 **12. Bottom Sheet**
**Archivo:** `/components/ui/bottom-sheet.tsx`

Alternativa nativa a modales centrados para móvil.

**Características:**
- ✅ Animación desde abajo
- ✅ Handle para arrastrar y cerrar
- ✅ Overlay oscuro
- ✅ 3 alturas: auto, half, full
- ✅ Previene scroll del body
- ✅ Gesture de arrastrar para cerrar

**Uso:**
```tsx
import { BottomSheet } from '@/components/ui/bottom-sheet';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="Opciones"
      description="Selecciona una opción"
      height="half"
    >
      <div>Contenido del bottom sheet</div>
    </BottomSheet>
  );
}
```

---

## 🎯 **Siguiente Paso: Configuración en Capacitor**

### **AndroidManifest.xml** (Android)

Añadir permisos:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

Añadir Deep Links:
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="udaredge" />
</intent-filter>
```

### **Info.plist** (iOS)

Deep Links:
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>udaredge</string>
    </array>
  </dict>
</array>
```

---

## ✅ **Checklist de Integración**

### **Paso 1: Inicializar Analytics**
```typescript
// En App.tsx o _app.tsx
import { analytics } from '@/services/analytics.service';

useEffect(() => {
  analytics.initialize();
}, []);
```

### **Paso 2: Activar Deep Links**
```typescript
// En App.tsx
import { useDeepLinks } from '@/hooks/useDeepLinks';

function App() {
  useDeepLinks(); // Auto-registra listeners
  return <div>...</div>;
}
```

### **Paso 3: Añadir Pull to Refresh**
```typescript
// En cada listado importante
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '@/components/mobile/PullToRefreshIndicator';

const { pullIndicatorRef } = usePullToRefresh(fetchData);
```

### **Paso 4: Configurar Orientación**
```typescript
// En App.tsx - forzar portrait en toda la app
import { useLockPortrait } from '@/hooks/useOrientation';

function App() {
  useLockPortrait();
  return <div>...</div>;
}
```

### **Paso 5: Añadir Haptics en Botones Clave**
```typescript
// Ejemplo en botón de pedido
const haptics = useHaptics();

<Button onClick={() => {
  haptics.onButtonPress();
  handleOrder();
}}>
  Realizar Pedido
</Button>
```

### **Paso 6: Trackear Eventos Importantes**
```typescript
// En cada acción clave
const analytics = useAnalytics();

analytics.logPurchase(pedidoId, total, 'EUR');
analytics.logScreenView('Dashboard');
```

---

## 🚀 **Build para Producción**

### **Android APK**
```bash
npm run build
npx cap sync android
npx cap open android

# En Android Studio:
# Build > Generate Signed Bundle / APK
# Seleccionar keystore y firmar
```

### **iOS IPA**
```bash
npm run build
npx cap sync ios
npx cap open ios

# En Xcode:
# Product > Archive
# Distribuir a App Store
```

---

## 📝 **Notas Finales**

### **TODOs Pendientes:**
1. ✅ Conectar Update Checker con API backend (endpoint `/api/v1/app/version`)
2. ✅ Integrar Firebase Analytics en `analytics.service.ts`
3. ✅ Configurar Firebase Crashlytics
4. ✅ Generar iconos adaptativos para Android (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
5. ✅ Crear splash screens responsivos
6. ✅ Generar keystore para firma de APK
7. ✅ Actualizar URLs de contacto en Política de Privacidad
8. ✅ Completar datos legales (CIF, Registro Mercantil) en Términos

### **Testing Recomendado:**
- [ ] Test de deep links desde email/SMS
- [ ] Test de compartir en diferentes apps
- [ ] Test de haptics en dispositivos reales
- [ ] Test de pull-to-refresh en diferentes velocidades
- [ ] Test de orientación en diferentes pantallas
- [ ] Test de teclado con diferentes tipos de input
- [ ] Test de actualización forzada
- [ ] Test de bottom sheet gesture

---

## 📚 **Recursos Adicionales**

- [Capacitor Deep Links](https://capacitorjs.com/docs/guides/deep-links)
- [Capacitor Share](https://capacitorjs.com/docs/apis/share)
- [Capacitor Haptics](https://capacitorjs.com/docs/apis/haptics)
- [Capacitor Keyboard](https://capacitorjs.com/docs/apis/keyboard)
- [Firebase Analytics](https://firebase.google.com/docs/analytics)
- [GDPR Compliance](https://gdpr.eu/)

---

**Última actualización:** 27 de noviembre de 2024
**Versión:** 1.0.0
