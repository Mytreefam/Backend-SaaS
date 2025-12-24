# ✅ TPV CONECTADO A EMPRESAS, MARCAS Y STOCK - COMPLETADO

## 📋 Resumen de Implementación

Se ha conectado el **TPV360Master** con el sistema de **Empresas, Marcas, Productos y Stock**, implementando:
1. **Selector de marca activa** en el header
2. **Filtrado automático** de productos por marca
3. **Gestión de stock en tiempo real** (resta al vender)
4. **Validación de stock** antes de añadir al carrito
5. **Indicadores visuales** de stock bajo/sin stock
6. **Ocultación de costos/escandallos** (solo precios de venta)

---

## ⭐ FUNCIONALIDADES IMPLEMENTADAS

### 1. **Selector de Marca Activa** 🏷️
✅ Dropdown en el header para cambiar marca
✅ Badge mostrando marca activa + contador de productos
✅ Toast de confirmación al cambiar marca
✅ Ejemplo: "Modomio (7)" indica 7 productos disponibles

```tsx
<Badge variant="outline" className="bg-teal-50 border-teal-300 text-teal-700">
  <Tag className="w-3 h-3 mr-1" />
  {getNombreMarca(marcaActivaLocal)} ({contadorProductosMarca})
</Badge>
<select
  value={marcaActivaLocal}
  onChange={(e) => {
    setMarcaActivaLocal(e.target.value);
    toast.success(`Marca cambiada a ${getNombreMarca(e.target.value)}`);
  }}
>
  {MARCAS_ARRAY.map(marca => (
    <option key={marca.id} value={marca.id}>{marca.nombre}</option>
  ))}
</select>
```

---

### 2. **Filtrado Automático por Marca** 🔍
✅ Productos se filtran según marca activa
✅ Solo muestra productos activos y visibles en TPV
✅ Productos multicanal aparecen en todas sus marcas

**Lógica de filtrado:**
```typescript
const productosFiltrados = productos.filter(producto => {
  const matchBusqueda = producto.nombre.toLowerCase().includes(searchQuery.toLowerCase());
  const matchCategoria = categoriaActiva === 'todos' || producto.categoria === categoriaActiva;
  const matchMarca = !producto.marcas_ids || producto.marcas_ids.includes(marcaActivaLocal);
  const esActivo = producto.activo !== false;
  const esVisibleTPV = producto.visible_tpv !== false;
  
  return matchBusqueda && matchCategoria && matchMarca && esActivo && esVisibleTPV;
});
```

**Ejemplo de distribución:**
- **Modomio:** Pan de Masa Madre, Croissant, Café, Tarta, Coca-Cola, Menú Desayuno, Napolitana (7 productos)
- **Blackburguer:** Café, Coca-Cola, Bocadillo Jamón, Hamburguesa (4 productos)
- **Productos compartidos:** Café Americano y Coca-Cola aparecen en ambas marcas

---

### 3. **Gestión de Stock en Tiempo Real** 📦

#### **Actualización Automática al Vender**
```typescript
const actualizarStockDespuesDeVenta = (itemsVendidos: ItemCarrito[]) => {
  setProductos(prevProductos => {
    const productosActualizados = prevProductos.map(producto => {
      const itemVendido = itemsVendidos.find(item => item.producto.id === producto.id);
      
      if (itemVendido) {
        const nuevoStock = Math.max(0, producto.stock - itemVendido.cantidad);
        
        // ⚠️ Alertas automáticas
        if (nuevoStock <= 5 && nuevoStock > 0) {
          toast.warning(`⚠️ Stock bajo: ${producto.nombre} (${nuevoStock} unidades)`);
        } else if (nuevoStock === 0) {
          toast.error(`❌ Sin stock: ${producto.nombre}`);
        }
        
        return { ...producto, stock: nuevoStock };
      }
      
      return producto;
    });
    
    return productosActualizados;
  });
};
```

**Flujo completo:**
1. Cliente añade 2x Croissant al carrito (stock: 40)
2. Procesa pago
3. Stock se actualiza: 40 → 38
4. Si stock llega a 5 → Toast: "⚠️ Stock bajo"
5. Si stock llega a 0 → Toast: "❌ Sin stock" + Producto deshabilitado

---

### 4. **Validación de Stock** ✅

#### **Al Añadir al Carrito**
```typescript
const agregarAlCarrito = (producto: Producto) => {
  // Validar caja abierta
  if (!estadoCaja.caja_abierta) {
    toast.error('Debes abrir la caja antes de realizar ventas');
    return;
  }
  
  const itemExistente = carrito.find(item => item.producto.id === producto.id);
  const nuevaCantidad = itemExistente ? itemExistente.cantidad + 1 : 1;
  
  // ⭐ VALIDAR STOCK DISPONIBLE
  if (!verificarStockDisponible(producto.id, nuevaCantidad)) {
    toast.error(`Sin stock suficiente de ${producto.nombre}`, {
      description: `Stock disponible: ${producto.stock} unidades`
    });
    return;
  }
  
  // Añadir al carrito...
};
```

#### **Al Modificar Cantidad**
```typescript
const modificarCantidad = (productoId: string, nuevaCantidad: number) => {
  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(productoId);
    return;
  }
  
  // ⭐ VALIDAR STOCK DISPONIBLE
  if (!verificarStockDisponible(productoId, nuevaCantidad)) {
    const producto = productos.find(p => p.id === productoId);
    toast.error(`Sin stock suficiente`, {
      description: producto ? `Stock disponible: ${producto.stock} unidades` : ''
    });
    return;
  }
  
  // Actualizar cantidad...
};
```

**Escenarios cubiertos:**
- ❌ Stock = 0 → No se puede añadir
- ⚠️ Stock = 3, intenta añadir 5 → Error: "Stock disponible: 3 unidades"
- ✅ Stock = 10, añade 2 → OK
- ✅ Stock = 5, carrito tiene 3, intenta +2 más → Error

---

### 5. **Indicadores Visuales de Stock** 🎨

#### **Badge con Colores Semafóricos**
```tsx
<Badge 
  variant="secondary" 
  className={`text-[10px] sm:text-xs ${
    producto.stock === 0 ? 'bg-red-100 text-red-700 border-red-300' :
    producto.stock <= 5 ? 'bg-orange-100 text-orange-700 border-orange-300' :
    'bg-gray-100 text-gray-700'
  }`}
>
  <span className="hidden sm:inline">Stock: </span>{producto.stock}
</Badge>
```

**Resultado visual:**
- 🔴 **Stock 0:** Fondo rojo + "❌ SIN STOCK" en esquina
- 🟠 **Stock 1-5:** Fondo naranja (alerta stock bajo)
- ⚪ **Stock 6+:** Fondo gris (normal)

#### **Badge "SIN STOCK" en Esquina**
```tsx
{producto.stock === 0 && (
  <div className="absolute -top-1 -right-1 z-10">
    <Badge className="bg-red-600 text-white text-[9px] sm:text-xs px-1 sm:px-2 py-0.5 shadow-md">
      ❌ SIN STOCK
    </Badge>
  </div>
)}
```

#### **Producto Deshabilitado**
```tsx
<button
  disabled={!estadoCaja.caja_abierta || producto.stock === 0}
  className={`${
    !estadoCaja.caja_abierta || producto.stock === 0
      ? 'opacity-50 cursor-not-allowed' 
      : 'hover:shadow-lg hover:border-teal-500 cursor-pointer'
  }`}
>
```

---

### 6. **Ocultación de Costos y Escandallos** 🔒

✅ **Solo se muestran precios de venta**
✅ **No se muestran:**
  - Costos de ingredientes
  - Costos de envases
  - Costo total
  - ID de escandallo
  - Margen bruto
  - Precio de compra

✅ **Interface Producto en TPV:**
```typescript
interface Producto {
  id: string;
  nombre: string;
  categoria: string;
  precio: number; // ✅ Solo precio de venta
  stock: number;
  descripcion?: string;
  imagen?: string;
  marcas_ids?: string[];
  activo?: boolean;
  visible_tpv?: boolean;
  // ❌ NO incluye: costo_total, escandallo_id, margen_bruto_pct, etc.
}
```

---

## 📊 DATOS MOCK IMPLEMENTADOS

### **Productos por Marca**

#### **Modomio (7 productos)**
| ID | Nombre | Precio | Stock | Estado |
|----|--------|--------|-------|--------|
| prod-001 | Pan de Masa Madre | €3.50 | 25 | ✅ |
| prod-002 | Croissant de Mantequilla | €1.80 | 40 | ✅ |
| prod-003 | Café Americano | €1.50 | 100 | ✅ Compartido |
| prod-004 | Tarta de Zanahoria | €4.50 | 12 | ✅ |
| prod-006 | Coca-Cola 33cl | €2.50 | 50 | ✅ Compartido |
| prod-007 | Menú Desayuno Completo | €2.80 | 999 | ✅ |
| prod-009 | Napolitana de Chocolate | €2.00 | 3 | ⚠️ Stock bajo |

#### **Blackburguer (4 productos)**
| ID | Nombre | Precio | Stock | Estado |
|----|--------|--------|-------|--------|
| prod-003 | Café Americano | €1.50 | 100 | ✅ Compartido |
| prod-005 | Bocadillo de Jamón Ibérico | €5.50 | 8 | ✅ |
| prod-006 | Coca-Cola 33cl | €2.50 | 50 | ✅ Compartido |
| prod-008 | Hamburguesa Clásica | €7.50 | 15 | ✅ |

---

## 🎯 FLUJOS DE USUARIO

### **Flujo 1: Trabajador cambia de marca**
1. Entra al TPV en marca **Modomio**
2. Ve 7 productos (pan, bollería, cafés, combos)
3. Cambia selector a **Blackburguer**
4. Toast: "Marca cambiada a Blackburguer"
5. Catálogo se actualiza automáticamente
6. Ahora ve 4 productos (hamburgesas, bocadillos, bebidas compartidas)
7. Los productos exclusivos de Modomio desaparecen

---

### **Flujo 2: Venta con actualización de stock**
1. Cliente pide 2x Napolitana (stock inicial: 3)
2. Trabajador añade al carrito
3. Procesa pago con tarjeta
4. ✅ Pago confirmado
5. Stock actualizado: 3 → 1
6. 🟠 Badge de stock cambia a naranja (stock bajo)
7. ⚠️ Toast: "Stock bajo: Napolitana de Chocolate (1 unidad)"
8. Próximo cliente pide 2x Napolitana
9. Al intentar añadir la 2ª unidad:
   - ❌ Error: "Sin stock suficiente"
   - Description: "Stock disponible: 1 unidades"

---

### **Flujo 3: Intentar vender producto sin stock**
1. Napolitana tiene stock: 0
2. Tarjeta muestra:
   - 🔴 Badge rojo: "Stock: 0"
   - ❌ Badge esquina: "SIN STOCK"
   - Tarjeta con `opacity-50` (deshabilitada)
3. Trabajador intenta hacer clic
4. ❌ Botón deshabilitado, no pasa nada
5. Tooltip podría mostrar: "Sin stock disponible"

---

### **Flujo 4: Producto compartido entre marcas**
1. **Café Americano** disponible en:
   - Modomio (€1.50)
   - Blackburguer (€1.50)
2. Stock compartido: 100 unidades
3. Venta en Modomio: 10 unidades → Stock: 90
4. Cambio a Blackburguer
5. Café sigue mostrando stock: 90 (sincronizado)
6. Venta en Blackburguer: 5 unidades → Stock: 85
7. Cambio a Modomio → Stock: 85 (actualizado)

---

## 🔄 SINCRONIZACIÓN CON GESTIÓN DE PRODUCTOS

### **Próxima fase: Integración real**

Actualmente el TPV usa `PRODUCTOS_TPV_MOCK` locales. En producción:

```typescript
// AHORA (Mock):
const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_TPV_MOCK);

// FUTURO (Real):
import { PRODUCTOS_MOCK } from '../data/productos-shared';
import { useStock } from '../contexts/StockContext';

const { actualizarStock } = useStock();
const [productos, setProductos] = useState<Producto[]>(
  PRODUCTOS_MOCK.filter(p => p.visible_tpv && p.activo)
);
```

**Beneficios:**
- ✅ Un solo archivo de productos compartido
- ✅ Cambios en GestionProductos reflejados en TPV
- ✅ Stock sincronizado en tiempo real
- ✅ Context API para gestión global

---

## 🎨 MEJORAS VISUALES IMPLEMENTADAS

### 1. **Selector de Marca Mejorado**
```
[🏷️ Modomio (7)]  [▼ Cambiar marca]
```
- Badge con icono Tag
- Contador entre paréntesis
- Dropdown nativo para cambio rápido
- Toast de confirmación

### 2. **Indicadores de Stock**
```
Stock normal:   [Stock: 50]  ← Gris
Stock bajo:     [Stock: 3]   ← 🟠 Naranja
Sin stock:      [Stock: 0]   ← 🔴 Rojo + Badge "❌ SIN STOCK"
```

### 3. **Tarjetas de Producto**
- Opacidad 50% si sin stock
- Cursor `not-allowed` si deshabilitado
- Badge flotante "❌ SIN STOCK" en esquina
- Mantiene badge PROMO si stock > 0

---

## 📝 CÓDIGO CLAVE AÑADIDO

### **Imports de Empresas/Marcas**
```typescript
import { 
  EMPRESAS, 
  MARCAS, 
  EMPRESAS_ARRAY,
  MARCAS_ARRAY,
  getNombreEmpresa,
  getNombreMarca 
} from '../constants/empresaConfig';
```

### **Estados de Marca Activa**
```typescript
const [empresaActiva, setEmpresaActiva] = useState<string>(EMPRESAS.DISARMINK);
const [marcaActivaLocal, setMarcaActivaLocal] = useState<string>(marcaActiva || MARCAS.MODOMIO);
```

### **Función de Verificación de Stock**
```typescript
const verificarStockDisponible = (productoId: string, cantidadSolicitada: number): boolean => {
  const producto = productos.find(p => p.id === productoId);
  if (!producto) return false;
  
  return producto.stock >= cantidadSolicitada;
};
```

### **Integración en procesarPago**
```typescript
const procesarPago = () => {
  // ... validaciones ...
  
  setPedidos([nuevoPedido, ...pedidos]);
  
  // ⭐ RESTAR STOCK DE PRODUCTOS VENDIDOS
  actualizarStockDespuesDeVenta(carrito);
  
  // ... limpiar carrito ...
};
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Funcionalidades Core**
- [x] Selector de marca activa en header
- [x] Filtrado automático por marca
- [x] Contador de productos por marca
- [x] Actualización de stock al vender
- [x] Validación de stock en carrito
- [x] Validación de stock en modificar cantidad
- [x] Alertas automáticas de stock bajo
- [x] Ocultación de costos/escandallos

### **Indicadores Visuales**
- [x] Badge de marca activa con contador
- [x] Badge de stock con colores (gris/naranja/rojo)
- [x] Badge "SIN STOCK" en esquina
- [x] Tarjeta deshabilitada si stock = 0
- [x] Opacidad reducida en productos sin stock
- [x] Toast al cambiar marca

### **Validaciones**
- [x] No añadir si stock insuficiente
- [x] No modificar cantidad si excede stock
- [x] Deshabilitar botón si stock = 0
- [x] Alertas al llegar a stock bajo (≤5)
- [x] Alertas al llegar a stock = 0

### **Productos Mock**
- [x] 9 productos creados
- [x] Marcas asignadas (Modomio/Blackburguer)
- [x] Productos compartidos (Café, Coca-Cola)
- [x] Stocks realistas (3 a 999)
- [x] Producto con stock bajo (Napolitana: 3)

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

### **OPCIÓN A: Conectar con Base de Datos Real**
1. Crear Context para productos compartidos
2. Sincronizar TPV ↔ GestionProductos
3. Usar Supabase para stock en tiempo real
4. Webhooks para actualizar múltiples TPVs

### **OPCIÓN B: Sistema de Alertas de Stock**
1. Notificaciones push cuando stock bajo
2. Panel de reposición en Gerente
3. Sugerencias automáticas de compra
4. Historial de movimientos de stock

### **OPCIÓN C: Reportes de Ventas por Marca**
1. Cuánto se vendió en Modomio vs Blackburguer
2. Productos más vendidos por marca
3. Rentabilidad por marca
4. Horas pico por marca

### **OPCIÓN D: Sistema de Reservas de Stock**
1. Pedidos app reservan stock temporalmente
2. Stock liberado si no se paga en 15min
3. Prioridad según tipo de pedido
4. Alertas de conflictos de stock

---

## 📊 MÉTRICAS IMPLEMENTADAS

| Métrica | Valor | Estado |
|---------|-------|--------|
| Marcas disponibles | 2 (Modomio, Blackburguer) | ✅ |
| Productos totales | 9 | ✅ |
| Productos Modomio | 7 | ✅ |
| Productos Blackburguer | 4 | ✅ |
| Productos compartidos | 2 (Café, Coca-Cola) | ✅ |
| Validaciones de stock | 2 (añadir + modificar) | ✅ |
| Alertas automáticas | 2 (stock bajo + sin stock) | ✅ |
| Indicadores visuales | 3 (badge, esquina, opacidad) | ✅ |

---

**📅 Completado:** 29 de noviembre de 2025  
**🔧 Archivos modificados:**  
  - `/components/TPV360Master.tsx` - Sistema completo de marcas y stock
**🔧 Próxima fase sugerida:** Integración con base de datos real o Sistema de Reportes de Ventas por Marca
