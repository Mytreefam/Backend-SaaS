# 🧪 CÓMO PROBAR LA SINCRONIZACIÓN EN TIEMPO REAL

**⚡ Guía rápida para probar que el StockContext funciona correctamente**

---

## 🎯 **OBJETIVO**

Verificar que cuando el **trabajador** recibe material, el **gerente** lo ve inmediatamente sin recargar la página.

---

## 📋 **PASO A PASO**

### **1. Abrir dos ventanas del navegador**

```bash
# Ventana 1: GERENTE
http://localhost:5173 (o tu URL)
- Login como Gerente
- Ir a "Stock y Proveedores"
- Pestaña "Inventario"

# Ventana 2: TRABAJADOR
http://localhost:5173 (en otra ventana o pestaña)
- Login como Trabajador
- Ir a "Material"
- Pestaña "Recepción"
```

---

### **2. OPCIONAL: Añadir indicador visual**

Para ver mejor los cambios, puedes añadir el componente `SyncDemoIndicator`:

#### En `/components/gerente/StockProveedoresCafe.tsx`:
```tsx
import { SyncDemoIndicator } from '../demo/SyncDemoIndicator';

export function StockProveedores() {
  // ... código existente ...
  
  return (
    <div>
      {/* ... tu contenido existente ... */}
      
      {/* ⭐ AÑADIR AL FINAL, justo antes del cierre </div> */}
      <SyncDemoIndicator />
    </div>
  );
}
```

#### En `/components/trabajador/MaterialTrabajador.tsx`:
```tsx
import { SyncDemoIndicator } from '../demo/SyncDemoIndicator';

export function MaterialTrabajador() {
  // ... código existente ...
  
  return (
    <div>
      {/* ... tu contenido existente ... */}
      
      {/* ⭐ AÑADIR AL FINAL, justo antes del cierre </div> */}
      <SyncDemoIndicator />
    </div>
  );
}
```

---

### **3. Probar flujo completo**

#### **TEST 1: Gerente crea pedido → Trabajador lo ve**

1. **En ventana GERENTE:**
   - Ve a "Stock y Proveedores" → Pestaña "Pedidos"
   - Busca un artículo con stock bajo
   - Crea un pedido a proveedor

2. **En ventana TRABAJADOR:**
   - Ve a "Material" → Pestaña "Recepción"
   - ✅ **VERIFICA:** El pedido aparece en la lista inmediatamente

#### **TEST 2: Trabajador recibe material → Gerente lo ve**

1. **En ventana TRABAJADOR:**
   - Ve a "Material" → Pestaña "Recepción"
   - Click en "Recibir Material"
   - Selecciona un pedido pendiente (o crea entrada manual)
   - Añade los artículos recibidos
   - Confirma la recepción

2. **En ventana GERENTE:**
   - Ve a "Stock y Proveedores" → Pestaña "Inventario"
   - ✅ **VERIFICA:** El stock se actualiza inmediatamente
   - ✅ **VERIFICA:** El estado del artículo cambia (ej: "bajo" → "ok")
   - Ve a "Pedidos"
   - ✅ **VERIFICA:** El pedido cambia de "en-transito" a "entregado"

#### **TEST 3: Ver indicador de sincronización** (si añadiste SyncDemoIndicator)

- En ambas ventanas verás el indicador en la esquina inferior derecha
- ✅ **VERIFICA:** Cuando haces cambios, el indicador muestra:
  - Ícono giratorio de "sincronizando"
  - Badge "Actualizado"
  - Hora de última actualización
  - Contadores actualizados

---

## 🎬 **ESCENARIO COMPLETO PASO A PASO**

### **PREPARACIÓN (Solo una vez)**

```
1. Abrir Chrome/Firefox
2. Ventana 1: Login → Gerente
3. Ventana 2: Login → Trabajador (en nueva ventana/pestaña)
4. Organizar ventanas lado a lado en pantalla
```

### **ESCENARIO: Recibir harina que estaba en stock bajo**

#### **ANTES:**

**Ventana GERENTE:**
```
Stock y Proveedores → Inventario
- Harina de Trigo T45: 15 unidades 🔴 BAJO
- Estado: Bajo
```

**Ventana TRABAJADOR:**
```
Material → Recepción
- Pedido PED-2025-001 (Harinas del Norte)
  Estado: En tránsito
  Artículos: Harina de Trigo T45 x 40
```

#### **ACCIÓN:**

**Ventana TRABAJADOR:**
```
1. Click "Recibir Material"
2. Seleccionar pedido "PED-2025-001"
3. Confirmar cantidades:
   - Harina de Trigo T45: 40 ud ✓
4. Añadir número de albarán: ALB-12345
5. Click "Confirmar y añadir al stock"
6. Toast: "¡Recepción completada y sincronizada!"
```

#### **DESPUÉS (SIN RECARGAR):**

**Ventana GERENTE (actualización automática):**
```
Stock y Proveedores → Inventario
- Harina de Trigo T45: 55 unidades ✅ OK
- Estado: Ok
- Último movimiento: Recepción ALB-12345 (+40)

Stock y Proveedores → Pedidos
- PED-2025-001: Estado cambiado a "Entregado" ✅
```

**Ventana TRABAJADOR:**
```
Material → Recepción
- Pedido PED-2025-001 ya no aparece (completado)
```

---

## ✅ **CHECKLIST DE VERIFICACIÓN**

### **Sincronización Stock:**
- [ ] Stock se actualiza en pantalla del gerente sin recargar
- [ ] Estado del artículo cambia (bajo → ok)
- [ ] Cantidad disponible aumenta correctamente

### **Sincronización Pedidos:**
- [ ] Pedido cambia de estado automáticamente
- [ ] Pedido desaparece de lista de pendientes en trabajador
- [ ] Fecha de recepción se actualiza

### **UI/UX:**
- [ ] Toast de confirmación aparece
- [ ] No hay errores en consola
- [ ] Indicador de sincronización funciona (si lo añadiste)
- [ ] Animaciones fluidas

### **Funcionalidad:**
- [ ] Puedes recibir múltiples artículos
- [ ] Puedes recibir sin pedido relacionado (entrada manual)
- [ ] Los movimientos se registran correctamente

---

## 🐛 **TROUBLESHOOTING**

### **Problema: No veo los cambios**

**Solución:**
1. Verifica que ambas ventanas están usando la **misma instancia** de la app
2. Asegúrate de NO estar recargando la página
3. Abre la consola del navegador (F12) y busca:
   ```
   🔌 StockContext: Datos mock cargados
   ✅ Recepción registrada en contexto
   📦 Stock actualizado
   ```

### **Problema: Datos no persisten al recargar**

**Esto es NORMAL:**
- Los datos solo viven en memoria
- Al recargar, vuelven a los datos mock iniciales
- Para persistencia, necesitarás Supabase o localStorage

### **Problema: Error "useStock debe ser usado dentro de un StockProvider"**

**Solución:**
1. Verifica que `/App.tsx` tiene el `<StockProvider>`
2. Asegúrate de que el componente está dentro del provider

---

## 📊 **DATOS DE PRUEBA**

### **SKUs con Stock Bajo (para probar):**

```typescript
'SKU001' - Harina de Trigo T45
  Disponible: 15
  Mínimo: 20
  Estado: BAJO

'SKU002' - Queso Mozzarella
  Disponible: 3
  Mínimo: 8
  Estado: BAJO

'SKU003' - Tomate Triturado Natural
  Disponible: 8
  Mínimo: 15
  Estado: BAJO
```

### **Pedidos Pendientes (para recibir):**

```typescript
'PED-001' - Harinas del Norte
  Estado: entregado
  Artículos: Harina x40

'PED-002' - Lácteos Premium
  Estado: en-transito
  Artículos: Queso Mozzarella x10
```

---

## 🎥 **VIDEO TUTORIAL (Próximamente)**

Si quieres, puedo ayudarte a crear un video tutorial mostrando:
1. Cómo abrir las dos ventanas
2. Crear un pedido como gerente
3. Recibirlo como trabajador
4. Ver la sincronización en tiempo real

---

## 📞 **¿FUNCIONA?**

Si todo funciona correctamente, deberías ver:

✅ Cambios inmediatos sin recargar  
✅ Stock actualizado en tiempo real  
✅ Pedidos sincronizados  
✅ Indicador de sincronización funcionando  

**¡Felicidades! El StockContext está funcionando perfectamente** 🎉

---

## 🚀 **SIGUIENTE NIVEL**

Una vez que confirmes que funciona:

1. **Añadir más componentes** que usen el contexto
2. **Implementar funciones pendientes** (actualizarEstadoPedido, etc.)
3. **Añadir persistencia local** (localStorage)
4. **Migrar a Supabase** (backend real + Realtime)

---

**¿Listo para probar?** ⚡ ¡Adelante!
