# ✅ REVISIÓN COMPLETA: SISTEMA DE STOCK Y PROVEEDORES

**Fecha:** 29 de Noviembre de 2025  
**Sistema:** Udar Edge - SaaS Multiempresa  
**Fase:** DEMO - Preparación para Backend Real  

---

## 📊 **ESTADO ACTUAL DEL SISTEMA DE STOCK**

### ✅ **LO QUE YA FUNCIONA (FRONTEND COMPLETO)**

#### **1. StockContext - Sistema Central de Gestión**
- ✅ Context API implementado en `/contexts/StockContext.tsx`
- ✅ Sincronización en tiempo real entre Gerente y Trabajador
- ✅ Separación por empresa y punto de venta
- ✅ Gestión completa de stock con todos los cálculos

#### **2. Componentes Integrados**
- ✅ **Gerente:** `StockProveedoresCafe.tsx` (pantalla principal)
- ✅ **Trabajador:** `MaterialTrabajador.tsx` (ver pedidos)
- ✅ **Trabajador:** `RecepcionMaterialModal.tsx` (recibir material)

#### **3. Datos Que Se Gestionan**
- ✅ **Stock de artículos** (SKUs con cantidades, ubicaciones, costos)
- ✅ **Pedidos a proveedores** (crear, ver, actualizar estados)
- ✅ **Proveedores** (información completa, contactos)
- ✅ **Recepciones** (historial de material recibido)
- ✅ **Movimientos** (entradas, salidas, ajustes)
- ✅ **Empresas y Puntos de Venta** (integrado con ConfiguracionEmpresas)

#### **4. Funcionalidades Implementadas**
- ✅ Ver stock en tiempo real
- ✅ Alertas de stock bajo/crítico
- ✅ Crear pedidos a proveedores
- ✅ Recibir material (escaneo OCR + manual)
- ✅ Actualizar stock automáticamente al recibir
- ✅ Cambiar estados de pedidos automáticamente
- ✅ Filtrar por empresa y punto de venta
- ✅ Calcular costos promedio
- ✅ KPIs y estadísticas

---

## 🗄️ **ESTRUCTURA DE DATOS - PREPARADA PARA BASE DE DATOS**

### **TABLA 1: EMPRESAS**
```typescript
interface Empresa {
  id: string;                    // PK - UUID
  nombreFiscal: string;          // "Disarmink S.L."
  cif: string;                   // "B67284315"
  nombreComercial: string;       // "Hoy Pecamos"
  domicilioFiscal: string;       // Dirección completa
  marcas: Marca[];               // JSON con marcas
  puntosVenta: PuntoVenta[];     // JSON con PDVs
  cuentasBancarias: {...}[];     // JSON con cuentas
  activo: boolean;               // true/false
  
  // Campos para backend:
  createdAt?: timestamp;         // Fecha creación
  updatedAt?: timestamp;         // Fecha actualización
  userId?: string;               // FK - Usuario que la creó
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/empresas                    → Listar todas
GET    /api/empresas/:id                → Obtener una
POST   /api/empresas                    → Crear nueva
PUT    /api/empresas/:id                → Actualizar
DELETE /api/empresas/:id                → Eliminar (soft delete)
GET    /api/empresas/:id/puntos-venta   → PDVs de una empresa
```

---

### **TABLA 2: STOCK (SKUs)**
```typescript
interface SKU {
  id: string;                    // PK - UUID
  codigo: string;                // "ART-001" (único)
  nombre: string;                // "Harina de Trigo T45"
  categoria: string;             // "Harinas"
  subcategoria?: string;         // "Harinas blancas"
  
  // SEPARACIÓN POR EMPRESA/PDV
  empresa: string;               // "Disarmink SL - Hoy Pecamos"
  empresaId: string;             // FK → empresas.id
  almacen: string;               // "Tiana" (nombre del PDV)
  puntoVentaId: string;          // FK → puntos_venta.id
  ubicacion: string;             // "A-12" (estantería física)
  
  // CANTIDADES
  disponible: number;            // Stock actual disponible
  comprometido: number;          // Reservado para pedidos
  minimo: number;                // Stock mínimo (alerta)
  maximo: number;                // Stock máximo
  
  // COSTOS
  costoMedio: number;            // Costo promedio ponderado
  precioCompra: number;          // Último precio de compra
  
  // UNIDADES
  unidad: 'kg' | 'litros' | 'unidades' | 'gramos' | 'ml';
  formatoPresentacion: string;   // "1kg" "500ml"
  
  // PROVEEDORES (relación N:M)
  proveedores: ProveedorArticulo[];  // JSON con proveedores
  
  // ESTADO CALCULADO
  estado: 'ok' | 'bajo' | 'critico' | 'sin-stock';
  
  // METADATA
  activo: boolean;
  
  // Campos para backend:
  createdAt?: timestamp;
  updatedAt?: timestamp;
  userId?: string;               // FK - Usuario que lo creó
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/stock                           → Listar todo el stock
GET    /api/stock/:id                       → Obtener SKU específico
GET    /api/stock/empresa/:empresaId        → Stock de una empresa
GET    /api/stock/pdv/:puntoVentaId         → Stock de un PDV
GET    /api/stock/bajo-stock                → Artículos con stock bajo
POST   /api/stock                           → Crear nuevo SKU
PUT    /api/stock/:id                       → Actualizar SKU
PUT    /api/stock/:id/cantidad              → Actualizar cantidad
DELETE /api/stock/:id                       → Eliminar SKU
GET    /api/stock/:id/movimientos           → Historial de movimientos
```

---

### **TABLA 3: PROVEEDORES**
```typescript
interface Proveedor {
  id: string;                    // PK - UUID
  codigo: string;                // "PROV-001"
  nombre: string;                // "Harinas del Norte S.A."
  cif: string;                   // "B12345678"
  
  // CONTACTO
  telefono: string;              // "+34 932 123 456"
  email: string;                 // "pedidos@harinas.com"
  direccion: string;             // Dirección completa
  
  // CONDICIONES
  plazoEntrega: number;          // Días de entrega
  condicionesPago: string;       // "30 días"
  pedidoMinimo: number;          // Importe mínimo
  
  // CATEGORÍAS
  categorias: string[];          // ["Harinas", "Cereales"]
  
  // ESTADO
  activo: boolean;
  calificacion: number;          // 1-5 estrellas
  
  // Campos para backend:
  empresaId?: string;            // FK - Si es específico de empresa
  createdAt?: timestamp;
  updatedAt?: timestamp;
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/proveedores                 → Listar todos
GET    /api/proveedores/:id             → Obtener uno
GET    /api/proveedores/categoria/:cat  → Por categoría
POST   /api/proveedores                 → Crear nuevo
PUT    /api/proveedores/:id             → Actualizar
DELETE /api/proveedores/:id             → Eliminar
GET    /api/proveedores/:id/articulos   → Artículos del proveedor
GET    /api/proveedores/:id/pedidos     → Pedidos al proveedor
```

---

### **TABLA 4: PEDIDOS A PROVEEDORES**
```typescript
interface PedidoProveedor {
  id: string;                    // PK - UUID
  numeroPedido: string;          // "PED-2025-001" (único)
  
  // RELACIONES
  proveedorId: string;           // FK → proveedores.id
  proveedorNombre: string;       // Desnormalizado para consultas rápidas
  empresaId: string;             // FK → empresas.id
  empresa: string;               // "Disarmink SL - Hoy Pecamos"
  puntoVentaId: string;          // FK → puntos_venta.id
  puntoVenta: string;            // "Tiana"
  
  // ESTADO DEL PEDIDO
  estado: 'solicitado' | 'confirmado' | 'en-transito' | 'parcial' | 'entregado' | 'anulado';
  
  // FECHAS
  fechaSolicitud: string;        // ISO timestamp
  fechaConfirmacion?: string;
  fechaEstimadaEntrega?: string;
  fechaEntregaReal?: string;
  
  // ARTÍCULOS (JSON o tabla relación)
  articulos: Array<{
    articuloId: string;          // FK → stock.id
    codigo: string;
    nombre: string;
    cantidad: number;
    unidad: string;
    precioUnitario: number;
    subtotal: number;
    cantidadRecibida: number;    // Para entregas parciales
  }>;
  
  // TOTALES
  subtotal: number;
  iva: number;
  total: number;
  
  // METADATA
  usuarioSolicitud: string;      // Usuario que creó el pedido
  observaciones?: string;
  
  // Campos para backend:
  createdAt?: timestamp;
  updatedAt?: timestamp;
  userId?: string;
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/pedidos-proveedores                     → Listar todos
GET    /api/pedidos-proveedores/:id                 → Obtener uno
GET    /api/pedidos-proveedores/empresa/:empresaId  → Por empresa
GET    /api/pedidos-proveedores/pdv/:pdvId          → Por punto de venta
GET    /api/pedidos-proveedores/proveedor/:provId   → Por proveedor
GET    /api/pedidos-proveedores/estado/:estado      → Por estado
POST   /api/pedidos-proveedores                     → Crear nuevo
PUT    /api/pedidos-proveedores/:id                 → Actualizar
PUT    /api/pedidos-proveedores/:id/estado          → Cambiar estado
DELETE /api/pedidos-proveedores/:id                 → Cancelar
```

---

### **TABLA 5: RECEPCIONES DE MATERIAL**
```typescript
interface RecepcionMaterial {
  id: string;                    // PK - UUID
  numeroRecepcion: string;       // "REC-2025-001" (único)
  
  // ALBARÁN DEL PROVEEDOR
  numeroAlbaran: string;         // "ALB-12345"
  
  // RELACIONES
  proveedorId?: string;          // FK → proveedores.id (opcional)
  proveedorNombre: string;
  pedidoId?: string;             // FK → pedidos_proveedores.id (opcional)
  pedidoRelacionado?: string;    // Número del pedido
  empresaId: string;             // FK → empresas.id
  puntoVentaId: string;          // FK → puntos_venta.id
  pdvDestino: string;            // "Tiana"
  
  // MATERIALES RECIBIDOS
  materiales: Array<{
    articuloId: string;          // FK → stock.id
    articuloNombre: string;
    articuloCodigo: string;
    cantidadRecibida: number;
    unidad: string;
    lote?: string;
    caducidad?: string;
    ubicacion?: string;
  }>;
  
  // METADATA
  fechaRecepcion: string;        // ISO timestamp
  usuarioRecepcion: string;      // Quién recibió
  observaciones?: string;
  
  // Campos para backend:
  createdAt?: timestamp;
  updatedAt?: timestamp;
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/recepciones                     → Listar todas
GET    /api/recepciones/:id                 → Obtener una
GET    /api/recepciones/pdv/:pdvId          → Por punto de venta
GET    /api/recepciones/pedido/:pedidoId    → De un pedido específico
POST   /api/recepciones                     → Registrar nueva recepción
GET    /api/recepciones/:id/pdf             → Generar PDF del albarán
```

---

### **TABLA 6: MOVIMIENTOS DE STOCK**
```typescript
interface MovimientoStock {
  id: string;                    // PK - UUID
  numeroMovimiento: string;      // "MOV-2025-001" (único)
  
  // TIPO Y ORIGEN
  tipo: 'entrada' | 'salida' | 'ajuste' | 'traspaso';
  origen: string;                // "recepcion" | "venta" | "merma" | "transferencia"
  
  // ARTÍCULO
  articuloId: string;            // FK → stock.id
  articuloNombre: string;
  articuloCodigo: string;
  
  // CANTIDADES
  cantidadAnterior: number;
  cantidadMovimiento: number;    // +40 (entrada) o -15 (salida)
  cantidadFinal: number;
  
  // UBICACIÓN
  empresaId: string;             // FK → empresas.id
  puntoVentaId: string;          // FK → puntos_venta.id
  puntoVenta: string;            // "Tiana"
  ubicacion?: string;            // Estantería
  
  // RELACIONES
  recepcionId?: string;          // FK → recepciones.id
  pedidoProveedorId?: string;    // FK → pedidos_proveedores.id
  ventaId?: string;              // FK → ventas.id (para salidas)
  
  // METADATA
  fecha: string;                 // ISO timestamp
  usuario: string;               // Quién realizó el movimiento
  observaciones?: string;
  
  // Campos para backend:
  createdAt?: timestamp;
}
```

**🔌 ENDPOINTS NECESARIOS:**
```
GET    /api/movimientos                        → Listar todos
GET    /api/movimientos/articulo/:articuloId   → De un artículo
GET    /api/movimientos/pdv/:pdvId             → De un punto de venta
GET    /api/movimientos/fecha/:desde/:hasta    → Por rango de fechas
POST   /api/movimientos                        → Registrar movimiento
GET    /api/movimientos/estadisticas           → Estadísticas de movimientos
```

---

## 🔗 **RELACIONES ENTRE TABLAS**

```
EMPRESAS
  ├─ 1:N → PUNTOS_VENTA
  ├─ 1:N → STOCK (por empresa)
  ├─ 1:N → PEDIDOS_PROVEEDORES
  └─ 1:N → USUARIOS

PUNTOS_VENTA
  ├─ 1:N → STOCK (por PDV)
  ├─ 1:N → PEDIDOS_PROVEEDORES
  ├─ 1:N → RECEPCIONES
  └─ 1:N → MOVIMIENTOS

STOCK (SKU)
  ├─ N:M → PROVEEDORES (tabla intermedia)
  ├─ 1:N → MOVIMIENTOS
  └─ 1:N → ARTICULOS_PEDIDO

PROVEEDORES
  ├─ N:M → STOCK (artículos que suministra)
  └─ 1:N → PEDIDOS_PROVEEDORES

PEDIDOS_PROVEEDORES
  ├─ N:1 → PROVEEDORES
  ├─ N:1 → EMPRESAS
  ├─ N:1 → PUNTOS_VENTA
  ├─ 1:1 → RECEPCIONES (cuando se recibe)
  └─ 1:N → ARTICULOS_PEDIDO

RECEPCIONES
  ├─ N:1 → PUNTOS_VENTA
  ├─ N:1 → PROVEEDORES
  ├─ 1:1 → PEDIDOS_PROVEEDORES (opcional)
  └─ 1:N → MOVIMIENTOS (genera movimientos)

MOVIMIENTOS
  ├─ N:1 → STOCK
  ├─ N:1 → PUNTOS_VENTA
  ├─ N:1 → RECEPCIONES (opcional)
  └─ N:1 → VENTAS (opcional)
```

---

## 📋 **FUNCIONES LISTAS PARA CONECTAR A APIs**

### **EN `/contexts/StockContext.tsx`**

Estas funciones ya están implementadas en el frontend. El programador solo necesita:
1. Cambiar los datos mock por llamadas a API
2. Mantener la misma firma de las funciones
3. Añadir manejo de errores y loading

#### **FUNCIONES DE STOCK:**
```typescript
// ✅ Ya implementadas - Solo cambiar mock por API
getStockPorEmpresa(empresa: string): SKU[]
getStockPorPuntoVenta(empresa: string, puntoVenta: string): SKU[]
actualizarStockArticulo(articuloId: string, cantidadCambio: number): void

// 🔌 CAMBIAR ESTO:
const stock = stockMockData;  // ❌ Mock local

// 🔌 POR ESTO:
const { data: stock } = await fetch('/api/stock');  // ✅ API real
```

#### **FUNCIONES DE PEDIDOS:**
```typescript
// ✅ Ya implementadas
crearPedidoProveedor(datosPedido: CrearPedidoInput): PedidoProveedor
getPedidosPorEmpresa(empresa: string): PedidoProveedor[]
getPedidosPorPuntoVenta(empresa: string, puntoVenta: string): PedidoProveedor[]

// 🔌 CAMBIAR ESTO:
const nuevoPedido = { id: generateId(), ...datos };  // ❌ Mock local
setPedidos([...pedidos, nuevoPedido]);

// 🔌 POR ESTO:
const { data: nuevoPedido } = await fetch('/api/pedidos-proveedores', {
  method: 'POST',
  body: JSON.stringify(datos)
});
```

#### **FUNCIONES DE RECEPCIONES:**
```typescript
// ✅ Ya implementada - Más compleja, actualiza stock y pedidos
registrarRecepcion(datosRecepcion: RegistrarRecepcionInput): RecepcionMaterial

// 🔌 CAMBIAR ESTO:
const nuevaRecepcion = { id: generateId(), ...datos };
setRecepciones([...recepciones, nuevaRecepcion]);
// Actualizar stock local
// Actualizar pedido local

// 🔌 POR ESTO:
const { data: recepcion } = await fetch('/api/recepciones', {
  method: 'POST',
  body: JSON.stringify(datos)
});
// El backend se encarga de actualizar stock y pedidos
```

---

## 📝 **DOCUMENTACIÓN PARA EL PROGRAMADOR**

### **ARCHIVO: `/BACKEND_INTEGRATION_GUIDE.md` (a crear)**

```markdown
# GUÍA DE INTEGRACIÓN BACKEND - SISTEMA DE STOCK

## 1. CONFIGURACIÓN INICIAL

### Base de Datos (Supabase recomendado)
- Crear proyecto en Supabase
- Ejecutar migrations para crear tablas (ver /migrations/)
- Configurar Row Level Security (RLS)
- Configurar Realtime para sincronización

### Variables de Entorno
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx
VITE_API_URL=http://localhost:3000 (development)

## 2. MODIFICAR StockContext.tsx

### Reemplazar función cargarDatosMock()
ANTES:
const cargarDatosMock = () => {
  setStock(stockMockData);
  setPedidos(pedidosMockData);
  setProveedores(proveedoresMockData);
};

DESPUÉS:
const cargarDatosDesdeAPI = async () => {
  try {
    const [stockRes, pedidosRes, proveedoresRes] = await Promise.all([
      fetch('/api/stock'),
      fetch('/api/pedidos-proveedores'),
      fetch('/api/proveedores')
    ]);
    
    const stock = await stockRes.json();
    const pedidos = await pedidosRes.json();
    const proveedores = await proveedoresRes.json();
    
    setStock(stock);
    setPedidos(pedidos);
    setProveedores(proveedores);
  } catch (error) {
    console.error('Error cargando datos:', error);
    // Mostrar toast de error
  }
};

## 3. IMPLEMENTAR ENDPOINTS (Ver sección ENDPOINTS NECESARIOS arriba)

## 4. SINCRONIZACIÓN EN TIEMPO REAL (Supabase Realtime)

const subscription = supabase
  .channel('stock-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'stock' },
    (payload) => {
      // Actualizar estado local cuando cambie el stock
      setStock(prev => actualizarStockConPayload(prev, payload));
    }
  )
  .subscribe();

## 5. TESTING
- Probar cada endpoint individualmente
- Verificar sincronización en tiempo real
- Probar con múltiples usuarios simultáneos
```

---

## ✅ **CHECKLIST DE PREPARACIÓN PARA BACKEND**

### **DATOS Y ESTRUCTURA**
- [x] ✅ Interfaces TypeScript definidas
- [x] ✅ Estructura de datos normalizada
- [x] ✅ Relaciones entre entidades mapeadas
- [x] ✅ Campos calculados identificados (estado, totales, etc.)
- [x] ✅ Datos mock completos y realistas

### **FUNCIONALIDADES FRONTEND**
- [x] ✅ StockContext implementado
- [x] ✅ CRUD de stock funcional (mock)
- [x] ✅ CRUD de pedidos funcional (mock)
- [x] ✅ Recepciones funcionando (mock)
- [x] ✅ Sincronización entre componentes
- [x] ✅ Filtros por empresa/PDV
- [x] ✅ Cálculos automáticos (totales, estados, KPIs)

### **DOCUMENTACIÓN**
- [x] ✅ Guía de uso del contexto
- [x] ✅ Estructura de datos documentada
- [x] ✅ Endpoints necesarios listados
- [ ] ⏳ Migrations de base de datos (crear)
- [ ] ⏳ Guía de integración backend (crear)

### **COMPONENTES UI**
- [x] ✅ Pantalla de gerente completa
- [x] ✅ Pantalla de trabajador completa
- [x] ✅ Modal de recepción funcional
- [x] ✅ Formularios validados
- [x] ✅ Feedback visual (toasts, estados)

---

## 🚧 **LO QUE FALTA (Para el Programador)**

### **BACKEND (1-2 semanas de trabajo)**
1. **Configurar Supabase:**
   - Crear proyecto
   - Crear tablas según estructura
   - Configurar RLS (seguridad por fila)
   - Configurar Realtime

2. **Crear APIs:**
   - Endpoints REST para CRUD
   - Autenticación y autorización
   - Validaciones en servidor
   - Manejo de errores

3. **Modificar StockContext:**
   - Reemplazar mock por llamadas API
   - Implementar loading states
   - Implementar error handling
   - Conectar Realtime subscriptions

4. **Migraciones:**
   - Scripts de creación de tablas
   - Scripts de datos iniciales
   - Índices para optimización

### **ESTIMACIÓN DE TIEMPO:**
- Setup inicial (Supabase + config): 4-6 horas
- Crear tablas y migrations: 6-8 horas
- Implementar endpoints: 16-24 horas
- Modificar StockContext: 8-12 horas
- Testing y debugging: 8-12 horas
- **TOTAL: 42-62 horas (1-2 semanas)**

---

## 🎯 **RESUMEN PARA TI (NO PROGRAMADOR)**

### **✅ LO QUE TIENES LISTO:**
1. **Toda la pantalla visual funciona** (botones, tablas, formularios)
2. **Todos los cálculos funcionan** (stock bajo, totales, KPIs)
3. **Sincronización entre pantallas funciona** (gerente ve lo que hace trabajador)
4. **Estructura de datos definida** (el programador sabe qué guardar)

### **📋 LO QUE FALTA (TRABAJO DEL PROGRAMADOR):**
1. **Base de datos real** (Supabase) para guardar todo permanentemente
2. **APIs** (conexiones) para que el frontend hable con la base de datos
3. **Sincronización entre dispositivos** (tablet del trabajador → PC del gerente)

### **🎬 CUANDO EL PROGRAMADOR TERMINE:**
- ✅ Los datos se guardan para siempre (no se pierden al cerrar)
- ✅ Múltiples usuarios ven lo mismo en tiempo real
- ✅ Cada empresa ve solo SUS datos
- ✅ Histórico completo de movimientos
- ✅ Sistema listo para producción

---

## 📞 **SIGUIENTE PASO:**

Ahora que revisamos que **STOCK Y PROVEEDORES** está listo, vamos a revisar:

### **🔍 VENTAS Y FACTURACIÓN**

¿Qué necesitas revisar específicamente?
1. ¿Sistema de catálogo de productos?
2. ¿TPV (Punto de Venta)?
3. ¿Generación de facturas?
4. ¿Gestión de clientes?
5. ¿Pedidos de clientes?
6. ¿Todo lo anterior?

**Dime qué quieres revisar y continuamos** 🚀
