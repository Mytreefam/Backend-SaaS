# 🔄 CAMBIO RÁPIDO DE TENANT

## ⚡ **CAMBIAR EN 30 SEGUNDOS**

Para cambiar entre **HoyPecamos** y **Udar Edge** (o cualquier otro tenant), solo necesitas **cambiar 2 líneas**.

---

## 🍰 **MODO HOY PECAMOS** (Actual - ACTIVADO ✅)

### **Paso 1:** `/config/tenant.config.ts` - Línea 267
```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_HOY_PECAMOS;
```

### **Paso 2:** `/capacitor.config.ts` - Líneas 4-5
```typescript
appId: 'com.hoypecamos.app',
appName: 'Hoy Pecamos',
```

### **Paso 3:** `/capacitor.config.ts` - Líneas 12 y 20
```typescript
backgroundColor: '#ED1C24', // Rojo HoyPecamos
iconColor: '#ED1C24',        // Rojo HoyPecamos
```

**Resultado:** App roja/negra con logo HoyPecamos ❤️

---

## 🎨 **MODO UDAR EDGE**

### **Paso 1:** `/config/tenant.config.ts` - Línea 267
```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_UDAR_EDGE;
```

### **Paso 2:** `/capacitor.config.ts` - Líneas 4-5
```typescript
appId: 'com.udaredge.app',
appName: 'Udar Edge',
```

### **Paso 3:** `/capacitor.config.ts` - Líneas 12 y 20
```typescript
backgroundColor: '#4DB8BA', // Teal UdarEdge
iconColor: '#4DB8BA',        // Teal UdarEdge
```

**Resultado:** App teal con logo UdarEdge 🎨

---

## 🍕 **MODO LA PIZZERÍA**

### **Paso 1:** `/config/tenant.config.ts` - Línea 267
```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_LA_PIZZERIA;
```

### **Paso 2:** `/capacitor.config.ts` - Líneas 4-5
```typescript
appId: 'com.lapizzeria.app',
appName: 'La Pizzería',
```

### **Paso 3:** `/capacitor.config.ts` - Líneas 12 y 20
```typescript
backgroundColor: '#d32f2f', // Rojo italiano
iconColor: '#d32f2f',
```

**Resultado:** App roja italiana con logo 🍕

---

## ☕ **MODO COFFEE HOUSE**

### **Paso 1:** `/config/tenant.config.ts` - Línea 267
```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_COFFEE_HOUSE;
```

### **Paso 2:** `/capacitor.config.ts` - Líneas 4-5
```typescript
appId: 'com.coffeehouse.app',
appName: 'Coffee House',
```

### **Paso 3:** `/capacitor.config.ts` - Líneas 12 y 20
```typescript
backgroundColor: '#5d4037', // Marrón café
iconColor: '#5d4037',
```

**Resultado:** App marrón café con logo ☕

---

## 👗 **MODO FASHION STORE**

### **Paso 1:** `/config/tenant.config.ts` - Línea 267
```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_FASHION_STORE;
```

### **Paso 2:** `/capacitor.config.ts` - Líneas 4-5
```typescript
appId: 'com.fashionstore.app',
appName: 'Fashion Store',
```

### **Paso 3:** `/capacitor.config.ts` - Líneas 12 y 20
```typescript
backgroundColor: '#000000', // Negro elegante
iconColor: '#e91e63',       // Rosa acento
```

**Resultado:** App negra elegante con logo 👗

---

## 📋 **TABLA RESUMEN DE TENANTS**

| Tenant | Slug | Color Primary | Logo | Package ID |
|--------|------|---------------|------|------------|
| **Hoy Pecamos** | `hoy-pecamos` | `#ED1C24` (Rojo) | 🍰 | com.hoypecamos.app |
| **Udar Edge** | `udar-edge` | `#4DB8BA` (Teal) | 🎨 | com.udaredge.app |
| **La Pizzería** | `la-pizzeria` | `#d32f2f` (Rojo) | 🍕 | com.lapizzeria.app |
| **Coffee House** | `coffee-house` | `#5d4037` (Marrón) | ☕ | com.coffeehouse.app |
| **Fashion Store** | `fashion-store` | `#000000` (Negro) | 👗 | com.fashionstore.app |

---

## 🚀 **Después del Cambio:**

```bash
# 1. Reiniciar servidor de desarrollo (si está corriendo)
# Ctrl+C para detener
npm run dev

# 2. Para compilar APK con el nuevo tenant:
npm run build
npx cap sync android
npx cap open android
```

---

## 💡 **Verificación Rápida:**

Después de cambiar el tenant, verifica que se apliquen:

✅ **Logo** correcto en splash screen  
✅ **Colores** del tema (botones, fondos)  
✅ **Textos** personalizados (login, onboarding)  
✅ **Nombre de la app** en título de ventana  
✅ **Package ID** correcto para APK  

---

## 🎯 **ESTADO ACTUAL:**

```
✅ TENANT ACTIVO: HOY PECAMOS
✅ APP ID: com.hoypecamos.app
✅ COLORES: Rojo #ED1C24 + Negro
✅ LOGO: HoyPecamos oficial
✅ TEXTOS: Personalizados
```

**Para volver a Udar Edge, cambia las 2 líneas arriba y reinicia el servidor.** 🔄
