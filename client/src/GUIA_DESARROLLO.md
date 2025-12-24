# 📱 Guía de Desarrollo - FoodDigital SaaS

## 🎯 Objetivo del Proyecto

Aplicación SaaS mobile-first para digitalizar negocios, específicamente adaptada para "Taller 360" (taller mecánico).

**Prioridad:** Aplicación móvil nativa (APK) con capacidad de funcionar en web desktop.

---

## 📐 Arquitectura del Código

### **Estructura Mobile-First Responsive**

El código está diseñado con un enfoque **mobile-first** usando Tailwind CSS responsive:

```
📱 Mobile (< 1024px): Layout móvil por defecto
💻 Desktop (≥ 1024px): Layout expandido automáticamente
```

### **Sistema de Breakpoints Tailwind**
```typescript
// Mobile: Sin prefijo (por defecto)
className="flex-col"

// Tablet: sm: (640px)
className="sm:grid-cols-2"

// Desktop: lg: (1024px)
className="lg:grid-cols-4"
```

---

## 🏗️ Estructura de Dashboards

### **3 Tipos de Usuario**

1. **Cliente** (`/components/ClienteDashboard.tsx`)
   - Hace pedidos, ve historial, chat con soporte
   - Sistema de planes de suscripción

2. **Trabajador/Colaborador** (`/components/TrabajadorDashboard.tsx`)
   - Gestión de tareas, fichaje, reportes
   - Vista de formación y soporte

3. **Gerente** (`/components/GerenteDashboard.tsx`)
   - Dashboard 360°, operativa, clientes
   - Facturación, RRHH, proveedores, productividad

---

## 🎨 Sistema de Navegación

### **Mobile (< 1024px)**
```typescript
// Hamburger button (fixed top-left)
className="lg:hidden fixed top-4 left-4 z-50"

// Sidebar deslizante desde la izquierda
className="fixed z-40 h-full -translate-x-full"
className="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"

// Overlay oscuro cuando el menú está abierto
className="lg:hidden fixed inset-0 bg-black/50 z-30"
```

### **Desktop (≥ 1024px)**
```typescript
// Sidebar siempre visible (relativa al layout)
className="lg:translate-x-0 lg:relative"

// Botón de colapsar sidebar (opcional)
className="hidden lg:block"

// Sin hamburger button
className="lg:hidden"
```

---

## 🔑 Componentes Clave

### **1. Estado del Dashboard**
```typescript
const [activeSection, setActiveSection] = useState('inicio');
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
```

### **2. Sidebar Responsive**
```typescript
<aside className={`
  bg-white border-r transition-all duration-300 flex flex-col 
  fixed z-40 h-full
  ${sidebarCollapsed ? 'w-20' : 'w-64'}
  ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:relative'}
`}>
```

### **3. Main Content**
```typescript
<main className="flex-1 overflow-y-auto w-full lg:w-auto">
  <header className="bg-white border-b sticky top-0 z-10">
    <h1 className="ml-12 lg:ml-0"> {/* Espacio para hamburger en mobile */}
  </header>
  
  <div className="p-4 sm:p-6 pb-24 lg:pb-6"> {/* Padding bottom para botón flotante mobile */}
    {/* Contenido dinámico */}
  </div>
</main>
```

---

## 📦 Componentes UI (Shadcn)

Ubicación: `/components/ui/`

**Componentes disponibles:**
- `Button`, `Badge`, `Card`, `Input`, `Textarea`
- `Dialog`, `Sheet`, `Tooltip`, `Popover`
- `Select`, `Checkbox`, `Switch`, `Slider`
- `Table`, `Tabs`, `Calendar`, `Form`
- Y más... (ver `/components/ui/`)

**Uso:**
```typescript
import { Button } from './ui/button';
import { Card } from './ui/card';
```

---

## 🎨 Sistema de Diseño

### **Tipografía**
```css
/* globals.css */
h1, h2, h3, h4, h5, h6: Poppins (títulos)
p, span, div: Open Sans (texto general)
```

⚠️ **IMPORTANTE:** No usar clases Tailwind de tipografía (`text-2xl`, `font-bold`, etc.) a menos que sea necesario.

### **Colores Principales**
```css
--primary: Teal/Turquesa (#14B8A6, teal-600)
--secondary: Naranja (#F97316, orange-600)
--success: Verde (#22C55E, green-600)
--danger: Rojo (#EF4444, red-600)
```

### **Moneda**
```typescript
// Todos los precios en euros
€45.00
```

---

## 🔧 Conversión a APK (React Native)

### **Puntos a considerar:**

1. **Navegación:**
   - Reemplazar sidebar con React Navigation (Stack/Drawer)
   - Eliminar clase `lg:` (no hay "desktop" en móvil)

2. **Componentes que cambiar:**
   ```
   div → View
   span/p → Text
   button → TouchableOpacity / Pressable
   img → Image
   ```

3. **Estilos:**
   - Convertir Tailwind a StyleSheet de React Native
   - Usar Nativewind para mantener sintaxis similar

4. **APIs y servicios:**
   - Las llamadas HTTP funcionan igual
   - Configurar navegación en `/config/app.config.ts`

5. **Imágenes:**
   - Reemplazar `ImageWithFallback` con `Image` de React Native
   - Gestionar assets locales

---

## 📂 Estructura de Archivos

```
/
├── App.tsx                          # Punto de entrada, routing de usuarios
├── components/
│   ├── ClienteDashboard.tsx         # Dashboard del cliente
│   ├── TrabajadorDashboard.tsx      # Dashboard del colaborador
│   ├── GerenteDashboard.tsx         # Dashboard del gerente
│   ├── LoginView.tsx                # Pantalla de login
│   ├── ui/                          # Componentes Shadcn UI
│   ├── gerente/                     # Sub-componentes del gerente
│   ├── InicioColaborador.tsx        # Vistas del colaborador
│   ├── TareasColaborador.tsx
│   └── ...
├── styles/
│   └── globals.css                  # Estilos globales, tipografía
├── config/
│   └── app.config.ts                # Configuración de la app
└── GUIA_DESARROLLO.md              # Este archivo
```

---

## 🚀 Flujo de Usuario

### **1. Login**
```typescript
// App.tsx
<LoginView onLogin={handleLogin} />
```

### **2. Autenticación**
```typescript
// Mock users en LoginView.tsx (línea ~11)
const mockUsers = {
  cliente: { email: '...', password: '...' },
  trabajador: { email: '...', password: '...' },
  gerente: { email: '...', password: '...' }
}
```

### **3. Dashboard según rol**
```typescript
{currentUser.role === 'cliente' && <ClienteDashboard />}
{currentUser.role === 'trabajador' && <TrabajadorDashboard />}
{currentUser.role === 'gerente' && <GerenteDashboard />}
```

---

## 💡 Buenas Prácticas Implementadas

✅ **Mobile-first approach:** Layout móvil por defecto
✅ **Responsive puro:** Sin simulación artificial
✅ **Accesibilidad:** ARIA labels, focus states, min-height táctil (44px)
✅ **Componentes reutilizables:** Shadcn UI + custom components
✅ **Código limpio:** Sin lógica de `mobileView` confusa
✅ **TypeScript:** Type-safe
✅ **Tailwind CSS v4:** Sistema de diseño consistente

---

## 📝 Notas para el Programador

### **Para desarrollo web:**
- El código funciona tal cual está
- Responsive automático de mobile a desktop
- Probar en diferentes tamaños de pantalla

### **Para conversión a APK:**
1. Analizar componentes específicos de cada dashboard
2. Identificar dependencias de navegación
3. Mapear componentes web → React Native
4. Configurar React Navigation
5. Adaptar estilos a StyleSheet
6. Gestionar almacenamiento local (AsyncStorage)
7. Configurar variables de entorno

### **Testing recomendado:**
- Chrome DevTools (modo responsive)
- Navegadores mobile reales
- iOS Safari / Android Chrome
- Diferentes resoluciones (320px - 1920px)

---

## 🐛 Resolución de Problemas

### **Contenido se desborda en mobile:**
```typescript
// Agregar en el contenedor principal
className="max-w-full overflow-x-hidden"

// En cards/componentes internos
className="min-w-0 flex-1" // Permite que el texto se ajuste
className="shrink-0" // Para iconos que no deben comprimirse
```

### **Sidebar no se cierra en mobile:**
```typescript
const handleMenuItemClick = (itemId: string) => {
  setActiveSection(itemId);
  setMobileMenuOpen(false); // ← Importante
};
```

### **Espaciado header en mobile:**
```typescript
// Header necesita margen izquierdo para el hamburger
className="ml-12 lg:ml-0"
```

---

## 📞 Información de Contacto

**Proyecto:** FoodDigital SaaS - Taller 360
**Versión:** 1.0.0
**Fecha:** Noviembre 2024
**Stack:** React + TypeScript + Tailwind CSS + Shadcn UI

---

## ✅ Checklist Conversión a APK

- [ ] Instalar React Native / Expo
- [ ] Configurar React Navigation
- [ ] Mapear componentes web → native
- [ ] Convertir estilos Tailwind → StyleSheet
- [ ] Implementar AsyncStorage para persistencia
- [ ] Configurar APIs y endpoints
- [ ] Gestionar permisos móviles
- [ ] Testing en dispositivos físicos
- [ ] Build APK/AAB
- [ ] Publicar en Google Play

---

**¡Código listo para producción!** 🚀
