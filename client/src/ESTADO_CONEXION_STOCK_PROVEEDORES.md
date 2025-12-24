# 🔌 ESTADO DE LA CONEXIÓN: Stock ↔ Proveedores ↔ Pedidos

**Sistema:** Udar Edge - Módulo de Gestión de Stock y Proveedores  
**Fecha de Análisis:** 29 de Noviembre de 2025  
**Estado:** ✅ CONECTADO A NIVEL FUNCIONAL (con datos mock)

---

## ✅ **RESPUESTA RÁPIDA**

**Sí, está conectado**. Cuando se recibe un pedido de proveedor, el stock se actualiza automáticamente. Sin embargo, actualmente funciona con datos **simulados en memoria** (mock data) porque no tienes backend real implementado.

---

## 📊 **FLUJO COMPLETO ACTUAL**

```
1️⃣ PEDIDO A PROVEEDOR
   └─ Se crea en StockProveedoresCafe.tsx
   └─ Se almacena en array pedidosProveedores (mock)
   └─ Estado: 'solicitado' → 'confirmado' → 'en-transito' → 'entregado'

2️⃣ RECEPCIÓN DE MATERIAL
   └─ Se abre RecepcionMaterialModal.tsx
   └─ Trabajador selecciona pedido pendiente
   └─ Escanea albarán (OCR simulado) o introduce manualmente
   └─ Revisa cantidades y ubicaciones

3️⃣ ACTUALIZACIÓN AUTOMÁTICA DE STOCK
   └─ Al confirmar recepción:
      ├─ stockManager.registrarRecepcion() ✅
      │  ├─ Suma cantidades al stock actual
      │  ├─ Registra movimiento de entrada
      │  └─ Almacena datos de lote, caducidad, ubicación
      │
      └─ stockManager.actualizarEstadoPedido() ✅
         ├─ Marca líneas de pedido como recibidas
         ├─ Calcula si pedido está completo/parcial
         └─ Actualiza estado del pedido

4️⃣ TRAZABILIDAD
   └─ Se generan registros de:
      ├─ Movimientos de stock (entrada/salida/ajuste)
      ├─ Historial de recepciones
      └─ Vinculación pedido-albarán-factura
```

---

## 🎯 **COMPONENTES CLAVE QUE YA FUNCIONAN**

### 1. **StockManager** (`/data/stock-manager.ts`)
Sistema centralizado que gestiona:

#### ✅ Métodos Implementados:
```typescript
// Registra recepción y actualiza stock automáticamente
registrarRecepcion(recepcion): RecepcionMaterial

// Actualiza estado de pedido (completo/parcial)
actualizarEstadoPedido(pedidoId, materialesRecibidos): void

// Registra salidas (producción, venta, merma)
registrarSalida(articuloId, cantidad, tipo...): MovimientoStock

// Consultas de stock
getStock(): Map<string, Ingrediente>
getMovimientos(): MovimientoStock[]
getRecepciones(): RecepcionMaterial[]
```

#### 📦 Datos que Gestiona:
- **Stock actual** por artículo y punto de venta
- **Movimientos** (entradas, salidas, ajustes)
- **Recepciones** vinculadas a pedidos
- **Trazabilidad** completa con usuario, fecha, motivo

---

### 2. **RecepcionMaterialModal** (`/components/trabajador/RecepcionMaterialModal.tsx`)
Modal para registrar entrada de mercancía.

#### ✅ Funcionalidades:
- 📋 **Vincular con pedido**: Autocompleta datos desde pedido existente
- 📸 **OCR simulado**: Escanea albarán (actualmente simulado)
- ✏️ **Entrada manual**: Añadir artículos manualmente
- 🔍 **Validación**: Compara cantidades esperadas vs recibidas
- 📦 **Actualización automática**: Al confirmar, actualiza stock inmediatamente

#### 🔄 Proceso de Actualización:
```typescript
// Línea 348-356 de RecepcionMaterialModal.tsx
const recepcion = stockManager.registrarRecepcion({
  numeroAlbaran,
  proveedorNombre: proveedor,
  pedidoRelacionado: pedidoSeleccionado,
  pdvDestino: 'tiana',
  materiales: materialesParaStock,
  usuarioRecepcion: 'Usuario Actual',
  observaciones: notas
});

// Línea 365: Si hay pedido relacionado, actualiza su estado
if (pedidoSeleccionado) {
  stockManager.actualizarEstadoPedido(
    pedidoSeleccionado, 
    materialesRecibidos
  );
}
```

---

### 3. **StockProveedoresCafe** (`/components/gerente/StockProveedoresCafe.tsx`)
Pantalla principal del gerente para gestión de stock y proveedores.

#### ✅ Datos Vinculados:
```typescript
// Cada artículo de stock tiene array de proveedores
interface SKU {
  id: string;
  codigo: string;
  nombre: string;
  disponible: number;  // Stock actual
  minimo: number;      // Stock mínimo
  maximo: number;      // Stock óptimo
  
  // 🔗 CONEXIÓN CON PROVEEDORES
  proveedores: ProveedorArticulo[];  // Lista de proveedores
  proveedorPreferente: string;       // ID del proveedor preferido
  ultimaCompra: string;              // Fecha última compra
  
  // Datos económicos
  costoMedio: number;
  pvp: number;
}

// Datos completos de cada proveedor por artículo
interface ProveedorArticulo {
  proveedorId: string;
  proveedorNombre: string;
  codigoProveedor: string;      // Código del proveedor para este artículo
  nombreProveedor: string;       // Nombre del proveedor para este artículo
  precioCompra: number;          // Precio SIN IVA
  iva: number;                   // 4, 10 o 21%
  recargoEquivalencia: number;   // 0, 0.5, 1.4, 5.2%
  ultimaCompra: string;
  ultimaFactura: string;
  esPreferente: boolean;
  activo: boolean;
}
```

---

## 📱 **NOTIFICACIONES Y "VENTANAS DE INFORMACIÓN"**

### 🔔 **Sistema de Notificaciones Actual**

#### 1. **Toast Notifications** (Sonner)
```typescript
// Éxito
toast.success('¡Recepción completada!', {
  description: `${materiales.length} artículos añadidos al inventario`,
  duration: 5000
});

// Advertencias
toast.warning('Stock bajo mínimo', {
  description: 'Se recomienda hacer pedido urgente'
});

// Errores
toast.error('Error al registrar recepción');
```

**Ubicación**: Aparecen en la esquina de la pantalla (típicamente arriba-derecha)

#### 2. **Console Logs con Emojis** (Trazabilidad)
```typescript
console.log('✅ RECEPCIÓN COMPLETADA', {
  recepcionId: recepcion.id,
  albaran: numeroAlbaran,
  articulos: materiales.length
});

console.log('📧 NOTIFICACIÓN GERENTE: Nueva recepción', {
  usuario: 'Usuario Actual',
  proveedor,
  totalArticulos: materiales.length
});
```

**Propósito**: Debugging y trazabilidad en desarrollo

#### 3. **Badges y Alertas Visuales**
```typescript
// Badges de estado en pedidos
<Badge variant="default">Entregado</Badge>
<Badge variant="warning">En tránsito</Badge>
<Badge variant="destructive">Anulado</Badge>

// Alertas en stock
{stock.estado === 'bajo' && (
  <Alert variant="destructive">
    <AlertCircle />
    <AlertDescription>
      Stock por debajo del mínimo
    </AlertDescription>
  </Alert>
)}
```

---

## ❓ **¿QUÉ SON LAS "VENTANAS DE INFORMACIÓN" QUE NECESITAS?**

Por favor, especifica qué tipo de "ventanas de información" necesitas. Aquí algunas opciones:

### 🎯 **Opción 1: Notificaciones Push en Tiempo Real**
- Notificar al gerente cuando llega un pedido
- Alertar cuando stock está bajo mínimo
- Avisar de discrepancias en recepciones

**Tecnología sugerida**: 
- WebSockets para tiempo real
- Notificaciones del navegador (Notification API)
- Panel de notificaciones en el header

### 🎯 **Opción 2: Paneles Informativos / Dashboards**
- Panel de "Pedidos Pendientes de Recepción"
- Panel de "Stock Crítico"
- Panel de "Recepciones del Día"

**Ubicación sugerida**:
- Sidebar derecho en StockProveedoresCafe
- Dashboard en página principal del gerente
- Widget flotante

### 🎯 **Opción 3: Modales de Confirmación/Información**
- Modal de resumen al completar recepción
- Modal de alertas de diferencias (pedido vs albarán)
- Modal de historial de movimientos

### 🎯 **Opción 4: Emails/WhatsApp Automáticos**
- Email al gerente cuando se recibe pedido
- WhatsApp al trabajador con lista de pendientes
- Notificación a proveedor confirmando recepción

---

## 🚀 **LO QUE FALTA PARA PRODUCCIÓN**

### ⚠️ **Limitaciones Actuales (Datos Mock)**

1. **No hay persistencia real**
   - Los datos se pierden al recargar
   - Todo está en memoria (arrays, Maps)

2. **No hay backend**
   - No se conecta a Supabase
   - No hay llamadas API reales
   - No hay autenticación de usuarios

3. **OCR simulado**
   - El escaneo de albaranes está simulado
   - Devuelve datos hardcodeados después de 2.5s

4. **Notificaciones limitadas**
   - Solo toast en navegador
   - No hay emails reales
   - No hay WhatsApp real
   - No hay push notifications

---

## 🎯 **PRÓXIMOS PASOS RECOMENDADOS**

### 1️⃣ **Definir Sistema de Notificaciones**
Especifica qué "ventanas de información" necesitas exactamente:
- ¿Notificaciones en tiempo real?
- ¿Paneles informativos?
- ¿Modales de alerta?
- ¿Emails/WhatsApp automáticos?

### 2️⃣ **Migrar de Mock a Backend Real**
Cuando conectes Supabase:

#### Tablas necesarias:
```sql
-- Stock por punto de venta
CREATE TABLE stock_articulos (
  id UUID PRIMARY KEY,
  codigo TEXT,
  nombre TEXT,
  disponible NUMERIC,
  minimo NUMERIC,
  maximo NUMERIC,
  punto_venta TEXT,
  ...
);

-- Movimientos de stock
CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY,
  fecha TIMESTAMP,
  tipo TEXT, -- 'entrada' | 'salida' | 'ajuste'
  articulo_id UUID REFERENCES stock_articulos(id),
  cantidad NUMERIC,
  usuario_id UUID,
  ...
);

-- Recepciones de material
CREATE TABLE recepciones_material (
  id UUID PRIMARY KEY,
  fecha TIMESTAMP,
  numero_albaran TEXT,
  proveedor_id UUID,
  pedido_id UUID REFERENCES pedidos_proveedores(id),
  estado TEXT, -- 'completo' | 'parcial' | 'con_diferencias'
  ...
);
```

#### APIs necesarias:
```typescript
// POST /api/recepciones - Registrar recepción
// PATCH /api/stock/:id - Actualizar stock
// PATCH /api/pedidos/:id - Actualizar estado pedido
// GET /api/movimientos - Consultar movimientos
```

### 3️⃣ **Implementar Notificaciones Reales**
```typescript
// Webhook cuando se completa recepción
await sendNotification({
  tipo: 'recepcion_completada',
  destinatarios: ['gerente@empresa.com'],
  datos: {
    albaran: numeroAlbaran,
    proveedor: proveedorNombre,
    articulos: materiales.length
  }
});
```

---

## 📝 **RESUMEN**

| Aspecto | Estado Actual | Pendiente |
|---------|---------------|-----------|
| **Conexión Stock-Proveedores** | ✅ Funcional (mock) | ⚠️ Backend real |
| **Actualización automática de stock** | ✅ Implementada | ⚠️ Persistencia BBDD |
| **Vinculación Pedido-Recepción** | ✅ Funcional | ⚠️ Backend real |
| **Trazabilidad de movimientos** | ✅ Implementada | ⚠️ Persistencia BBDD |
| **Notificaciones toast** | ✅ Funcional | ✅ Completo |
| **Notificaciones email/WhatsApp** | ❌ No implementado | ⚠️ Pendiente |
| **Panel de información** | ⚠️ Parcial | ❓ Por definir |
| **Alertas en tiempo real** | ❌ No implementado | ❓ Por definir |

---

## ❓ **PREGUNTAS PARA TI**

1. **¿Qué entiendes exactamente por "ventanas de información del sistema"?**
   - ¿Notificaciones push?
   - ¿Paneles informativos?
   - ¿Modales de alerta?
   - ¿Emails automáticos?

2. **¿Quiénes deben recibir estas notificaciones?**
   - ¿Solo el gerente?
   - ¿También los trabajadores?
   - ¿Los proveedores?

3. **¿Qué eventos deben disparar notificaciones?**
   - ¿Recepción de pedido?
   - ¿Stock bajo mínimo?
   - ¿Diferencias en albarán?
   - ¿Pedido confirmado por proveedor?

4. **¿Cuándo quieres conectar el backend real?**
   - ¿Antes de implementar notificaciones?
   - ¿Después de definir la arquitectura completa?

---

**Por favor, especifica tus necesidades para poder crear la solución exacta que necesitas.** 🎯
