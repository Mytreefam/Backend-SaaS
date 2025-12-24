# 🎯 ¿DÓNDE ESTÁ EL BOTÓN?

---

## 📍 UBICACIÓN EXACTA

El botón **🏢** está en la **ESQUINA INFERIOR DERECHA** de la pantalla.

```
┌─────────────────────────────────────────────┐
│  🎨 Udar Edge                          👤  │
│                                             │
│                                             │
│  Bienvenido                                 │
│  Inicia sesión para continuar              │
│                                             │
│  Email                                      │
│  [                                      ]   │
│                                             │
│  Contraseña                                 │
│  [                                      ]   │
│                                             │
│  [Iniciar Sesión]                           │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                             │
│                                         🏢  │ ← AQUÍ!
└─────────────────────────────────────────────┘
   ↑                                      ↑
bottom-4                              right-4
```

---

## 🎨 CÓMO SE VE

### **El botón es:**

```
┌─────┐
│     │
│ 🏢  │  ← Icono de edificio (Building2)
│     │
└─────┘
```

**Características:**
- 🟣 **Color:** Morado/Púrpura (`bg-purple-600`)
- 📏 **Tamaño:** 48x48px (con padding)
- 🔵 **Forma:** Círculo redondo (`rounded-full`)
- 🌑 **Sombra:** Shadow grande (`shadow-lg`)
- 🎭 **Hover:** Se oscurece al pasar el mouse (`hover:bg-purple-700`)
- 🔝 **Z-index:** 999 (siempre visible encima de todo)

---

## 🖱️ AL HACER CLIC

### **Se abre un panel encima del botón:**

```
                    ┌──────────────────────────────┐
                    │ 🏢 Cambiar Tenant/Empresa  ✕ │
                    ├──────────────────────────────┤
                    │ Solo visible en desarrollo    │
                    │                               │
                    │ Seleccionar tenant:           │
                    │ ┌──────────────────────────┐  │
                    │ │ 🎨 Udar Edge          ▾  │  │
                    │ └──────────────────────────┘  │
                    │                               │
                    │ Tenant ID: tenant-001         │
                    │ Slug: udar-edge               │
                    │ Locale: es-ES                 │
                    │                               │
                    │ Colores: ▪️ ▪️ ▪️             │
                    └──────────────────────────────┘
                ┌─────┐
                │ 🏢  │ ← Botón que abrió el panel
                └─────┘
```

---

## 🔽 AL ABRIR EL DROPDOWN

### **Verás las 4 opciones:**

```
┌──────────────────────────────┐
│ 🏢 Cambiar Tenant/Empresa  ✕ │
├──────────────────────────────┤
│ Seleccionar tenant:           │
│ ┌──────────────────────────┐  │
│ │ 🎨 Udar Edge          ▾  │◄─ Clic aquí
│ └──────────────────────────┘  │
│   ┌────────────────────────┐  │
│   │ 🎨 Udar Edge           │  │ ◄─ Opción 1
│   │    Digitaliza tu...    │  │
│   ├────────────────────────┤  │
│   │ 🍕 La Pizzería         │  │ ◄─ Opción 2
│   │    La mejor pizza...   │  │
│   ├────────────────────────┤  │
│   │ ☕ Coffee House        │  │ ◄─ Opción 3
│   │    El mejor café...    │  │
│   ├────────────────────────┤  │
│   │ 👗 Fashion Store       │  │ ◄─ Opción 4
│   │    Tu estilo, tu...    │  │
│   └────────────────────────┘  │
└──────────────────────────────┘
```

---

## ✅ VERIFICACIÓN RÁPIDA

### **¿Estás en modo desarrollo?**

```bash
# Verifica que ejecutaste:
npm run dev

# NO:
npm run build
npm run preview
npm start
```

### **¿Qué puerto?**

Por defecto: **http://localhost:5173/**

Si usas otro puerto, asegúrate de estar en la URL correcta.

---

## 🔍 SI NO LO VES

### **1. Verifica la consola del navegador (F12)**

Busca errores como:
```
❌ Cannot find module './components/dev/TenantSwitcher'
❌ Cannot find module './hooks/useTenant'
❌ Cannot find module './components/ui/select'
```

### **2. Verifica que el archivo existe:**

```bash
# En tu terminal:
ls -la components/dev/TenantSwitcher.tsx
ls -la hooks/useTenant.ts
ls -la config/tenant.config.ts
```

Deberían existir todos.

### **3. Scroll hasta abajo**

A veces la pantalla es larga y el botón está abajo del todo.
**Haz scroll hacia abajo** hasta ver la esquina inferior derecha.

### **4. Zoom del navegador**

Si tienes zoom muy grande (>150%), el botón puede quedar fuera de vista.
Prueba con zoom 100% (Ctrl+0).

---

## 🎯 CÓDIGO DEL BOTÓN

### **Está en:** `/components/dev/TenantSwitcher.tsx` (líneas 37-43)

```typescript
<button
  onClick={() => setIsVisible(!isVisible)}
  className="fixed bottom-4 right-4 z-[999] bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
  aria-label="Cambiar tenant"
>
  <Building2 className="w-6 h-6" />
</button>
```

### **Incluido en:** `/App.tsx` (líneas 118 y 157)

```typescript
{/* En la pantalla de login (sin usuario) */}
{(import.meta?.env?.DEV || import.meta?.env?.MODE === 'development') && <TenantSwitcher />}

{/* En el dashboard (con usuario) */}
{(import.meta?.env?.DEV || import.meta?.env?.MODE === 'development') && <TenantSwitcher />}
```

---

## 🐛 TROUBLESHOOTING

### **Error: "Select is not defined"**

Instala shadcn select:
```bash
npm install @radix-ui/react-select
```

O verifica que existe: `/components/ui/select.tsx`

### **Error: "Building2 is not defined"**

Instala lucide-react:
```bash
npm install lucide-react
```

### **El botón aparece pero no hace nada**

Abre la consola (F12) y busca errores al hacer clic.

### **El panel se abre pero el dropdown no funciona**

Verifica que `components/ui/select.tsx` esté correctamente instalado.

---

## 🎨 PERSONALIZACIÓN (OPCIONAL)

### **Cambiar posición:**

```typescript
// En /components/dev/TenantSwitcher.tsx línea 39
className="fixed bottom-4 left-4 ..." // Izquierda
className="fixed top-4 right-4 ..."   // Arriba derecha
className="fixed top-4 left-4 ..."    // Arriba izquierda
```

### **Cambiar color:**

```typescript
className="fixed bottom-4 right-4 z-[999] bg-blue-600 ..." // Azul
className="fixed bottom-4 right-4 z-[999] bg-green-600 ..." // Verde
className="fixed bottom-4 right-4 z-[999] bg-red-600 ..." // Rojo
```

### **Cambiar icono:**

```typescript
import { Settings, Palette, Globe } from 'lucide-react';

<Settings className="w-6 h-6" />  // Engranaje
<Palette className="w-6 h-6" />   // Paleta
<Globe className="w-6 h-6" />     // Globo
```

---

## ✅ RESUMEN

**UBICACIÓN:**  
🎯 Esquina inferior derecha

**APARIENCIA:**  
🟣 Botón morado redondo con icono 🏢

**FUNCIONALIDAD:**  
- Clic → Abre panel
- Select → Elige tenant
- Cambia → App recarga con nuevo tenant

**REQUISITO:**  
⚠️ Solo visible en `npm run dev` (modo desarrollo)

---

## 🚀 ¡PRUÉBALO!

```bash
npm run dev
# Espera a que compile
# Abre navegador
# Busca esquina inferior derecha
# Verás el botón morado 🏢
# ¡Clic y disfruta! ✨
```

---

**¿Dudas?** Abre `/components/dev/TenantSwitcher.tsx` para ver el código completo.

---

*Última actualización: 28 Noviembre 2025*
