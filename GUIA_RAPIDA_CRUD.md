# 🚀 Guía Rápida de Uso - CRUD Stock & Proveedores

## ¿Qué se ha hecho?

Se ha integrado completamente el sistema de CRUD (Crear, Leer, Actualizar, Eliminar) para:
- 📦 **Proveedores** - Crear, editar, eliminar proveedores
- 📋 **Artículos** - Crear, editar, eliminar artículos de stock
- 🛒 **Pedidos** - Crear, editar, eliminar pedidos a proveedores
- 📥 **Recepción** - Recibir material de pedidos

---

## Acceso Rápido

**Ubicación en la aplicación:**
```
Gerente → Stock/Proveedores/Café
```

---

## Funcionalidades Principales

### 1️⃣ **Gestión de Proveedores**

#### Crear Nuevo Proveedor
```
Sección "Proveedores"
↓
Click en [+ Nuevo]
↓
Completar formulario
↓
Click [Guardar]
↓
✓ Se agrega a la lista
```

#### Editar Proveedor
```
En tabla de proveedores
↓
Click en ⋮ (más opciones)
↓
Click [Editar]
↓
Modificar datos
↓
Click [Guardar]
↓
✓ Se actualiza automáticamente
```

#### Eliminar Proveedor
```
En tabla de proveedores
↓
Click en ⋮ (más opciones)
↓
Click [Eliminar]
↓
Confirmar acción
↓
✓ Se elimina de la lista
```

---

### 2️⃣ **Gestión de Pedidos**

#### Crear Nuevo Pedido
```
Sección "Pedidos a Proveedores"
↓
Click en [+ Nuevo Pedido]
↓
Seleccionar proveedor
↓
Agregar artículos y cantidades
↓
Click [Crear Pedido]
↓
✓ El pedido aparece en la lista con estado "Solicitado"
```

#### Editar Pedido (Solo en estado "Solicitado")
```
En tabla de pedidos
↓
Click en ⋮ (más opciones)
↓
Click [Editar pedido]
↓
Modificar datos
↓
Click [Guardar]
↓
✓ Se actualiza el pedido
```

#### Recibir Material (En estado "En Tránsito")
```
En tabla de pedidos
↓
Buscar pedido con estado "🚚 En Tránsito"
↓
Click en ⋮ (más opciones)
↓
Click [Recibir material]
↓
Verificar cantidades recibidas
↓
Click [Recibir]
↓
✓ Stock se actualiza automáticamente
✓ Estado cambia a "📦 Entregado"
```

#### Cambiar Estado del Pedido
```
En tabla de pedidos
↓
Click en ⋮ (más opciones)
↓
Opciones disponibles según estado actual:
  - "Solicitado" → Confirmar o Anular
  - "Confirmado" → Marcar en tránsito
  - "En Tránsito" → Entregar o Reclamar
  - "Reclamado" → Entregar
↓
✓ Se actualiza el estado
```

---

## Estados de un Pedido

| Estado | Emoji | Significado | Acciones Posibles |
|--------|-------|-------------|-------------------|
| Solicitado | 📋 | Pedido creado, esperando confirmación | Editar, Confirmar, Anular, Eliminar |
| Confirmado | ✅ | Proveedor confirmó el pedido | Marcar en tránsito, Eliminar |
| En Tránsito | 🚚 | Pedido está en camino | Recibir material, Entregar, Reclamar |
| Entregado | 📦 | Pedido recibido y procesado | Ver detalles, Casear con factura |
| Reclamado | ⚠️ | Hay incidencia con el pedido | Marcar como entregado |
| Anulado | ❌ | Pedido cancelado | No hay acciones |

---

## Flujo Completo de un Pedido

```
1. CREAR PEDIDO
   ├─ Click [+ Nuevo Pedido]
   ├─ Seleccionar Proveedor
   ├─ Agregar Artículos
   └─ Estado: "Solicitado"

2. CONFIRMAR PEDIDO
   ├─ Click [Confirmar pedido]
   └─ Estado: "Confirmado"

3. MARCAR EN TRÁNSITO
   ├─ Click [Marcar en tránsito]
   └─ Estado: "En Tránsito"

4. RECIBIR MATERIAL
   ├─ Click [Recibir material]
   ├─ Verificar cantidades
   ├─ Click [Recibir]
   ├─ Stock se actualiza automáticamente
   └─ Estado: "Entregado"

5. OPCIONAL: CASEAR CON FACTURA
   ├─ Click [Casear con factura]
   └─ Vincular con factura proveedor
```

---

## Datos que se Sincronizan Automáticamente

✅ **Cuando cambias de Empresa o PDV:**
- Se cargan automáticamente todos los proveedores
- Se cargan todos los artículos disponibles
- Se cargan todos los pedidos

✅ **Después de crear/editar/eliminar:**
- Las listas se actualizan automáticamente
- Se muestran mensajes de éxito/error
- Los datos se reflejan inmediatamente

✅ **Al recibir material:**
- El stock se incrementa automáticamente
- El estado del pedido cambia a "Entregado"
- Se genera registro de movimiento de stock

---

## Mensajes de Confirmación

Verás notificaciones toast en la esquina inferior derecha:

```
✓ Proveedor creado
✓ Proveedor actualizado  
✓ Proveedor eliminado
✓ Artículo creado
✓ Artículo actualizado
✓ Artículo eliminado
✓ Pedido creado
✓ Pedido actualizado
✓ Pedido eliminado
✓ Recepción registrada correctamente
✓ Material recibido correctamente
```

---

## Consejos de Uso

### 🎯 **Para Proveedores**
1. Crea todos los proveedores primero
2. Asigna artículos preferentes a cada proveedor
3. Completa datos de contacto (email, teléfono)
4. Define tiempos de entrega y SLA

### 🎯 **Para Artículos**
1. Define stock mínimo (para alertas)
2. Define stock máximo (para no sobre-pedidos)
3. Establece punto de reorden automático
4. Asigna proveedor preferente

### 🎯 **Para Pedidos**
1. Revisa stock antes de crear pedidos
2. Agrupa artículos del mismo proveedor
3. Verifica cantidades antes de confirmar
4. Recibe material en cuanto llegue

---

## Errores Comunes y Soluciones

### ❌ "No se carga la lista de proveedores"
**Solución:**
1. Verifica que hayas seleccionado una empresa válida
2. Actualiza la página (F5)
3. Revisa la consola (F12) por errores
4. Verifica que el backend está ejecutándose

### ❌ "No puedo editar un proveedor"
**Solución:**
1. Verifica que haya datos disponibles en la tabla
2. Intenta hacer click nuevamente en ⋮ → [Editar]
3. Comprueba que no hay modales abiertos

### ❌ "El stock no se actualizó"
**Solución:**
1. Verifica que el pedido esté en estado "En Tránsito"
2. Comprueba que hayas hecho click [Recibir]
3. Actualiza la página para ver el cambio
4. Revisa los movimientos de stock

### ❌ "No veo el botón [Recibir material]"
**Solución:**
1. El pedido debe estar en estado "🚚 En Tránsito"
2. Verifica que hayas marcado el pedido como "en tránsito" primero
3. Si el pedido está en otro estado, haz click [Marcar en tránsito] primero

---

## Keyboard Shortcuts (Atajos)

- **F5** - Recargar página
- **F12** - Abrir consola del navegador
- **Ctrl+F** - Buscar en la página

---

## Necesitas Ayuda?

1. **Lee la documentación:**
   - [INTEGRACION_CRUD_COMPLETADA.md](./INTEGRACION_CRUD_COMPLETADA.md)

2. **Verifica los logs:**
   - Abre F12 (DevTools)
   - Tab "Console"
   - Busca mensajes de error

3. **Contacta al desarrollador:**
   - Describe el problema
   - Adjunta screenshot
   - Menciona pasos para reproducir

---

**¡Disfruta el sistema CRUD completamente funcional!** 🎉

