# 📋 Changelog - Sistema de Creación de Productos

## ✨ Nueva Estructura Implementada

### 🎯 Tipos de Productos (3 opciones)

#### 1. 🥤 **Producto Simple**
- **Descripción**: Un único artículo de stock que se vende directamente sin elaboración
- **Ejemplos**: Bebidas, snacks envasados, productos empaquetados
- **Relación**: 1 artículo stock → 1 producto venta
- **Coste**: Precio de coste del artículo de stock seleccionado

#### 2. 🍕 **Producto Manufacturado**
- **Descripción**: Producto elaborado con múltiples artículos de stock (receta/escandallo)
- **Ejemplos**: Pizzas, bocadillos, platos elaborados, bollería artesanal
- **Relación**: Múltiples artículos stock + cantidades → 1 producto venta
- **Coste**: Suma de (artículo.precioCoste × cantidad) de todos los ingredientes

#### 3. 🎁 **Combo / Pack**
- **Descripción**: Conjunto de productos del catálogo vendidos juntos con precio especial
- **Ejemplos**: Menú del día, pack promoción, oferta 2x1
- **Relación**: Múltiples productos catálogo → 1 combo con precio reducido
- **Coste**: Suma del coste estimado de cada producto (40% del PVP)

---

## 🚀 Flujo de Creación (4 Pasos)

### **Paso 1: Selección de Tipo**
- ✅ 3 tarjetas visuales con iconos distintivos
- ✅ Descripción detallada de cada tipo
- ✅ Ejemplos de uso con badges
- ✅ Indicador visual de selección

### **Paso 2: Selección de Componentes**
**Para Producto Simple:**
- ✅ Buscador de artículos de stock
- ✅ Selección de UN artículo
- ✅ Vista previa del artículo seleccionado con coste

**Para Producto Manufacturado:**
- ✅ Buscador de artículos de stock
- ✅ Selección de MÚLTIPLES artículos
- ✅ Input de cantidad para cada artículo
- ✅ Cálculo automático de coste total
- ✅ Vista de receta completa con subtotales

**Para Combo:**
- ✅ Buscador de productos del catálogo
- ✅ Selección de MÚLTIPLES productos
- ✅ Vista previa con precios
- ✅ Cálculo automático del total

### **Paso 3: Configuración de Precios**
- ✅ Muestra precio de coste automático calculado
- ✅ Selector de multiplicador de margen (2x, 2.5x, 3x, 3.5x, 4x)
- ✅ Cálculo automático de PVP
- ✅ Override manual opcional de PVP
- ✅ Selector de IVA (4%, 10%, 21%)
- ✅ Cálculo de PVP final con IVA
- ✅ Selector de promoción opcional

### **Paso 4: Información Final y Resumen**
- ✅ Input de nombre del producto (requerido)
- ✅ Input de URL de imagen (opcional)
- ✅ Configuración de visibilidad (TPV / App)
- ✅ **Resumen Completo Detallado**:
  - Tipo de producto con icono
  - Detalle de componentes según tipo
  - Precio de coste
  - Multiplicador aplicado
  - PVP sin IVA
  - IVA aplicado
  - **PVP Final destacado**
  - **Margen bruto calculado**
  - Promoción aplicada (si existe)
  - Canales de visibilidad

---

## 🔧 Mejoras Técnicas

### **Cálculo Automático de Costes**
```typescript
// Producto Simple
coste = articuloBaseSeleccionado.precioCoste

// Producto Manufacturado
coste = sum(artículo.precioCoste × cantidad)

// Combo
coste = sum(producto.precio × 0.4)  // 40% del PVP como estimación
```

### **Validaciones de Navegación**
- ✅ Paso 1 → 2: Requiere tipo seleccionado
- ✅ Paso 2 → 3: Requiere componentes seleccionados
- ✅ Paso 3 → 4: Sin validación (precios se calculan automáticamente)
- ✅ Paso 4 → Crear: Requiere nombre del producto

### **Payload del Evento PRODUCTO_CREADO**
```typescript
{
  tipo: 'simple' | 'manufacturado' | 'combo',
  id_producto: string,
  nombre: string,
  imagen: string,
  precio_coste: number,
  multiplicador: number,
  pvp_sin_iva: number,
  pvp_manual: number | null,
  iva: string,
  pvp_con_iva: number,
  margen_bruto: number,  // Porcentaje
  promocion: string | null,
  
  // Específicos según tipo
  articulo_base: ArticuloStock | null,  // Solo para 'simple'
  receta: Ingrediente[] | null,         // Solo para 'manufacturado'
  productos_combo: Producto[] | null,   // Solo para 'combo'
  
  // Visibilidad
  visible_tpv: boolean,
  visible_app: boolean,
  timestamp: Date
}
```

---

## 📊 Beneficios del Sistema

### **Para el Negocio**
✅ **Trazabilidad completa**: Saber qué consume cada producto del stock  
✅ **Control de costes**: Cálculo automático de coste por receta  
✅ **Gestión de inventario**: Productos manufacturados descuentan múltiples artículos  
✅ **Flexibilidad de precios**: Combos con descuentos especiales  
✅ **Márgenes claros**: Cálculo automático para cada tipo

### **Para el Usuario**
✅ **Interfaz intuitiva**: Flujo claro en 4 pasos  
✅ **Visual feedback**: Resumen completo antes de crear  
✅ **Validaciones**: Evita errores en la creación  
✅ **Flexibilidad**: 3 tipos cubren todas las casuísticas

---

## 🔄 Cambios en el Código

### **Estados Modificados**
- ❌ Eliminado: `subtipo: 'individual' | 'ingredientes'`
- ✅ Modificado: `tipoProducto: 'simple' | 'manufacturado' | 'combo'`

### **Archivos Modificados**
- `/components/gerente/ClientesGerente.tsx` - Modal completo rediseñado
- `/CHANGELOG_PRODUCTOS.md` - Este archivo (documentación)

### **Dependencias**
- `/data/articulos-stock.ts` - Base de datos de artículos de compra
- `/data/productos.ts` - Base de datos de productos de venta (catálogo)

---

## 🎨 UX/UI Highlights

- 🎨 Código de colores por tipo:
  - **Simple**: Teal/Verde azulado
  - **Manufacturado**: Naranja
  - **Combo**: Púrpura
  
- 📱 Iconos distintivos:
  - **Simple**: `Box` (caja)
  - **Manufacturado**: `ChefHat` (gorro de chef)
  - **Combo**: `Layers` (capas)

- ✨ Feedback visual constante:
  - Bordes de selección
  - Checkmarks de confirmación
  - Resumen en tiempo real
  - Toast notifications con detalles

---

## 🚀 Próximos Pasos Sugeridos

1. **Backend Integration**: Conectar eventos PRODUCTO_CREADO a Make.com
2. **Gestión de Stock**: Implementar descuento automático de stock al vender productos manufacturados
3. **Edición de Productos**: Modal de edición con la misma estructura
4. **Importación Masiva**: CSV/Excel para creación de múltiples productos
5. **Plantillas**: Guardar recetas como plantillas reutilizables

---

**Fecha de Implementación**: 28 de Noviembre, 2024  
**Versión**: 2.0 - Sistema Unificado de Productos
