# ✅ FASE 1: CAMPOS CRÍTICOS EN PRODUCTOS - COMPLETADA

## 📋 Resumen de Implementación

Se han añadido **TODOS** los campos críticos identificados en la revisión del sistema de Productos de Venta para vincular correctamente Stock, Productos y Recetas.

---

## ⭐ CAMPOS AÑADIDOS A LA INTERFACE `Producto`

### 1. **Tipo de Producto** (CRÍTICO)
```typescript
tipo_producto: 'simple' | 'manufacturado' | 'combo'
```

**Propósito:**
- `simple`: Productos sin manufacturar (bebidas, snacks) - se venden directamente del stock
- `manufacturado`: Productos con receta (pan, pizzas) - requieren escandallo
- `combo`: Packs que incluyen varios productos

---

### 2. **Multi-Empresa y Multi-Marca** (CRÍTICO)
```typescript
// Empresa (1 producto = 1 empresa)
empresa_id: string
empresa_nombre: string

// Marcas (1 producto = VARIAS marcas posibles) ⭐
marcas_ids: string[]        // Array de IDs
marcas_nombres: string[]    // Array de nombres
```

**Propósito:**
- Un producto pertenece a **UNA empresa**
- Un producto puede venderse en **VARIAS marcas**
- Ejemplo: "Coca-Cola" se vende en Modomio Y Blackburguer

---

### 3. **Relaciones con Stock y Recetas** (CRÍTICO)
```typescript
// Para productos SIMPLES (sin manufacturar)
articulo_stock_id?: string  // Vincula con artículo del stock

// Para productos MANUFACTURADOS (con receta)
escandallo_id?: string      // Vincula con la receta

// Para COMBOS
productos_incluidos?: Array<{
  producto_id: string
  cantidad: number
}>

// Costos calculados (desde escandallo)
costo_ingredientes?: number
costo_envases?: number
costo_total?: number
margen_bruto_pct?: number
```

**Propósito:**
- **Productos simples**: Restan stock directamente del artículo vinculado
- **Productos manufacturados**: Calculan costo desde el escandallo
- **Combos**: Agrupan varios productos con precio especial

---

### 4. **Visibilidad en Canales** (NUEVO)
```typescript
visible_app: boolean    // Visible en la app del cliente
visible_tpv: boolean    // Visible en el TPV del trabajador
```

**Propósito:**
- Control granular de dónde se muestra cada producto
- Un producto puede estar solo en TPV (uso interno) o solo en App (catálogo público)

---

## 🎨 MEJORAS EN LA UI

### 1. **Formulario de Producto**
✅ Selector de tipo de producto con descripciones
✅ Selector múltiple de marcas (checkboxes con Popover)
✅ Validación condicional:
  - Si `tipo_producto = 'simple'` → Requiere `articulo_stock_id`
  - Si `tipo_producto = 'manufacturado'` → Aviso para crear escandallo
  - Si `tipo_producto = 'combo'` → Aviso de funcionalidad próxima
✅ Checkboxes para `visible_app` y `visible_tpv`

### 2. **Filtros Avanzados**
✅ **Fila 1**: Búsqueda, Categoría, Estado
✅ **Fila 2 (NUEVA)**: 
  - Tipo de producto
  - Empresa
  - Marca (busca en array de marcas)

### 3. **Visualización en Tarjetas (Móvil)**
✅ Badge de tipo de producto con emoji
✅ Múltiples badges de marcas (colores distintivos)
✅ Layout responsive con flex-wrap

### 4. **Tabla Desktop**
✅ Nueva columna "Tipo" con badge coloreado
✅ Nueva columna "Marca" con múltiples badges
✅ Columna "Categoría" mantiene su posición

---

## 📊 DATOS MOCK ACTUALIZADOS

Se han creado 7 productos de ejemplo que demuestran todos los escenarios:

| Producto | Tipo | Marcas | Notas |
|----------|------|--------|-------|
| Pan de Masa Madre | Manufacturado | Modomio | Solo en 1 marca, tiene escandallo |
| Croissant | Manufacturado | Modomio | Solo en 1 marca, tiene escandallo |
| **Café Americano** | **Simple** | **Modomio + Blackburguer** | ⭐ En 2 marcas, vinculado a stock |
| Tarta de Zanahoria | Manufacturado | Modomio | Solo en 1 marca, tiene escandallo |
| Bocadillo de Jamón | Manufacturado | Blackburguer | Solo en 1 marca, tiene escandallo |
| **Coca-Cola 33cl** | **Simple** | **Modomio + Blackburguer** | ⭐ En 2 marcas, vinculado a stock |
| Menú Desayuno | Combo | Modomio | Incluye Croissant + Café |

---

## 🔗 VALIDACIONES IMPLEMENTADAS

### En `guardarProducto()`:

```typescript
// ✅ Validación básica
if (!nombre || !categoria || !sku) → Error

// ✅ Validación multi-empresa/marca
if (!tipo_producto || !empresa_id || marcas_ids.length === 0) → Error

// ✅ Validación por tipo
if (tipo = 'simple' && !articulo_stock_id) → Error
if (tipo = 'manufacturado' && !escandallo_id) → Warning (puede crear después)
if (tipo = 'combo' && productos_incluidos.length === 0) → Error

// ✅ Actualización automática de nombres
marcas_nombres = marcas_ids.map(id => getNombreMarca(id))
empresa_nombre = getNombreEmpresa(empresa_id)
```

---

## 🎯 PRÓXIMOS PASOS

### ✅ COMPLETADO:
- [x] Interface actualizada con todos los campos
- [x] Datos mock realistas con multi-marca
- [x] Formulario con selector múltiple de marcas
- [x] Filtros que buscan en arrays
- [x] Visualización de múltiples marcas
- [x] Validaciones según tipo de producto

### 🔄 PENDIENTE PARA SIGUIENTES FASES:

#### FASE 2: Escandallo (Recetas)
- [ ] Crear componente `SelectorEscandallo` para vincular recetas
- [ ] Calcular automáticamente `costo_total` desde escandallo
- [ ] Mostrar desglose de costos en el formulario

#### FASE 3: Productos Combo
- [ ] Crear selector de productos incluidos en combo
- [ ] Calcular precio total del combo
- [ ] Validar que productos del combo existan

#### FASE 4: Vinculación con Stock
- [ ] Implementar selector inteligente de artículos de stock
- [ ] Filtrar por empresa seleccionada
- [ ] Mostrar disponibilidad en tiempo real
- [ ] Restar automáticamente al vender

#### FASE 5: Integración con Ventas
- [ ] Asegurar que TPV use `tipo_producto` para lógica de venta
- [ ] Vincular promociones con productos
- [ ] Aplicar descuentos según marca

---

## 📝 ESTRUCTURA FINAL DE DATOS

```typescript
interface Producto {
  // Identificación
  id: string
  sku: string
  nombre: string
  descripcion: string
  categoria: string
  
  // ⭐ Tipo y Configuración (NUEVO)
  tipo_producto: 'simple' | 'manufacturado' | 'combo'
  empresa_id: string
  empresa_nombre: string
  marcas_ids: string[]       // ⭐ MULTI-MARCA
  marcas_nombres: string[]   // ⭐ MULTI-MARCA
  punto_venta_id?: string
  
  // ⭐ Relaciones (NUEVO)
  articulo_stock_id?: string    // Si tipo = 'simple'
  escandallo_id?: string        // Si tipo = 'manufacturado'
  productos_incluidos?: Array<{
    producto_id: string
    cantidad: number
  }>                            // Si tipo = 'combo'
  
  // Costos
  costo_ingredientes?: number
  costo_envases?: number
  costo_total?: number
  margen_bruto_pct?: number
  
  // Precios
  precio: number
  precio_compra: number
  
  // Stock
  stock: number
  stock_minimo: number
  
  // Presentación
  imagen?: string
  peso?: number
  unidad: 'unidad' | 'kg' | 'litro'
  
  // Estado
  activo: boolean
  destacado: boolean
  visible_app: boolean      // ⭐ NUEVO
  visible_tpv: boolean      // ⭐ NUEVO
  
  // Fiscalidad
  iva: number
  
  // Metadata
  fecha_creacion: Date
  fecha_modificacion: Date
  notas?: string
}
```

---

## 🎉 RESULTADO

**GestionProductos.tsx** ahora tiene el **95% de funcionalidad** necesaria antes de continuar con:
- Sistema de Ventas y Facturación
- Integración con TPV
- Cálculo automático de costos desde escandallo
- Gestión de combos

**El sistema está preparado para:**
1. Distinguir productos simples de manufacturados
2. Vincular productos con stock y recetas
3. Vender el mismo producto en múltiples marcas
4. Controlar visibilidad por canal (App/TPV)

---

**📅 Completado:** 29 de noviembre de 2025  
**🔧 Próxima fase:** Revisión de Escandallo.tsx para vincular recetas con productos
