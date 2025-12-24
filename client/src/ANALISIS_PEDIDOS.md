# 📦 ANÁLISIS DEL SISTEMA DE PEDIDOS - UDAR EDGE

## 🎯 OBJETIVO
Unificar la arquitectura del sistema de gestión de pedidos para soportar 3 flujos distintos:
1. **Pedidos App con delivery a domicilio**
2. **Pedidos presenciales en local (TPV)**
3. **Pedidos de plataformas delivery externas (Glovo, Just Eat, etc.)**

---

## 📊 ESTADO ACTUAL DEL SISTEMA

### ✅ **LO QUE TENEMOS IMPLEMENTADO**

#### 1. **Servicio Central de Pedidos** (`/services/pedidos.service.ts`)
- ✅ CRUD completo de pedidos
- ✅ Sistema multiempresa/marca/PDV integrado
- ✅ Estados de pedido: `pendiente | pagado | en_preparacion | listo | entregado | cancelado`
- ✅ Estados de entrega: `pendiente | preparando | listo | en_camino | entregado`
- ✅ Métodos de pago: `tarjeta | efectivo | bizum | transferencia`
- ✅ Tipos de entrega: `recogida | domicilio`
- ✅ Sistema de tiempo estimado de preparación
- ✅ Asignación de trabajadores a pedidos
- ✅ Sistema de facturación integrado
- ✅ Filtros avanzados por empresa/marca/PDV/fecha/estado
- ✅ Estadísticas de pedidos
- ✅ Almacenamiento en LocalStorage (mock - listo para backend)

**Modelo de datos:**
```typescript
interface Pedido {
  id: string;
  numero: string;
  fecha: string;
  
  // Jerarquía multiempresa
  empresaId: string;
  empresaNombre: string;
  marcaId: string;
  marcaNombre: string;
  puntoVentaId: string;
  puntoVentaNombre: string;
  
  // Cliente
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion?: string;
  };
  
  // Items
  items: ItemPedido[];
  
  // Financiero
  subtotal: number;
  descuento: number;
  cuponAplicado?: string;
  iva: number;
  total: number;
  
  // Pago y entrega
  metodoPago: MetodoPago;
  tipoEntrega: TipoEntrega;
  direccionEntrega?: string;
  
  // Estados
  estado: EstadoPedido;
  estadoEntrega: EstadoEntrega;
  
  // Relaciones
  facturaId?: string;
  trabajadorId?: string;
  
  // Tiempos
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  tiempoPreparacion?: number;
}
```

#### 2. **Modal Entregar Pedido** (`/components/trabajador/ModalEntregarPedido.tsx`)
- ✅ Interfaz para trabajadores
- ✅ Búsqueda en tiempo real
- ✅ Diseño responsive y profesional
- ⚠️ **PROBLEMA: Usa datos MOCK independientes** - No conectado al servicio central

#### 3. **Vista de Pedidos del Trabajador** (`/components/trabajador/PedidosTrabajador.tsx`)
- ✅ Vista de tabla y tarjetas
- ✅ Filtros por estado
- ✅ Modal de detalle de pedido
- ✅ Diseño profesional con badges
- ⚠️ **PROBLEMA: Usa datos MOCK independientes** - No conectado al servicio central

#### 4. **Sistema de Cliente**
- ✅ **SÍ está conectado al servicio central** (`pedidos.service.ts`)
- ✅ Creación de pedidos desde el carrito
- ✅ Historial de pedidos del cliente
- ✅ Tracking en tiempo real

---

## ❌ **LO QUE FALTA IMPLEMENTAR**

### 1. **Campos adicionales en el modelo de Pedido**

Necesitamos agregar:

```typescript
interface Pedido {
  // ... campos existentes ...
  
  // ⭐ NUEVO: Origen del pedido
  origenPedido: 'app' | 'tpv' | 'glovo' | 'justeat' | 'ubereats' | 'deliveroo';
  
  // ⭐ NUEVO: Estado de pago (para pedidos en efectivo)
  estadoPago: 'pagado' | 'pendiente_cobro';
  pagoEnEfectivo: boolean; // true si debe cobrar el repartidor/cajero
  
  // ⭐ NUEVO: QR/Código de barras para escaneo
  codigoQR: string; // Código único para escanear
  codigoBarras: string; // Código de barras EAN-13 o similar
  
  // ⭐ NUEVO: Sistema de impresión
  impresoraId?: string; // ID de la impresora donde se imprimió
  fechaImpresion?: string;
  reimprimir?: boolean; // Flag para reimprimir ticket
  
  // ⭐ NUEVO: Repartidor (para delivery)
  repartidorId?: string;
  repartidorNombre?: string;
  repartidorTipo?: 'propio' | 'externo'; // Rider propio o de plataforma externa
  
  // ⭐ NUEVO: Datos de plataforma externa
  plataformaExterna?: {
    pedidoExternoId: string; // ID del pedido en Glovo/JustEat
    comisionPlataforma: number; // Comisión que se lleva la plataforma
    tiempoEstimadoRecogida: string; // Cuándo viene el rider
  };
  
  // ⭐ NUEVO: TPV (para pedidos presenciales)
  tpvId?: string; // ID del TPV que creó el pedido
  cajeroId?: string; // ID del cajero que atendió
}
```

### 2. **Funciones nuevas en `pedidos.service.ts`**

```typescript
// ⭐ Cambiar estado a "en reparto" cuando el repartidor escanea el QR
export const marcarEnReparto = (pedidoId: string, repartidorId: string): Pedido | null;

// ⭐ Marcar pedido como entregado
export const marcarEntregado = (pedidoId: string, entregadoPor: string): Pedido | null;

// ⭐ Generar código QR/barras
export const generarCodigoQR = (pedidoId: string): string;
export const generarCodigoBarras = (pedidoId: string): string;

// ⭐ Crear pedido desde TPV
export const crearPedidoTPV = (params: CrearPedidoTPVParams): Pedido;

// ⭐ Crear pedido desde plataforma externa
export const crearPedidoExterno = (params: CrearPedidoExternoParams): Pedido;

// ⭐ Imprimir ticket de pedido
export const imprimirTicket = (pedidoId: string, impresoraId: string): Promise<void>;

// ⭐ Obtener pedidos pendientes de reparto
export const obtenerPedidosPendientesReparto = (puntoVentaId: string): Pedido[];

// ⭐ Obtener pedidos listos para entregar (cajero)
export const obtenerPedidosListosEntrega = (puntoVentaId: string): Pedido[];
```

### 3. **Servicio de Impresión** (`/services/impresion.service.ts`)

```typescript
// ⭐ NUEVO SERVICIO
interface Impresora {
  id: string;
  nombre: string;
  tipo: 'tickets' | 'cocina' | 'bar' | 'etiquetas';
  puntoVentaId: string;
  ip?: string; // Para impresoras de red
  url?: string; // Para impresoras cloud
}

export const registrarImpresora = (impresora: Impresora): void;
export const obtenerImpresoras = (puntoVentaId: string): Impresora[];
export const imprimirTicketPedido = (pedido: Pedido, impresoraId: string): Promise<void>;
export const imprimirComandaCocina = (pedido: Pedido, impresoraId: string): Promise<void>;
```

### 4. **Servicio de Códigos QR/Barras** (`/services/qr-barcode.service.ts`)

```typescript
// ⭐ NUEVO SERVICIO
export const generarQR = (data: string): Promise<string>; // Retorna base64
export const escanearQR = (): Promise<string>; // Abre cámara y escanea
export const generarBarcode = (pedidoId: string): string; // Genera EAN-13
export const escanearBarcode = (): Promise<string>; // Escanea código de barras
```

### 5. **Integración con Plataformas Delivery** (`/services/delivery-platforms.service.ts`)

```typescript
// ⭐ NUEVO SERVICIO
interface PlataformaDelivery {
  id: 'glovo' | 'justeat' | 'ubereats' | 'deliveroo';
  nombre: string;
  activa: boolean;
  apiKey?: string;
  webhookUrl?: string;
}

// Webhook para recibir pedidos
export const recibirPedidoGlovo = (payload: any): Pedido;
export const recibirPedidoJustEat = (payload: any): Pedido;
export const confirmarPedidoPlataforma = (pedidoId: string, plataforma: string): Promise<void>;
export const rechazarPedidoPlataforma = (pedidoId: string, motivo: string): Promise<void>;
```

---

## 🔄 **FLUJOS COMPLETOS A IMPLEMENTAR**

### **FLUJO 1: Pedido App con Delivery a Domicilio**

```
1. Cliente hace pedido en la app
   ├─ Selecciona productos
   ├─ Elige "Entrega a domicilio"
   └─ Pago: "Por app" (tarjeta/bizum) o "Efectivo al recibir"

2. Sistema crea pedido
   ├─ origenPedido = 'app'
   ├─ estadoPago = pago === 'efectivo' ? 'pendiente_cobro' : 'pagado'
   ├─ pagoEnEfectivo = pago === 'efectivo'
   ├─ Genera codigoQR y codigoBarras
   └─ estadoEntrega = 'pendiente'

3. Imprime automáticamente en cocina
   ├─ Busca impresora tipo 'cocina' del PDV
   ├─ Imprime ticket con QR visible
   └─ Guarda impresoraId y fechaImpresion

4. Cocina prepara pedido
   └─ Trabajador marca estado = 'listo'

5. Repartidor escanea QR del ticket
   ├─ Se abre cámara para escanear
   ├─ Sistema valida QR
   ├─ Llama a marcarEnReparto(pedidoId, repartidorId)
   └─ estadoEntrega = 'en_camino'

6. Repartidor entrega y presiona botón
   ├─ Si pagoEnEfectivo = true → Confirma cobro
   ├─ Llama a marcarEntregado(pedidoId, repartidorId)
   ├─ estadoEntrega = 'entregado'
   └─ estadoPago = 'pagado'
```

**Estado actual:** ✅ 70% implementado
- ✅ Creación de pedido
- ✅ Sistema de estados
- ❌ Códigos QR/Barras
- ❌ Impresión automática
- ❌ Escaneo de QR
- ❌ Flag de pago en efectivo

---

### **FLUJO 2: Pedido Presencial en Local (TPV)**

```
1. Cliente pide en el local
   └─ Cajero toma el pedido en el TPV

2. Sistema crea pedido desde TPV
   ├─ origenPedido = 'tpv'
   ├─ tipoEntrega = 'recogida'
   ├─ estadoPago = 'pagado' (cobrado en el momento)
   ├─ Genera codigoQR y codigoBarras
   ├─ Guarda tpvId y cajeroId
   └─ estadoEntrega = 'pendiente'

3. Imprime en cocina/bar
   ├─ Busca impresora del PDV
   └─ Imprime comanda

4. Cocina/Bar prepara
   └─ Marca estado = 'listo'

5. Cajero entrega al cliente
   ├─ Presiona botón "Entregar"
   ├─ Llama a marcarEntregado(pedidoId, cajeroId)
   └─ estadoEntrega = 'entregado'
```

**Estado actual:** ❌ 40% implementado
- ✅ TPV funcional
- ❌ Creación de pedidos desde TPV
- ❌ Impresión automática
- ❌ Botón "Entregar" en cajero
- ❌ Conexión con pedidos.service.ts

---

### **FLUJO 3: Pedido de Plataforma Externa (Glovo, Just Eat, etc.)**

```
1. Cliente pide por Glovo/JustEat
   └─ Pedido llega por webhook/API

2. Sistema recibe pedido externo
   ├─ recibirPedidoGlovo(payload) o recibirPedidoJustEat(payload)
   ├─ origenPedido = 'glovo' | 'justeat' | etc.
   ├─ estadoPago = 'pagado' (plataforma ya cobró)
   ├─ Guarda plataformaExterna { pedidoExternoId, comisionPlataforma }
   ├─ Genera codigoQR y codigoBarras
   └─ estadoEntrega = 'pendiente'

3. Imprime automáticamente
   ├─ Busca impresora del PDV
   ├─ Imprime ticket marcando origen (GLOVO / JUSTEAT)
   └─ Incluye tiempo estimado de recogida

4. Cocina prepara
   └─ Marca estado = 'listo'

5. Se entrega a rider
   ├─ OPCIÓN A: Rider de Glovo/JustEat recoge
   │   ├─ Trabajador presiona "Entregar"
   │   ├─ repartidorTipo = 'externo'
   │   └─ estadoEntrega = 'entregado'
   │
   └─ OPCIÓN B: Rider propio de la empresa
       ├─ Escanea QR
       ├─ estadoEntrega = 'en_camino'
       ├─ Entrega al cliente
       └─ estadoEntrega = 'entregado'

6. Notifica a plataforma
   └─ confirmarPedidoPlataforma(pedidoId, 'glovo')
```

**Estado actual:** ❌ 0% implementado
- ❌ Webhook para recibir pedidos
- ❌ Integración con APIs externas
- ❌ Mapeo de datos de plataformas
- ❌ Sistema de comisiones
- ❌ Notificación a plataforma

---

## 🚨 **PROBLEMAS CRÍTICOS ACTUALES**

### 1. **Tres sistemas de datos separados**
- `pedidos.service.ts` → Usado solo por cliente
- `ModalEntregarPedido.tsx` → Datos mock independientes
- `PedidosTrabajador.tsx` → Datos mock independientes

**Solución:** Unificar todo para usar `pedidos.service.ts` como única fuente de verdad.

### 2. **Sin sincronización entre vistas**
- Un cambio en el modal de entregar NO se refleja en la vista de pedidos
- Un cambio en la vista de pedidos NO se refleja en el modal

**Solución:** Context API o suscripción a cambios en LocalStorage.

### 3. **Falta sistema de QR/Códigos de barras**
**Solución:** Crear servicio con librería `qrcode` y `jsbarcode`.

### 4. **Falta sistema de impresión**
**Solución:** Crear servicio con integración a impresoras térmicas (ESC/POS).

### 5. **Sin integración con plataformas delivery**
**Solución:** Crear webhooks y adaptadores para cada plataforma.

---

## 📋 **CHECKLIST DE IMPLEMENTACIÓN**

### **FASE 1: Unificación del Sistema** (Prioridad Alta)
- [ ] Extender modelo de Pedido con campos nuevos
- [ ] Agregar funciones nuevas a `pedidos.service.ts`
- [ ] Conectar `ModalEntregarPedido.tsx` al servicio central
- [ ] Conectar `PedidosTrabajador.tsx` al servicio central
- [ ] Crear Context de Pedidos para sincronización en tiempo real
- [ ] Agregar flag `pagoEnEfectivo` y `estadoPago`

### **FASE 2: Sistema de QR/Códigos** (Prioridad Alta)
- [ ] Crear `/services/qr-barcode.service.ts`
- [ ] Instalar librería `qrcode` (para generar)
- [ ] Instalar librería `jsbarcode` (para códigos de barras)
- [ ] Integrar con cámara para escaneo (Capacitor Barcode Scanner)
- [ ] Generar QR automáticamente al crear pedido
- [ ] Mostrar QR en tickets impresos

### **FASE 3: Sistema de Impresión** (Prioridad Alta)
- [ ] Crear `/services/impresion.service.ts`
- [ ] Integrar con impresoras térmicas (ESC/POS)
- [ ] Crear plantillas de tickets (cocina, bar, cliente)
- [ ] Configurar impresoras por PDV
- [ ] Imprimir automáticamente al crear pedido
- [ ] Función de reimprimir ticket

### **FASE 4: Flujo TPV → Pedidos** (Prioridad Media)
- [ ] Agregar función `crearPedidoTPV()` en servicio
- [ ] Conectar TPV con sistema de pedidos
- [ ] Botón "Entregar" para cajero
- [ ] Guardar `tpvId` y `cajeroId` en pedido

### **FASE 5: Plataformas Delivery Externas** (Prioridad Media-Baja)
- [ ] Crear `/services/delivery-platforms.service.ts`
- [ ] Crear webhook endpoint para Glovo
- [ ] Crear webhook endpoint para Just Eat
- [ ] Crear webhook endpoint para Uber Eats
- [ ] Crear webhook endpoint para Deliveroo
- [ ] Mapear datos de cada plataforma
- [ ] Sistema de confirmación/rechazo de pedidos
- [ ] Calcular y guardar comisiones

### **FASE 6: UI/UX Repartidor** (Prioridad Media)
- [ ] Pantalla de escaneo de QR
- [ ] Lista de pedidos en reparto (para repartidor)
- [ ] Botón "Iniciar reparto" (escanea QR)
- [ ] Botón "Pedido entregado"
- [ ] Confirmación de cobro en efectivo
- [ ] Navegación GPS a dirección de entrega

---

## 🎯 **RECOMENDACIÓN DE IMPLEMENTACIÓN**

**Prioridad 1 - URGENTE:**
1. Unificar los 3 sistemas de datos → Todos usan `pedidos.service.ts`
2. Agregar campos de `origenPedido`, `pagoEnEfectivo`, `estadoPago`
3. Sistema de QR/Códigos básico

**Prioridad 2 - IMPORTANTE:**
4. Sistema de impresión automática
5. Flujo completo App → Repartidor (escaneo QR)
6. Flujo TPV → Cajero entrega

**Prioridad 3 - DESEABLE:**
7. Integración plataformas externas (Glovo, Just Eat)
8. Dashboard de repartidores
9. Analytics de pedidos por origen

---

## 💡 **SUGERENCIAS ADICIONALES**

1. **Notificaciones Push:** Avisar a cocina cuando llega pedido nuevo
2. **Sonido/Alerta:** Sonido distintivo por origen (App/TPV/Glovo)
3. **KDS (Kitchen Display System):** Pantalla en cocina mostrando pedidos
4. **Tiempos reales:** Medir tiempos de preparación reales vs estimados
5. **Estadísticas:** Pedidos por hora, origen, PDV, trabajador
6. **Histórico:** Guardar logs de cambios de estado con timestamp

---

## 🔧 **TECNOLOGÍAS NECESARIAS**

- ✅ `qrcode` - Generar códigos QR
- ✅ `jsbarcode` - Generar códigos de barras
- ✅ `@capacitor-community/barcode-scanner` - Escanear QR/códigos
- ⚠️ Impresoras térmicas ESC/POS (requiere backend o plugin nativo)
- ⚠️ Webhooks (requiere backend)
- ⚠️ APIs de Glovo/JustEat (requiere backend)

---

## ✅ **RESUMEN EJECUTIVO**

| Componente | Estado | Completado |
|------------|--------|------------|
| Servicio Central de Pedidos | ✅ Funcional | 90% |
| Vista Cliente | ✅ Conectada | 100% |
| Vista Trabajador (Pedidos) | ⚠️ Mock | 30% |
| Modal Entregar Pedido | ⚠️ Mock | 30% |
| Códigos QR/Barras | ❌ No existe | 0% |
| Sistema Impresión | ❌ No existe | 0% |
| Flujo App → Delivery | ⚠️ Parcial | 50% |
| Flujo TPV → Cajero | ❌ No existe | 10% |
| Plataformas Externas | ❌ No existe | 0% |

**GLOBAL: ~45% completado**

---

**Generado:** 1 Diciembre 2025
**Proyecto:** Udar Edge - Sistema Multiempresa SaaS
