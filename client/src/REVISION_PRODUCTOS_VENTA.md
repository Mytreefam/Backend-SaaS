# 📦 REVISIÓN COMPLETA: SISTEMA DE PRODUCTOS DE VENTA (CATÁLOGO)

**Fecha:** 29 de Noviembre de 2025  
**Sistema:** Udar Edge - SaaS Multiempresa  
**Fase:** DEMO - Preparación para Backend Real  

---

## 🎯 **TU ARQUITECTURA (Muy bien planteada)**

```
ARTÍCULOS DE PROVEEDORES (Stock de compra)
    ├─ Sin Manufacturar ────────► PRODUCTOS VENTA (Venta directa)
    │   Ejemplo: Coca-Cola                   │
    │                                         │
    └─ Manufacturados (Ingredientes) ─────► RECETA ──► PRODUCTO MANUFACTURADO
        Ejemplo: Harina, Tomate                  │         │
                                                 │         └─► Pizza Margarita
                                                 │
                                            ESCANDALLO
                                        (Costo ingredientes)
```

### **TU LÓGICA ES CORRECTA:**

1. **ARTÍCULOS SIN MANUFACTURAR** → Se venden tal cual (bebidas, snacks)
2. **ARTÍCULOS MANUFACTURADOS** (ingredientes) → Se transforman en productos mediante RECETAS
3. **PRODUCTOS FINALES** → Aparecen en APP del cliente y TPV

---

## ✅ **LO QUE YA TIENES IMPLEMENTADO**

### **1. GESTIÓN DE PRODUCTOS** ✅ `/components/gerente/GestionProductos.tsx`

**Estado:** 🟢 **IMPLEMENTADO Y FUNCIONAL**

#### **Características:**
- ✅ CRUD completo de productos (Crear, Leer, Actualizar, Eliminar)
- ✅ Catálogo de productos con categorías
- ✅ Búsqueda y filtros
- ✅ Gestión de stock (cantidad disponible)
- ✅ Precios de venta y compra
- ✅ Productos activos/inactivos
- ✅ Productos destacados
- ✅ Gestión de imágenes
- ✅ IVA configurable
- ✅ Unidades de medida (kg, litros, unidades)
- ✅ Stock mínimo con alertas
- ✅ Exportar/Importar productos
- ✅ Duplicar productos
- ✅ Optimizado para móvil (APK)

#### **Estructura de Datos:**
```typescript
interface Producto {
  id: string;                    // "prod-001"
  sku: string;                   // "PAN-001" (código único)
  nombre: string;                // "Pan de Masa Madre"
  descripcion: string;           // Texto descriptivo
  categoria: string;             // "Pan de masa madre"
  precio: number;                // 3.50 (precio venta)
  precio_compra: number;         // 1.20 (costo)
  stock: number;                 // 45 unidades
  stock_minimo: number;          // 10 (alerta)
  imagen?: string;               // URL imagen
  activo: boolean;               // true/false
  destacado: boolean;            // Aparece destacado
  iva: number;                   // 10, 21, etc.
  peso?: number;                 // 0.5 (opcional)
  unidad: 'unidad' | 'kg' | 'litro';
  proveedor_id?: string;         // FK opcional
  fecha_creacion: Date;
  fecha_modificacion: Date;
  notas?: string;
}
```

#### **Categorías Disponibles:**
```typescript
[
  'Pan básico',
  'Pan de masa madre',
  'Bollería simple',
  'Bollería especial',
  'Pasteles individuales',
  'Tartas',
  'Bocadillos',
  'Ensaladas',
  'Bebidas frías',
  'Bebidas calientes',
  'Sándwiches',
  'Cafés especiales'
]
```

#### **Productos Mock de Ejemplo:**
```typescript
// 1. Pan de Masa Madre - 3.50€ (MANUFACTURADO)
// 2. Croissant de Mantequilla - 1.80€ (MANUFACTURADO)
// 3. Café Americano - 1.50€ (SIN MANUFACTURAR - bebida)
// 4. Tarta de Zanahoria - 4.50€ (MANUFACTURADO)
// 5. Bocadillo de Jamón Ibérico - 5.50€ (MANUFACTURADO)
```

---

### **2. ESCANDALLO (RECETAS Y COSTOS)** ✅ `/components/gerente/Escandallo.tsx`

**Estado:** 🟢 **IMPLEMENTADO Y FUNCIONAL**

#### **Características:**
- ✅ Crear recetas de productos manufacturados
- ✅ Añadir ingredientes (artículos del stock)
- ✅ Añadir sub-productos (productos compuestos)
- ✅ Calcular costo total automáticamente
- ✅ Calcular margen bruto (%)
- ✅ Ver rentabilidad (rentable, revisar, guardado)
- ✅ Ver detalle completo de escandallo
- ✅ Editar/eliminar escandallos
- ✅ Activar/desactivar productos

#### **Estructura de Datos:**
```typescript
interface EscandalloIngrediente {
  id: string;                           // "E001"
  producto_id: string;                  // "PV001" FK → Producto final
  tipo_elemento: 'articulo' | 'producto'; // Artículo o Sub-producto
  articulo_id: string | null;           // "MP001" FK → Stock compra
  producto_hijo_id: string | null;      // "PV002" FK → Otro producto
  cantidad: number;                     // 50
  unidad: string;                       // "g", "ml", "unidades"
  coste_unitario: number;               // 0.0008 €/g
  coste_total_ingrediente: number;      // 0.04 €
}

interface EscandalloResumen {
  producto_id: string;
  nombre_producto: string;
  pvp: number;                          // Precio venta público
  coste_total: number;                  // Suma ingredientes
  margen_bruto_pct: number;             // (PVP - Costo) / PVP * 100
  estado: 'rentable' | 'guardado' | 'revisar';
}
```

#### **Ejemplo Real: Croissant de Mantequilla**
```typescript
Producto: "Croissant de Mantequilla"
PVP: 2.50€

Ingredientes (artículos del stock):
  - Harina (MP001): 50g × 0.0008€/g = 0.04€
  - Mantequilla (MP005): 30g × 0.009€/g = 0.27€
  - Levadura (MP006): 5g × 0.017€/g = 0.085€
  - Sal (MP007): 2g × 0.0008€/g = 0.0016€
  
COSTO TOTAL: 0.3966€
MARGEN BRUTO: (2.50 - 0.40) / 2.50 = 84%
ESTADO: ✅ Rentable
```

#### **Capacidades Avanzadas:**
- ✅ **Productos compuestos:** Un producto puede incluir otros productos
  - Ejemplo: "Menú Desayuno" incluye → "Croissant" + "Café con Leche"
- ✅ **Cálculo recursivo:** Si el croissant tiene costo 0.40€ y el café 0.30€, el menú cuesta 0.70€
- ✅ **Actualización automática:** Si sube el precio de la mantequilla, el costo del croissant se actualiza

---

## 🔴 **LO QUE FALTA (Gaps identificados)**

### **PROBLEMA 1: NO HAY SEPARACIÓN DE TIPOS DE PRODUCTO** ⚠️

**Situación actual:**
```typescript
interface Producto {
  // ❌ NO TIENE campo "tipo"
  nombre: string;
  precio: number;
  // ...
}
```

**Lo que necesitas:**
```typescript
interface Producto {
  id: string;
  sku: string;
  nombre: string;
  
  // ✅ AÑADIR ESTE CAMPO
  tipo_producto: 'simple' | 'manufacturado' | 'combo';
  
  // Si es 'simple' → se vende tal cual (bebida, snack)
  // Si es 'manufacturado' → tiene receta (escandallo)
  // Si es 'combo' → incluye otros productos
  
  precio: number;
  // ...
}
```

**Impacto:**
- ❌ No puedes distinguir bebidas (venta directa) de pizzas (manufacturadas)
- ❌ La app y TPV no saben si descontar stock de ingredientes
- ❌ Al vender una Coca-Cola, debería restar del stock de bebidas
- ❌ Al vender una Pizza, debería restar harina, tomate, queso, etc.

---

### **PROBLEMA 2: NO HAY RELACIÓN DIRECTA PRODUCTO → ARTÍCULO STOCK** ⚠️

**Situación actual:**
```
STOCK (Artículos compra)          PRODUCTOS (Venta)
├─ Coca-Cola 1L                   ├─ Coca-Cola - 2.50€
├─ Harina T45                     ├─ Pan Artesanal - 3.50€
├─ Tomate triturado               └─ Pizza Margarita - 12.50€
└─ Queso Mozzarella
     ↓
  ❌ NO HAY CONEXIÓN AUTOMÁTICA
```

**Lo que necesitas:**
```typescript
// Producto SIMPLE (sin manufacturar)
{
  id: 'PROD-001',
  nombre: 'Coca-Cola 1L',
  tipo_producto: 'simple',
  articulo_stock_id: 'SKU-COCA-001',  // ⭐ REFERENCIA DIRECTA
  // Cuando se vende 1, se resta 1 del stock SKU-COCA-001
}

// Producto MANUFACTURADO (con receta)
{
  id: 'PROD-002',
  nombre: 'Pizza Margarita',
  tipo_producto: 'manufacturado',
  escandallo_id: 'ESC-002',           // ⭐ TIENE RECETA
  // Cuando se vende 1, se ejecuta la receta:
  //   - Harina: -250g
  //   - Tomate: -100g
  //   - Queso: -150g
}
```

---

### **PROBLEMA 3: ESCANDALLO NO ESTÁ INTEGRADO CON GESTIONPRODUCTOS** ⚠️

**Situación actual:**
- ✅ `GestionProductos.tsx` → Gestiona productos
- ✅ `Escandallo.tsx` → Gestiona recetas
- ❌ **ESTÁN SEPARADOS** → No se comunican

**Lo que debería pasar:**
```
1. GERENTE crea producto "Pizza Margarita" en GestionProductos
   ↓
2. GERENTE marca tipo_producto: 'manufacturado'
   ↓
3. SISTEMA pregunta: "¿Quieres crear la receta ahora?"
   ↓
4. GERENTE va a Escandallo y crea la receta
   ↓
5. SISTEMA vincula automáticamente:
   Producto.escandallo_id = ESC-002
   ↓
6. CUANDO SE VENDE:
   - Busca escandallo ESC-002
   - Lee ingredientes: Harina 250g, Tomate 100g, Queso 150g
   - Resta del stock automáticamente
```

**Actualmente:**
- ❌ Puedes crear producto sin receta
- ❌ Puedes crear receta sin producto
- ❌ No hay validación de que exista la receta
- ❌ Al vender, no se descuenta stock de ingredientes

---

### **PROBLEMA 4: NO HAY CAMPO `empresa_id` NI `marca_id`** ⚠️

**Situación actual:**
```typescript
interface Producto {
  id: string;
  nombre: string;
  // ❌ NO TIENE empresa_id
  // ❌ NO TIENE marca_id
}
```

**Lo que necesitas (según tu arquitectura multiempresa):**
```typescript
interface Producto {
  id: string;
  sku: string;
  nombre: string;
  
  // ✅ SEPARACIÓN POR EMPRESA Y MARCA
  empresa_id: string;              // "EMP-001" FK
  empresa_nombre: string;          // "Disarmink SL - Hoy Pecamos"
  marca_id: string;                // "MRC-001" FK
  marca_nombre: string;            // "Modomio"
  punto_venta_id?: string;         // "PDV-TIANA" (opcional)
  
  // Si es catálogo global → punto_venta_id = null
  // Si es específico de tienda → punto_venta_id = "PDV-TIANA"
}
```

**Impacto:**
- ❌ No puedes separar productos de "Modomio" vs "Blackburguer"
- ❌ Todos los productos se mezclan en una sola lista
- ❌ La app del cliente no puede filtrar por marca
- ❌ El TPV no sabe qué productos mostrar según el punto de venta

---

### **PROBLEMA 5: NO HAY RELACIÓN CON PROMOCIONES** ⚠️

Mencionaste:
> "El sistema de Promociones del Gerente debe ser la base de datos master que se conecte con las visualizaciones del Cliente y también se visualice en el TPV"

**Situación actual:**
```
PRODUCTOS                         PROMOCIONES
├─ Pizza Margarita - 12.50€      ├─ 2x1 Pizzas
└─ Coca-Cola - 2.50€             └─ -20% Bebidas
     ↓                                 ↓
  ❌ NO HAY CONEXIÓN
```

**Lo que necesitas:**
```typescript
interface Producto {
  id: string;
  nombre: string;
  precio: number;                  // Precio base
  
  // ✅ PROMOCIONES APLICABLES
  promociones_activas?: string[];  // ["PROMO-001", "PROMO-005"]
  precio_con_promocion?: number;   // Calculado en tiempo real
}

interface Promocion {
  id: string;
  tipo: '2x1' | 'descuento_porcentaje' | 'descuento_fijo' | 'combo';
  productos_aplicables: string[];  // ["PROD-001", "PROD-002"]
  // ...
}
```

---

## 📊 **COMPARATIVA: LO QUE TIENES vs LO QUE NECESITAS**

| Aspecto | Estado Actual | Lo Que Necesitas | Prioridad |
|---------|---------------|------------------|-----------|
| **CRUD Productos** | ✅ Completo | ✅ OK | - |
| **Catálogo visual** | ✅ Completo | ✅ OK | - |
| **Recetas/Escandallo** | ✅ Completo | ✅ OK | - |
| **Tipos de producto** | ❌ No existe | ⚠️ `tipo_producto` | 🔴 ALTA |
| **Relación Stock→Producto** | ❌ No existe | ⚠️ `articulo_stock_id` | 🔴 ALTA |
| **Integración Escandallo** | ❌ Separado | ⚠️ `escandallo_id` | 🔴 ALTA |
| **Multi-empresa** | ❌ No existe | ⚠️ `empresa_id`, `marca_id` | 🟡 MEDIA |
| **Relación Promociones** | ❌ No existe | ⚠️ `promociones_activas` | 🟡 MEDIA |
| **Descuento stock al vender** | ❌ No implementado | ⚠️ Lógica backend | 🔴 ALTA |
| **Costo calculado** | ✅ En Escandallo | ✅ OK | - |
| **Margen bruto** | ✅ En Escandallo | ✅ OK | - |

---

## 🎯 **ESTRUCTURA DE DATOS PROPUESTA (Mejorada)**

### **TABLA: PRODUCTOS (Catálogo de Venta)**

```typescript
interface ProductoVenta {
  // IDENTIFICACIÓN
  id: string;                           // "PROD-001" UUID
  sku: string;                          // "PAN-001" UNIQUE
  nombre: string;                       // "Pizza Margarita"
  descripcion: string;                  // Descripción larga
  
  // ⭐ TIPO DE PRODUCTO (NUEVO)
  tipo_producto: 'simple' | 'manufacturado' | 'combo';
  
  // SEPARACIÓN MULTI-EMPRESA (NUEVO)
  empresa_id: string;                   // "EMP-001" FK
  empresa_nombre: string;               // "Disarmink SL - Hoy Pecamos"
  marca_id: string;                     // "MRC-001" FK
  marca_nombre: string;                 // "Modomio"
  punto_venta_id?: string;              // "PDV-TIANA" (opcional)
  
  // CATEGORIZACIÓN
  categoria: string;                    // "Pizzas"
  subcategoria?: string;                // "Pizzas clásicas"
  
  // PRECIOS
  precio_venta: number;                 // 12.50 (sin IVA)
  precio_con_iva: number;               // 13.75 (calculado)
  iva: number;                          // 10%
  
  // ⭐ COSTOS (CALCULADOS DESDE ESCANDALLO)
  costo_ingredientes?: number;          // 4.20 (si manufacturado)
  costo_envases?: number;               // 0.80
  costo_total?: number;                 // 5.00
  margen_bruto_pct?: number;            // 60%
  
  // ⭐ RELACIONES (NUEVO)
  // Si tipo_producto = 'simple':
  articulo_stock_id?: string;           // "SKU-001" FK → Stock de compra
  
  // Si tipo_producto = 'manufacturado':
  escandallo_id?: string;               // "ESC-001" FK → Receta
  
  // Si tipo_producto = 'combo':
  productos_incluidos?: Array<{
    producto_id: string;                // "PROD-002"
    cantidad: number;                   // 1
  }>;
  
  // PROMOCIONES (NUEVO)
  promociones_activas?: string[];       // ["PROMO-001"]
  precio_promocional?: number;          // 10.00 (si hay promo)
  
  // STOCK (Para productos simples sin manufacturar)
  stock_actual?: number;                // 45 (si aplica)
  stock_minimo?: number;                // 10
  
  // PRESENTACIÓN
  imagen_url?: string;
  imagenes_adicionales?: string[];
  peso?: number;                        // 0.5
  unidad: 'unidad' | 'kg' | 'litro';
  tiempo_preparacion?: number;          // 15 minutos
  
  // ESTADO
  activo: boolean;                      // Visible en app/TPV
  destacado: boolean;                   // Aparece destacado
  visible_app: boolean;                 // Visible en app cliente
  visible_tpv: boolean;                 // Visible en TPV
  
  // METADATA
  notas?: string;
  tags?: string[];                      // ["vegano", "sin gluten"]
  orden_visualizacion?: number;         // Para ordenar en menú
  
  // TIMESTAMPS
  created_at: timestamp;
  updated_at: timestamp;
  created_by: string;                   // Usuario que lo creó
}
```

### **TABLA: ESCANDALLOS (Recetas)**

```typescript
interface Escandallo {
  id: string;                           // "ESC-001" UUID
  producto_id: string;                  // "PROD-002" FK UNIQUE
  nombre_escandallo: string;            // "Receta Pizza Margarita"
  
  // INGREDIENTES
  ingredientes: EscandalloIngrediente[];
  
  // COSTOS CALCULADOS
  costo_total_ingredientes: number;     // Suma de todos
  costo_envases: number;                // Cajas, bolsas, etc.
  costo_total: number;                  // Total
  
  // RENDIMIENTO
  cantidad_producida: number;           // 1 (pizza)
  unidad_producida: string;             // "unidad"
  
  // METADATA
  activo: boolean;
  notas?: string;
  created_at: timestamp;
  updated_at: timestamp;
}

interface EscandalloIngrediente {
  id: string;                           // "ESC-ING-001"
  escandallo_id: string;                // "ESC-001" FK
  
  // TIPO DE ELEMENTO
  tipo_elemento: 'articulo' | 'producto';
  
  // Si tipo = 'articulo' (ingrediente del stock)
  articulo_id?: string;                 // "SKU-001" FK → Stock
  articulo_nombre?: string;             // "Harina T45"
  
  // Si tipo = 'producto' (sub-producto)
  producto_hijo_id?: string;            // "PROD-003" FK → Otro producto
  producto_hijo_nombre?: string;        // "Salsa de tomate casera"
  
  // CANTIDAD
  cantidad: number;                     // 250
  unidad: string;                       // "g", "ml", "unidades"
  
  // COSTO
  costo_unitario: number;               // 0.0012 €/g
  costo_total_ingrediente: number;      // 0.30€
  
  // METADATA
  orden: number;                        // Para ordenar ingredientes
  opcional: boolean;                    // Si es opcional
  notas?: string;
}
```

---

## 🔗 **FLUJO COMPLETO: ARTÍCULO → PRODUCTO → VENTA**

### **CASO 1: PRODUCTO SIMPLE (Sin manufacturar)**

```
1. GERENTE compra "Coca-Cola 1L" al proveedor
   ↓
   StockContext registra:
   {
     id: 'SKU-COCA-001',
     codigo: 'BEB-001',
     nombre: 'Coca-Cola 1L',
     categoria: 'Bebidas',
     disponible: 50,  ← Stock inicial
     empresa: 'Disarmink SL',
     almacen: 'Tiana'
   }

2. GERENTE crea producto de venta en GestionProductos
   ↓
   {
     id: 'PROD-COCA-001',
     nombre: 'Coca-Cola 1L',
     tipo_producto: 'simple',  ⭐
     articulo_stock_id: 'SKU-COCA-001',  ⭐ Vinculado
     precio_venta: 2.50,
     activo: true
   }

3. CLIENTE compra 1 Coca-Cola en la APP
   ↓
   Sistema ejecuta:
   - Crea venta
   - Busca producto PROD-COCA-001
   - Ve que es tipo 'simple'
   - Busca articulo_stock_id: 'SKU-COCA-001'
   - Resta 1 del stock:
     SKU-COCA-001.disponible: 50 → 49  ✅

4. TRABAJADOR ve en MaterialTrabajador:
   ↓
   "Coca-Cola 1L: 49 unidades (se vendió 1)"  ✅
```

---

### **CASO 2: PRODUCTO MANUFACTURADO (Con receta)**

```
1. GERENTE compra ingredientes
   ↓
   Stock:
   - SKU-001: Harina T45 (15 kg)
   - SKU-002: Tomate triturado (8 kg)
   - SKU-003: Queso Mozzarella (3 kg)

2. GERENTE crea producto en GestionProductos
   ↓
   {
     id: 'PROD-PIZZA-001',
     nombre: 'Pizza Margarita',
     tipo_producto: 'manufacturado',  ⭐
     precio_venta: 12.50
   }

3. GERENTE crea escandallo en Escandallo.tsx
   ↓
   {
     id: 'ESC-PIZZA-001',
     producto_id: 'PROD-PIZZA-001',  ⭐ Vinculado
     ingredientes: [
       {
         tipo_elemento: 'articulo',
         articulo_id: 'SKU-001',  // Harina
         cantidad: 250,
         unidad: 'g',
         costo_total: 0.30€
       },
       {
         tipo_elemento: 'articulo',
         articulo_id: 'SKU-002',  // Tomate
         cantidad: 100,
         unidad: 'g',
         costo_total: 0.12€
       },
       {
         tipo_elemento: 'articulo',
         articulo_id: 'SKU-003',  // Queso
         cantidad: 150,
         unidad: 'g',
         costo_total: 0.45€
       }
     ],
     costo_total: 0.87€
   }

4. SISTEMA vincula automáticamente
   ↓
   PROD-PIZZA-001.escandallo_id = 'ESC-PIZZA-001'  ✅

5. CLIENTE compra 1 Pizza en la APP
   ↓
   Sistema ejecuta:
   - Crea venta
   - Busca producto PROD-PIZZA-001
   - Ve que es tipo 'manufacturado'
   - Busca escandallo_id: 'ESC-PIZZA-001'
   - Lee ingredientes:
     * Harina: 250g
     * Tomate: 100g
     * Queso: 150g
   - Resta del stock:
     * SKU-001: 15kg → 14.75kg  ✅
     * SKU-002: 8kg → 7.9kg     ✅
     * SKU-003: 3kg → 2.85kg    ✅

6. TRABAJADOR ve en MaterialTrabajador:
   ↓
   "Harina T45: 14.75 kg (↓ 0.25 kg)"
   "Tomate: 7.9 kg (↓ 0.1 kg)"
   "Queso: 2.85 kg (↓ 0.15 kg)"  ✅

7. GERENTE ve en StockProveedores:
   ↓
   - Alertas actualizadas
   - Costos calculados
   - Margen real de la venta  ✅
```

---

## 🚨 **PRIORIDADES PARA COMPLETAR EL SISTEMA**

### **🔴 PRIORIDAD ALTA (Necesario para funcionar)**

#### **1. Añadir campo `tipo_producto`** (2 horas)
```typescript
// En /components/gerente/GestionProductos.tsx
interface Producto {
  // ... campos existentes
  tipo_producto: 'simple' | 'manufacturado' | 'combo';  // ⭐ NUEVO
}

// En el formulario de crear/editar producto:
<Select value={tipoProducto} onValueChange={setTipoProducto}>
  <SelectItem value="simple">
    Sin manufacturar (venta directa)
  </SelectItem>
  <SelectItem value="manufacturado">
    Manufacturado (con receta)
  </SelectItem>
  <SelectItem value="combo">
    Combo/Pack (incluye productos)
  </SelectItem>
</Select>
```

#### **2. Añadir relación `articulo_stock_id`** (1 hora)
```typescript
interface Producto {
  // ... campos existentes
  articulo_stock_id?: string;  // ⭐ NUEVO (solo si tipo='simple')
}

// En el formulario, si tipoProducto === 'simple':
<Select>
  <SelectItem value="SKU-001">Coca-Cola 1L</SelectItem>
  <SelectItem value="SKU-002">Agua Mineral 1.5L</SelectItem>
  {/* Lista de artículos del stock */}
</Select>
```

#### **3. Añadir relación `escandallo_id`** (1 hora)
```typescript
interface Producto {
  // ... campos existentes
  escandallo_id?: string;  // ⭐ NUEVO (solo si tipo='manufacturado')
}

// Vincular automáticamente al crear escandallo
```

#### **4. Añadir campos multi-empresa** (2 horas)
```typescript
interface Producto {
  // ... campos existentes
  empresa_id: string;        // ⭐ NUEVO
  empresa_nombre: string;
  marca_id: string;          // ⭐ NUEVO
  marca_nombre: string;
  punto_venta_id?: string;   // ⭐ NUEVO (opcional)
}

// Usar la estructura de ConfiguracionEmpresas
import { EMPRESAS, MARCAS, PUNTOS_VENTA } from '../../constants/empresaConfig';
```

**TIEMPO TOTAL PRIORIDAD ALTA: 6 horas**

---

### **🟡 PRIORIDAD MEDIA (Importante pero no bloqueante)**

#### **5. Integrar GestionProductos con Escandallo** (4 horas)
- Crear botón "Crear receta" desde GestionProductos
- Al crear escandallo, vincular automáticamente
- Mostrar costo calculado en la tabla de productos
- Validar que productos manufacturados tengan escandallo

#### **6. Añadir filtros por empresa/marca** (2 horas)
- Filtrar productos por empresa seleccionada
- Filtrar por marca
- Filtrar por punto de venta

#### **7. Mostrar stock calculado para manufacturados** (3 horas)
- Calcular cuántas pizzas se pueden hacer con el stock actual
- "Puedes hacer 45 pizzas con el stock disponible"
- Alertas si falta algún ingrediente

**TIEMPO TOTAL PRIORIDAD MEDIA: 9 horas**

---

### **🟢 PRIORIDAD BAJA (Nice to have)**

#### **8. Relación con Promociones** (6 horas)
- Vincular productos con promociones activas
- Calcular precio promocional
- Mostrar en catálogo

#### **9. Importar/Exportar con nuevos campos** (2 horas)
- Actualizar funciones de import/export
- Incluir todos los nuevos campos

#### **10. Historial de cambios de precio** (4 horas)
- Guardar histórico de precios
- Ver evolución de costos

**TIEMPO TOTAL PRIORIDAD BAJA: 12 horas**

---

## 📋 **CHECKLIST DE PREPARACIÓN PARA BACKEND**

### **FRONTEND (Lo que ya tienes)**
- [x] ✅ CRUD de productos completo
- [x] ✅ Escandallo/recetas funcional
- [x] ✅ Cálculo de costos y márgenes
- [x] ✅ Categorías y filtros
- [x] ✅ Búsqueda de productos
- [ ] ⏳ Campo `tipo_producto`
- [ ] ⏳ Campo `articulo_stock_id`
- [ ] ⏳ Campo `escandallo_id`
- [ ] ⏳ Campos multi-empresa
- [ ] ⏳ Integración con Stock

### **BACKEND (Para el programador)**
- [ ] ⏳ Tabla `productos_venta`
- [ ] ⏳ Tabla `escandallos`
- [ ] ⏳ Tabla `escandallo_ingredientes`
- [ ] ⏳ Tabla `productos_combos` (relación N:M)
- [ ] ⏳ Endpoints CRUD productos
- [ ] ⏳ Endpoints CRUD escandallos
- [ ] ⏳ Lógica de descuento de stock al vender
- [ ] ⏳ Trigger: Actualizar costo al cambiar precio ingrediente
- [ ] ⏳ Cálculo automático de stock disponible (manufacturados)

---

## 🎯 **MI RECOMENDACIÓN**

### **FASE 1: COMPLETAR CAMPOS BÁSICOS** (1 día - 6 horas)
```
✅ 1. Añadir tipo_producto a GestionProductos
✅ 2. Añadir articulo_stock_id (para productos simples)
✅ 3. Añadir escandallo_id (para manufacturados)
✅ 4. Añadir empresa_id, marca_id, punto_venta_id
✅ 5. Actualizar datos mock con nuevos campos
```

### **FASE 2: INTEGRACIÓN** (1 día - 4 horas)
```
✅ 6. Conectar GestionProductos con Escandallo
✅ 7. Vincular automáticamente al crear receta
✅ 8. Mostrar costos calculados en tabla productos
✅ 9. Validaciones (producto manufacturado → debe tener escandallo)
```

### **FASE 3: DOCUMENTACIÓN BACKEND** (2 horas)
```
✅ 10. Crear estructura de tablas SQL
✅ 11. Definir endpoints necesarios
✅ 12. Documentar lógica de descuento de stock
✅ 13. Crear guía para el programador
```

**TIEMPO TOTAL: 2 días (12 horas)**

---

## 📞 **SIGUIENTE PASO**

¿Quieres que implemente las **mejoras de FASE 1** (6 horas)?

Es decir:
1. Añadir campo `tipo_producto` a GestionProductos
2. Añadir relación con stock (`articulo_stock_id`)
3. Añadir relación con escandallo (`escandallo_id`)
4. Añadir campos multi-empresa (`empresa_id`, `marca_id`)
5. Actualizar los datos mock

**Con esto tendrás todo listo para que el programador conecte el backend.**

¿Procedemos? 🚀
