# 🔄 ANÁLISIS DE BIDIRECCIONALIDAD - SISTEMA DE STOCK

## ❓ PREGUNTA DEL USUARIO

> "¿Existe bidireccionalidad en la información? ¿Entra un pedido y se resta del stock? ¿Se compra al proveedor y se suma?"

---

## 📊 RESPUESTA EJECUTIVA

### ❌ **NO - Actualmente NO hay bidireccionalidad automática**

**Estado actual:**
- ✅ **Frontend funcional al 85-90%** con datos mock
- ❌ **Sin conexión stock ↔ pedidos** (automática)
- ❌ **Sin descuento automático** al vender
- ⚠️ **Actualización manual de stock** por trabajadores

---

## 🔍 ANÁLISIS DETALLADO

### **1. FLUJO ACTUAL - PEDIDOS DE CLIENTES** 

#### **Cuando un cliente hace un pedido:**

```typescript
// components/cliente/CheckoutModal.tsx

const handleConfirmarPedido = async () => {
  // 1. Crear pedido
  const nuevoPedido = crearPedido({
    items: items,
    subtotal: subtotal,
    total: total,
    // ...
  });
  
  // 2. Generar factura
  const facturaId = await generarFacturaVeriFactu(nuevoPedido);
  
  // 3. Crear notificación
  await notificationsService.createNotification({ ... });
  
  // 4. Vaciar carrito
  clearCart();
  
  // ❌ NO SE DESCUENTA EL STOCK AUTOMÁTICAMENTE
}
```

**Lo que pasa:**
1. ✅ Se crea el pedido en `localStorage`
2. ✅ Se genera factura VeriFactu (simulada)
3. ✅ Se notifica al cliente
4. ✅ Se vacía el carrito
5. ❌ **El stock NO se actualiza**

**Lo que DEBERÍA pasar:**
```typescript
// Al confirmar pedido
items.forEach(item => {
  stockManager.registrarMovimiento({
    tipo: 'venta',
    articuloId: item.productoId,
    cantidad: -item.cantidad, // Negativo = salida
    motivo: `Venta pedido ${nuevoPedido.numero}`
  });
});
```

---

### **2. FLUJO ACTUAL - PEDIDOS A PROVEEDORES**

#### **Cuando se compra a un proveedor:**

**Crear pedido:**
```typescript
// components/gerente/StockProveedoresCafe.tsx

const crearNuevoPedido = (articulos) => {
  const nuevoPedido: PedidoProveedor = {
    id: `PED-${Date.now()}`,
    numeroInterno: `PED-2024-${String(pedidosActuales.length + 1).padStart(4, '0')}`,
    estado: 'borrador',
    items: articulos,
    // ...
  };
  
  // ✅ Se guarda en localStorage
  // ❌ NO se actualiza stock (es solo un pedido)
  
  // ⚠️ TODO comentado en el código:
  // TODO: Implementar actualización en StockContext
}
```

**Recibir material (manual):**
```typescript
// components/trabajador/RecepcionMaterialModal.tsx

const handleConfirmarRecepcion = () => {
  // El trabajador registra manualmente lo recibido
  const recepcion: RecepcionMaterial = {
    numeroAlbaran: numeroAlbaran,
    materiales: materialesRecibidos,
    // ...
  };
  
  // ✅ Llama al stockManager
  stockManager.registrarRecepcion(recepcion);
  
  // ✅ stockManager SÍ actualiza el stock
  // ✅ stockManager registra movimiento de entrada
}
```

**Lo que pasa:**
1. ✅ Se crea pedido (estado: borrador → enviado → recibido)
2. ⚠️ Trabajador **manualmente** registra recepción en UI
3. ✅ `stockManager.registrarRecepcion()` **SÍ actualiza stock**
4. ✅ Se registra movimiento de tipo 'recepcion'

---

### **3. SISTEMA STOCK MANAGER**

#### **¿Qué SÍ funciona?**

```typescript
// data/stock-manager.ts

class StockManager {
  /**
   * ✅ ESTO SÍ FUNCIONA - Recepción de material
   */
  registrarRecepcion(recepcion): RecepcionMaterial {
    recepcion.materiales.forEach(material => {
      const articulo = this.stock.get(material.articuloId);
      
      // ✅ Actualiza stock
      articulo.stock = cantidadAnterior + material.cantidadRecibida;
      
      // ✅ Registra movimiento
      this.movimientos.push({
        tipo: 'recepcion',
        cantidad: material.cantidadRecibida,
        cantidadAnterior,
        cantidadNueva: articulo.stock,
        // ...
      });
    });
    
    return nuevaRecepcion;
  }
  
  /**
   * ✅ ESTO SÍ FUNCIONA - Ajustes manuales
   */
  registrarMovimiento(movimiento): void {
    const articulo = this.stock.get(movimiento.articuloId);
    
    // ✅ Actualiza stock
    articulo.stock += movimiento.cantidad; // Puede ser positivo o negativo
    
    // ✅ Registra movimiento
    this.movimientos.push({ ... });
  }
  
  /**
   * ❌ ESTO NO EXISTE - Descuento automático por venta
   */
  // registrarVenta() - NO IMPLEMENTADO
}
```

---

### **4. PEDIDOS DELIVERY (Glovo, Uber Eats, Just Eat)**

#### **Cuando llega un pedido de delivery:**

```typescript
// services/pedidos-delivery.service.ts

export async function procesarNuevoPedidoDelivery(
  pedidoAgregador: PedidoAgregador,
  agregador: string
): Promise<PedidoDelivery> {
  
  // 1. Convertir formato
  const pedidoInterno = convertirPedidoAgregadorAInterno(pedidoAgregador, agregador);
  
  // 2. Guardar en localStorage
  savePedidosDelivery([...pedidos, pedidoInterno]);
  
  // 3. Notificar
  await notificarNuevoPedido(pedidoInterno);
  
  // ❌ NO SE DESCUENTA EL STOCK
  
  return pedidoInterno;
}
```

**Lo que pasa:**
1. ✅ Webhook recibe pedido de Glovo/Uber/JustEat
2. ✅ Se convierte a formato interno
3. ✅ Se guarda en `localStorage`
4. ✅ Se notifica a cocina/trabajadores
5. ❌ **El stock NO se actualiza**

---

## 📋 TABLA RESUMEN

| Acción | Stock se actualiza? | Cómo? | Estado |
|--------|-------------------|-------|--------|
| **Cliente hace pedido web** | ❌ NO | - | Sin implementar |
| **Cliente hace pedido delivery** | ❌ NO | - | Sin implementar |
| **Trabajador acepta pedido delivery** | ❌ NO | - | Sin implementar |
| **TPV registra venta** | ❌ NO | - | Sin implementar |
| **Trabajador registra recepción material** | ✅ SÍ | `stockManager.registrarRecepcion()` | ✅ Funcional |
| **Trabajador hace ajuste manual** | ✅ SÍ | `stockManager.registrarMovimiento()` | ✅ Funcional |
| **Sistema produce recetas** | ❌ NO | - | Sin implementar |
| **Se registra merma** | ⚠️ MANUAL | Trabajador usa UI de movimientos | Funcional manual |

---

## 🔴 PROBLEMAS IDENTIFICADOS

### **1. Sin descuento automático en ventas**

**Problema:**
```typescript
// Cliente compra:
// - 2x Pizza Margarita
// - 1x Coca Cola

// ❌ El stock de ingredientes NO se descuenta
// ❌ El stock de productos NO se descuenta
```

**Impacto:**
- ❌ Stock no refleja realidad
- ❌ No se puede gestionar inventario real
- ❌ Alertas de stock bajo no funcionan
- ❌ No se puede hacer reorden automático

---

### **2. Sin conexión Pedidos → Stock**

**Problema:**
```typescript
// Pedido creado en:
// - Web cliente
// - Delivery (Glovo, Uber, JustEat)
// - TPV

// ❌ No hay hook que descuente stock
```

**Consecuencia:**
- Pedidos están "flotando" sin impacto en inventario

---

### **3. Sin conexión Recetas → Stock**

**Problema:**
```typescript
// Si se produce 100 panes:
// - Debería descontar harina
// - Debería descontar levadura
// - Debería descontar agua

// ❌ No hay sistema de escandallo automático
```

**Consecuencia:**
- No se puede rastrear consumo de materias primas

---

### **4. Stock separado: Artículos vs Productos**

**Situación actual:**
- ✅ **Artículos de stock** (stock-ingredientes.ts) - Materias primas
- ✅ **Productos de venta** (productos-*.ts) - Catálogo de venta
- ❌ **Sin vinculación automática**

**Ejemplo:**
```typescript
// STOCK (ingredientes):
{
  id: 'ING-001',
  nombre: 'Harina de trigo',
  stock: 250 // kg
}

// CATÁLOGO (productos):
{
  id: 'PROD-001',
  nombre: 'Pizza Margarita',
  precio: 12.50
  // ❌ No tiene campo "ingredientes_necesarios"
}

// ❌ No hay relación entre ambos
```

---

## ✅ LO QUE SÍ FUNCIONA (Parcialmente)

### **1. Recepción de Material** ✅

```typescript
// Trabajador recibe material del proveedor
stockManager.registrarRecepcion({
  proveedorNombre: 'Proveedor ABC',
  materiales: [
    { articuloId: 'ING-001', cantidadRecibida: 100 }
  ]
});

// ✅ Stock se actualiza: 250 kg → 350 kg
// ✅ Se registra movimiento de tipo 'recepcion'
```

---

### **2. Movimientos Manuales** ✅

```typescript
// Trabajador registra ajuste manual
stockManager.registrarMovimiento({
  tipo: 'ajuste',
  articuloId: 'ING-001',
  cantidad: -10, // Negativo = salida
  motivo: 'Merma por caducidad'
});

// ✅ Stock se actualiza: 350 kg → 340 kg
// ✅ Se registra movimiento
```

---

### **3. Historial de Movimientos** ✅

```typescript
// Se puede consultar todo el historial
const movimientos = stockManager.getMovimientos();

// ✅ Muestra todos los movimientos
// ✅ Filtrable por tipo, fecha, artículo
```

---

## 🎯 LO QUE FALTA IMPLEMENTAR

### **PRIORIDAD 1: Descuento automático en ventas** 🔴

**Qué hacer:**
```typescript
// Cuando se confirma un pedido
export async function confirmarPedido(pedido: Pedido) {
  // 1. Crear pedido
  const nuevoPedido = crearPedido(pedido);
  
  // 2. ⭐ NUEVO: Descontar stock
  await descontarStockPorPedido(nuevoPedido);
  
  // 3. Generar factura
  const facturaId = await generarFacturaVeriFactu(nuevoPedido);
  
  return nuevoPedido;
}

// Nueva función
async function descontarStockPorPedido(pedido: Pedido) {
  pedido.items.forEach(item => {
    // Buscar producto en catálogo
    const producto = obtenerProducto(item.productoId);
    
    if (producto.tipo === 'simple') {
      // Producto simple: descontar directamente
      stockManager.registrarMovimiento({
        tipo: 'venta',
        articuloId: producto.articuloStockId, // ⚠️ Nuevo campo necesario
        cantidad: -item.cantidad,
        motivo: `Venta pedido ${pedido.numero}`,
        referencia: pedido.id
      });
      
    } else if (producto.tipo === 'manufacturado') {
      // Producto con receta: descontar ingredientes
      producto.receta.ingredientes.forEach(ing => {
        stockManager.registrarMovimiento({
          tipo: 'produccion',
          articuloId: ing.ingredienteId,
          cantidad: -(ing.cantidad * item.cantidad),
          motivo: `Producción para pedido ${pedido.numero}`,
          referencia: pedido.id
        });
      });
    }
  });
}
```

**Archivos a modificar:**
- `/services/pedidos.service.ts` - Añadir `descontarStockPorPedido()`
- `/components/cliente/CheckoutModal.tsx` - Llamar nueva función
- `/services/pedidos-delivery.service.ts` - Añadir descuento en delivery
- `/data/productos-*.ts` - Añadir campo `articuloStockId` o `receta`

---

### **PRIORIDAD 2: Vinculación Productos ↔ Stock** 🟠

**Qué hacer:**

**Opción A: Campo articuloStockId (Productos Simples)**
```typescript
// productos-cafeteria.ts

export const productosCafeteria = [
  {
    id: 'PROD-001',
    nombre: 'Coca Cola',
    precio: 2.50,
    tipo: 'simple',
    articuloStockId: 'ING-010', // ⭐ NUEVO - Link a stock
  },
  // ...
];
```

**Opción B: Receta (Productos Manufacturados)**
```typescript
// productos-panaderia.ts

export const productosReposteria = [
  {
    id: 'PROD-050',
    nombre: 'Croissant',
    precio: 1.80,
    tipo: 'manufacturado',
    receta: { // ⭐ NUEVO
      ingredientes: [
        { ingredienteId: 'ING-001', cantidad: 0.05 }, // 50g harina
        { ingredienteId: 'ING-002', cantidad: 0.02 }, // 20g mantequilla
        { ingredienteId: 'ING-003', cantidad: 0.01 }, // 10g azúcar
      ],
      tiempoPreparacion: 45, // minutos
      rendimiento: 1 // unidad
    }
  },
  // ...
];
```

**Archivos a modificar:**
- `/data/productos-cafeteria.ts`
- `/data/productos-panaderia.ts`
- `/data/productos-cafe.ts`
- Crear `/types/producto.types.ts` con interfaces

---

### **PRIORIDAD 3: Auto-actualización en Delivery** 🟡

**Qué hacer:**
```typescript
// services/pedidos-delivery.service.ts

export async function aceptarPedidoDelivery(
  pedidoId: string,
  tiempoPreparacionMinutos: number
): Promise<void> {
  // ... código existente ...
  
  // ⭐ NUEVO: Descontar stock al aceptar
  await descontarStockPorPedido(pedido);
  
  // Llamar API del agregador
  await agregador.aceptarPedido(pedido.id_pedido_agregador, tiempoPreparacionMinutos);
}
```

---

### **PRIORIDAD 4: Sistema de Escandallo Automático** 🟢

**Qué hacer:**
- Crear módulo de recetas completo
- Vincular recetas con productos
- Auto-descuento al producir
- Tracking de costos de producción

**Archivos a crear:**
- `/services/escandallo.service.ts`
- `/types/receta.types.ts`
- `/components/gerente/GestionRecetas.tsx`

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### **FASE 1: Fundamentos (2-3 horas)**

1. **Añadir campo articuloStockId a productos simples**
   - Modificar archivos de productos
   - Añadir tipo `ProductoSimple` con campo stock

2. **Crear función descontarStockPorPedido()**
   - En `/services/pedidos.service.ts`
   - Manejar productos simples

3. **Conectar con CheckoutModal**
   - Llamar descuento al confirmar pedido
   - Manejar errores de stock insuficiente

---

### **FASE 2: Delivery (1-2 horas)**

1. **Conectar pedidos delivery con stock**
   - Modificar `aceptarPedidoDelivery()`
   - Descontar al aceptar pedido

2. **Testing con simuladores**
   - Probar con `/api/webhooks/glovo/test`
   - Verificar descuento de stock

---

### **FASE 3: Productos Manufacturados (3-4 horas)**

1. **Crear sistema de recetas**
   - Interface `Receta` con ingredientes
   - Campo `receta` en productos manufacturados

2. **Implementar descuento por receta**
   - Al vender croissant → descontar harina, mantequilla, etc.
   - Registrar movimiento tipo 'produccion'

3. **UI de gestión de recetas**
   - CRUD de recetas
   - Asignar receta a producto

---

### **FASE 4: Validaciones (2 horas)**

1. **Validar stock antes de vender**
   ```typescript
   function validarStockDisponible(pedido: Pedido): boolean {
     return pedido.items.every(item => {
       const stockNecesario = calcularStockNecesario(item);
       const stockDisponible = obtenerStockDisponible(item.productoId);
       return stockDisponible >= stockNecesario;
     });
   }
   ```

2. **Alertas de stock insuficiente**
   - Mostrar error al usuario
   - Sugerir productos alternativos

---

### **FASE 5: Supabase (cuando esté listo)**

1. **Migrar de localStorage a Supabase**
2. **Triggers de base de datos**
   ```sql
   -- Trigger que descuenta stock automáticamente
   CREATE TRIGGER descontar_stock_venta
   AFTER INSERT ON pedidos_items
   FOR EACH ROW
   EXECUTE FUNCTION descontar_stock_automatico();
   ```

---

## 📊 COMPARATIVA: AHORA vs IDEAL

| Flujo | Ahora | Ideal |
|-------|-------|-------|
| **Cliente compra web** | ❌ Stock sin tocar | ✅ Stock descontado automático |
| **Pedido delivery** | ❌ Stock sin tocar | ✅ Stock descontado al aceptar |
| **TPV venta** | ❌ Stock sin tocar | ✅ Stock descontado en tiempo real |
| **Recepción proveedor** | ✅ Stock +100 | ✅ Stock +100 (ya funciona) |
| **Producción receta** | ❌ Manual | ✅ Auto-descuento ingredientes |
| **Merma/caducidad** | ⚠️ Manual | ⚠️ Manual (correcto) |
| **Validación stock** | ❌ No valida | ✅ Valida antes de vender |
| **Alertas stock bajo** | ⚠️ Estáticas | ✅ Dinámicas en tiempo real |

---

## 🎯 RECOMENDACIÓN FINAL

### **¿Implementar bidireccionalidad ahora?**

**SÍ, pero por fases:**

#### **Implementar YA (Crítico):**
1. ✅ **Descuento en ventas web** (FASE 1)
2. ✅ **Descuento en delivery** (FASE 2)
3. ✅ **Validación de stock** (FASE 4)

#### **Implementar PRONTO (Importante):**
4. 🟡 **Sistema de recetas** (FASE 3)
5. 🟡 **Vinculación productos-stock** (completa)

#### **Implementar DESPUÉS (Mejora):**
6. 🟢 **Escandallo automático** (FASE 3 extendida)
7. 🟢 **Analytics de consumo**
8. 🟢 **Predicción de compras**

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Para Implementar Bidireccionalidad Básica:**

- [ ] Añadir campo `articuloStockId` a productos simples
- [ ] Añadir campo `receta` a productos manufacturados
- [ ] Crear función `descontarStockPorPedido()`
- [ ] Conectar con `confirmarPedido()` en CheckoutModal
- [ ] Conectar con `aceptarPedidoDelivery()` en delivery
- [ ] Añadir validación de stock disponible
- [ ] Mostrar errores de stock insuficiente
- [ ] Testing completo con simuladores
- [ ] Documentar en guía del programador

---

## 📝 CONCLUSIÓN

**RESPUESTA CORTA:**
❌ **NO existe bidireccionalidad automática actualmente**

**LO QUE SÍ FUNCIONA:**
- ✅ Recepción de material → Stock se actualiza
- ✅ Ajustes manuales → Stock se actualiza
- ✅ Historial de movimientos completo

**LO QUE FALTA:**
- ❌ Venta → No descuenta stock
- ❌ Producción → No descuenta ingredientes
- ❌ Validación de stock al vender

**ESFUERZO PARA IMPLEMENTARLO:**
- Básico (ventas simples): **2-3 horas**
- Completo (con recetas): **8-10 horas**
- Con Supabase: **+4 horas**

**¿PROCEDER CON LA IMPLEMENTACIÓN?**
Dime si quieres que implemente:
- **A)** Solo descuento básico en ventas (2-3 hrs)
- **B)** Sistema completo con recetas (8-10 hrs)
- **C)** Dejarlo para cuando conectemos Supabase

---

**Fecha:** 29 Nov 2025  
**Estado:** ⏳ Pendiente decisión
