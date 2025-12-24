# ➕ IMPLEMENTACIÓN BOTÓN "AÑADIR ARTÍCULO" AL PEDIDO

## 🎯 OBJETIVO
Permitir al usuario añadir manualmente cualquier artículo del inventario al pedido, seleccionando el proveedor y la cantidad deseada.

---

## 🏗️ ARQUITECTURA

### **Estados Creados**
```typescript
const [modalAñadirArticuloAbierto, setModalAñadirArticuloAbierto] = useState(false);
const [busquedaArticulo, setBusquedaArticulo] = useState('');
const [articuloSeleccionadoParaAñadir, setArticuloSeleccionadoParaAñadir] = useState<SKU | null>(null);
const [proveedorSeleccionadoParaAñadir, setProveedorSeleccionadoParaAñadir] = useState<string>('');
const [cantidadParaAñadir, setCantidadParaAñadir] = useState<number>(0);
```

### **Función de Filtrado**
```typescript
const articulosFiltrados = skus.filter(sku => 
  sku.codigo.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
  sku.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
  sku.categoria.toLowerCase().includes(busquedaArticulo.toLowerCase())
);
```

---

## 🎨 UI/UX - FLUJO DE 2 PASOS

### **PASO 1: Búsqueda y Selección de Artículo**

#### **Componentes:**
1. **Buscador con icono**
   - Input con placeholder: "Buscar por código, nombre o categoría..."
   - Icono `<Search />` a la izquierda
   - Búsqueda en tiempo real (sin botón)
   - `autoFocus` al abrir modal

2. **Tabla de Resultados**
   - Altura máxima: 384px (max-h-96)
   - Scroll vertical si hay muchos resultados
   - Header sticky para mantener columnas visibles
   - Hover effect en filas

#### **Columnas de la Tabla:**
| Columna | Contenido | Descripción |
|---------|-----------|-------------|
| **Código** | `ART-001` | NUESTRO código interno en teal |
| **Artículo** | Nombre + icono | Icono Package + nombre del artículo |
| **Categoría** | Badge | Badge outline con categoría |
| **PDV** | 📍 Ubicación | PDV/Almacén del artículo |
| **Stock** | 15/50 | Disponible/Máximo (rojo si < rop) |
| **Proveedores** | Badge azul | N° de proveedores disponibles |
| **Acción** | Botón | "Seleccionar" |

#### **Estado Vacío:**
- Icono `<Package />` grande en gris
- Mensaje: "No se encontraron artículos"

---

### **PASO 2: Configuración de Cantidad y Proveedor**

#### **Componentes:**

1. **Card de Artículo Seleccionado** (bg-teal-50)
   - Icono `<Package />`
   - Nombre del artículo en negrita
   - Metadata: Código · PDV · Stock
   - Botón "Cambiar artículo" (vuelve al paso 1)

2. **Selector de Proveedor**
   - Label: "Proveedor *"
   - Select con todos los proveedores del artículo
   - Muestra por cada proveedor:
     - Icono `<Building2 />`
     - Nombre del proveedor
     - Badge "Preferente" (verde) si aplica
     - Referencia: `Ref: HAR-001`
     - Precio: `18.50€` (en teal)

3. **Input de Cantidad**
   - Label: "Cantidad *"
   - Input type="number", min="1"
   - Texto de ayuda: "Sugerido: 35 uds"
   - Cálculo: `maximo - disponible`

4. **Preview de Total** (Card bg-blue-50)
   - Se muestra solo si hay proveedor y cantidad > 0
   - "Total estimado:"
   - Cálculo: `cantidad × precioCompra`
   - Formato: `647.50€` en negrita azul

---

## ⚙️ LÓGICA DE NEGOCIO

### **Al hacer clic en "Seleccionar" (Paso 1 → Paso 2):**
```typescript
onClick={() => {
  setArticuloSeleccionadoParaAñadir(sku);
  
  // Pre-seleccionar proveedor preferente
  const provPreferente = sku.proveedores.find(p => p.esPreferente);
  if (provPreferente) {
    setProveedorSeleccionadoParaAñadir(provPreferente.proveedorId);
  }
  
  // Calcular cantidad sugerida
  setCantidadParaAñadir(Math.max(0, sku.maximo - sku.disponible));
}}
```

### **Al hacer clic en "Añadir al Pedido":**

#### **1. Validaciones:**
```typescript
disabled={
  !articuloSeleccionadoParaAñadir || 
  !proveedorSeleccionadoParaAñadir || 
  cantidadParaAñadir <= 0
}
```

#### **2. Buscar datos del proveedor:**
```typescript
const proveedorData = articuloSeleccionadoParaAñadir.proveedores.find(
  p => p.proveedorId === proveedorSeleccionadoParaAñadir
);
```

#### **3. Verificar si ya existe en el pedido:**
```typescript
const articuloExistente = articulosSeleccionados.find(
  a => a.id === articuloSeleccionadoParaAñadir.id && 
       a.proveedorId === proveedorSeleccionadoParaAñadir
);
```

#### **4A. Si ya existe → Actualizar cantidad:**
```typescript
if (articuloExistente) {
  const nuevosArticulos = articulosSeleccionados.map(a =>
    a.id === articuloSeleccionadoParaAñadir.id && 
    a.proveedorId === proveedorSeleccionadoParaAñadir
      ? { ...a, propuesta: a.propuesta + cantidadParaAñadir }
      : a
  );
  setArticulosSeleccionados(nuevosArticulos);
  toast.success('Cantidad actualizada', {
    description: `Se han añadido ${cantidadParaAñadir} unidades más`
  });
}
```

#### **4B. Si NO existe → Añadir nuevo:**
```typescript
else {
  const nuevoArticulo = {
    id: articuloSeleccionadoParaAñadir.id,
    codigo: articuloSeleccionadoParaAñadir.codigo,
    codigoProveedor: proveedorData.codigoProveedor,
    articulo: articuloSeleccionadoParaAñadir.nombre,
    nombreProveedor: proveedorData.nombreProveedor,
    pdv: articuloSeleccionadoParaAñadir.almacen,
    stockActual: articuloSeleccionadoParaAñadir.disponible,
    stockOptimo: articuloSeleccionadoParaAñadir.maximo,
    propuesta: cantidadParaAñadir,
    precio: proveedorData.precioCompra,
    proveedor: proveedorData.proveedorNombre,
    proveedorId: proveedorData.proveedorId,
    ultimaFactura: proveedorData.ultimaFactura,
    proveedoresDisponibles: articuloSeleccionadoParaAñadir.proveedores
  };

  setArticulosSeleccionados([...articulosSeleccionados, nuevoArticulo]);
  
  toast.success('Artículo añadido al pedido', {
    description: `${cantidadParaAñadir} × ${articuloSeleccionadoParaAñadir.nombre}`
  });
}
```

#### **5. Emitir evento:**
```typescript
console.log('➕ EVENTO: ARTICULO_AÑADIDO_A_PEDIDO', {
  articuloId: nuevoArticulo.id,
  codigo: nuevoArticulo.codigo,
  proveedor: proveedorData.proveedorNombre,
  cantidad: cantidadParaAñadir,
  precioUnitario: proveedorData.precioCompra,
  total: cantidadParaAñadir * proveedorData.precioCompra,
  timestamp: new Date()
});
```

#### **6. Cerrar modal y limpiar:**
```typescript
setModalAñadirArticuloAbierto(false);
setArticuloSeleccionadoParaAñadir(null);
setProveedorSeleccionadoParaAñadir('');
setCantidadParaAñadir(0);
setBusquedaArticulo('');
```

---

## 🎭 CASOS DE USO

### **Caso 1: Añadir artículo nuevo**
1. Usuario hace clic en "+ Añadir Artículo"
2. Modal se abre mostrando todos los SKUs
3. Usuario busca "harina" → Filtra a "Harina de Trigo T45"
4. Usuario hace clic en "Seleccionar"
5. Se pre-selecciona "Harinas del Norte" (preferente)
6. Se sugiere cantidad: 35 uds
7. Usuario modifica a 40 uds
8. Hace clic en "Añadir al Pedido"
9. Se añade nueva línea en la tabla de pedidos
10. Toast: "Artículo añadido al pedido - 40 × Harina de Trigo T45"

### **Caso 2: Incrementar cantidad de artículo existente**
1. Artículo "ART-001" + "PROV-001" ya está con 35 uds
2. Usuario añade nuevamente "ART-001" + "PROV-001" con 10 uds
3. Sistema detecta que ya existe
4. Actualiza cantidad: 35 + 10 = 45 uds
5. Toast: "Cantidad actualizada - Se han añadido 10 unidades más"

### **Caso 3: Mismo artículo, diferente proveedor**
1. Artículo "ART-001" + "PROV-001" ya está con 35 uds
2. Usuario añade "ART-001" + "PROV-005" con 20 uds
3. Sistema detecta que es diferente proveedor
4. Crea NUEVA línea en el pedido
5. Ahora hay 2 líneas del mismo artículo, diferentes proveedores
6. Toast: "Artículo añadido al pedido"

---

## 🔒 VALIDACIONES

| Condición | Estado del Botón | Mensaje |
|-----------|------------------|---------|
| No hay artículo seleccionado | ❌ Deshabilitado | - |
| No hay proveedor seleccionado | ❌ Deshabilitado | - |
| Cantidad = 0 | ❌ Deshabilitado | - |
| Cantidad < 0 | ❌ Deshabilitado | Input min="1" |
| Todo correcto | ✅ Habilitado | - |

---

## 🎨 DISEÑO VISUAL

### **Colores:**
- **Teal (#0d9488)**: Códigos de artículos, botones principales
- **Blue (#3b82f6)**: Preview de total, badges de proveedores
- **Green (#22c55e)**: Badge "Preferente"
- **Red (#ef4444)**: Stock bajo (disponible < rop)
- **Gray**: Textos secundarios, bordes

### **Iconos:**
- `<Search />`: Buscador
- `<Package />`: Artículos
- `<Building2 />`: Proveedores
- `<Plus />`: Añadir artículo

### **Tipografía:**
- `font-mono`: Códigos (ART-001, HAR-001)
- `font-semibold`: Nombres, precios
- `font-medium`: Labels
- `text-sm`, `text-xs`: Metadata, ayudas

---

## 📊 MÉTRICAS DE RENDIMIENTO

- **Búsqueda en tiempo real**: Filtrado instantáneo de SKUs
- **No hay llamadas a API**: Todo en memoria (datos mock)
- **Validaciones en cliente**: No requiere servidor
- **UX fluida**: Transición suave entre pasos

---

## 🧪 TESTS RECOMENDADOS

### **Tests Funcionales:**
1. ✅ Búsqueda por código encuentra artículos
2. ✅ Búsqueda por nombre encuentra artículos
3. ✅ Búsqueda por categoría encuentra artículos
4. ✅ Búsqueda vacía muestra todos los artículos
5. ✅ Seleccionar artículo pre-carga proveedor preferente
6. ✅ Seleccionar artículo calcula cantidad sugerida
7. ✅ Añadir artículo nuevo crea línea en pedido
8. ✅ Añadir artículo existente incrementa cantidad
9. ✅ Mismo artículo + diferente proveedor = 2 líneas
10. ✅ Botón deshabilitado sin datos completos
11. ✅ Modal se cierra y limpia estados al añadir
12. ✅ Evento `ARTICULO_AÑADIDO_A_PEDIDO` se emite

### **Tests de UI:**
1. ✅ Modal abre al hacer clic en botón
2. ✅ Buscador tiene autoFocus
3. ✅ Tabla muestra scroll si hay muchos resultados
4. ✅ Header de tabla sticky al hacer scroll
5. ✅ Hover effect en filas de tabla
6. ✅ Preview de total se muestra solo con datos completos
7. ✅ Toast aparece al añadir artículo
8. ✅ Botón "Cambiar artículo" vuelve al paso 1

---

## 🔮 MEJORAS FUTURAS

1. **Búsqueda avanzada:**
   - Filtros por PDV
   - Filtros por categoría
   - Filtros por estado de stock

2. **Sugerencias inteligentes:**
   - Artículos más pedidos
   - Artículos del mismo proveedor
   - Artículos relacionados

3. **Validación de stock:**
   - Advertir si se pide más del máximo
   - Sugerir cantidad óptima basada en histórico

4. **Optimización:**
   - Virtualización de tabla para miles de SKUs
   - Debounce en búsqueda

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear estados del modal
- [x] Crear función de filtrado de artículos
- [x] Diseñar UI del modal (2 pasos)
- [x] Implementar paso 1: Búsqueda y selección
- [x] Implementar paso 2: Configuración
- [x] Lógica de añadir artículo nuevo
- [x] Lógica de incrementar cantidad existente
- [x] Validaciones de formulario
- [x] Integración con tabla de pedidos
- [x] Toasts de confirmación
- [x] Evento `ARTICULO_AÑADIDO_A_PEDIDO`
- [x] Limpieza de estados al cerrar
- [x] Botón "Cambiar artículo"
- [x] Preview de total estimado
- [x] Estilos y responsive

---

## 🎯 IMPACTO

**Antes:**
- ❌ Solo se podían pedir artículos con stock bajo
- ❌ No se podía cambiar la lista de artículos
- ❌ Pedidos limitados a artículos filtrados

**Ahora:**
- ✅ Se puede pedir CUALQUIER artículo del inventario
- ✅ Se puede elegir proveedor específico
- ✅ Se puede personalizar cantidad
- ✅ Control total sobre el pedido
- ✅ Flexibilidad máxima para el gerente

---

**Fecha de implementación:** 29 de Noviembre de 2025  
**Versión:** 1.0  
**Estado:** ✅ COMPLETADO Y FUNCIONAL
