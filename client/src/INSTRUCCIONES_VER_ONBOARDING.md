# 🎬 CÓMO VER EL ONBOARDING - TEMPORAL

## ✅ CAMBIOS REALIZADOS

### 1️⃣ **Archivo de entrada creado**: `/src/main.tsx`
- Ahora apunta a `App.mobile.tsx`
- Este archivo tiene el flujo completo: Splash → Onboarding → Login → Permisos → App

### 2️⃣ **Lógica de "solo una vez" desactivada** (TEMPORAL)
En `/App.mobile.tsx`:
```typescript
// ⚠️ TEMPORAL: SIEMPRE mostrar onboarding para desarrollo
// TODO: Reactivar lógica de "hasSeenOnboarding" cuando esté listo
// const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
```

### 3️⃣ **Ahora SIEMPRE se muestra el onboarding** (si está habilitado en config)

---

## 🔧 CÓMO VER LOS 4 SLIDES

### **Paso 1: Limpia el localStorage**
Si ya habías entrado antes, tienes datos guardados que te llevan directo a la app.

**Opción A - Limpiar todo (Recomendado):**
1. Abre la consola del navegador (`F12` o clic derecho → Inspeccionar)
2. Ve a la pestaña **"Console"**
3. Escribe:
```javascript
localStorage.clear()
```
4. Presiona `Enter`
5. Recarga la página (`F5`)

**Opción B - Solo borrar el usuario:**
```javascript
localStorage.removeItem('currentUser')
localStorage.removeItem('hasSeenOnboarding')
```

---

### **Paso 2: Recarga la página**
- Presiona `F5` o `Ctrl+R`
- Espera 2 segundos (Splash Screen)
- ✅ **Verás el Onboarding con los 4 slides!**

---

## 📱 FLUJO QUE VERÁS

```
1. SPLASH SCREEN (2s)
   ↓
2. ONBOARDING (4 slides)
   - Slide 1: "¿Quiénes somos?" 🏢
   - Slide 2: "Todo tu negocio en una sola app" 📱
   - Slide 3: "Trabaja desde cualquier lugar" 🌐
   - Slide 4: "Aumenta tus ventas un 40%" 📈
   ↓
3. LOGIN / REGISTRO
   ↓
4. PERMISOS (notificaciones, ubicación, etc.)
   ↓
5. APP PRINCIPAL (según tu rol: Cliente/Trabajador/Gerente)
```

---

## 🎨 LOS 4 SLIDES DEL ONBOARDING

### **Slide 1: ¿Quiénes somos?**
- Icono: Building (🏢)
- Descripción: "Somos Udar Edge, la plataforma SaaS líder en digitalización para negocios de hostelería..."

### **Slide 2: Todo tu negocio en una sola app**
- Icono: Smartphone (📱)
- Descripción: "TPV completo, gestión de pedidos, control de stock, fichaje de empleados, reportes en tiempo real..."

### **Slide 3: Trabaja desde cualquier lugar**
- Icono: Globe (🌐)
- Descripción: "Modo offline, sincronización automática, notificaciones en tiempo real..."

### **Slide 4: Aumenta tus ventas un 40%**
- Icono: TrendingUp (📈)
- Descripción: "Nuestros clientes mejoran su eficiencia operativa, reducen costes y aumentan sus ingresos..."

---

## ⚡ NAVEGACIÓN EN EL ONBOARDING

- **Botón "Siguiente"** → Avanza al siguiente slide
- **Botón "Saltar"** → Salta directamente al login
- **Botón "Empezar"** (último slide) → Va al login
- **Botón "← Anterior"** → Vuelve al slide anterior
- **Indicadores de progreso** → Puntos en la parte inferior

---

## 🔄 CUANDO ESTÉ TODO LISTO

### **Reactivar la lógica de "solo una vez":**

En `/App.mobile.tsx`, descomenta estas líneas:

```typescript
// ✅ PRODUCCIÓN: Descomentar esto
const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');

// Y cambiar esto:
if (config.onboarding.enabled) {
  // ...
}

// Por esto:
if (!hasSeenOnboarding && config.onboarding.enabled) {
  // Mostrar onboarding después del splash
  setTimeout(() => {
    setAppState('onboarding');
  }, 2000);
} else {
  // Ir directo a login después del splash
  setTimeout(() => {
    setAppState('login');
  }, 2000);
}
```

---

## 📝 PERSONALIZAR LOS SLIDES

Los slides se configuran en `/config/white-label.config.ts` (líneas 109-138):

```typescript
onboarding: {
  enabled: true,
  screens: [
    {
      id: '1',
      title: '¿Quiénes somos?',
      description: 'Somos Udar Edge...',
      image: '/onboarding/screen1.svg',
      icon: 'building',
    },
    // ... más slides
  ],
}
```

**Para cambiar el contenido:**
1. Edita el título y descripción
2. Cambia el icono (`building`, `smartphone`, `globe`, `trending-up`, etc.)
3. Guarda y recarga

---

## 🚫 DESACTIVAR ONBOARDING (TEMPORAL)

Si quieres desactivar el onboarding temporalmente:

En `/config/white-label.config.ts`:
```typescript
onboarding: {
  enabled: false, // ← Cambia a false
  screens: [...]
}
```

---

## 📂 ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| `/src/main.tsx` | ✅ Creado - Apunta a App.mobile.tsx |
| `/App.mobile.tsx` | ✅ Comentada lógica de "hasSeenOnboarding" |
| `/components/LoginViewMobile.tsx` | ✅ Siempre asigna rol 'cliente' |
| `/ESPECIFICACIONES_FLUJO.md` | ✅ Flujo completo documentado |

---

## ❓ TROUBLESHOOTING

### **No veo el onboarding, voy directo a la app**
→ Tienes un usuario guardado. Ejecuta `localStorage.clear()` y recarga.

### **No veo el onboarding, voy directo al login**
→ Revisa que `onboarding.enabled: true` en `/config/white-label.config.ts`

### **Los slides no tienen contenido**
→ Verifica que los datos en `white-label.config.ts` estén completos

### **Error al cargar**
→ Abre la consola (`F12`) y mira los errores. Comparte el error para ayudarte.

---

**Fecha**: 2025-12-01  
**Estado**: TEMPORAL - Para desarrollo  
**Próximo paso**: Reactivar lógica cuando esté listo para producción
