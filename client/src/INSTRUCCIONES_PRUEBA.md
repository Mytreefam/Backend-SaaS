# 🧪 INSTRUCCIONES DE PRUEBA - SISTEMA WHITE-LABEL

## ¡Vamos a probar el sistema de tenants!

---

## 🚀 PASO 1: INICIAR LA APP

```bash
npm run dev
```

Espera a que compile y se abra en el navegador.

---

## 🎨 PASO 2: ENCONTRAR EL BOTÓN FLOTANTE

Busca en la **esquina inferior derecha** un botón morado flotante con el icono:

```
🏢
```

**Si no lo ves:**
- Asegúrate de que estás en modo desarrollo
- El botón está en posición fija: `bottom-4 right-4`

---

## 🔄 PASO 3: CAMBIAR ENTRE TENANTS

### Clic en el botón 🏢

Se abrirá un panel con:

```
┌────────────────────────────────┐
│ 🏢 Cambiar Tenant/Empresa      │
│                                │
│ Seleccionar tenant:            │
│ ┌────────────────────────────┐ │
│ │ 🎨 Udar Edge            ▾  │ │
│ └────────────────────────────┘ │
│                                │
│ Tenant ID: tenant-001          │
│ Slug: udar-edge                │
│ Locale: es-ES                  │
│                                │
│ Colores: ██ ██ ██             │
└────────────────────────────────┘
```

### Selecciona cada tenant y observa los cambios:

---

## 🎨 **TENANT 1: UDAR EDGE** (Negro)

**Seleccionar:** 🎨 Udar Edge

**Qué observar:**
- ✅ Logo: 🎨
- ✅ Nombre: "Udar Edge"
- ✅ Color principal: Negro (#030213)
- ✅ Textos: "Bienvenido", "Iniciar Sesión"
- ✅ Profesional y neutro

**Login screen:**
- Título: "Bienvenido"
- Botón: "Iniciar Sesión" (negro)
- OAuth: Google + Apple + Facebook

---

## 🍕 **TENANT 2: LA PIZZERÍA** (Rojo)

**Seleccionar:** 🍕 La Pizzería

**Qué observar:**
- ✅ Logo: 🍕
- ✅ Nombre: "La Pizzería"
- ✅ Color principal: Rojo italiano (#d32f2f)
- ✅ Tagline: "La mejor pizza de la ciudad"
- ✅ Fondo: Crema suave
- ✅ Textos personalizados pizza

**Login screen:**
- Título: "Bienvenido a La Pizzería"
- Subtítulo: "¡La mejor pizza te espera!"
- Botón: "Entrar" (rojo)
- OAuth: Google + Facebook (sin Apple)

**Dashboard (después de login como cliente):**
- Mensaje: "¡Hola {name}! ¿Qué pizza te apetece hoy?"
- Sección: "Mis Favoritas" (femenino)

---

## ☕ **TENANT 3: COFFEE HOUSE** (Marrón)

**Seleccionar:** ☕ Coffee House

**Qué observar:**
- ✅ Logo: ☕
- ✅ Nombre: "Coffee House"
- ✅ Color principal: Marrón café (#5d4037)
- ✅ Tagline: "El mejor café artesanal"
- ✅ Fondo: Gris muy claro
- ✅ Textos personalizados café

**Login screen:**
- Título: "Bienvenido a Coffee House"
- Subtítulo: "El mejor café te está esperando"
- Botón: "Iniciar Sesión" (marrón)
- OAuth: Google + Apple (sin Facebook)

**Dashboard (después de login como cliente):**
- Mensaje: "¡Buenos días {name}! ☕"
- Loading: "Preparando..." en lugar de "Cargando..."

---

## 👗 **TENANT 4: FASHION STORE** (Negro Elegante)

**Seleccionar:** 👗 Fashion Store

**Qué observar:**
- ✅ Logo: 👗
- ✅ Nombre: "Fashion Store"
- ✅ Color principal: Negro elegante (#000000)
- ✅ Accent: Rosa (#e91e63)
- ✅ Tagline: "Tu estilo, nuestra pasión"
- ✅ Diseño minimalista

**Login screen:**
- Título: "Bienvenido a Fashion Store"
- Botón: "Iniciar Sesión" (negro)
- OAuth: Google + Apple + Facebook

---

## ✅ QUÉ VERIFICAR EN CADA CAMBIO

### 1. **Header/Logo**
- [ ] Cambia el emoji del logo
- [ ] Cambia el nombre de la app
- [ ] Cambia el color del header

### 2. **Botones principales**
- [ ] Cambia el color de fondo
- [ ] Los textos cambian según el tenant

### 3. **Textos**
- [ ] Título de login diferente
- [ ] Subtítulos personalizados
- [ ] Textos de botones

### 4. **Colores**
- [ ] Color principal visible en botones
- [ ] Fondo de página cambia (algunos tenants)
- [ ] Bordes y acentos coherentes

### 5. **Fuentes**
- [ ] Se mantiene legible en todos los tenants

---

## 🎯 ESCENARIO COMPLETO DE PRUEBA

### **Test Flow Completo:**

1. **Iniciar en Udar Edge** (por defecto)
   - Observar diseño neutro/profesional

2. **Cambiar a La Pizzería** 🍕
   - Ver cambio a rojo italiano
   - Login con usuario "maria@test.com"
   - Observar textos personalizados: "¿Qué pizza te apetece hoy?"

3. **Cambiar a Coffee House** ☕
   - Ver cambio a marrón café
   - Observar textos personalizados de café
   - Verificar que algunos agregadores están deshabilitados

4. **Cambiar a Fashion Store** 👗
   - Ver cambio a negro elegante con rosa
   - Diseño más minimalista

5. **Volver a Udar Edge** 🎨
   - Confirmar que vuelve al estado original

---

## 🐛 SI ALGO NO FUNCIONA

### **El botón 🏢 no aparece:**

**Verificar:**
```typescript
// En /App.tsx líneas 156-157
{(import.meta?.env?.DEV || import.meta?.env?.MODE === 'development') && <TenantSwitcher />}
```

**Solución temporal:** Quitar la condición:
```typescript
<TenantSwitcher />
```

### **Los colores no cambian:**

**Abrir consola del navegador** (F12) y buscar errores.

**Verificar que existe:**
- `/hooks/useTenant.ts`
- `/config/tenant.config.ts`
- `/config/branding.config.ts`

### **La app recarga constantemente:**

Esto es **normal** cuando cambias de tenant. El sistema recarga la página para aplicar todos los cambios correctamente.

### **Errores de importación:**

**Verificar que existen:**
```
/components/ui/select.tsx
/components/ui/card.tsx
/components/ui/button.tsx
```

---

## 📸 QUÉ ESPERAR VER

### **Cambio Visual Dramático:**

```
Udar Edge:      🎨 Negro    → Profesional
La Pizzería:    🍕 Rojo     → Cálido/Italiano
Coffee House:   ☕ Marrón   → Acogedor/Café
Fashion Store:  👗 Negro    → Elegante/Minimalista
```

### **Cambio de Textos:**

```
Login Title:
Udar Edge:      "Bienvenido"
La Pizzería:    "Bienvenido a La Pizzería"
Coffee House:   "Bienvenido a Coffee House"
Fashion Store:  "Bienvenido a Fashion Store"
```

```
Welcome Message (Cliente):
Udar Edge:      "¡Hola Juan!"
La Pizzería:    "¡Hola María! ¿Qué pizza te apetece hoy?"
Coffee House:   "¡Buenos días Ana! ☕"
Fashion Store:  "¡Hola Laura!"
```

---

## 🎓 EXTRA: CAMBIO MANUAL

Si prefieres cambiar el tenant manualmente (sin el botón):

### **Opción 1: Editar código**

```typescript
// Archivo: /config/tenant.config.ts (línea ~170)

export const ACTIVE_TENANT: TenantConfig = TENANT_LA_PIZZERIA; // 🍕
//                                          ↑
//                                      CAMBIAR AQUÍ

// Opciones:
// TENANT_UDAR_EDGE
// TENANT_LA_PIZZERIA
// TENANT_COFFEE_HOUSE
// TENANT_FASHION_STORE
```

**Guardar el archivo → La app recargará automáticamente**

### **Opción 2: Desde la consola del navegador**

```javascript
// Abrir consola (F12)
localStorage.setItem('activeTenant', 'la-pizzeria');
location.reload();

// Opciones:
// 'udar-edge'
// 'la-pizzeria'
// 'coffee-house'
// 'fashion-store'
```

---

## 📊 CHECKLIST DE PRUEBA

### **Funcionalidad Básica:**
- [ ] La app inicia correctamente
- [ ] El botón 🏢 es visible
- [ ] Se puede abrir el panel de selección
- [ ] Se puede cambiar entre tenants
- [ ] La app recarga al cambiar tenant
- [ ] Los colores cambian correctamente
- [ ] Los textos cambian correctamente
- [ ] El logo cambia correctamente

### **Cada Tenant:**
- [ ] **Udar Edge:** Negro, profesional, textos genéricos
- [ ] **La Pizzería:** Rojo, cálido, textos pizza
- [ ] **Coffee House:** Marrón, acogedor, textos café
- [ ] **Fashion Store:** Negro elegante, minimalista

### **Persistencia:**
- [ ] El tenant seleccionado se guarda
- [ ] Al recargar la página, mantiene el tenant activo
- [ ] localStorage tiene 'activeTenant'

---

## 🎉 ¡ÉXITO!

Si puedes:
1. ✅ Ver el botón 🏢
2. ✅ Cambiar entre los 4 tenants
3. ✅ Ver cambios de colores y textos
4. ✅ La app recarga correctamente

**¡El sistema funciona perfectamente!** 🚀

---

## 📝 NOTAS

- **El botón solo aparece en desarrollo** (`npm run dev`)
- **La app recarga al cambiar tenant** (esto es intencional)
- **Los cambios son inmediatos** tras la recarga
- **El tenant se guarda en localStorage** para persistencia

---

## 🆘 ¿NECESITAS AYUDA?

Si encuentras algún problema:

1. **Verificar consola** (F12) para errores
2. **Verificar archivos** existen en `/config/` y `/hooks/`
3. **Reiniciar servidor** (`Ctrl+C` y luego `npm run dev`)
4. **Limpiar caché** del navegador (Ctrl+Shift+R)

---

**¡DISFRUTA PROBANDO EL SISTEMA!** 🎨🍕☕👗

*Última actualización: 28 Noviembre 2025*
