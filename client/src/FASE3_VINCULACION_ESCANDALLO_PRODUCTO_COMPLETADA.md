# ✅ FASE 3: VINCULACIÓN ESCANDALLO ↔ PRODUCTO - COMPLETADA

## 📋 Resumen de Implementación

Se ha completado la **vinculación bidireccional entre Escandallos y Productos**, permitiendo que los productos manufacturados calculen automáticamente sus costos desde las recetas, muestren márgenes de beneficio en tiempo real, y validen la rentabilidad durante la creación/edición.

---

## ⭐ FUNCIONALIDADES IMPLEMENTADAS

### 1. **Selector Inteligente de Escandallos**
✅ Dropdown filtrado por empresa y marcas del producto  
✅ Solo muestra escandallos compatibles (misma empresa + al menos 1 marca en común)  
✅ Muestra costo de cada escandallo en el selector  
✅ Opción "Sin escandallo" para crear después  
✅ Mensaje de alerta si no hay escandallos disponibles  

### 2. **Cálculo Automático de Costos**
✅ Al seleccionar escandallo → Carga automática de:
  - `costo_ingredientes`
  - `costo_envases`
  - `costo_total`
  - `margen_bruto_pct`
✅ Panel visual con desglose de costos
✅ Actualización en tiempo real al cambiar escandallo

### 3. **Indicador de Margen en Tiempo Real**
✅ Panel visual con colores según rentabilidad:
  - 🟢 Verde: ≥60% (Rentable)
  - 🟡 Amarillo: 40-60% (Aceptable)
  - 🔴 Rojo: <40% (Bajo)
✅ Muestra margen bruto %
✅ Muestra beneficio unitario en €
✅ Recalcula automáticamente al cambiar precio

### 4. **Validación de Datos**
✅ Productos manufacturados sin escandallo → Warning (no bloquea)
✅ Costos se guardan automáticamente en el producto
✅ `precio_compra` se actualiza con `costo_total` para manufacturados

### 5. **Visualización en Tabla de Productos**
✅ Nueva columna "Costo" para productos manufacturados
✅ Muestra si el costo viene de escandallo (📊) o es manual
✅ Columna "Margen" con colores según rentabilidad
✅ Usa `margen_bruto_pct` para manufacturados

---

## 🎨 NUEVA ESTRUCTURA DE DATOS

### **Interface EscandalloDisponible** (Mock Data)
```typescript
interface EscandalloDisponible {
  id: string;
  nombre_producto: string;
  costo_ingredientes: number;
  costo_envases: number;
  costo_total: number;
  empresa_id: string;
  marcas_ids: string[];
}
```

### **Escandallos Mock**
```typescript
const ESCANDALLOS_DISPONIBLES: EscandalloDisponible[] = [
  {
    id: 'ESC-PAN-001',
    nombre_producto: 'Pan de Masa Madre',
    costo_ingredientes: 1.05,
    costo_envases: 0.15,
    costo_total: 1.20,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO]
  },
  {
    id: 'ESC-CAFE-001',
    nombre_producto: 'Café con Leche',
    costo_ingredientes: 0.12,
    costo_envases: 0.03,
    costo_total: 0.15,
    empresa_id: EMPRESAS.DISARMINK,
    marcas_ids: [MARCAS.MODOMIO, MARCAS.BLACKBURGUER] // ⭐ Multi-marca
  },
  // ... más escandallos
];
```

---

## 🧠 LÓGICA DE FILTRADO

### **useMemo: escandallosFiltrados**
```typescript
const escandallosFiltrados = useMemo(() => {
  if (!formData.empresa_id) return [];
  
  return ESCANDALLOS_DISPONIBLES.filter(esc => {
    // Debe pertenecer a la misma empresa
    const matchEmpresa = esc.empresa_id === formData.empresa_id;
    
    // Debe tener al menos una marca en común
    const tieneAlgunaMarcaEnComun = formData.marcas_ids?.some(marcaId => 
      esc.marcas_ids.includes(marcaId)
    );
    
    return matchEmpresa && tieneAlgunaMarcaEnComun;
  });
}, [formData.empresa_id, formData.marcas_ids]);
```

### **useMemo: costosCalculados**
```typescript
const costosCalculados = useMemo(() => {
  let costo_total = 0;
  let costo_ingredientes = 0;
  let costo_envases = 0;

  // Si hay escandallo seleccionado, obtener su costo
  if (formData.tipo_producto === 'manufacturado' && formData.escandallo_id) {
    const escandallo = ESCANDALLOS_DISPONIBLES.find(e => e.id === formData.escandallo_id);
    if (escandallo) {
      costo_ingredientes = escandallo.costo_ingredientes;
      costo_envases = escandallo.costo_envases;
      costo_total = escandallo.costo_total;
    }
  } else if (formData.tipo_producto === 'simple') {
    costo_total = formData.precio_compra || 0;
  }

  // Calcular margen
  const precio = formData.precio || 0;
  const margen_bruto_pct = precio > 0 ? ((precio - costo_total) / precio) * 100 : 0;

  return {
    costo_ingredientes,
    costo_envases,
    costo_total,
    margen_bruto_pct
  };
}, [formData.tipo_producto, formData.escandallo_id, formData.precio, formData.precio_compra]);
```

---

## 🎨 COMPONENTES UI NUEVOS

### 1. **Selector de Escandallo**
```tsx
<Select 
  value={formData.escandallo_id || 'sin-escandallo'} 
  onValueChange={(value) => {
    if (value === 'sin-escandallo') {
      setFormData({ ...formData, escandallo_id: undefined });
    } else {
      setFormData({ ...formData, escandallo_id: value });
    }
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Selecciona un escandallo" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sin-escandallo">
      Sin escandallo (crear después)
    </SelectItem>
    {escandallosFiltrados.length === 0 ? (
      <SelectItem value="no-disponibles" disabled>
        No hay escandallos disponibles para esta empresa/marca
      </SelectItem>
    ) : (
      escandallosFiltrados.map(esc => (
        <SelectItem key={esc.id} value={esc.id}>
          {esc.nombre_producto} - €{esc.costo_total.toFixed(2)}
        </SelectItem>
      ))
    )}
  </SelectContent>
</Select>
```

### 2. **Panel de Costos**
```tsx
{formData.escandallo_id && (
  <div className="mt-3 space-y-2 bg-white p-3 rounded border border-amber-300">
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">Costo ingredientes:</span>
      <span className="font-medium text-gray-900">
        €{costosCalculados.costo_ingredientes.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-gray-600">Costo envases:</span>
      <span className="font-medium text-gray-900">
        €{costosCalculados.costo_envases.toFixed(2)}
      </span>
    </div>
    <div className="flex justify-between text-sm border-t pt-2">
      <span className="font-medium text-gray-700">Costo total:</span>
      <span className="font-bold text-teal-600">
        €{costosCalculados.costo_total.toFixed(2)}
      </span>
    </div>
  </div>
)}
```

### 3. **Indicador de Margen en Tiempo Real**
```tsx
{formData.tipo_producto === 'manufacturado' && 
 formData.escandallo_id && 
 formData.precio > 0 && (
  <div className="mt-2 p-3 bg-gradient-to-r from-teal-50 to-blue-50 rounded-md border border-teal-200">
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-600">Margen bruto:</span>
      <span className={`text-sm font-bold ${
        costosCalculados.margen_bruto_pct >= 60 ? 'text-green-600' :
        costosCalculados.margen_bruto_pct >= 40 ? 'text-yellow-600' :
        'text-red-600'
      }`}>
        {costosCalculados.margen_bruto_pct.toFixed(1)}%
      </span>
    </div>
    <div className="flex justify-between items-center mt-1">
      <span className="text-xs text-gray-600">Beneficio unitario:</span>
      <span className="text-xs font-medium text-gray-900">
        €{(formData.precio - costosCalculados.costo_total).toFixed(2)}
      </span>
    </div>
    <div className="mt-2 text-xs">
      {costosCalculados.margen_bruto_pct >= 60 && (
        <span className="text-green-700">✅ Rentable (≥60%)</span>
      )}
      {costosCalculados.margen_bruto_pct >= 40 && costosCalculados.margen_bruto_pct < 60 && (
        <span className="text-yellow-700">⚠️ Margen aceptable (40-60%)</span>
      )}
      {costosCalculados.margen_bruto_pct < 40 && (
        <span className="text-red-700">❌ Margen bajo (<40%)</span>
      )}
    </div>
  </div>
)}
```

### 4. **Tabla - Columna de Costo**
```tsx
<td className="p-3 text-right">
  {producto.tipo_producto === 'manufacturado' && producto.costo_total ? (
    <>
      <p className="font-medium text-gray-700">
        {producto.costo_total.toFixed(2)}€
      </p>
      <p className="text-xs text-gray-500">
        {producto.escandallo_id ? '📊 Escandallo' : 'Manual'}
      </p>
    </>
  ) : (
    <p className="text-xs text-gray-400">-</p>
  )}
</td>
```

### 5. **Tabla - Columna de Margen con Colores**
```tsx
<td className="p-3 text-right">
  <p className={`font-medium ${
    producto.tipo_producto === 'manufacturado' && producto.margen_bruto_pct !== undefined
      ? producto.margen_bruto_pct >= 60 ? 'text-green-600' :
        producto.margen_bruto_pct >= 40 ? 'text-yellow-600' :
        'text-red-600'
      : producto.margen >= 60 ? 'text-green-600' :
        producto.margen >= 40 ? 'text-yellow-600' :
        'text-red-600'
  }`}>
    {producto.tipo_producto === 'manufacturado' && producto.margen_bruto_pct !== undefined
      ? producto.margen_bruto_pct.toFixed(1)
      : producto.margen.toFixed(1)
    }%
  </p>
  <p className="text-xs text-gray-500">+{producto.margen_unitario.toFixed(2)}€</p>
</td>
```

---

## 🔄 FLUJO DE TRABAJO DEL GERENTE

### **Escenario 1: Crear producto con escandallo existente**
1. Clic en "Nuevo Producto"
2. Seleccionar tipo: "Manufacturado"
3. Seleccionar empresa: "Disarmink SL"
4. Seleccionar marcas: "Modomio"
5. Selector de escandallo → Muestra solo escandallos de Modomio
6. Seleccionar "Pan de Masa Madre - €1.20"
7. ✅ Panel muestra: Ingredientes €1.05 + Envases €0.15 = Total €1.20
8. Ingresar precio de venta: €3.50
9. ✅ Indicador muestra: Margen 65.7% ✅ Rentable
10. Guardar → Costos se guardan automáticamente

### **Escenario 2: Crear producto sin escandallo**
1. Clic en "Nuevo Producto"
2. Seleccionar tipo: "Manufacturado"
3. Selector de escandallo → "Sin escandallo (crear después)"
4. ⚠️ Warning: "Deberías tener una receta. Puedes crearla después."
5. No se bloquea el guardado
6. Gerente puede crear el escandallo después en el módulo "Escandallo"
7. Después editar el producto y vincular el escandallo

### **Escenario 3: Filtrado inteligente**
- Producto con empresa "Disarmink" y marca "Blackburguer"
- Selector muestra:
  - ✅ "Bocadillo de Jamón" (Blackburguer)
  - ✅ "Café con Leche" (Modomio + Blackburguer) ← Multi-marca
  - ❌ "Pan de Masa Madre" (Solo Modomio) ← No aparece

---

## 📊 DATOS GUARDADOS AL CREAR PRODUCTO

Cuando se guarda un producto manufacturado con escandallo:

```typescript
const datosActualizados = {
  ...formData,
  empresa_nombre: 'Disarmink SL - Hoy Pecamos',
  marcas_nombres: ['Modomio'],
  // ⭐ COSTOS CALCULADOS AUTOMÁTICAMENTE
  costo_ingredientes: 1.05,
  costo_envases: 0.15,
  costo_total: 1.20,
  margen_bruto_pct: 65.7,
  precio_compra: 1.20  // ⭐ Se actualiza con costo_total
};
```

---

## 🎯 BENEFICIOS

### 1. **Cálculo Automático de Costos**
- No hay que ingresar costos manualmente
- Siempre sincronizado con el escandallo
- Reduce errores humanos

### 2. **Validación de Rentabilidad en Tiempo Real**
- Gerente ve inmediatamente si el precio es rentable
- Colores visuales facilitan la toma de decisiones
- Evita crear productos con márgenes muy bajos

### 3. **Filtrado Inteligente**
- Solo muestra escandallos compatibles
- Evita vincular escandallo de marca incorrecta
- Facilita gestión multi-marca

### 4. **Trazabilidad Completa**
- Tabla muestra qué productos tienen escandallo (📊)
- Fácil identificar productos sin costo calculado
- Análisis de rentabilidad en la tabla principal

### 5. **Sincronización Preparada**
- Estructura lista para actualización en cascada
- Si escandallo cambia → Puede recalcular productos
- Base para Sistema de Costos Dinámico (Fase futura)

---

## 🔄 PRÓXIMAS MEJORAS (FASES FUTURAS)

### FASE 4: Sincronización Bidireccional
- [ ] Si escandallo cambia → Actualizar costos en productos vinculados
- [ ] Botón "Recalcular costos desde escandallo"
- [ ] Notificaciones: "3 productos afectados por cambio en receta"

### FASE 5: Sistema de Costos Dinámico
- [ ] Historial de costos por fecha
- [ ] Gráficos de evolución de margen
- [ ] Alertas: "El margen del Pan bajó de 65% a 58%"

### FASE 6: Análisis de Rentabilidad
- [ ] Dashboard: "Productos por rentabilidad"
- [ ] Filtro: "Mostrar solo productos con margen <40%"
- [ ] Recomendaciones: "Subir precio en €0.20 para margen 60%"

### FASE 7: Integración con Stock
- [ ] Calcular disponibilidad de producción
- [ ] "Puedes producir 45 panes con el stock actual"
- [ ] Alertas: "No hay suficiente harina para producir"

---

## 🏆 RESULTADO FINAL

### ✅ **Funcionalidades Core Implementadas:**
1. Selector de escandallo con filtrado inteligente
2. Cálculo automático de costos desde receta
3. Indicador de margen en tiempo real con colores
4. Validación de rentabilidad
5. Nueva columna "Costo" en tabla de productos
6. Columna "Margen" con colores según rentabilidad

### ✅ **Preparado para:**
1. Sincronización con backend (Supabase)
2. Recalculo en cascada cuando cambia escandallo
3. Sistema de costos dinámico
4. Análisis de rentabilidad avanzado

### ✅ **UX Mejorada:**
- Gerente ve costos y margen antes de guardar
- Colores visuales para identificar productos rentables
- Mensajes claros cuando no hay escandallos disponibles
- Filtrado automático según empresa/marca

---

## 📝 CÓDIGO CLAVE AÑADIDO

### **Función guardarProducto() actualizada:**
```typescript
const datosActualizados = {
  ...formData,
  empresa_nombre: empresaSeleccionada ? getNombreEmpresa(empresaSeleccionada.id) : formData.empresa_nombre,
  marcas_nombres: marcasNombres,
  // ⭐ INCLUIR COSTOS CALCULADOS
  costo_ingredientes: costosCalculados.costo_ingredientes,
  costo_envases: costosCalculados.costo_envases,
  costo_total: costosCalculados.costo_total,
  margen_bruto_pct: costosCalculados.margen_bruto_pct,
  // ⭐ Actualizar precio_compra para manufacturados
  precio_compra: formData.tipo_producto === 'manufacturado' 
    ? costosCalculados.costo_total 
    : formData.precio_compra
};
```

---

**📅 Completado:** 29 de noviembre de 2025  
**🔧 Archivos modificados:** `/components/gerente/GestionProductos.tsx`  
**🔧 Próxima fase sugerida:** Revisión del Sistema de VENTAS Y FACTURACIÓN o continuar con Fase 4 (Sincronización bidireccional)
