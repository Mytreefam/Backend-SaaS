# 🎯 Sistema de Selección Multimarca para Terminales TPV

## 📋 Resumen del Flujo Implementado

Este documento describe el nuevo sistema multimarca implementado que permite a los terminales TPV trabajar con múltiples puntos de venta de diferentes marcas.

---

## 🔄 Flujo Completo de Usuario

### 1️⃣ **Configuración de Terminal (Gerente)**

El Gerente configura qué marcas puede vender cada terminal:

```
Configuración > Sistema > TPV > [Seleccionar TPV] > Añadir Terminal

Opciones:
✅ Modomio
✅ Blackburguer
```

**Ejemplo:**
- **Terminal 1 - Principal**: Ambas marcas ✓
- **Terminal 2 - Bar**: Solo Modomio
- **Terminal 3 - Delivery**: Solo Blackburguer

---

### 2️⃣ **Apertura de Terminal (Trabajador/Gerente)**

Al abrir un terminal, el sistema sigue este flujo:

#### **Paso 1: Selección de TPV**
```
Modal: "Selección de Punto de Venta y TPV"

1. Selecciona el Punto de Venta:
   ○ Tiana
   ○ Badalona

2. Selecciona el Terminal TPV:
   ○ TPV 1 (Disponible)
   ○ TPV 2 (Ocupado - María García)
   ○ TPV 3 (Mantenimiento)

[Cancelar] [Abrir Caja]
```

#### **Paso 2: Selección de Marca** (Solo si el terminal tiene múltiples marcas)

**Si el terminal tiene UNA marca:**
- ✅ Se abre directamente con esa marca

**Si el terminal tiene MÚLTIPLES marcas:**
```
Modal: "Selección de Punto de Venta"

Este terminal puede operar con múltiples puntos de venta. 
Selecciona con cuál quieres trabajar ahora.

Puntos de Venta Disponibles:

┌─────────────────────────────────────────┐
│ ○ Modomio Tiana                    [Modomio] │
│   Passeig de la Vilesa, 6, Tiana            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ○ Blackburguer Tiana          [Blackburguer] │
│   Passeig de la Vilesa, 6, Tiana            │
└─────────────────────────────────────────┘

☑️ Recordar mi selección para este terminal
   No volveré a preguntar cuando uses este terminal.
   Podrás cambiar el punto de venta en cualquier momento.

[Cancelar] [✓ Confirmar]
```

---

### 3️⃣ **Durante la Operación (TPV Activo)**

Una vez dentro del TPV, el usuario ve en el header:

```
┌─────────────────────────────────────────────────┐
│ TPV 360 - Base                                  │
│                                                 │
│ Usuario: Juan Pérez · Rol: Trabajador          │
│ Punto de Venta: Tiana                          │
│ [Modomio] [Cambiar]                    [⚡ Estado TPV] │
└─────────────────────────────────────────────────┘
```

**Indicador de marca activa:**
- Badge: `[Modomio]` con icono de tienda
- Botón "Cambiar" (solo visible si hay múltiples marcas)

---

### 4️⃣ **Cambio de Marca Durante la Operación**

Si el usuario hace clic en **"Cambiar"**:

```
Modal: "Selección de Punto de Venta"

[Mismo modal que en el paso 2]

- Muestra las marcas disponibles
- Permite cambiar sin cerrar caja
- Opción de recordar la nueva selección
```

**Comportamiento:**
- ✅ No cierra la caja
- ✅ Cambia el contexto del punto de venta
- ✅ Los productos mostrados se filtran por la marca seleccionada
- ✅ Las ventas se registran bajo la marca activa

---

## 🎨 Componentes Implementados

### 1. **ModalSeleccionPuntoVenta.tsx**
- Modal para seleccionar el punto de venta/marca
- Checkbox "Recordar selección"
- Guarda preferencias en localStorage
- Hook `usePuntoVentaPreferido` para gestión de preferencias

### 2. **ModalSeleccionTPV.tsx** (Modificado)
- Integra el flujo multimarca
- Detecta si el terminal tiene múltiples marcas
- Verifica preferencias guardadas
- Abre automáticamente el modal de selección de marca

### 3. **TPV360Master.tsx** (Modificado)
- Props nuevas:
  - `marcaActiva`: Marca actualmente seleccionada
  - `marcasDisponibles`: Array de marcas del terminal
  - `onCambiarMarca`: Callback para cambiar marca
- Header mejorado con indicador de marca y botón cambiar

### 4. **GerenteDashboard.tsx** (Modificado)
- Estados para gestión de marcas
- Función `handleCambiarMarca`
- Modal de cambio de marca integrado

---

## 💾 Persistencia de Preferencias

### LocalStorage
```javascript
Clave: tpv_punto_venta_preferido_{terminalId}

Valor: {
  "puntoVentaId": "Modomio",
  "timestamp": 1234567890
}
```

### Comportamiento
- ✅ Preferencia por terminal (no global)
- ✅ Se valida que la marca aún esté disponible
- ✅ Se puede eliminar haciendo "Cambiar" sin marcar recordar
- ✅ Persistente entre sesiones

---

## 🔐 Casos de Uso

### Caso 1: Terminal Monomarca
```
Terminal: "Terminal 2 - Bar"
Marcas configuradas: [Modomio]

Flujo:
1. Selecciona TPV → Abre directamente
2. No muestra modal de selección de marca
3. No muestra botón "Cambiar" en header
```

### Caso 2: Terminal Multimarca - Primera Vez
```
Terminal: "Terminal 1 - Principal"
Marcas configuradas: [Modomio, Blackburguer]

Flujo:
1. Selecciona TPV
2. ⚠️ Modal de selección de marca
3. Selecciona "Modomio" + ☑️ Recordar
4. Abre con Modomio
5. Header muestra: [Modomio] [Cambiar]
```

### Caso 3: Terminal Multimarca - Con Preferencia
```
Terminal: "Terminal 1 - Principal"
Marcas configuradas: [Modomio, Blackburguer]
Preferencia guardada: Modomio

Flujo:
1. Selecciona TPV
2. ✅ Abre directamente con Modomio (sin modal)
3. Header muestra: [Modomio] [Cambiar]
```

### Caso 4: Cambio de Marca Durante Operación
```
Estado: Operando con Modomio
Acción: Clic en "Cambiar"

Flujo:
1. Modal de selección de marca
2. Selecciona "Blackburguer"
3. ✅ Cambia a Blackburguer sin cerrar caja
4. Header actualiza: [Blackburguer] [Cambiar]
5. Productos se filtran por Blackburguer
```

---

## 🎯 Ventajas del Sistema

### ✅ **Flexibilidad Operativa**
- Un terminal puede trabajar con múltiples marcas
- Cambio rápido entre marcas sin cerrar caja

### ✅ **Eficiencia**
- Recordar preferencia evita preguntar cada vez
- Flujo optimizado para el caso más común

### ✅ **Control**
- El Gerente decide qué marcas por terminal
- Cambio manual disponible en cualquier momento

### ✅ **Experiencia de Usuario**
- Flujo claro y progresivo
- Indicadores visuales claros
- Mínima fricción

### ✅ **Trazabilidad**
- Cada venta se registra con la marca correcta
- Informes y métricas separadas por marca
- Auditoría clara del punto de venta

---

## 🔧 Datos Mock Ejemplo

### Configuración de Terminales
```typescript
TPV Tiana:
  Terminal 1: ['Modomio', 'Blackburguer'] ← Multimarca
  Terminal 2: ['Modomio']                  ← Monomarca
  Terminal 3: ['Modomio']                  ← Monomarca
  Terminal 4: ['Blackburguer']             ← Monomarca
  Terminal 5: ['Blackburguer']             ← Monomarca

TPV Badalona:
  Terminal 1: ['Modomio', 'Blackburguer'] ← Multimarca
  Terminal 2: ['Modomio']                  ← Monomarca
  Terminal 3: ['Modomio']                  ← Monomarca
  Terminal 4: ['Modomio']                  ← Monomarca
  Terminal 5: ['Blackburguer']             ← Monomarca
  Terminal 6: ['Blackburguer']             ← Monomarca
  Terminal 7: ['Blackburguer']             ← Monomarca
```

---

## 🚀 Implementación Técnica

### Archivos Modificados
1. ✅ `/components/gerente/ModalSeleccionPuntoVenta.tsx` (NUEVO)
2. ✅ `/components/gerente/ModalSeleccionTPV.tsx` (MODIFICADO)
3. ✅ `/components/TPV360Master.tsx` (MODIFICADO)
4. ✅ `/components/GerenteDashboard.tsx` (MODIFICADO)

### Próximos Pasos para Producción
1. 🔄 Integrar con backend real
2. 🔄 Sincronizar configuración de terminales desde base de datos
3. 🔄 Guardar preferencias en perfil de usuario (opcional)
4. 🔄 Logs de auditoría de cambios de marca
5. 🔄 Métricas separadas por marca en tiempo real

---

## 📊 Impacto en Flujos Existentes

### ✅ Compatible con:
- Sistema de apertura/cierre de caja
- Gestión de pedidos
- Sistema de facturación
- Informes y métricas
- Operaciones de caja

### ⚠️ Consideraciones:
- Los productos deben estar filtrados por marca activa
- Las ventas se registran con la marca activa
- Los informes deben incluir el filtro de marca

---

## 🎓 Guía de Usuario

### Para Gerentes:
1. Ve a **Configuración > Sistema > TPV**
2. Selecciona un punto de venta
3. Añade o edita un terminal
4. Marca las casillas de las marcas que este terminal puede vender
5. Guarda los cambios

### Para Trabajadores:
1. Al abrir el TPV, selecciona tu terminal
2. Si tiene múltiples marcas, elige con cuál trabajar
3. Marca "Recordar" si siempre usas la misma
4. Durante la operación, haz clic en "Cambiar" si necesitas cambiar de marca

---

## ✅ Estado de Implementación

- [x] Diseño del flujo multimarca
- [x] Componente de selección de punto de venta
- [x] Integración con modal de selección de TPV
- [x] Sistema de preferencias con localStorage
- [x] Indicador de marca en header del TPV
- [x] Botón de cambio de marca
- [x] Modal de cambio durante operación
- [x] Configuración de terminales multimarca
- [ ] Integración con backend (pendiente)
- [ ] Filtrado de productos por marca (pendiente)
- [ ] Registro de ventas con marca (pendiente)

---

**Fecha de implementación:** 28 de Noviembre, 2025
**Versión:** 1.0.0
**Estado:** ✅ Implementado en Frontend (Mock Data)
