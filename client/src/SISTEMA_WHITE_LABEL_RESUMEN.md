# 🎨 SISTEMA WHITE-LABEL - RESUMEN

## Tu app ahora es configurable por cliente/empresa

---

## ✅ ¿QUÉ HEMOS CREADO?

### Sistema que permite cambiar:

| Elemento | Ejemplo 1 (Udar Edge) | Ejemplo 2 (Pizzería) | Ejemplo 3 (Cafetería) |
|----------|----------------------|---------------------|---------------------|
| **Logo** | 🎨 | 🍕 | ☕ |
| **Nombre** | Udar Edge | La Pizzería | Coffee House |
| **Color principal** | #030213 (Negro) | #d32f2f (Rojo) | #5d4037 (Marrón) |
| **Tagline** | Digitaliza tu negocio | La mejor pizza | El mejor café |
| **Textos** | Genéricos | Personalizados pizza | Personalizados café |
| **Features** | Todas | Sin Just Eat | Sin delivery |

---

## 📁 ARCHIVOS CREADOS

```
/types/
  └── tenant.types.ts              # Tipos TypeScript

/config/
  ├── branding.config.ts           # Logo, colores, fuentes
  ├── texts.config.ts              # Todos los textos
  └── tenant.config.ts             # Configuración completa

/hooks/
  └── useTenant.ts                 # Hooks para usar branding

/components/
  ├── /shared/
  │   └── BrandedHeader.tsx        # Ejemplo header con branding
  └── /dev/
      └── TenantSwitcher.tsx       # Cambiar tenant en desarrollo

/GUIA_WHITE_LABEL.md               # 📚 Documentación completa
```

---

##  🚀 CÓMO CAMBIAR EL BRANDING

### **MÉTODO 1: Cambio rápido (2 minutos)**

1. Abrir `/config/tenant.config.ts`
2. Cambiar línea 170:

```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_UDAR_EDGE;
//                                          ↑
//                                      CAMBIAR AQUÍ

// Opciones:
TENANT_UDAR_EDGE      → App genérica
TENANT_LA_PIZZERIA    → Pizzería italiana
TENANT_COFFEE_HOUSE   → Cafetería premium
TENANT_FASHION_STORE  → Tienda de ropa
```

3. Guardar y recargar → **¡Listo!**

---

### **MÉTODO 2: En desarrollo con TenantSwitcher**

1. Clic en botón flotante 🏢 (abajo derecha)
2. Seleccionar tenant del dropdown
3. La app recarga automáticamente

**Solo visible en desarrollo** ✅

---

### **MÉTODO 3: Crear nuevo tenant (10 minutos)**

Ver guía completa en [GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)

---

## 💻 CÓMO USAR EN CÓDIGO

### Hook principal: `useTenant()`

```typescript
import { useTenant } from './hooks/useTenant';

function MiComponente() {
  const { tenant, branding, texts } = useTenant();
  
  return (
    <div>
      {/* Logo del tenant actual */}
      <span>{branding.logo}</span>
      
      {/* Nombre de la app */}
      <h1>{branding.appName}</h1>
      
      {/* Textos configurables */}
      <p>{texts.login.title}</p>
      
      {/* Colores dinámicos */}
      <button style={{ 
        backgroundColor: branding.colors.primary 
      }}>
        {texts.common.save}
      </button>
    </div>
  );
}
```

### Hooks específicos:

```typescript
// Solo branding
import { useBranding } from './hooks/useTenant';
const branding = useBranding();

// Solo textos
import { useTexts } from './hooks/useTenant';
const texts = useTexts();

// Verificar features
import { useFeature } from './hooks/useTenant';
const hasOrders = useFeature('cliente', 'orders');

// Verificar módulos
import { useModule } from './hooks/useTenant';
const hasIntegrations = useModule('integrations');

// Verificar integraciones
import { useIntegration } from './hooks/useTenant';
const hasGlovo = useIntegration('glovo');
```

---

## 🎨 TENANTS DISPONIBLES

### 1️⃣ UDAR EDGE (App genérica)
```typescript
Logo:        🎨
Colores:     Negro/Blanco
Textos:      Genéricos
Features:    Todas habilitadas
Integra:     Monei, Glovo, Uber Eats, Just Eat
```

### 2️⃣ LA PIZZERÍA
```typescript
Logo:        🍕
Colores:     Rojo italiano (#d32f2f)
Textos:      Personalizados pizza
Features:    Sin Just Eat
Integra:     Monei, Glovo, Uber Eats
```

### 3️⃣ COFFEE HOUSE
```typescript
Logo:        ☕
Colores:     Marrón café (#5d4037)
Textos:      Personalizados café
Features:    Sin delivery, con loyalty
Integra:     Solo Monei (recogida en local)
```

### 4️⃣ FASHION STORE
```typescript
Logo:        👗
Colores:     Negro elegante
Textos:      Genéricos
Features:    Con wishlist e inventory
Integra:     Solo Monei (sin delivery)
```

---

## 📊 COMPARACIÓN

| Feature | Udar Edge | Pizzería | Coffee | Fashion |
|---------|-----------|----------|--------|---------|
| **Logo** | 🎨 | 🍕 | ☕ | 👗 |
| **Monei** | ✅ | ✅ | ✅ | ✅ |
| **Glovo** | ✅ | ✅ | ❌ | ❌ |
| **Uber Eats** | ✅ | ✅ | ❌ | ❌ |
| **Just Eat** | ✅ | ❌ | ❌ | ❌ |
| **OAuth Google** | ✅ | ✅ | ✅ | ✅ |
| **OAuth Apple** | ✅ | ❌ | ✅ | ✅ |
| **OAuth Facebook** | ✅ | ✅ | ❌ | ✅ |
| **Productos** | ✅ | ✅ | ✅ | ✅ |
| **Analytics** | ✅ | ✅ | ✅ | ✅ |
| **Inventory** | ❌ | ❌ | ❌ | ✅ |
| **Loyalty** | ❌ | ❌ | ✅ | ❌ |

---

## 🔧 CONFIGURACIÓN POR TENANT

### Cada tenant puede tener:

**Branding diferente:**
- Logo
- Colores (primary, secondary, accent, etc.)
- Fuentes (heading, body)
- Imágenes (login background, onboarding, etc.)

**Textos diferentes:**
- Login/registro
- Onboarding
- Dashboard (cliente, trabajador, gerente)
- Todos los botones y mensajes

**Features por rol:**
- Cliente: orders, favorites, profile, notifications, loyalty, wishlist
- Trabajador: tasks, schedule, checkin, inventory
- Gerente: dashboard, products, analytics, integrations, users

**Módulos habilitados/deshabilitados:**
- products, orders, analytics, integrations, users, tasks, schedule

**Integraciones activas/inactivas:**
- monei, glovo, uberEats, justEat

**OAuth providers:**
- google, apple, facebook

**Configuración regional:**
- locale (es-ES, en-US, etc.)
- currency (EUR, USD, etc.)
- timezone

---

## 🎯 CASOS DE USO

### Caso 1: SaaS Multi-Tenant
Una app, múltiples empresas:
- `app.com/empresa-a` → Branding A
- `app.com/empresa-b` → Branding B
- `app.com/empresa-c` → Branding C

### Caso 2: White-Label
Vender la app con branding personalizado:
- Cliente 1 paga → Su logo + colores
- Cliente 2 paga → Su logo + colores
- Cliente 3 paga → Su logo + colores

### Caso 3: Verticales
Misma app, diferentes industrias:
- Versión Restaurantes → 🍕
- Versión Cafeterías → ☕
- Versión Retail → 👗

### Caso 4: A/B Testing
Probar diferentes brandings:
- 50% usuarios → Branding A
- 50% usuarios → Branding B
- Medir conversión

---

## 📚 DOCUMENTACIÓN COMPLETA

### Ver guía detallada:
**[GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)**

Incluye:
- ✅ Crear nuevo branding paso a paso
- ✅ Crear nuevos textos
- ✅ Crear tenant completo
- ✅ Ejemplos de código
- ✅ Casos de uso
- ✅ Deploy multi-tenant

---

## ✅ VENTAJAS

### Para ti como desarrollador:
- ✅ **Un solo código base** (no duplicar nada)
- ✅ **Fácil de mantener** (cambios en un lugar)
- ✅ **Escalable** (agregar tenants fácilmente)
- ✅ **Tipado** (TypeScript en todo)

### Para tus clientes:
- ✅ **Su propio branding** (logo, colores)
- ✅ **Textos personalizados** (su voz de marca)
- ✅ **Features a medida** (solo lo que necesitan)
- ✅ **Rápido** (cambios en minutos)

### Para el negocio:
- ✅ **Vender a múltiples clientes** (white-label)
- ✅ **Configuración sin código** (cambio en config)
- ✅ **A/B testing** (probar brandings)
- ✅ **Multi-tenant ready** (SaaS escalable)

---

## 🚀 SIGUIENTE PASO

### Para empezar:

1. **Ver los ejemplos:**
   - Abrir app en desarrollo
   - Clic en botón 🏢 (abajo derecha)
   - Cambiar entre tenants
   - Ver cómo cambia todo automáticamente

2. **Crear tu primer tenant:**
   - Leer [GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)
   - Crear branding en 2 minutos
   - Agregar textos personalizados
   - Configurar features

3. **Usar en componentes:**
   - Usar `useTenant()` en tus componentes
   - Reemplazar textos hardcodeados
   - Aplicar colores dinámicos
   - Verificar features antes de renderizar

---

## 🎉 RESULTADO

### Antes:
```typescript
<h1>Udar Edge</h1> // Hardcodeado
<button className="bg-black">Guardar</button> // Color fijo
```

### Después:
```typescript
const { branding, texts } = useTenant();

<h1>{branding.appName}</h1> // Dinámico por tenant
<button style={{ backgroundColor: branding.colors.primary }}>
  {texts.common.save}
</button>
```

**¡Tu app ahora es multi-tenant!** 🚀

---

## 📞 PREGUNTAS FRECUENTES

**P: ¿Puedo tener múltiples tenants en producción?**
R: Sí, detectando el tenant por subdomain, path o header.

**P: ¿Los tenants comparten base de datos?**
R: Depende de tu implementación. Puedes tener DB separadas o compartida con `tenant_id`.

**P: ¿Puedo agregar tenants sin recompilar?**
R: Sí, cargando configuración desde API/DB en runtime.

**P: ¿Funciona en móvil (iOS/Android)?**
R: Sí, completamente. El branding se aplica en Capacitor también.

**P: ¿Afecta al performance?**
R: No, el branding se aplica una vez al cargar.

---

**TODO LISTO PARA MULTI-TENANT** ✅

*Última actualización: 28 Noviembre 2025*
 