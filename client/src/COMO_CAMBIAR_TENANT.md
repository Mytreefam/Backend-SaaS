# 🏢 CÓMO CAMBIAR DE TENANT (Sin Botón Flotante)

---

## ✅ ESTADO ACTUAL

La aplicación tiene **4 tenants configurados** y funcionando:

1. 🎨 **Udar Edge** - Genérico (Negro)
2. 🍕 **La Pizzería** - Restaurante italiano (Rojo)
3. ☕ **Coffee House** - Cafetería (Marrón)
4. 👗 **Fashion Store** - Tienda de moda (Negro elegante)

---

## 🔧 MÉTODO 1: Consola del Navegador (MÁS RÁPIDO)

### **Paso 1:** Abre la consola
- **Windows/Linux:** `F12` o `Ctrl + Shift + J`
- **Mac:** `Cmd + Option + J`

### **Paso 2:** Pega uno de estos comandos

```javascript
// 🎨 Udar Edge (Negro profesional)
localStorage.setItem('activeTenant', 'udar-edge');
location.reload();

// 🍕 La Pizzería (Rojo italiano)
localStorage.setItem('activeTenant', 'la-pizzeria');
location.reload();

// ☕ Coffee House (Marrón café)
localStorage.setItem('activeTenant', 'coffee-house');
location.reload();

// 👗 Fashion Store (Negro elegante)
localStorage.setItem('activeTenant', 'fashion-store');
location.reload();
```

### **Paso 3:** Presiona Enter

✅ La página se recargará con el nuevo tenant aplicado.

---

## 📝 MÉTODO 2: Editar Código

### **Archivo:** `/config/tenant.config.ts`

### **Buscar línea ~250:**

```typescript
// ============================================
// 🎯 TENANT ACTIVO
// ============================================

// Cambiar este valor:
export const ACTIVE_TENANT: TenantConfig = TENANT_UDAR_EDGE;

// Opciones disponibles:
// TENANT_UDAR_EDGE       → 🎨 Negro profesional
// TENANT_LA_PIZZERIA     → 🍕 Rojo italiano
// TENANT_COFFEE_HOUSE    → ☕ Marrón café
// TENANT_FASHION_STORE   → 👗 Negro elegante
```

### **Ejemplo: Cambiar a La Pizzería**

```typescript
export const ACTIVE_TENANT: TenantConfig = TENANT_LA_PIZZERIA; // 🍕
```

**Guarda el archivo** → Vite recarga automáticamente.

---

## 🌐 MÉTODO 3: Página HTML Standalone

Abre en tu navegador:

```
http://localhost:5173/tenant-switcher.html
```

Interfaz visual completa para cambiar entre tenants.

---

## ✅ VERIFICAR QUE FUNCIONÓ

### **Cambios visuales esperados:**

**UDAR EDGE → LA PIZZERÍA:**

```
ANTES (Negro):                DESPUÉS (Rojo):
┌────────────────────┐       ┌────────────────────┐
│ 🎨 Udar Edge   👤 │   →   │ 🍕 La Pizzería 👤 │
│ Bienvenido         │       │ Bienvenido a La... │
│ [Iniciar Sesión]   │       │ [Entrar]           │
└────────────────────┘       └────────────────────┘
   Botón NEGRO                   Botón ROJO
```

**Si los colores y textos cambiaron** → ✅ **¡FUNCIONA!**

---

## 🎯 CAMBIOS QUE VERÁS:

### **Logo/Icono:**
- 🎨 Udar Edge
- 🍕 La Pizzería  
- ☕ Coffee House
- 👗 Fashion Store

### **Colores:**
- **Primarios:** Negro/Rojo/Marrón/Negro elegante
- **Secundarios:** Diferentes para cada tenant
- **Acentos:** Diferentes para cada tenant

### **Textos:**
- **Nombre de la app**
- **Tagline**
- **Textos de botones**
- **Mensajes del sistema**

### **Contenido:**
- **Productos mostrados** (según el negocio)
- **Categorías disponibles**
- **Funcionalidades habilitadas**

---

## 🔄 VOLVER AL TENANT ORIGINAL

```javascript
// Consola del navegador (F12)
localStorage.setItem('activeTenant', 'udar-edge');
location.reload();
```

---

## 🧪 VER TENANT ACTUAL

```javascript
// Consola del navegador (F12)
console.log('Tenant actual:', localStorage.getItem('activeTenant'));
```

---

## 📊 CONFIGURACIÓN DE CADA TENANT

### **🎨 Udar Edge (Genérico)**
- **Slug:** `udar-edge`
- **Color:** Negro (#030213)
- **Uso:** SaaS genérico para cualquier negocio

### **🍕 La Pizzería (Restaurante)**
- **Slug:** `la-pizzeria`
- **Color:** Rojo (#d32f2f)
- **Uso:** Restaurante italiano, pizzería

### **☕ Coffee House (Cafetería)**
- **Slug:** `coffee-house`
- **Color:** Marrón (#5d4037)
- **Uso:** Café, cafetería, pastelería

### **👗 Fashion Store (Moda)**
- **Slug:** `fashion-store`
- **Color:** Negro elegante (#000000)
- **Uso:** Tienda de ropa, boutique

---

## 🎨 CREAR NUEVO TENANT

Consulta la documentación completa:
- [GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)
- [SISTEMA_WHITE_LABEL_RESUMEN.md](SISTEMA_WHITE_LABEL_RESUMEN.md)

---

## ⚙️ UBICACIÓN DE ARCHIVOS

```
/config/
  ├── branding/
  │   ├── udar-edge.branding.ts    (🎨)
  │   ├── la-pizzeria.branding.ts  (🍕)
  │   ├── coffee-house.branding.ts (☕)
  │   └── fashion-store.branding.ts (👗)
  │
  ├── texts/
  │   ├── udar-edge.texts.ts
  │   ├── la-pizzeria.texts.ts
  │   ├── coffee-house.texts.ts
  │   └── fashion-store.texts.ts
  │
  ├── tenants/
  │   ├── udar-edge.tenant.ts
  │   ├── la-pizzeria.tenant.ts
  │   ├── coffee-house.tenant.ts
  │   └── fashion-store.tenant.ts
  │
  └── tenant.config.ts  ← TENANT ACTIVO AQUÍ
```

---

## 🚀 EJEMPLO PRÁCTICO COMPLETO

### **Escenario:** Probar todos los tenants

```javascript
// 1. Abrir consola (F12)

// 2. Ver actual
console.log('Actual:', localStorage.getItem('activeTenant'));

// 3. Probar Pizzería
localStorage.setItem('activeTenant', 'la-pizzeria');
location.reload();
// ✅ Observa: Logo 🍕, colores rojos, textos en italiano

// 4. Probar Café (después de que recargue)
localStorage.setItem('activeTenant', 'coffee-house');
location.reload();
// ✅ Observa: Logo ☕, colores marrones, ambiente de café

// 5. Probar Fashion (después de que recargue)
localStorage.setItem('activeTenant', 'fashion-store');
location.reload();
// ✅ Observa: Logo 👗, colores negros elegantes, moda

// 6. Volver a Udar Edge
localStorage.setItem('activeTenant', 'udar-edge');
location.reload();
// ✅ Observa: Logo 🎨, colores genéricos, SaaS
```

---

## 📖 DOCUMENTACIÓN RELACIONADA

- **Resumen del sistema:** [SISTEMA_WHITE_LABEL_RESUMEN.md](SISTEMA_WHITE_LABEL_RESUMEN.md)
- **Guía completa:** [GUIA_WHITE_LABEL.md](GUIA_WHITE_LABEL.md)
- **Lista de verificación:** [LISTO_PARA_PROBAR.md](LISTO_PARA_PROBAR.md)

---

## 🎉 ¡DISFRUTA EL SISTEMA WHITE-LABEL!

**4 tenants completos y personalizables.**  
**Cambia entre ellos en segundos.**  
**Listo para producción.** ✅

---

*Sistema White-Label Multi-Tenant - Udar Edge v1.0*  
*Última actualización: 28 Noviembre 2025*
