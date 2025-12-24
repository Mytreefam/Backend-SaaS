# 📚 EJEMPLO DE USO - COMPONENTES WHITE LABEL

## 🎯 **Cómo usar los nuevos componentes en tu app**

---

## 1️⃣ **SplashScreen - Pantalla de Carga Inicial**

### **Uso en App.tsx:**

```tsx
import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { YourMainApp } from './components/YourMainApp';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen 
          onFinish={() => setShowSplash(false)}
          duration={2500} // Opcional: duración en ms
        />
      )}
      
      {!showSplash && <YourMainApp />}
    </>
  );
}
```

### **Resultado:**
- ✅ Logo animado de HoyPecamos (o el tenant activo)
- ✅ Fondo negro (#000000)
- ✅ Puntos de carga rojos (#ED1C24)
- ✅ Texto "Un buen pecado siempre merece la pena"
- ✅ Se oculta automáticamente después de 2.5s

---

## 2️⃣ **OnboardingScreen - Tutorial de Bienvenida**

### **Uso en App.tsx:**

```tsx
import { useState, useEffect } from 'react';
import { OnboardingScreen } from './components/OnboardingScreen';

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Verificar si es primera vez
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <>
      {showOnboarding && (
        <OnboardingScreen 
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
      
      {!showOnboarding && <YourMainApp />}
    </>
  );
}
```

### **Resultado:**
- ✅ 3 pantallas con textos personalizados de HoyPecamos
- ✅ Botón "Saltar" arriba a la derecha
- ✅ Indicadores de progreso (puntitos)
- ✅ Botón "¡A pecar!" en última pantalla
- ✅ Transiciones fluidas

---

## 3️⃣ **LoadingScreen - Pantalla de Carga**

### **Uso en cualquier componente:**

```tsx
import { LoadingScreen } from './components/LoadingScreen';

function ProductsPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingScreen message="Cargando dulces..." />;
  }

  return <div>{/* Tus productos */}</div>;
}
```

### **Opciones:**

```tsx
// Pantalla completa (default)
<LoadingScreen />

// Con mensaje personalizado
<LoadingScreen message="Preparando tu pedido..." />

// Modo inline (no fullscreen)
<LoadingScreen fullScreen={false} />
```

### **Resultado:**
- ✅ Logo animado con pulso
- ✅ Spinner rojo girando
- ✅ Mensaje personalizado
- ✅ Fondo negro corporativo

---

## 4️⃣ **TenantLogo - Logo Reutilizable**

### **Uso en cualquier componente:**

```tsx
import { TenantLogo } from './components/TenantLogo';

function Header() {
  return (
    <header className="flex items-center gap-4 p-4">
      {/* Logo pequeño sin tagline */}
      <TenantLogo size="sm" />
      
      {/* Logo mediano con tagline */}
      <TenantLogo size="md" showTagline={true} />
      
      {/* Logo grande */}
      <TenantLogo size="lg" />
      
      {/* Logo extra grande */}
      <TenantLogo size="xl" />
    </header>
  );
}
```

### **Tamaños disponibles:**
- `sm` → 32px (h-8)
- `md` → 48px (h-12) - **default**
- `lg` → 64px (h-16)
- `xl` → 96px (h-24)

### **Resultado:**
- ✅ Muestra logo del tenant activo
- ✅ Si es HoyPecamos: muestra imagen PNG
- ✅ Si es Udar Edge: muestra emoji 🎨
- ✅ Adaptable a cualquier tenant

---

## 5️⃣ **Flujo Completo - App desde Cero**

### **Ejemplo completo en App.tsx:**

```tsx
import { useState, useEffect } from 'react';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingScreen } from './components/OnboardingScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { TenantLogo } from './components/TenantLogo';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Al terminar splash, verificar onboarding
    if (!showSplash) {
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [showSplash]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  // SPLASH SCREEN
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // ONBOARDING
  if (showOnboarding) {
    return (
      <OnboardingScreen 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingComplete}
      />
    );
  }

  // LOADING
  if (loading) {
    return <LoadingScreen message="Cargando tu app..." />;
  }

  // MAIN APP
  return (
    <div className="min-h-screen">
      {/* Header con logo */}
      <header className="p-4 bg-black border-b border-red-600/30">
        <TenantLogo size="md" showTagline={false} />
      </header>

      {/* Contenido principal */}
      <main className="p-6">
        <h1 className="text-3xl text-white">¡Bienvenido!</h1>
        {/* Tu contenido aquí */}
      </main>
    </div>
  );
}

export default App;
```

---

## 6️⃣ **Acceder a Configuración del Tenant**

### **Obtener colores, textos, logo, etc:**

```tsx
import { ACTIVE_TENANT } from './config/tenant.config';

function MyComponent() {
  const { branding, texts, config } = ACTIVE_TENANT;

  return (
    <div style={{ backgroundColor: branding.colors.background }}>
      {/* Usar color primario */}
      <button style={{ backgroundColor: branding.colors.primary }}>
        {texts.common.save}
      </button>

      {/* Mostrar nombre de la app */}
      <h1 style={{ fontFamily: branding.fonts.heading }}>
        {branding.appName}
      </h1>

      {/* Verificar si módulo está habilitado */}
      {config.modules.products && (
        <div>Módulo de productos habilitado</div>
      )}

      {/* Verificar integración */}
      {config.integrations.glovo && (
        <div>Integración con Glovo activa</div>
      )}
    </div>
  );
}
```

---

## 7️⃣ **Helpers Útiles**

### **Verificar features:**

```tsx
import { ACTIVE_TENANT, isFeatureEnabled } from './config/tenant.config';

function DashboardCliente() {
  // Verificar si feature está habilitada para cliente
  const canOrder = isFeatureEnabled(ACTIVE_TENANT, 'cliente', 'orders');
  const hasFavorites = isFeatureEnabled(ACTIVE_TENANT, 'cliente', 'favorites');

  return (
    <div>
      {canOrder && <button>Hacer Pedido</button>}
      {hasFavorites && <button>Ver Favoritos</button>}
    </div>
  );
}
```

### **Verificar módulos:**

```tsx
import { ACTIVE_TENANT, isModuleEnabled } from './config/tenant.config';

function AdminPanel() {
  const hasAnalytics = isModuleEnabled(ACTIVE_TENANT, 'analytics');
  const hasIntegrations = isModuleEnabled(ACTIVE_TENANT, 'integrations');

  return (
    <div>
      {hasAnalytics && <AnalyticsModule />}
      {hasIntegrations && <IntegrationsModule />}
    </div>
  );
}
```

### **Verificar integraciones:**

```tsx
import { ACTIVE_TENANT, isIntegrationEnabled } from './config/tenant.config';

function DeliveryOptions() {
  const hasGlovo = isIntegrationEnabled(ACTIVE_TENANT, 'glovo');
  const hasUberEats = isIntegrationEnabled(ACTIVE_TENANT, 'uberEats');
  const hasJustEat = isIntegrationEnabled(ACTIVE_TENANT, 'justEat');

  return (
    <div>
      {hasGlovo && <button>Pedir por Glovo</button>}
      {hasUberEats && <button>Pedir por Uber Eats</button>}
      {hasJustEat && <button>Pedir por Just Eat</button>}
    </div>
  );
}
```

---

## 8️⃣ **Aplicar Branding al DOM (Opcional)**

### **Aplicar colores como CSS Variables:**

```tsx
import { useEffect } from 'react';
import { ACTIVE_TENANT } from './config/tenant.config';
import { applyBrandingToDOM } from './config/branding.config';

function App() {
  useEffect(() => {
    // Aplicar branding al cargar la app
    applyBrandingToDOM(ACTIVE_TENANT.branding);
  }, []);

  return <div>{/* Tu app */}</div>;
}
```

### **Luego usar en CSS:**

```css
.my-button {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.my-heading {
  font-family: var(--font-heading);
  color: var(--color-foreground);
}

.my-text {
  font-family: var(--font-body);
}
```

---

## ✅ **Checklist de Implementación:**

- [ ] Añadir `<SplashScreen />` al inicio de la app
- [ ] Añadir `<OnboardingScreen />` para nuevos usuarios
- [ ] Usar `<LoadingScreen />` en carga de datos
- [ ] Usar `<TenantLogo />` en header/footer
- [ ] Importar `ACTIVE_TENANT` donde necesites branding
- [ ] Usar `isFeatureEnabled()` para features condicionales
- [ ] Usar `isModuleEnabled()` para módulos condicionales
- [ ] Usar `isIntegrationEnabled()` para integraciones
- [ ] Aplicar `applyBrandingToDOM()` en main.tsx o App.tsx

---

## 🎉 **¡Listo para usar!**

Todos los componentes están **listos** y se adaptan **automáticamente** al tenant activo (HoyPecamos, Udar Edge, etc). Solo cambia `ACTIVE_TENANT` y todo se actualiza. 🚀
