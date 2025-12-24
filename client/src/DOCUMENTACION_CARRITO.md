# 🛒 **SISTEMA DE CARRITO DE COMPRA - DOCUMENTACIÓN COMPLETA**

## 📋 **ÍNDICE**

1. [Resumen](#resumen)
2. [Arquitectura](#arquitectura)
3. [Funcionalidades](#funcionalidades)
4. [Uso del Hook useCart](#uso-del-hook-usecart)
5. [Integración con Componentes](#integración-con-componentes)
6. [Persistencia](#persistencia)
7. [Sistema de Cupones](#sistema-de-cupones)
8. [Próximos Pasos](#próximos-pasos)

---

## 📖 **RESUMEN**

El sistema de carrito de compra es un **contexto global** que gestiona todos los productos añadidos por el usuario, permitiendo:

- ✅ Agregar productos con opciones de personalización
- ✅ Eliminar productos
- ✅ Actualizar cantidades
- ✅ Aplicar cupones de descuento
- ✅ Cálculos automáticos (subtotal, IVA, total)
- ✅ Persistencia en `localStorage`
- ✅ Integración completa con el catálogo

---

## 🏗️ **ARQUITECTURA**

### **Estructura de Archivos**

```
/contexts/
  └── CartContext.tsx         # Contexto global del carrito

/hooks/
  └── useCart.ts              # Hook para acceder al carrito

/components/
  └── cliente/
      ├── CestaOverlay.tsx           # Vista del carrito (overlay)
      ├── CatalogoPromos.tsx         # Catálogo que añade productos
      └── ProductoDetalle.tsx        # Detalle de productos (café)
  └── ClienteDashboard.tsx           # Dashboard principal
```

### **Flujo de Datos**

```
┌─────────────────────────────────────────────┐
│          CartContext (Estado Global)        │
│  - items: CartItem[]                        │
│  - totalItems: number                       │
│  - subtotal, iva, total                     │
│  - cuponAplicado: Cupon | null              │
└─────────────────────────────────────────────┘
                    ▲
                    │ useCart()
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│CestaOverlay  │ │CatalogoPromos│ │ProductoDetalle│
│(Ver carrito) │ │(Añadir items)│ │(Añadir cafés)│
└──────────────┘ └──────────────┘ └──────────────┘
```

---

## ⚡ **FUNCIONALIDADES**

### **1. Agregar Productos**

```typescript
addItem({
  productoId: 'PROD-001',
  nombre: 'Croissant',
  precio: 2.50,
  cantidad: 2,
  imagen: 'https://...',
  categoria: 'Bollería',
  stock: 10,
  opciones: {
    tipo: 'grano',
    peso: '250g',
    complementos: ['Mermelada'],
  },
});
```

**Comportamiento:**
- Si el producto ya existe con las mismas opciones → aumenta la cantidad
- Si es nuevo → lo añade como un item separado
- Muestra un toast de confirmación

### **2. Eliminar Productos**

```typescript
removeItem(itemId);
```

**Comportamiento:**
- Elimina el producto del carrito
- Muestra un toast de confirmación

### **3. Actualizar Cantidad**

```typescript
updateQuantity(itemId, 5);
```

**Comportamiento:**
- Actualiza la cantidad del producto
- Si la cantidad es <= 0 → elimina el producto
- Verifica el stock si está disponible

### **4. Aplicar Cupón**

```typescript
const aplicado = aplicarCupon('BIENVENIDO10');
if (aplicado) {
  console.log('Cupón aplicado correctamente');
}
```

**Cupones disponibles (mock):**
- `BIENVENIDO10` → 10% de descuento
- `VERANO2024` → 15% de descuento
- `PRIMERACOMPRA` → 5€ de descuento
- `BLACK20` → 20% de descuento

### **5. Vaciar Carrito**

```typescript
clearCart();
```

**Comportamiento:**
- Elimina todos los productos
- Elimina el cupón aplicado
- Limpia el `localStorage`

---

## 🎯 **USO DEL HOOK `useCart`**

### **Import**

```typescript
import { useCart } from '../contexts/CartContext';
// O también:
import { useCart } from '../hooks/useCart';
```

### **En un Componente**

```typescript
function MiComponente() {
  const {
    // Estado
    items,              // CartItem[] - Lista de productos
    totalItems,         // number - Total de items (suma cantidades)
    cuponAplicado,      // Cupon | null - Cupón actual
    
    // Cálculos
    subtotal,           // number - Suma de precio × cantidad
    descuentoCupon,     // number - Descuento del cupón
    iva,                // number - IVA 21%
    total,              // number - Total final a pagar
    
    // Acciones
    addItem,            // Agregar producto
    removeItem,         // Eliminar producto
    updateQuantity,     // Actualizar cantidad
    clearCart,          // Vaciar carrito
    aplicarCupon,       // Aplicar cupón
    eliminarCupon,      // Eliminar cupón
  } = useCart();
  
  return (
    <div>
      <p>Items: {totalItems}</p>
      <p>Total: €{total.toFixed(2)}</p>
    </div>
  );
}
```

---

## 🔗 **INTEGRACIÓN CON COMPONENTES**

### **1. ClienteDashboard**

```typescript
// ✅ Contador dinámico del carrito
const { totalItems: itemsEnCesta } = useCart();

// Mostrar badge con número de items
<Badge>{itemsEnCesta}</Badge>
```

### **2. CatalogoPromos**

```typescript
// ✅ Añadir productos simples
const { addItem } = useCart();

const handleAnadirCarrito = (producto: Producto) => {
  addItem({
    productoId: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: 1,
    imagen: producto.imagen,
    categoria: producto.categoria,
    stock: producto.stock,
  });
};
```

### **3. ProductoDetalle (Cafés)**

```typescript
// ✅ Añadir productos con opciones
const { addItem } = useCart();

const handleAñadirAlCarrito = () => {
  addItem({
    productoId: producto.id,
    nombre: producto.nombre,
    precio: precioAjustado,
    cantidad: cantidad,
    opciones: {
      tipo: 'grano',
      peso: '250g',
      complementos: ['Mermelada'],
    },
  });
};
```

### **4. CestaOverlay**

```typescript
// ✅ Mostrar y gestionar el carrito completo
const {
  items,
  totalItems,
  subtotal,
  iva,
  total,
  updateQuantity,
  removeItem,
  aplicarCupon,
} = useCart();

// Renderizar items, calcular totales, etc.
```

---

## 💾 **PERSISTENCIA**

### **LocalStorage**

El carrito se guarda automáticamente en `localStorage`:

```typescript
// Clave: 'udar-cart'
// Valor: JSON.stringify(items)

// Clave: 'udar-cart-cupon'
// Valor: JSON.stringify(cuponAplicado)
```

### **Restauración Automática**

Al cargar la app, el carrito se restaura desde `localStorage`:

```typescript
useEffect(() => {
  const savedCart = localStorage.getItem('udar-cart');
  if (savedCart) {
    setItems(JSON.parse(savedCart));
  }
}, []);
```

### **Sincronización**

Cada cambio en el carrito se guarda automáticamente:

```typescript
useEffect(() => {
  localStorage.setItem('udar-cart', JSON.stringify(items));
}, [items]);
```

---

## 🎟️ **SISTEMA DE CUPONES**

### **Cupones Mock Disponibles**

```typescript
const CUPONES_DISPONIBLES: Cupon[] = [
  { 
    codigo: 'BIENVENIDO10', 
    tipo: 'porcentaje', 
    valor: 10, 
    descripcion: '10% de descuento' 
  },
  { 
    codigo: 'VERANO2024', 
    tipo: 'porcentaje', 
    valor: 15, 
    descripcion: '15% de descuento' 
  },
  { 
    codigo: 'PRIMERACOMPRA', 
    tipo: 'fijo', 
    valor: 5, 
    descripcion: '5€ de descuento' 
  },
  { 
    codigo: 'BLACK20', 
    tipo: 'porcentaje', 
    valor: 20, 
    descripcion: '20% de descuento' 
  },
];
```

### **Cálculo del Descuento**

```typescript
const descuentoCupon = cuponAplicado 
  ? cuponAplicado.tipo === 'porcentaje'
    ? subtotal * (cuponAplicado.valor / 100)  // Porcentaje
    : cuponAplicado.valor                     // Fijo
  : 0;
```

### **Aplicar Cupón**

```typescript
const aplicado = aplicarCupon('BIENVENIDO10');

// Si es válido → true + toast success
// Si no existe → false + toast error
// Si ya está aplicado → false + toast info
```

### **Interfaz en CestaOverlay**

- Campo de texto para introducir código
- Botón "Aplicar"
- Badge verde con cupón aplicado
- Botón para eliminar cupón

---

## 🔮 **PRÓXIMOS PASOS**

### **1. Integración con Sistema de Pedidos**

```typescript
// En CestaOverlay.tsx
const handlePagar = async () => {
  // 1. Crear pedido
  const pedido = await crearPedidoDesdeCarrito(items, user);
  
  // 2. Generar factura VeriFactu
  const factura = await generarFacturaAutomatica(pedido);
  
  // 3. Procesar pago
  const pago = await procesarPago(total, metodoPago);
  
  // 4. Limpiar carrito
  clearCart();
  
  // 5. Mostrar confirmación
  toast.success('Pedido realizado correctamente');
  navigate('/pedidos');
};
```

### **2. Integración con Backend**

Actualmente todo es local. Próximos pasos:

```typescript
// Guardar carrito en el servidor
await api.post('/cart', { items, userId });

// Sincronizar entre dispositivos
const cartFromServer = await api.get('/cart', { userId });
```

### **3. Productos Sugeridos Reales**

```typescript
// En CestaOverlay.tsx
const { data: sugeridos } = useQuery('productos-sugeridos', () => 
  api.get('/productos/sugeridos', { cartItems: items })
);
```

### **4. Notificaciones Push**

```typescript
// Carrito abandonado
if (items.length > 0 && lastActivity > 24h) {
  sendPushNotification('¡Tienes productos en tu carrito!');
}
```

### **5. Analytics**

```typescript
// Trackear eventos
analytics.track('product_added', { productId, price, quantity });
analytics.track('cart_viewed', { totalItems, total });
analytics.track('checkout_started', { total });
```

---

## 📊 **TIPOS**

### **CartItem**

```typescript
interface CartItem {
  id: string;                // ID único del item en el carrito
  productoId: string;        // ID del producto original
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  observaciones?: string;
  
  // Opciones de personalización
  opciones?: {
    tipo?: 'grano' | 'molido';
    peso?: '250g' | '1kg';
    complementos?: string[];
    bebidas?: string[];
    extras?: Record<string, string[]>;
  };
  
  // Metadatos
  categoria?: string;
  stock?: number;
}
```

### **Cupon**

```typescript
interface Cupon {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  descripcion?: string;
}
```

---

## ✅ **CHECKLIST DE FUNCIONALIDADES**

### **Implementado ✅**

- [x] Contexto global del carrito
- [x] Hook `useCart`
- [x] Agregar productos simples
- [x] Agregar productos con opciones
- [x] Eliminar productos
- [x] Actualizar cantidades
- [x] Cálculos automáticos (subtotal, IVA, total)
- [x] Sistema de cupones
- [x] Persistencia en `localStorage`
- [x] Contador dinámico en dashboard
- [x] Integración con CatalogoPromos
- [x] Integración con ProductoDetalle (cafés)
- [x] UI completa en CestaOverlay
- [x] Verificación de stock
- [x] Toasts de confirmación

### **Por Implementar 🚧**

- [ ] Integración con sistema de pedidos
- [ ] Integración con sistema de facturación VeriFactu
- [ ] Pasarela de pago real
- [ ] Guardar carrito en backend
- [ ] Sincronización entre dispositivos
- [ ] Productos sugeridos reales (API)
- [ ] Descuentos automáticos por cantidad
- [ ] Programa de puntos/fidelidad
- [ ] Historial de compras
- [ ] Lista de deseos
- [ ] Comparativa de productos
- [ ] Notificaciones de carrito abandonado
- [ ] Analytics completo

---

## 📞 **SOPORTE**

Si tienes dudas sobre el sistema de carrito:

1. Revisa esta documentación
2. Revisa el código en `/contexts/CartContext.tsx`
3. Revisa ejemplos en `/components/cliente/CestaOverlay.tsx`

---

**¡El sistema de carrito está completamente funcional y listo para usar!** 🎉
