# 📊 ESTRUCTURA COMPLETA DE LA BASE DE DATOS - Stock y Proveedores

## ✅ VERIFICACIÓN COMPLETA DE CAMPOS

---

## 📦 INTERFACE: `ProveedorArticulo`

Relación entre un artículo y un proveedor específico.

### **Campos Disponibles:**

| Campo | Tipo | Descripción | ✅ |
|-------|------|-------------|-----|
| `proveedorId` | `string` | ID del proveedor | ✅ |
| `proveedorNombre` | `string` | Nombre del proveedor | ✅ |
| `codigoProveedor` | `string` | **Código del proveedor para este artículo** | ✅ |
| `nombreProveedor` | `string` | **Nombre del proveedor para este artículo** | ✅ |
| `precioCompra` | `number` | **Precio SIN IVA** | ✅ |
| `iva` | `number` | **Porcentaje de IVA (4, 10 o 21)** | ✅ |
| `recargoEquivalencia` | `number` | **Porcentaje de recargo (0, 0.5, 1.4, 5.2)** | ✅ |
| `ultimaCompra` | `string` | Fecha de última compra | ✅ |
| `ultimaFactura` | `string` | ID de la última factura | ✅ |
| `esPreferente` | `boolean` | Si es el proveedor preferente | ✅ |
| `activo` | `boolean` | Si está activo | ✅ |

### **Ejemplo de Datos:**

```typescript
{
  proveedorId: 'PROV-001',
  proveedorNombre: 'Harinas del Norte',
  codigoProveedor: 'HAR-001',           // ← Código del proveedor
  nombreProveedor: 'Harina de Trigo T45 25kg', // ← Nombre del proveedor
  precioCompra: 18.50,                  // ← Precio SIN IVA
  iva: 4,                               // ← 4% IVA superreducido
  recargoEquivalencia: 0.5,             // ← 0.5% recargo
  ultimaCompra: '2025-11-20',
  ultimaFactura: 'FACT-2025-101',
  esPreferente: true,
  activo: true
}
```

---

## 🏷️ INTERFACE: `SKU` (Artículo)

Artículo de nuestro inventario.

### **Campos Disponibles:**

| Campo | Tipo | Descripción | ✅ |
|-------|------|-------------|-----|
| `id` | `string` | ID interno del artículo | ✅ |
| `codigo` | `string` | **NUESTRO código de producto** | ✅ |
| `nombre` | `string` | **NUESTRO nombre del producto** | ✅ |
| `imagen` | `string?` | URL de la imagen | ✅ |
| `categoria` | `string` | Categoría del producto | ✅ |
| `empresa` | `string` | Empresa propietaria | ✅ |
| `almacen` | `string` | Almacén donde se encuentra | ✅ |
| `ubicacion` | `string` | Ubicación física | ✅ |
| `pasillo` | `string` | Pasillo | ✅ |
| `estanteria` | `string` | Estantería | ✅ |
| `hueco` | `string` | Hueco | ✅ |
| `disponible` | `number` | Stock disponible | ✅ |
| `comprometido` | `number` | Stock comprometido | ✅ |
| `minimo` | `number` | Stock mínimo | ✅ |
| `maximo` | `number` | Stock máximo | ✅ |
| `rop` | `number` | Punto de reorden | ✅ |
| `costoMedio` | `number` | Costo medio del artículo | ✅ |
| `pvp` | `number` | Precio de venta público | ✅ |
| `proveedores` | `ProveedorArticulo[]` | **Array de proveedores** | ✅ |
| `proveedorPreferente` | `string` | ID del proveedor preferente | ✅ |
| `ultimaCompra` | `string` | Fecha última compra | ✅ |
| `leadTime` | `number` | Tiempo de entrega (días) | ✅ |
| `estado` | `'bajo' \| 'ok' \| 'sobrestock'` | Estado del stock | ✅ |
| `rotacion` | `number` | Rotación del producto | ✅ |

### **Ejemplo de Datos:**

```typescript
{
  id: 'SKU001',
  codigo: 'ART-001',                    // ← NUESTRO código
  nombre: 'Harina de Trigo T45',        // ← NUESTRO nombre
  categoria: 'Harinas',
  empresa: 'Disarmink SL - Hoy Pecamos',
  almacen: 'Tiana',
  disponible: 35,
  minimo: 50,
  rop: 60,
  proveedores: [                        // ← Array de proveedores
    {
      proveedorId: 'PROV-001',
      proveedorNombre: 'Harinas del Norte',
      codigoProveedor: 'HAR-001',       // ← Código del proveedor
      nombreProveedor: 'Harina de Trigo T45 25kg', // ← Nombre del proveedor
      precioCompra: 18.50,              // ← Precio sin IVA
      iva: 4,                           // ← IVA
      recargoEquivalencia: 0.5,         // ← Recargo
      esPreferente: true,
      activo: true
    },
    {
      proveedorId: 'PROV-005',
      proveedorNombre: 'Panadería Industrial',
      codigoProveedor: 'PI-T45-25',
      nombreProveedor: 'T45 Premium 25kg',
      precioCompra: 19.20,
      iva: 4,
      recargoEquivalencia: 0.5,
      esPreferente: false,
      activo: true
    }
  ],
  proveedorPreferente: 'PROV-001'
}
```

---

## 📋 INTERFACE: `ArticuloPedido`

Artículo dentro de un pedido a proveedor.

### **Campos Disponibles:**

| Campo | Tipo | Descripción | ✅ |
|-------|------|-------------|-----|
| `id` | `string` | ID del artículo (SKU) | ✅ |
| `codigo` | `string` | **NUESTRO código** | ✅ |
| `codigoProveedor` | `string` | **Código del proveedor** | ✅ |
| `nombre` | `string` | **NUESTRO nombre** | ✅ |
| `nombreProveedor` | `string` | **Nombre del proveedor** | ✅ |
| `cantidad` | `number` | Cantidad pedida | ✅ |
| `precioUnitario` | `number` | **Precio SIN IVA** | ✅ |
| `iva` | `number` | **Porcentaje de IVA** | ✅ |
| `recargoEquivalencia` | `number` | **Porcentaje de recargo** | ✅ |
| `subtotal` | `number` | Subtotal SIN IVA | ✅ |
| `totalConImpuestos` | `number` | Total CON IVA + Recargo | ✅ |

### **Ejemplo de Datos:**

```typescript
{
  id: 'SKU001',
  codigo: 'ART-001',                    // ← NUESTRO código
  codigoProveedor: 'HAR-001',           // ← Código del proveedor
  nombre: 'Harina de Trigo T45',        // ← NUESTRO nombre
  nombreProveedor: 'Harina de Trigo T45 25kg', // ← Nombre del proveedor
  cantidad: 40,
  precioUnitario: 18.50,                // ← Precio SIN IVA
  iva: 4,                               // ← 4%
  recargoEquivalencia: 0.5,             // ← 0.5%
  subtotal: 740.00,                     // ← 40 × 18.50
  totalConImpuestos: 773.30             // ← 740 + IVA(29.60) + Recargo(3.70)
}
```

---

## 📦 INTERFACE: `PedidoProveedor`

Pedido completo a un proveedor.

### **Campos Disponibles:**

| Campo | Tipo | Descripción | ✅ |
|-------|------|-------------|-----|
| `id` | `string` | ID interno del pedido | ✅ |
| `numeroPedido` | `string` | Número de pedido (PED-2025-001) | ✅ |
| `proveedorId` | `string` | ID del proveedor | ✅ |
| `proveedorNombre` | `string` | Nombre del proveedor | ✅ |
| `estado` | `Estado` | Estado del pedido | ✅ |
| `fechaSolicitud` | `string` | Fecha de solicitud | ✅ |
| `fechaConfirmacion` | `string?` | Fecha de confirmación | ✅ |
| `fechaEntrega` | `string?` | Fecha real de entrega | ✅ |
| `fechaEstimadaEntrega` | `string?` | Fecha estimada | ✅ |
| `articulos` | `ArticuloPedido[]` | Array de artículos | ✅ |
| `subtotal` | `number` | **Subtotal SIN IVA** | ✅ |
| `totalIva` | `number` | **Total de IVA** | ✅ |
| `totalRecargoEquivalencia` | `number` | **Total de Recargo** | ✅ |
| `total` | `number` | **Total CON IVA + Recargo** | ✅ |
| `anotaciones` | `string?` | Notas del pedido | ✅ |
| `metodoEnvio` | `string?` | Método de envío | ✅ |
| `responsable` | `string` | Responsable del pedido | ✅ |
| `facturaId` | `string?` | ID de la factura | ✅ |
| `facturaCaseada` | `boolean?` | Si está caseada | ✅ |

**Estados posibles:**
- `solicitado`
- `confirmado`
- `en-transito`
- `entregado`
- `reclamado`
- `anulado`

### **Ejemplo de Datos:**

```typescript
{
  id: 'PED-001',
  numeroPedido: 'PED-2025-001',
  proveedorId: 'PROV-001',
  proveedorNombre: 'Harinas del Norte',
  estado: 'entregado',
  fechaSolicitud: '2025-11-15T10:30:00',
  fechaConfirmacion: '2025-11-15T14:20:00',
  fechaEntrega: '2025-11-18T09:15:00',
  articulos: [
    {
      id: 'SKU001',
      codigo: 'ART-001',
      codigoProveedor: 'HAR-001',
      nombre: 'Harina de Trigo T45',
      nombreProveedor: 'Harina de Trigo T45 25kg',
      cantidad: 40,
      precioUnitario: 18.50,
      iva: 4,
      recargoEquivalencia: 0.5,
      subtotal: 740.00,
      totalConImpuestos: 773.30
    }
  ],
  subtotal: 740.00,                     // ← Subtotal SIN impuestos
  totalIva: 29.60,                      // ← 740 × 0.04
  totalRecargoEquivalencia: 3.70,       // ← 740 × 0.005
  total: 773.30,                        // ← 740 + 29.60 + 3.70
  anotaciones: 'Entrega en horario de mañana',
  metodoEnvio: 'email',
  responsable: 'Carlos Martínez',
  facturaId: 'FACT-2025-101',
  facturaCaseada: true
}
```

---

## 📊 TIPOS DE IVA EN ESPAÑA

### **IVA Superreducido (4%)**
- Pan, harinas, cereales
- Leche, huevos
- Quesos (según tipo)
- Frutas y verduras frescas
- **Recargo de Equivalencia:** 0.5%

### **IVA Reducido (10%)**
- Alimentos en general
- Carnes y pescados
- Conservas
- Aceites alimentarios
- **Recargo de Equivalencia:** 1.4%

### **IVA General (21%)**
- Bebidas alcohólicas
- Refrescos
- Productos elaborados
- **Recargo de Equivalencia:** 5.2%

---

## 🧮 CÁLCULO DE TOTALES

### **Fórmulas:**

```typescript
// Por artículo
const subtotal = cantidad × precioUnitario;
const importeIva = subtotal × (iva / 100);
const importeRecargo = subtotal × (recargoEquivalencia / 100);
const totalConImpuestos = subtotal + importeIva + importeRecargo;

// Por pedido completo
const subtotalPedido = Σ(articulos.subtotal);
const totalIvaPedido = Σ(articulos.importeIva);
const totalRecargoPedido = Σ(articulos.importeRecargo);
const totalPedido = subtotalPedido + totalIvaPedido + totalRecargoPedido;
```

### **Ejemplo de Cálculo:**

```
Artículo: Harina de Trigo T45
- Precio unitario: 18.50€ (sin IVA)
- Cantidad: 40 uds
- IVA: 4%
- Recargo: 0.5%

Cálculos:
1. Subtotal = 40 × 18.50 = 740.00€
2. IVA = 740.00 × 0.04 = 29.60€
3. Recargo = 740.00 × 0.005 = 3.70€
4. TOTAL = 740.00 + 29.60 + 3.70 = 773.30€
```

---

## ✅ RESUMEN DE VERIFICACIÓN

| Campo Requerido | Ubicación | Estado |
|-----------------|-----------|--------|
| **Nuestro código de producto** | `SKU.codigo` | ✅ Disponible |
| **Nuestro nombre** | `SKU.nombre` | ✅ Disponible |
| **Código del proveedor** | `ProveedorArticulo.codigoProveedor` | ✅ Disponible |
| **Nombre del proveedor** | `ProveedorArticulo.nombreProveedor` | ✅ Disponible |
| **Precio** | `ProveedorArticulo.precioCompra` | ✅ Disponible |
| **IVA** | `ProveedorArticulo.iva` | ✅ Disponible |
| **Recargo de Equivalencia** | `ProveedorArticulo.recargoEquivalencia` | ✅ Disponible |

---

## 📊 DATOS MOCK DISPONIBLES

### **Artículos con Proveedores:**

1. **ART-001: Harina de Trigo T45**
   - PROV-001: HAR-001 (18.50€, IVA 4%, RE 0.5%)
   - PROV-005: PI-T45-25 (19.20€, IVA 4%, RE 0.5%)

2. **ART-002: Queso Mozzarella**
   - PROV-002: QUE-002 (22.80€, IVA 4%, RE 0.5%)
   - PROV-007: QA-MOZ-5K (24.50€, IVA 4%, RE 0.5%)

3. **ART-003: Tomate Triturado Natural**
   - PROV-003: TOM-003 (12.30€, IVA 10%, RE 1.4%)
   - PROV-008: IT-TOM-3K (14.80€, IVA 10%, RE 1.4%)

4. **ART-004: Carne de Ternera Premium**
   - PROV-004: CAR-004 (35.40€, IVA 10%, RE 1.4%)
   - PROV-009: GP-TERN-5K (38.90€, IVA 10%, RE 1.4%)

5. **ART-005: Pan de Hamburguesa Brioche**
   - PROV-005: PAN-005 (15.60€, IVA 4%, RE 0.5%)
   - PROV-010: BA-BRIOCHE-50 (17.20€, IVA 4%, RE 0.5%)

6. **ART-006: Aceite de Oliva Virgen Extra**
   - PROV-006: ACE-006 (28.90€, IVA 10%, RE 1.4%)
   - PROV-011: AM-AOVE-5L (31.20€, IVA 10%, RE 1.4%)

7. **ART-007: Verduras Salteadas Congeladas**
   - PROV-012: VER-007 (8.50€, IVA 10%, RE 1.4%)

---

## 🎯 CONCLUSIÓN

✅ **TODOS los campos solicitados están disponibles en la BBDD:**
- ✅ Nuestro código de producto
- ✅ Nuestro nombre
- ✅ Códigos de los artículos del proveedor
- ✅ Nombres de los proveedores
- ✅ Precios (sin IVA)
- ✅ IVA (porcentaje)
- ✅ Recargo de Equivalencia (porcentaje)

✅ **El sistema calcula automáticamente:**
- Subtotales sin IVA
- Importes de IVA
- Importes de Recargo de Equivalencia
- Totales con impuestos

✅ **Todos los pedidos incluyen:**
- Desglose completo de impuestos
- Cálculos individuales por artículo
- Totales agregados del pedido

---

**Fecha de verificación:** 29 de Noviembre de 2025  
**Versión de la BBDD:** 3.0  
**Estado:** ✅ COMPLETAMENTE VERIFICADO
