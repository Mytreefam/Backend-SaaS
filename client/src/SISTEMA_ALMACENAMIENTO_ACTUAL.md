# 💾 SISTEMA DE ALMACENAMIENTO ACTUAL - UDAR EDGE

## 📊 RESUMEN EJECUTIVO

**Estado:** Todo almacenado en **LocalStorage del navegador**  
**Base de datos:** ❌ No existe  
**Persistencia:** ✅ Entre sesiones (mismo navegador)  
**Sincronización:** ❌ No hay (cada navegador es independiente)  
**Backup:** ❌ No automático  
**Multi-dispositivo:** ❌ No soportado

---

## 🗄️ ESTRUCTURA DE ALMACENAMIENTO

### **LocalStorage Keys Actuales:**

```typescript
// ============================================
// VENTAS Y PEDIDOS
// ============================================

'udar-pedidos'                    // Pedidos web de clientes
'udar-pedidos-delivery'           // Pedidos Glovo/Uber/JustEat

// ============================================
// FACTURACIÓN
// ============================================

'udar-facturas'                   // Facturas simples (CheckoutModal)
'facturas_verifactu'              // Facturas VeriFactu completas
'contador_facturas'               // Contador secuencial de facturas
'verifactu_config'                // Configuración VeriFactu
'verifactu_estadisticas'          // Estadísticas VeriFactu
'verifactu_logs'                  // Logs de operaciones VeriFactu

// ============================================
// CAJA Y OPERACIONES
// ============================================

'udar-estado-caja'                // Estado actual de la caja
'udar-operaciones-caja'           // Historial de operaciones
'udar-turnos'                     // Turnos de trabajadores

// ============================================
// STOCK E INVENTARIO
// ============================================

'udar-stock-ingredientes'         // Stock actual de ingredientes
'udar-movimientos-stock'          // Movimientos de stock (NUEVO)
'udar-recepciones'                // Recepciones de material

// ============================================
// OTROS
// ============================================

'udar-notificaciones'             // Notificaciones del usuario
'udar-user-data'                  // Datos del usuario logueado
'udar-carrito'                    // Carrito de compra actual
```

---

## 📦 DETALLE POR MÓDULO

### **1. PEDIDOS (Ventas Web y Presenciales)**

**Key:** `'udar-pedidos'`

**Servicio:** `/services/pedidos.service.ts`

**Estructura:**

```typescript
interface Pedido {
  id: string;                    // "PED-1732895234567-ABC123"
  numero: string;                // "2025-000001"
  fecha: string;                 // ISO 8601
  
  // Cliente
  cliente: {
    id: string;
    nombre: string;
    email: string;
    telefono: string;
    direccion?: string;
  };
  
  // Items
  items: ItemPedido[];           // Productos del pedido
  
  // Importes
  subtotal: number;              // Sin IVA
  descuento: number;             // Descuento aplicado
  cuponAplicado?: string;        // Código del cupón
  iva: number;                   // IVA total
  total: number;                 // Total a pagar
  
  // Pago
  metodoPago: 'tarjeta' | 'efectivo' | 'bizum' | 'transferencia';
  tipoEntrega: 'recogida' | 'domicilio';
  direccionEntrega?: string;
  
  // Estados
  estado: 'pendiente' | 'pagado' | 'en_preparacion' | 'listo' | 'entregado' | 'cancelado';
  estadoEntrega: 'pendiente' | 'preparando' | 'listo' | 'en_camino' | 'entregado';
  
  // Tiempos
  fechaEstimadaEntrega?: string;
  fechaEntrega?: string;
  tiempoPreparacion?: number;    // minutos
  
  // Relaciones
  facturaId?: string;            // ID de la factura asociada
  trabajadorId?: string;         // Quien lo prepara
  puntoVentaId?: string;         // Punto de venta (para stock)
  
  // Observaciones
  observaciones?: string;
  observacionesCocina?: string;
  
  // Metadatos
  createdAt: string;             // ISO 8601
  updatedAt: string;             // ISO 8601
}
```

**Funciones de acceso:**

```typescript
// Leer
const getPedidos = (): Pedido[] => {
  const data = localStorage.getItem('udar-pedidos');
  return data ? JSON.parse(data) : [];
};

// Escribir
const savePedidos = (pedidos: Pedido[]): void => {
  localStorage.setItem('udar-pedidos', JSON.stringify(pedidos));
};

// API pública
export const crearPedido = (params: CrearPedidoParams): Pedido;
export const obtenerPedido = (id: string): Pedido | null;
export const obtenerTodosPedidos = (): Pedido[];
export const obtenerPedidosCliente = (clienteId: string): Pedido[];
export const actualizarEstado = (id: string, estado: EstadoPedido): void;
export const actualizarEstadoEntrega = (id: string, estadoEntrega: EstadoEntrega): void;
export const cancelarPedido = (id: string): void;
export const asociarFactura = (pedidoId: string, facturaId: string): void;
```

**Almacenamiento:**

```json
// localStorage['udar-pedidos']
[
  {
    "id": "PED-1732895234567-ABC123",
    "numero": "2025-000001",
    "fecha": "2025-11-29T10:30:00.000Z",
    "cliente": {
      "id": "CLI-001",
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "telefono": "+34 600 000 000"
    },
    "items": [
      {
        "productoId": "PROD-001",
        "nombre": "Pan de Masa Madre",
        "cantidad": 2,
        "precio": 3.50,
        "subtotal": 7.00
      }
    ],
    "subtotal": 7.00,
    "descuento": 0,
    "iva": 0.70,
    "total": 7.70,
    "metodoPago": "tarjeta",
    "tipoEntrega": "recogida",
    "estado": "pagado",
    "estadoEntrega": "pendiente",
    "createdAt": "2025-11-29T10:30:00.000Z",
    "updatedAt": "2025-11-29T10:30:00.000Z"
  }
]
```

---

### **2. PEDIDOS DELIVERY**

**Key:** `'udar-pedidos-delivery'`

**Servicio:** `/services/pedidos-delivery.service.ts`

**Estructura:**

```typescript
interface PedidoDelivery extends Pedido {
  // Campos adicionales de delivery
  agregador: 'glovo' | 'uber_eats' | 'justeat';
  idAgregadorExterno: string;           // ID del pedido en Glovo/Uber/JustEat
  comisionAgregador: number;            // Comisión que cobra el agregador
  estadoAgregador: EstadoPedidoAgregador;
  tiempoPreparacionAceptado?: number;
  horaAceptacion?: string;
  horaRecogida?: string;
  
  // Datos del repartidor
  repartidor?: {
    nombre: string;
    telefono: string;
    vehiculo: string;
  };
}
```

**Funciones:**

```typescript
export const procesarNuevoPedidoDelivery = async (
  pedidoAgregador: PedidoAgregador,
  agregador: 'glovo' | 'uber_eats' | 'justeat'
): Promise<PedidoDelivery>;

export const aceptarPedidoDelivery = async (
  pedidoId: string,
  tiempoPreparacion: number
): Promise<{ success: boolean; error?: string }>;

export const rechazarPedidoDelivery = async (
  pedidoId: string,
  motivo: string
): Promise<{ success: boolean; error?: string }>;

export const marcarComoListoDelivery = async (
  pedidoId: string
): Promise<{ success: boolean; error?: string }>;

export const confirmarRecogidaDelivery = async (
  pedidoId: string
): Promise<{ success: boolean; error?: string }>;
```

---

### **3. FACTURAS VERIFACTU**

**Key:** `'facturas_verifactu'`

**Servicio:** `/services/facturacion-automatica.service.ts`

**Estructura:**

```typescript
interface FacturaVeriFactu {
  id: string;                           // "FAC-001"
  serie: string;                        // "2025"
  numero: string;                       // "000001"
  numeroCompleto: string;               // "2025-000001"
  fecha: Date;                          // Fecha de emisión
  tipoFactura: TipoFactura;             // 'F1' (completa) | 'F2' (simplificada)
  
  // Emisor (empresa)
  emisor: {
    nif: string;                        // "B12345678"
    razonSocial: string;                // "Udar Edge SL"
    nombreComercial?: string;           // "Udar Edge"
    direccion: DireccionFiscal;
  };
  
  // Receptor (cliente)
  receptor: {
    tipoIdentificador: 'NIF' | 'NIE' | 'SinIdentificar';
    numeroIdentificador?: string;       // NIF del cliente
    razonSocial?: string;               // Nombre del cliente
  };
  
  // Líneas de la factura
  lineas: LineaFacturaVeriFactu[];
  
  // Importes
  baseImponibleTotal: number;           // Suma de bases
  importeIVATotal: number;              // Suma de IVAs
  importeTotal: number;                 // Total factura
  
  // Desglose de IVA
  desgloseIVA: DesgloseIVA[];           // Por tipo de IVA (21%, 10%, 4%)
  
  // Cobro
  datosCobro: {
    medioCobro: 'efectivo' | 'tarjeta' | 'transferencia' | 'otros';
    importe: number;
    fecha: Date;
  };
  
  // ⭐ VERIFACTU
  verifactu?: {
    idVeriFactu: string;                // ID único VeriFactu
    hash: string;                       // Hash SHA-256 de la factura
    algoritmoHash: 'SHA-256';
    hashFacturaAnterior?: string;       // Hash de factura anterior (encadenamiento)
    firma?: string;                     // Firma digital
    algoritmoFirma?: 'RSA-SHA256';
    codigoQR: string;                   // QR en base64
    urlQR: string;                      // URL del QR
    fechaRegistro: Date;
    estado: 'pendiente' | 'firmada' | 'enviada' | 'validada' | 'rechazada';
    csv?: string;                       // Código Seguro de Verificación AEAT
    fechaEnvioAEAT?: Date;
    respuestaAEAT?: {
      codigo: string;
      mensaje: string;
      estado: 'validada' | 'rechazada';
    };
  };
  
  // Relaciones
  referenciaExterna?: string;           // ID del pedido asociado
  
  // Observaciones
  observaciones?: string;
}
```

**Funciones:**

```typescript
class FacturacionAutomaticaService {
  // Generar factura automáticamente al pagar
  async generarFacturaAutomatica(pedido: Pedido): Promise<FacturaVeriFactu | null>;
  
  // Consultas
  obtenerTodasLasFacturas(): FacturaVeriFactu[];
  obtenerFacturasCliente(clienteId: string): FacturaVeriFactu[];
  obtenerFacturaPorId(id: string): FacturaVeriFactu | null;
  
  // Exportación
  exportarFacturasPDF(fechaDesde: Date, fechaHasta: Date): void;
  exportarFacturasCSV(): void;
  
  // Desarrollo
  limpiarFacturas(): void;
}
```

**Contador de facturas:**

**Key:** `'contador_facturas'`

```typescript
// localStorage['contador_facturas']
"42"  // Próximo número de factura
```

---

### **4. CONFIGURACIÓN Y ESTADÍSTICAS VERIFACTU**

**Keys:**
- `'verifactu_config'`
- `'verifactu_estadisticas'`
- `'verifactu_logs'`

**Servicio:** `/services/verifactu.service.ts`

**Configuración:**

```typescript
interface ConfiguracionVeriFactu {
  nifEmpresa: string;                   // "B12345678"
  nombreSistemaInformatico: string;     // "Udar Edge"
  versionSistema: string;               // "1.0.0"
  algoritmoHash: 'SHA-256' | 'SHA-384' | 'SHA-512';
  urlBase: string;                      // URL base de VeriFactu AEAT
  seriesPorDefecto: {
    normal: string;                     // "2025"
    simplificada: string;               // "S2025"
    rectificativa: string;              // "R2025"
  };
  modoProduccion: boolean;              // false para desarrollo
  certificado?: string;                 // Certificado digital (opcional)
  algoritmoFirma?: 'RSA-SHA256' | 'ECDSA-SHA256';
  ultimoHash?: string;                  // Último hash generado (encadenamiento)
}
```

**Estadísticas:**

```typescript
interface EstadisticasVeriFactu {
  totalFacturas: number;                // 42
  facturasFirmadas: number;             // 42
  facturasEnviadas: number;             // 0 (sin conexión AEAT real)
  facturasValidadas: number;            // 0
  facturasRechazadas: number;           // 0
  ultimaFactura?: string;               // "2025-000042"
  ultimoHash?: string;                  // "a3f5b2c..."
  fechaUltimaFactura?: Date;
}
```

**Logs:**

```typescript
interface LogVeriFactu {
  id: string;
  fecha: Date;
  accion: 'generar' | 'firmar' | 'enviar' | 'validar' | 'error';
  facturaId: string;
  detalles: string;
  resultado: 'exito' | 'error';
}

// Se guardan los últimos 100 logs
```

---

### **5. OPERACIONES DE CAJA**

**Keys:**
- `'udar-estado-caja'`
- `'udar-operaciones-caja'`
- `'udar-turnos'`

**Archivo:** `/types/operaciones-caja.ts`

**Estado de caja:**

```typescript
interface EstadoCaja {
  abierta: boolean;                     // true/false
  turnoActual?: string;                 // ID del turno
  trabajadorActual?: string;            // ID del trabajador
  
  // Saldos
  saldoInicial: number;                 // 100.00 (al abrir)
  saldoActual: number;                  // 250.50 (actual)
  totalEfectivo: number;                // 150.50
  totalTarjeta: number;                 // 100.00
  totalVentas: number;                  // 250.50
  numeroVentas: number;                 // 12
  
  // Operaciones
  retiradas: number;                    // 50.00
  consumosPropio: number;               // 10.00
  devoluciones: number;                 // 5.00
  descuadre: number;                    // 0 (calculado al cerrar)
  
  // Tiempos
  horaApertura?: Date;
  horaCierre?: Date;
  ultimaOperacion?: Date;
  
  // Historial
  operaciones: OperacionCaja[];
}
```

**Operación de caja:**

```typescript
type TipoOperacionCaja = 
  | 'apertura'
  | 'cierre'
  | 'venta_efectivo'
  | 'venta_tarjeta'
  | 'venta_mixta'
  | 'retirada'
  | 'ingreso'
  | 'arqueo'
  | 'consumo_propio'
  | 'devolucion';

interface OperacionCaja {
  id: string;                           // "OPE-1732895234567-ABC"
  tipo: TipoOperacionCaja;
  fecha: Date;
  turnoId: string;
  trabajadorId: string;
  trabajadorNombre: string;
  
  importe: number;                      // +50.00 / -20.00
  saldoAnterior: number;                // 100.00
  saldoNuevo: number;                   // 150.00
  
  metodoPago?: 'efectivo' | 'tarjeta' | 'mixto';
  detalles?: {
    efectivo?: number;
    tarjeta?: number;
    cambio?: number;
  };
  
  pedidoRelacionado?: string;           // ID del pedido (si aplica)
  observaciones?: string;
  
  autorizado?: boolean;
  autorizadoPor?: string;
}
```

**Turno:**

```typescript
interface Turno {
  id: string;
  trabajadorId: string;
  trabajadorNombre: string;
  
  horaInicio: Date;
  horaFin?: Date;
  duracion?: number;                    // minutos
  
  saldoInicial: number;
  saldoFinal?: number;
  totalVentas: number;
  totalEfectivo: number;
  totalTarjeta: number;
  numeroVentas: number;
  
  retiradas: number;
  consumosPropio: number;
  devoluciones: number;
  descuadre?: number;                   // Calculado al cerrar
  
  estado: 'activo' | 'cerrado';
  observaciones?: string;
}
```

---

### **6. STOCK E INVENTARIO**

**Keys:**
- `'udar-stock-ingredientes'`
- `'udar-movimientos-stock'`
- `'udar-recepciones'`

**Servicio:** `/data/stock-manager.ts`

**Stock de ingredientes:**

```typescript
interface Ingrediente {
  id: string;                           // "ING-001"
  nombre: string;                       // "Harina de Trigo"
  categoria: string;                    // "Harinas"
  stock: number;                        // 50.5
  unidad: 'kg' | 'litros' | 'unidades';
  stockMinimo: number;                  // 10 (alerta)
  stockMaximo: number;                  // 100
  precio: number;                       // 1.50 (por unidad)
  proveedor: string;                    // "Harinas SA"
  ubicacion: string;                    // "Almacén A - Estante 3"
  lote?: string;
  fechaCaducidad?: Date;
}
```

**Movimiento de stock:**

```typescript
interface MovimientoStock {
  id: string;                           // "MOV-1732895234567-ING001"
  fecha: Date;
  tipo: 'recepcion' | 'venta' | 'produccion' | 'merma' | 'ajuste' | 'devolucion';
  
  articuloId: string;                   // "ING-001"
  articuloNombre: string;               // "Harina de Trigo"
  
  cantidad: number;                     // +10 (entrada) / -5 (salida)
  cantidadAnterior: number;             // 40
  cantidadNueva: number;                // 50
  unidad: 'kg' | 'litros' | 'unidades';
  
  pdv: string;                          // Punto de venta
  usuario: string;                      // Quien registra
  motivo: string;                       // "Recepción proveedor" / "Venta pedido 2025-000001"
  referencia?: string;                  // ID del pedido/recepción relacionado
  observaciones?: string;
}
```

**Recepción de material:**

```typescript
interface RecepcionMaterial {
  id: string;
  fecha: Date;
  numeroAlbaran: string;                // "ALB-001"
  
  proveedorId: string;
  proveedorNombre: string;
  
  materiales: {
    articuloId: string;
    articuloNombre: string;
    cantidadRecibida: number;
    cantidadEsperada?: number;
    unidad: string;
    precioUnitario: number;
    lote?: string;
    fechaCaducidad?: Date;
  }[];
  
  estado: 'completa' | 'parcial' | 'con_diferencias';
  pedidoRelacionado?: string;           // ID del pedido a proveedor
  
  recibidoPor: string;                  // Trabajador que recibe
  observaciones?: string;
}
```

---

## 🔄 FLUJO DE DATOS

### **Flujo de Venta:**

```
1. Cliente añade productos al carrito
   └─> localStorage['udar-carrito']

2. Cliente hace checkout
   └─> Crear pedido
       └─> localStorage['udar-pedidos'].push(nuevoPedido)

3. ⭐ Descontar stock (NUEVO)
   └─> localStorage['udar-stock-ingredientes'] (actualizar)
   └─> localStorage['udar-movimientos-stock'].push(movimiento)

4. Generar factura VeriFactu
   └─> Generar hash + QR + encadenar
   └─> localStorage['facturas_verifactu'].push(factura)
   └─> localStorage['contador_facturas']++
   └─> localStorage['verifactu_estadisticas'] (actualizar)
   └─> localStorage['verifactu_logs'].push(log)

5. Registrar operación de caja (si TPV presencial)
   └─> localStorage['udar-operaciones-caja'].push(operacion)
   └─> localStorage['udar-estado-caja'] (actualizar saldos)

6. Asociar factura con pedido
   └─> pedido.facturaId = factura.id
   └─> localStorage['udar-pedidos'] (actualizar)

7. Limpiar carrito
   └─> localStorage.removeItem('udar-carrito')
```

---

## ⚠️ LIMITACIONES ACTUALES

### **1. Sin persistencia real**
```
❌ Si cambias de navegador → Pierdes todo
❌ Si borras caché → Pierdes todo
❌ Si usas modo incógnito → No se guarda nada
❌ Si reinstalar el navegador → Pierdes todo
```

### **2. Sin sincronización**
```
❌ TPV 1 y TPV 2 no comparten datos
❌ No hay "nube"
❌ No hay backup automático
❌ No hay histórico centralizado
```

### **3. Límite de tamaño**
```
⚠️ LocalStorage tiene límite de ~5-10 MB por dominio
⚠️ Si se llena, empezará a fallar
⚠️ No hay limpieza automática
```

### **4. Sin control de versiones**
```
❌ Si cambias la estructura de datos, puede romper
❌ No hay migraciones automáticas
❌ Hay que limpiar localStorage manualmente
```

### **5. Seguridad limitada**
```
⚠️ Cualquiera con acceso al navegador puede ver los datos
⚠️ No hay cifrado
⚠️ No hay control de acceso
```

---

## 🎯 MIGRACIÓN A SUPABASE (Pendiente)

### **Estructura de tablas necesaria:**

```sql
-- VENTAS/PEDIDOS
CREATE TABLE ventas (
  id UUID PRIMARY KEY,
  numero VARCHAR(50) UNIQUE,
  fecha TIMESTAMP,
  cliente_id UUID,
  punto_venta_id UUID,
  trabajador_id UUID,
  subtotal DECIMAL(10,2),
  descuento DECIMAL(10,2),
  iva DECIMAL(10,2),
  total DECIMAL(10,2),
  metodo_pago VARCHAR(20),
  tipo_entrega VARCHAR(20),
  estado VARCHAR(20),
  factura_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE lineas_venta (
  id UUID PRIMARY KEY,
  venta_id UUID REFERENCES ventas(id),
  producto_id UUID,
  producto_nombre VARCHAR(200),
  cantidad DECIMAL(10,3),
  precio_unitario DECIMAL(10,2),
  descuento DECIMAL(10,2),
  tipo_iva DECIMAL(5,2),
  subtotal DECIMAL(10,2),
  iva_linea DECIMAL(10,2),
  total DECIMAL(10,2)
);

-- FACTURAS
CREATE TABLE facturas (
  id UUID PRIMARY KEY,
  serie VARCHAR(20),
  numero VARCHAR(50),
  numero_completo VARCHAR(100) UNIQUE,
  fecha_emision TIMESTAMP,
  tipo_factura VARCHAR(5),
  emisor_nif VARCHAR(20),
  emisor_nombre VARCHAR(200),
  receptor_tipo VARCHAR(20),
  receptor_nif VARCHAR(20),
  receptor_nombre VARCHAR(200),
  base_imponible DECIMAL(10,2),
  importe_iva DECIMAL(10,2),
  importe_total DECIMAL(10,2),
  -- VeriFactu
  id_verifactu VARCHAR(100) UNIQUE,
  hash VARCHAR(128),
  hash_factura_anterior VARCHAR(128),
  qr_base64 TEXT,
  qr_url TEXT,
  firma TEXT,
  estado_verifactu VARCHAR(20),
  csv_aeat VARCHAR(100),
  -- Relaciones
  venta_id UUID REFERENCES ventas(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- OPERACIONES DE CAJA
CREATE TABLE operaciones_caja (
  id UUID PRIMARY KEY,
  tipo_operacion VARCHAR(30),
  fecha_operacion TIMESTAMP,
  turno_id UUID,
  trabajador_id UUID,
  importe DECIMAL(10,2),
  saldo_anterior DECIMAL(10,2),
  saldo_nuevo DECIMAL(10,2),
  metodo_pago VARCHAR(20),
  detalles_pago JSONB,
  venta_relacionada UUID REFERENCES ventas(id),
  observaciones TEXT
);

-- TURNOS
CREATE TABLE turnos (
  id UUID PRIMARY KEY,
  trabajador_id UUID,
  punto_venta_id UUID,
  hora_inicio TIMESTAMP,
  hora_fin TIMESTAMP,
  saldo_inicial DECIMAL(10,2),
  saldo_final DECIMAL(10,2),
  total_ventas DECIMAL(10,2),
  total_efectivo DECIMAL(10,2),
  total_tarjeta DECIMAL(10,2),
  numero_ventas INT,
  descuadre DECIMAL(10,2),
  estado VARCHAR(20)
);

-- STOCK
CREATE TABLE movimientos_stock (
  id UUID PRIMARY KEY,
  fecha TIMESTAMP,
  tipo VARCHAR(20),
  articulo_id UUID,
  articulo_nombre VARCHAR(200),
  cantidad DECIMAL(10,3),
  cantidad_anterior DECIMAL(10,3),
  cantidad_nueva DECIMAL(10,3),
  unidad VARCHAR(20),
  pdv VARCHAR(100),
  usuario VARCHAR(200),
  motivo TEXT,
  referencia VARCHAR(100),
  observaciones TEXT
);
```

---

## 📊 COMPARATIVA: ACTUAL vs. SUPABASE

| Característica | LocalStorage (Actual) | Supabase (Futuro) |
|---------------|----------------------|-------------------|
| **Persistencia** | ⚠️ Solo navegador | ✅ Servidor cloud |
| **Sincronización** | ❌ No | ✅ Tiempo real |
| **Multi-dispositivo** | ❌ No | ✅ Sí |
| **Backup** | ❌ Manual | ✅ Automático |
| **Límite de datos** | ⚠️ ~10 MB | ✅ Ilimitado (plan) |
| **Seguridad** | ⚠️ Básica | ✅ RLS + Auth |
| **Velocidad lectura** | ✅ Instantánea | ⚠️ Red (ms) |
| **Velocidad escritura** | ✅ Instantánea | ⚠️ Red (ms) |
| **Queries complejas** | ❌ No | ✅ SQL completo |
| **Filtros/búsquedas** | ⚠️ En memoria | ✅ Índices DB |
| **Relaciones** | ⚠️ Manuales | ✅ Foreign keys |
| **Transacciones** | ❌ No | ✅ ACID |
| **Validación** | ⚠️ Frontend | ✅ Frontend + Backend |
| **Auditoria** | ⚠️ Logs manuales | ✅ Triggers automáticos |
| **Reportes** | ⚠️ Limitados | ✅ SQL complejo |
| **Costo** | ✅ Gratis | ⚠️ $25/mes (Pro) |

---

## 🚀 VENTAJAS DEL SISTEMA ACTUAL

### **1. Desarrollo rápido**
```
✅ No necesita backend
✅ No necesita configuración
✅ Funciona offline al 100%
✅ No hay latencia de red
```

### **2. Prototipado perfecto**
```
✅ Ideal para demostración
✅ No requiere credenciales
✅ Fácil de probar
✅ Reseteable fácilmente
```

### **3. Sin costos**
```
✅ No paga por servidor
✅ No paga por base de datos
✅ No paga por ancho de banda
```

---

## ⚠️ DESVENTAJAS DEL SISTEMA ACTUAL

### **1. No es producción**
```
❌ Datos no persistentes
❌ Sin backup
❌ Sin recuperación ante desastres
```

### **2. No escala**
```
❌ Límite de 10 MB
❌ Un solo usuario por navegador
❌ No hay métricas centralizadas
```

### **3. No es seguro**
```
❌ Datos en cliente (vulnerables)
❌ Sin autenticación real
❌ Sin permisos granulares
```

---

## 🎯 CONCLUSIÓN

### **Estado actual:**

✅ **Sistema funcional al 100% en LocalStorage**  
✅ **Perfecto para desarrollo y demo**  
✅ **Todos los flujos implementados**  
⚠️ **NO apto para producción real**  

### **Próximo paso recomendado:**

**MIGRAR A SUPABASE:**

1. Conectar Supabase (2 hrs)
2. Crear esquema de BD (4 hrs)
3. Crear API de ventas (8 hrs)
4. Migrar servicio de pedidos (4 hrs)
5. Migrar servicio de facturas (4 hrs)
6. Migrar servicio de caja (3 hrs)
7. Migrar servicio de stock (3 hrs)
8. Testing completo (4 hrs)

**Total:** ~32 horas

**Beneficio:** Sistema 100% producción-ready

---

## 📝 FUNCIONES DE UTILIDAD

### **Exportar datos actuales:**

```typescript
// Exportar todo localStorage a JSON
function exportarDatos() {
  const datos = {
    pedidos: JSON.parse(localStorage.getItem('udar-pedidos') || '[]'),
    pedidosDelivery: JSON.parse(localStorage.getItem('udar-pedidos-delivery') || '[]'),
    facturas: JSON.parse(localStorage.getItem('facturas_verifactu') || '[]'),
    stock: JSON.parse(localStorage.getItem('udar-stock-ingredientes') || '[]'),
    movimientosStock: JSON.parse(localStorage.getItem('udar-movimientos-stock') || '[]'),
    operacionesCaja: JSON.parse(localStorage.getItem('udar-operaciones-caja') || '[]'),
    turnos: JSON.parse(localStorage.getItem('udar-turnos') || '[]'),
  };
  
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `udar-backup-${new Date().toISOString()}.json`;
  a.click();
}
```

### **Importar datos:**

```typescript
function importarDatos(archivo: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const datos = JSON.parse(e.target.result as string);
    
    localStorage.setItem('udar-pedidos', JSON.stringify(datos.pedidos || []));
    localStorage.setItem('udar-pedidos-delivery', JSON.stringify(datos.pedidosDelivery || []));
    localStorage.setItem('facturas_verifactu', JSON.stringify(datos.facturas || []));
    localStorage.setItem('udar-stock-ingredientes', JSON.stringify(datos.stock || []));
    // ... etc
    
    toast.success('Datos importados correctamente');
    window.location.reload();
  };
  reader.readAsText(archivo);
}
```

### **Limpiar todo:**

```typescript
function limpiarTodo() {
  if (confirm('¿Estás seguro? Se perderán TODOS los datos')) {
    const keys = [
      'udar-pedidos',
      'udar-pedidos-delivery',
      'facturas_verifactu',
      'contador_facturas',
      'verifactu_config',
      'verifactu_estadisticas',
      'verifactu_logs',
      'udar-estado-caja',
      'udar-operaciones-caja',
      'udar-turnos',
      'udar-stock-ingredientes',
      'udar-movimientos-stock',
      'udar-recepciones',
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    toast.success('Todos los datos eliminados');
    window.location.reload();
  }
}
```

---

**¿Quieres que continúe con la migración a Supabase?** 🚀
