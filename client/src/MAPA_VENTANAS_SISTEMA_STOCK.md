# 🗺️ MAPA COMPLETO: Ventanas del Sistema de Stock y Proveedores

**Sistema:** Udar Edge - Análisis de Conexión entre Interfaces  
**Fecha:** 29 de Noviembre de 2025  
**Estado:** ✅ Diseñadas | ⚠️ Sincronización Parcial

---

## 📋 RESUMEN EJECUTIVO

### ✅ **BUENAS NOTICIAS**
Las ventanas/pantallas del sistema YA ESTÁN diseñadas y funcionan correctamente de forma individual:

- ✅ **Gerente** tiene su pantalla completa de Stock y Proveedores
- ✅ **Trabajador** tiene su pantalla de Productos con Recepción
- ✅ Ambas usan el mismo `StockManager` para gestión de datos
- ✅ El flujo de trabajo está completo de principio a fin

### ⚠️ **ÁREA DE MEJORA**
Actualmente NO hay sincronización en tiempo real entre las ventanas porque:

- ❌ Cada componente tiene sus propios arrays de datos mock
- ❌ Los cambios en una pantalla NO se reflejan automáticamente en la otra
- ❌ No hay backend real ni base de datos compartida
- ❌ No hay WebSockets ni polling para actualizaciones en tiempo real

---

## 🖥️ VENTANAS DEL GERENTE

### 📁 **Archivo:** `/components/gerente/StockProveedoresCafe.tsx`

#### 🎯 **Pestañas Disponibles:**

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Inventario  │  📋 Pedidos  │  🏢 Proveedores  │  🔄...  │
└─────────────────────────────────────────────────────────────┘
```

### 1️⃣ **PESTAÑA: INVENTARIO**
**Vista:** Lista completa de artículos de stock

#### 📊 **Información que Muestra:**
```typescript
- Código del artículo (ART-001, ART-002...)
- Nombre del artículo
- Categoría (Harinas, Lácteos, Conservas, Cárnicos...)
- Empresa y Punto de Venta (Tiana, Badalona)
- Ubicación física (Pasillo-Estantería-Hueco)
- Stock disponible vs comprometido
- Stock mínimo, máximo y punto de reorden (ROP)
- Costo medio y PVP
- Estado (bajo, ok, sobrestock)
- Proveedores disponibles para cada artículo
- Última compra y lead time
```

#### 🎨 **KPIs Visuales:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total SKUs   │ │ Stock Bajo   │ │ Valor Total  │ │ Sugerencias  │
│    2,847     │ │     127      │ │  €87,456     │ │      23      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### ⚙️ **Acciones Disponibles:**
- ✏️ Ver/Editar detalles del artículo
- 📦 Registrar recepción de material
- 🔄 Transferir entre almacenes
- 📊 Ver historial de movimientos
- 🛒 Crear pedido a proveedor
- 📈 Ver análisis de rotación

---

### 2️⃣ **PESTAÑA: PEDIDOS A PROVEEDORES**
**Vista:** Lista de pedidos realizados a proveedores

#### 📊 **Información que Muestra:**
```typescript
interface PedidoProveedor {
  numeroPedido: string;           // PED-2025-001
  proveedorNombre: string;        // Harinas del Norte
  estado: string;                 // solicitado | confirmado | en-transito | entregado
  fechaSolicitud: string;
  fechaConfirmacion?: string;
  fechaEntrega?: string;
  fechaEstimadaEntrega?: string;
  articulos: ArticuloPedido[];    // Líneas del pedido
  subtotal: number;               // Sin IVA
  totalIva: number;               // Total IVA
  totalRecargoEquivalencia: number;
  total: number;                  // Total con IVA + RE
  metodoEnvio?: string;           // email | whatsapp | app | telefono
  responsable: string;            // Usuario que realizó el pedido
  facturaId?: string;             // Si ya está facturado
  facturaCaseada?: boolean;       // Si está conciliado
}
```

#### 🎨 **Estados de Pedido:**
```
🟦 Solicitado      → Pedido enviado al proveedor
🟩 Confirmado      → Proveedor confirmó el pedido
🟨 En tránsito     → Mercancía en camino
✅ Entregado       → Recibido y actualizado en stock
🔴 Reclamado       → Hay incidencias
⚫ Anulado          → Pedido cancelado
```

#### ⚙️ **Acciones Disponibles:**
- 📧 Reenviar pedido por email/WhatsApp
- 📄 Descargar PDF del pedido
- 📦 Registrar recepción parcial/total
- ⚠️ Registrar incidencia/reclamación
- 🔗 Ver factura asociada
- 📊 Ver detalles y seguimiento

---

### 3️⃣ **PESTAÑA: PROVEEDORES**
**Vista:** Listado y gestión de proveedores

#### 📊 **Información que Muestra:**
```typescript
- Nombre comercial y CIF
- Datos de contacto (email, teléfono, WhatsApp)
- Persona de contacto
- Datos fiscales (dirección fiscal, forma de pago, plazos)
- Datos bancarios (IBAN)
- Categorías de productos que suministra
- SLA (cumplimiento de plazos)
- Rating (valoración)
- Lead time promedio
- Precio medio de compra
- Pedidos activos
- Historial de pedidos y facturas
```

#### 🎯 **Métricas de Rendimiento:**
```
┌─────────────────────────────────────────────────┐
│ Harinas del Norte                               │
├─────────────────────────────────────────────────┤
│ SLA: 96.5%    Rating: ⭐⭐⭐⭐⭐ (4.8/5)        │
│ Lead Time: 3 días                               │
│ Precio medio: €18.50                            │
│ Pedidos activos: 2                              │
└─────────────────────────────────────────────────┘
```

#### ⚙️ **Acciones Disponibles:**
- ➕ Añadir nuevo proveedor
- ✏️ Editar datos del proveedor
- 🔗 Ver historial de pedidos
- 📊 Ver acuerdos comerciales
- 📧 Configurar canales de envío (email/WhatsApp/app)
- 📄 Ver facturas asociadas
- ⭐ Actualizar valoración

---

### 4️⃣ **PESTAÑA: SESIONES DE INVENTARIO**
**Vista:** Sesiones de recuento físico de inventario

#### 📊 **Información que Muestra:**
- Nombre de la sesión
- Tipo (total, cíclico, rápido)
- Almacén/Punto de venta
- Progreso (%)
- Diferencias en unidades y valor
- Responsables asignados
- Fecha límite
- Estado (activa, pausada, completada)

---

### 5️⃣ **PESTAÑA: TRANSFERENCIAS**
**Vista:** Transferencias entre almacenes

#### 📊 **Información que Muestra:**
- Origen y destino
- Número de SKUs transferidos
- Responsable
- Fecha
- Estado (borrador, en tránsito, recibida)

---

## 👷 VENTANAS DEL TRABAJADOR/COLABORADOR

### 📁 **Archivo:** `/components/trabajador/MaterialTrabajador.tsx`

#### 🎯 **Pestañas Disponibles:**

```
┌─────────────────────────────────────────────────────┐
│  📦 Recepción  │  📊 Stock  │  📋 Consumos y Ventas │
└─────────────────────────────────────────────────────┘
```

### 1️⃣ **PESTAÑA: RECEPCIÓN**
**Vista:** Pedidos pendientes de recibir

#### 📊 **Información que Muestra:**
```typescript
interface PedidoPendiente {
  id: string;                     // PED-2025-011
  proveedor: string;              // Harinas Molino del Sur
  fechaSolicitud: string;
  fechaEsperada: string;
  estado: string;                 // pendiente | parcial | retrasado
  productos: {
    nombre: string;
    codigo: string;
    cantidadSolicitada: number;
    cantidadRecibida: number;     // Para recepciones parciales
  }[];
  total: number;
}
```

#### 🎨 **KPIs Superiores:**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Stock        │ │ Alertas      │ │ Movimientos  │
│ Materiales   │ │ Disponible   │ │              │ │              │
│    127       │ │     98       │ │      12      │ │      45      │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

#### 📋 **Tabla de Pedidos Pendientes:**
```
┌─────────────┬──────────────────┬────────────┬──────────┬────────────┐
│ Pedido      │ Proveedor        │ F.Esperada │ Estado   │ Productos  │
├─────────────┼──────────────────┼────────────┼──────────┼────────────┤
│ PED-2025-11 │ Harinas Molino   │ 22/11/2025 │ Pendiente│ 3 productos│
│ PED-2025-10 │ Lácteos Menorca  │ 20/11/2025 │ Retrasado│ 3 productos│
│ PED-2025-09 │ Azúcares Iberia  │ 21/11/2025 │ Parcial  │ 3 productos│
└─────────────┴──────────────────┴────────────┴──────────┴────────────┘
```

#### ⚙️ **Acciones Disponibles:**
- 📦 **Recibir material** → Abre `RecepcionMaterialModal`
  - Permite vincular con pedido pendiente
  - Escaneo OCR de albarán (simulado)
  - Entrada manual de artículos
  - Validación cantidad esperada vs recibida
  - Registro de lotes y caducidades
  - Asignación de ubicaciones

- 🔄 **Transferir material** → Entre almacenes/PDV
- ⚠️ **Registrar merma** → Pérdidas o productos dañados

---

### 2️⃣ **PESTAÑA: STOCK**
**Vista:** Inventario actual de materiales

#### 📊 **Información que Muestra:**
```typescript
interface Material {
  codigo: string;          // Código interno
  nombre: string;
  categoria: string;       // Pan, Bollería, Lácteos, Bebidas...
  stock: number;           // Cantidad actual
  minimo: number;          // Stock mínimo
  ubicacion: string;       // PDV, Almacén
  estado: string;          // disponible | bajo | agotado
  lote?: string;
  precio?: number;
}
```

#### 🎨 **Estados Visuales:**
```
✅ Disponible  → Stock suficiente (verde)
⚠️ Stock bajo  → Por debajo del mínimo (naranja)
❌ Agotado     → Sin stock (rojo)
```

#### 🔍 **Filtros Disponibles:**
- 🔎 Búsqueda por código o nombre
- 📂 Filtro por categoría
- 📍 Filtro por ubicación
- 🚦 Filtro por estado (disponible/bajo/agotado)

#### ⚙️ **Acciones por Artículo:**
```
┌──────────────────────────────────────────────┐
│ 🍞 Barras de Pan Artesanal                   │
│ Código: PAN001 | Stock: 45 ud | Min: 20 ud   │
│ ✅ Disponible                                 │
├──────────────────────────────────────────────┤
│ [Registrar Consumo] [Venta Directa] [Más...] │
│   ↓ Para OT          ↓ Cliente               │
└──────────────────────────────────────────────┘
```

- 📝 **Registrar consumo** → Asignar a orden de trabajo (OT)
- 💰 **Venta directa** → Venta en mostrador con ticket/factura
- 📦 **Solicitar reposición** → Notifica al gerente
- 👁️ **Ver ficha completa** → Detalles del artículo

---

### 3️⃣ **PESTAÑA: CONSUMOS Y VENTAS**
**Vista:** Historial de movimientos de stock

#### 📊 **Información que Muestra:**
```typescript
interface Movimiento {
  tipo: string;              // ot | venta_directa | correccion
  fecha: string;
  material: string;
  codigo: string;
  cantidad: number;
  ot?: string;               // Si es consumo de OT
  cliente?: string;
  total?: number;            // Si es venta directa
  metodoPago?: string;       // efectivo | tarjeta
  tipoDocumento?: string;    // ticket | factura
}
```

#### 🎨 **Tipos de Movimiento:**
```
🟦 OT              → Consumo para orden de trabajo
🟩 Venta directa   → Venta en mostrador
🟧 Corrección      → Ajuste de inventario
```

#### 🔍 **Filtros Disponibles:**
- 🔎 Búsqueda por material, código, OT o cliente
- 📂 Filtro por tipo de movimiento
- 📅 Filtro por fecha (hoy, semana, mes, todos)

#### ⚙️ **Acciones por Movimiento:**
- 🔙 **Devolver** → Revertir movimiento (crear ajuste)
- 📄 **Ver ticket/factura** → Solo para ventas directas
- 🔗 **Ver OT** → Si está asociado a orden de trabajo

---

## 🔗 CONEXIÓN ENTRE VENTANAS

### ✅ **LO QUE YA FUNCIONA:**

#### 1. **StockManager Compartido**
Ambas interfaces usan el mismo sistema centralizado:

```typescript
// /data/stock-manager.ts
export class StockManager {
  private movimientos: MovimientoStock[] = [];
  private recepciones: RecepcionMaterial[] = [];
  private stock: Map<string, Ingrediente> = new Map();
  
  // ESTE MÉTODO LO LLAMA EL TRABAJADOR
  public registrarRecepcion(recepcion) {
    // 1. Suma cantidades al stock
    // 2. Registra movimiento de entrada
    // 3. Actualiza estado del pedido
    // 4. Devuelve la recepción creada
  }
  
  // ESTE MÉTODO LO USA EL GERENTE
  public getStock() {
    // Devuelve el stock actualizado
    return this.stock;
  }
}
```

#### 2. **Flujo de Recepción Completo**

```
GERENTE                           TRABAJADOR
   │                                  │
   ├─ Crea pedido a proveedor         │
   │  (StockProveedoresCafe)          │
   │                                  │
   │  Estado: 'solicitado'            │
   │                                  │
   │ ────────────────────────────────►│
   │                                  │
   │                      Llega mercancía
   │                                  │
   │                                  ├─ Ve pedido pendiente
   │                                  │  (MaterialTrabajador)
   │                                  │
   │                                  ├─ Abre RecepcionMaterialModal
   │                                  │  • Vincula con pedido
   │                                  │  • Escanea/ingresa artículos
   │                                  │  • Confirma cantidades
   │                                  │
   │                                  ├─ Confirma recepción
   │                                  │  ↓
   │                                  stockManager.registrarRecepcion()
   │                                  │  ↓
   │                                  ├─ ✅ Stock actualizado
   │                                  ├─ ✅ Movimientos registrados
   │                                  └─ ✅ Pedido marcado como entregado
   │                                  
   ├─ Ve stock actualizado            │
   │  (DEBERÍA verse automáticamente) │
   │                                  │
   ├─ Ve pedido como 'entregado'      │
   │  (DEBERÍA verse automáticamente) │
   └──────────────────────────────────┘
```

---

### ⚠️ **LO QUE NO FUNCIONA ACTUALMENTE:**

#### 1. **Datos Mock Independientes**

**PROBLEMA:**
```typescript
// En StockProveedoresCafe.tsx (GERENTE)
const skus: SKU[] = [
  { id: 'SKU001', nombre: 'Harina...', disponible: 15, ... }
];

// En MaterialTrabajador.tsx (TRABAJADOR)
const materiales: Material[] = productosPanaderia.map(producto => ({
  id: producto.id,
  nombre: producto.nombre,
  stock: producto.stock,  // ← DIFERENTE FUENTE DE DATOS
  ...
}));
```

**Cada componente tiene sus propios datos mock que NO se sincronizan.**

#### 2. **Sin Actualización en Tiempo Real**

**PROBLEMA:**
```
TRABAJADOR recibe pedido → Stock actualizado en StockManager
                                    ↓
                           PERO el GERENTE no lo ve
                           hasta que recargue la página
```

**Falta:**
- WebSockets para push en tiempo real
- Polling periódico
- Context API de React para estado global
- Subscripción a eventos de StockManager

#### 3. **Sin Persistencia**

**PROBLEMA:**
```
Usuario recarga la página → ❌ Todos los cambios se pierden
```

**Falta:**
- Base de datos real (Supabase)
- LocalStorage temporal
- SessionStorage

---

## 🚀 SOLUCIÓN: CÓMO CONECTAR LAS VENTANAS

### 📋 **OPCIÓN 1: Estado Global con Context API (React)**

#### Implementación Rápida (sin backend):

```typescript
// /contexts/StockContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import { stockManager } from '../data/stock-manager';

interface StockContextType {
  stock: Map<string, Ingrediente>;
  pedidos: PedidoProveedor[];
  movimientos: MovimientoStock[];
  refreshStock: () => void;
  registrarRecepcion: (recepcion) => void;
}

const StockContext = createContext<StockContextType>(null!);

export function StockProvider({ children }) {
  const [stock, setStock] = useState(stockManager.getStock());
  const [pedidos, setPedidos] = useState(stockManager.getPedidos());
  const [movimientos, setMovimientos] = useState(stockManager.getMovimientos());
  
  const refreshStock = () => {
    setStock(new Map(stockManager.getStock()));
    setPedidos([...stockManager.getPedidos()]);
    setMovimientos([...stockManager.getMovimientos()]);
  };
  
  const registrarRecepcion = (recepcion) => {
    stockManager.registrarRecepcion(recepcion);
    refreshStock(); // ← Actualiza todas las ventanas
  };
  
  return (
    <StockContext.Provider value={{ 
      stock, 
      pedidos, 
      movimientos, 
      refreshStock,
      registrarRecepcion 
    }}>
      {children}
    </StockContext.Provider>
  );
}

export const useStock = () => useContext(StockContext);
```

#### Uso en componentes:

```typescript
// En StockProveedoresCafe.tsx (GERENTE)
import { useStock } from '../../contexts/StockContext';

export function StockProveedoresCafe() {
  const { stock, pedidos, refreshStock } = useStock();
  
  // Ahora usa 'stock' y 'pedidos' del contexto
  // Se actualiza automáticamente cuando el trabajador registra recepción
}

// En MaterialTrabajador.tsx (TRABAJADOR)
import { useStock } from '../../contexts/StockContext';

export function MaterialTrabajador() {
  const { stock, registrarRecepcion } = useStock();
  
  const handleConfirmarRecepcion = (recepcion) => {
    registrarRecepcion(recepcion);
    // ← Automáticamente actualiza la vista del gerente
  };
}
```

**✅ VENTAJAS:**
- Sincronización instantánea entre ventanas
- Sin backend necesario
- Fácil de implementar (1-2 horas)

**❌ DESVENTAJAS:**
- No persiste al recargar
- Solo funciona en la misma sesión del navegador

---

### 📋 **OPCIÓN 2: LocalStorage + Event Listeners**

#### Sincronización entre pestañas del navegador:

```typescript
// /lib/storage-sync.ts
export class StorageSync {
  static saveStock(stock: any) {
    localStorage.setItem('udar_stock', JSON.stringify(stock));
    window.dispatchEvent(new Event('storage'));
  }
  
  static getStock() {
    const data = localStorage.getItem('udar_stock');
    return data ? JSON.parse(data) : null;
  }
  
  static onStockChange(callback: () => void) {
    window.addEventListener('storage', callback);
    return () => window.removeEventListener('storage', callback);
  }
}

// En componentes:
useEffect(() => {
  const unsubscribe = StorageSync.onStockChange(() => {
    // Stock actualizado, refrescar vista
    refreshStock();
  });
  return unsubscribe;
}, []);
```

**✅ VENTAJAS:**
- Persiste datos al recargar
- Sincroniza entre pestañas del navegador
- No requiere backend

**❌ DESVENTAJAS:**
- Solo funciona en el mismo navegador
- No sincroniza entre dispositivos

---

### 📋 **OPCIÓN 3: Backend Real con Supabase**

#### Arquitectura de Producción:

```typescript
// Tabla: stock_articulos
CREATE TABLE stock_articulos (
  id UUID PRIMARY KEY,
  codigo TEXT UNIQUE,
  nombre TEXT,
  disponible NUMERIC,
  minimo NUMERIC,
  punto_venta TEXT,
  updated_at TIMESTAMP DEFAULT NOW()
);

// Tabla: movimientos_stock
CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY,
  articulo_id UUID REFERENCES stock_articulos(id),
  tipo TEXT,
  cantidad NUMERIC,
  usuario_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

// Real-time subscription (Supabase)
const subscription = supabase
  .channel('stock-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock_articulos' },
    (payload) => {
      // Actualizar vista automáticamente
      refreshStock();
    }
  )
  .subscribe();
```

**✅ VENTAJAS:**
- Persistencia real
- Sincronización en tiempo real
- Multi-dispositivo
- Multi-usuario
- Trazabilidad completa

**❌ DESVENTAJAS:**
- Requiere backend
- Más complejo de implementar
- Necesita conexión a internet

---

## 📊 COMPARACIÓN DE OPCIONES

| Característica | Context API | LocalStorage | Supabase |
|----------------|-------------|--------------|----------|
| **Tiempo de implementación** | 1-2 horas | 3-4 horas | 2-3 días |
| **Sincronización en tiempo real** | ✅ Misma sesión | ✅ Mismo navegador | ✅ Multi-dispositivo |
| **Persistencia** | ❌ No | ✅ Sí | ✅ Sí |
| **Multi-usuario** | ❌ No | ❌ No | ✅ Sí |
| **Requiere backend** | ❌ No | ❌ No | ✅ Sí |
| **Escalabilidad** | Baja | Media | Alta |
| **Recomendado para** | Prototipo rápido | Demo/Testing | Producción |

---

## 🎯 RECOMENDACIÓN

### **FASE 1: Implementar Context API (YA)**
Para tener sincronización inmediata entre gerente y trabajador:

```bash
1. Crear StockContext
2. Envolver App con StockProvider
3. Convertir datos mock a estado compartido
4. Usar useStock() en ambos componentes
```

**Tiempo:** 1-2 horas  
**Beneficio:** Las ventanas se sincronizan inmediatamente

### **FASE 2: Agregar LocalStorage (OPCIONAL)**
Si necesitas que los datos persistan al recargar:

```bash
1. Guardar estado en localStorage cuando cambie
2. Cargar desde localStorage al iniciar
3. Sincronizar entre pestañas con storage events
```

**Tiempo:** 2-3 horas adicionales  
**Beneficio:** Datos persisten al recargar página

### **FASE 3: Migrar a Supabase (CUANDO ESTÉS LISTO)**
Cuando quieras ir a producción:

```bash
1. Conectar a Supabase
2. Migrar StockManager a usar APIs
3. Implementar real-time subscriptions
4. Agregar autenticación de usuarios
```

**Tiempo:** 2-3 días  
**Beneficio:** Sistema de producción completo

---

## ✅ CONCLUSIÓN

### **ESTADO ACTUAL:**
- ✅ **Las ventanas están diseñadas y funcionan bien individualmente**
- ✅ **El flujo de trabajo está completo de principio a fin**
- ⚠️ **Falta sincronización en tiempo real entre gerente y trabajador**
- ⚠️ **Los datos son independientes (mock) en cada componente**

### **PRÓXIMO PASO RECOMENDADO:**
**Implementar Context API para sincronización inmediata** entre todas las ventanas del sistema. Esto te dará sincronización en tiempo real sin necesidad de backend, perfecto para seguir desarrollando y probando el sistema.

**¿Quieres que implemente el StockContext ahora mismo para conectar las ventanas?** 🚀
