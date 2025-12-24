# 🚀 GUÍA COMPLETA PARA EL DESARROLLADOR BACKEND - UDAR EDGE

**Versión:** 1.0.0  
**Fecha:** 27 Noviembre 2025  
**Framework Frontend:** React + TypeScript + Tailwind CSS  
**Estado del Frontend:** ✅ Completado y limpio

---

## 📋 ÍNDICE

1. [Introducción y Arquitectura](#introducción)
2. [Estructura del Proyecto](#estructura)
3. [Entidades y Modelos de Datos](#entidades)
4. [Endpoints API Necesarios](#endpoints)
5. [Flujos de Autenticación](#autenticación)
6. [Sistema de Permisos](#permisos)
7. [Websockets y Tiempo Real](#websockets)
8. [Integración con Make.com](#makecom)
9. [Variables de Entorno](#variables)
10. [Testing y Despliegue](#testing)

---

## 🎯 INTRODUCCIÓN

### **¿Qué es Udar Edge?**

**Udar Edge** es una aplicación SaaS multiempresa para digitalizar negocios de hostelería. Permite gestionar:
- 🏢 Múltiples empresas por cliente
- 🏪 Múltiples marcas por empresa
- 📍 Múltiples puntos de venta por marca
- 👥 3 tipos de usuarios: Cliente, Trabajador (Colaborador), Gerente

### **Arquitectura Multiempresa**

```
CLIENTE (Usuario Root)
└── EMPRESA 1 (ej: "Restaurantes PAU")
    ├── MARCA 1 (ej: "PIZZAS")
    │   ├── PUNTO VENTA 1 (ej: "TIANA")
    │   └── PUNTO VENTA 2 (ej: "BADALONA")
    └── MARCA 2 (ej: "BURGUERS")
        └── PUNTO VENTA 3 (ej: "BARCELONA CENTRO")
```

### **Regla de Oro: AMARRE GLOBAL**

⚠️ **CRÍTICO:** Todas las entidades DEBEN incluir:
```typescript
{
  EmpresaId: string;      // UUID de la empresa
  MarcaId?: string;       // UUID de la marca (opcional según entidad)
  PuntoVentaId?: string;  // UUID del punto de venta (opcional según entidad)
}
```

**Documentación:** Ver `/AMARRE_GLOBAL_UDAR_DELIVERY360.md`

---

## 📁 ESTRUCTURA DEL PROYECTO

```
/
├── components/
│   ├── cliente/              # Componentes del perfil Cliente
│   ├── trabajador/           # Componentes del perfil Trabajador/Colaborador
│   ├── gerente/              # Componentes del perfil Gerente
│   ├── figma/                # Componentes de Figma (NO TOCAR)
│   ├── filtros/              # Sistema de filtros universal
│   ├── navigation/           # Navegación, sidebar, breadcrumb
│   ├── ui/                   # Componentes UI reutilizables (shadcn)
│   ├── App.tsx               # Punto de entrada principal
│   ├── LoginView.tsx         # Pantalla de login
│   ├── ClienteDashboard.tsx  # Dashboard principal Cliente
│   ├── TrabajadorDashboard.tsx # Dashboard principal Trabajador
│   └── GerenteDashboard.tsx  # Dashboard principal Gerente
│
├── contexts/
│   └── FiltroUniversalContext.tsx  # Context del filtro jerárquico
│
├── data/                     # ⚠️ DATOS MOCK - REEMPLAZAR CON API
│   ├── productos-cafe.ts
│   ├── productos-cafeteria.ts
│   ├── productos-panaderia.ts
│   └── productos-personalizables.ts
│
├── docs/                     # Documentación técnica
│   ├── DATABASE_SCHEMA_TPV360.sql
│   ├── DATABASE_SCHEMA_DATOS_CLIENTE.sql
│   ├── MAKE_AUTOMATION_TPV360.md
│   └── MAKE_AUTOMATION_DATOS_CLIENTE.md
│
├── types/
│   └── operaciones-caja.ts   # Tipos para operaciones TPV
│
└── DOCUMENTACIÓN_*.md        # Toda la documentación del proyecto
```

---

## 🗄️ ENTIDADES Y MODELOS DE DATOS

### **1. USUARIOS Y AUTENTICACIÓN**

#### **Tabla: Users**
```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // UNIQUE
  passwordHash: string;          // bcrypt
  name: string;
  role: 'cliente' | 'trabajador' | 'gerente';
  avatar?: string;               // URL
  telefono?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  
  // Relaciones
  EmpresaId?: string;            // Para trabajador/gerente
  MarcaId?: string;              // Para trabajador específico de marca
  PuntoVentaId?: string;         // Para trabajador de punto de venta
}
```

#### **Tabla: Sessions**
```typescript
interface Session {
  id: string;
  userId: string;
  token: string;                 // JWT
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  ipAddress?: string;
  userAgent?: string;
}
```

---

### **2. ESTRUCTURA MULTIEMPRESA**

#### **Tabla: Empresas**
```typescript
interface Empresa {
  id: string;                    // UUID
  ClienteId: string;             // FK a Users (rol: cliente)
  nombreFiscal: string;
  nombreComercial: string;
  cif: string;                   // UNIQUE
  domicilioFiscal: string;
  telefono: string;
  email: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: Marcas**
```typescript
interface Marca {
  id: string;                    // UUID
  EmpresaId: string;             // FK a Empresas
  nombreFiscal: string;
  nombreComercial: string;
  cif?: string;
  domicilioFiscal?: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: PuntosVenta**
```typescript
interface PuntoVenta {
  id: string;                    // UUID
  EmpresaId: string;             // FK a Empresas
  MarcaId: string;               // FK a Marcas
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  horario?: string;              // JSON: { lunes: "9-18", ... }
  activo: boolean;
  
  // Configuración TPV
  impresoras?: JSON;             // Configuración de impresoras
  metodoPago?: JSON;             // Métodos de pago disponibles
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### **3. PRODUCTOS Y STOCK**

#### **Tabla: Productos**
```typescript
interface Producto {
  id: string;                    // UUID
  EmpresaId: string;
  MarcaId: string;
  
  sku: string;                   // UNIQUE dentro de la empresa
  nombre: string;
  descripcion?: string;
  categoria: string;             // 'comida' | 'bebida' | 'postre' | ...
  precio: number;                // Decimal(10,2)
  
  // Stock
  stock: number;
  stockMinimo: number;
  stockMaximo: number;
  
  // Configuración
  activo: boolean;
  destacado: boolean;
  personalizable: boolean;       // Si permite modificadores
  
  // Media
  imagen?: string;               // URL
  
  // Metadata
  tiempoPreparacion?: number;    // Minutos
  calorias?: number;
  alergenos?: string[];          // JSON
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: MovimientosStock**
```typescript
interface MovimientoStock {
  id: string;                    // UUID
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  ProductoId: string;
  
  tipo: 'entrada' | 'salida' | 'ajuste' | 'merma' | 'devolucion' | 'traspaso';
  cantidad: number;              // Positivo o negativo
  stockAnterior: number;
  stockNuevo: number;
  
  motivo?: string;
  UsuarioId: string;             // Quien hizo el movimiento
  
  // Para traspasos
  PuntoVentaOrigenId?: string;
  PuntoVentaDestinoId?: string;
  
  createdAt: Date;
}
```

---

### **4. PEDIDOS (TPV 360)**

#### **Tabla: Pedidos**
```typescript
interface Pedido {
  id: string;                    // UUID
  numeroPedido: string;          // Ej: "PED-001"
  
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  
  // Cliente
  ClienteId?: string;            // Si es cliente registrado
  clienteNombre?: string;        // Si es cliente anónimo
  clienteTelefono?: string;
  clienteDireccion?: string;     // Para delivery
  
  // Estado
  estado: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  tipo: 'mesa' | 'recoger' | 'domicilio';
  mesa?: string;                 // Si es tipo mesa
  
  // Montos
  subtotal: number;              // Decimal(10,2)
  descuento: number;
  impuestos: number;             // IVA
  total: number;
  propina?: number;
  
  // Pago
  metodoPago: 'efectivo' | 'tarjeta' | 'mixto' | 'transferencia';
  pagado: boolean;
  
  // Metadata
  notas?: string;
  tiempoEstimado?: number;       // Minutos
  
  // Auditoría
  UsuarioCreadorId: string;      // Trabajador que creó el pedido
  createdAt: Date;
  updatedAt: Date;
  entregadoAt?: Date;
  canceladoAt?: Date;
}
```

#### **Tabla: PedidoLineas**
```typescript
interface PedidoLinea {
  id: string;                    // UUID
  PedidoId: string;              // FK a Pedidos
  ProductoId: string;
  
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  
  // Personalización
  modificadores?: JSON;          // Ej: { "sin cebolla": true, "extra queso": true }
  notas?: string;
  
  createdAt: Date;
}
```

---

### **5. CAJA Y OPERACIONES**

#### **Tabla: Cajas**
```typescript
interface Caja {
  id: string;                    // UUID
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  
  nombre: string;                // Ej: "Caja Principal"
  codigo: string;                // Ej: "C01"
  activo: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: TurnosCaja**
```typescript
interface TurnoCaja {
  id: string;                    // UUID
  CajaId: string;
  UsuarioId: string;             // Trabajador responsable
  
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  
  // Apertura
  fechaApertura: Date;
  efectivoInicial: number;
  
  // Cierre
  fechaCierre?: Date;
  efectivoEsperado?: number;
  efectivoReal?: number;
  diferencia?: number;
  cerrado: boolean;
  
  // Metadata
  notas?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: OperacionesCaja**
```typescript
interface OperacionCaja {
  id: string;                    // UUID
  TurnoCajaId: string;
  
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  
  tipo: 'apertura' | 'venta' | 'retirada' | 'arqueo' | 'cierre' | 'devolucion';
  monto: number;
  metodoPago: 'efectivo' | 'tarjeta' | 'mixto';
  
  // Si es venta
  PedidoId?: string;
  
  // Detalles pago mixto
  montoEfectivo?: number;
  montoTarjeta?: number;
  
  descripcion?: string;
  UsuarioId: string;
  
  createdAt: Date;
}
```

---

### **6. EMPLEADOS Y RRHH**

#### **Tabla: Empleados**
```typescript
interface Empleado {
  id: string;                    // UUID
  UserId: string;                // FK a Users (rol: trabajador)
  
  EmpresaId: string;
  MarcaId?: string;              // Opcional, si es de una marca específica
  PuntoVentaId?: string;         // Opcional, si es de un punto específico
  
  // Datos personales
  nombre: string;
  apellidos: string;
  dni: string;                   // UNIQUE
  fechaNacimiento: Date;
  telefono: string;
  email: string;
  direccion: string;
  
  // Contrato
  puesto: string;
  departamento?: string;
  fechaIngreso: Date;
  fechaBaja?: Date;
  tipoContrato: 'indefinido' | 'temporal' | 'practicas' | 'autonomo';
  salario: number;
  
  // Estado
  activo: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: PermisosEmpleado**
```typescript
interface PermisoEmpleado {
  id: string;                    // UUID
  EmpleadoId: string;
  
  tipo: 'vacaciones' | 'enfermedad' | 'personal' | 'paternidad' | 'otros';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  
  fechaInicio: Date;
  fechaFin: Date;
  diasSolicitados: number;
  
  motivo?: string;
  documentos?: JSON;             // URLs de archivos adjuntos
  
  // Aprobación
  aprobadoPor?: string;          // UserId del gerente
  fechaAprobacion?: Date;
  motivoRechazo?: string;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: Fichajes**
```typescript
interface Fichaje {
  id: string;                    // UUID
  EmpleadoId: string;
  
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  
  tipo: 'entrada' | 'salida' | 'pausa_inicio' | 'pausa_fin';
  fecha: Date;
  
  // Geolocalización
  latitud?: number;
  longitud?: number;
  
  // Metadata
  notas?: string;
  
  createdAt: Date;
}
```

---

### **7. COMUNICACIÓN Y CHATS**

#### **Tabla: Conversaciones**
```typescript
interface Conversacion {
  id: string;                    // UUID
  
  tipo: 'pedido' | 'consulta' | 'incidencia' | 'sugerencia' | 'rrhh';
  asunto: string;
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
  prioridad: 'baja' | 'media' | 'alta' | 'urgente';
  
  // Participantes
  ClienteId?: string;            // Si es un cliente
  EmpleadoId?: string;           // Si es un empleado
  GerenteId?: string;            // Gerente asignado
  
  EmpresaId: string;
  MarcaId?: string;
  PuntoVentaId?: string;
  
  // Metadata
  PedidoId?: string;             // Si está relacionado con un pedido
  valoracion?: number;           // 1-5 estrellas
  
  createdAt: Date;
  updatedAt: Date;
  cerradoAt?: Date;
}
```

#### **Tabla: Mensajes**
```typescript
interface Mensaje {
  id: string;                    // UUID
  ConversacionId: string;
  
  RemitenteId: string;           // UserId
  tipoRemitente: 'cliente' | 'trabajador' | 'gerente' | 'sistema';
  
  contenido: string;
  adjuntos?: JSON;               // URLs de archivos
  
  leido: boolean;
  fechaLeido?: Date;
  
  createdAt: Date;
}
```

---

### **8. NOTIFICACIONES**

#### **Tabla: Notificaciones**
```typescript
interface Notificacion {
  id: string;                    // UUID
  UsuarioId: string;             // Destinatario
  
  tipo: 'pedido' | 'chat' | 'permiso' | 'sistema' | 'rrhh' | 'stock';
  titulo: string;
  mensaje: string;
  
  // Metadata
  accion?: string;               // URL o ruta a la que redirigir
  datos?: JSON;                  // Datos adicionales
  
  // Estado
  leido: boolean;
  fechaLeido?: Date;
  
  // Envío
  envioPush: boolean;
  envioEmail: boolean;
  envioSMS: boolean;
  
  createdAt: Date;
}
```

---

### **9. DOCUMENTACIÓN Y ARCHIVOS**

#### **Tabla: Documentos**
```typescript
interface Documento {
  id: string;                    // UUID
  
  tipo: 'dni' | 'contrato' | 'nomina' | 'factura' | 'licencia' | 'alquiler' | 'otro';
  nombre: string;
  descripcion?: string;
  
  // Almacenamiento
  url: string;                   // S3, Cloudinary, etc.
  mimeType: string;              // application/pdf, image/jpeg, etc.
  tamaño: number;                // Bytes
  
  // Relaciones
  EmpresaId?: string;
  EmpleadoId?: string;
  PuntoVentaId?: string;
  
  // Metadata
  fechaVencimiento?: Date;       // Para licencias, alquileres, etc.
  
  // Auditoría
  SubidoPorId: string;           // UserId
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

### **10. PROVEEDORES**

#### **Tabla: Proveedores**
```typescript
interface Proveedor {
  id: string;                    // UUID
  EmpresaId: string;
  
  nombre: string;
  cif: string;
  direccion: string;
  telefono: string;
  email: string;
  contacto?: string;             // Nombre del contacto principal
  
  // Metadata
  categorias?: string[];         // JSON: ['bebidas', 'alimentos']
  notas?: string;
  activo: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}
```

#### **Tabla: PedidosProveedor**
```typescript
interface PedidoProveedor {
  id: string;                    // UUID
  numeroPedido: string;
  
  EmpresaId: string;
  MarcaId: string;
  PuntoVentaId: string;
  ProveedorId: string;
  
  estado: 'pendiente' | 'enviado' | 'recibido' | 'parcial' | 'cancelado';
  
  fechaPedido: Date;
  fechaEsperada?: Date;
  fechaRecepcion?: Date;
  
  total: number;
  
  notas?: string;
  UsuarioId: string;             // Quien hizo el pedido
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔌 ENDPOINTS API NECESARIOS

### **BASE URL:** `https://api.udaredge.com/v1`

---

### **1. AUTENTICACIÓN**

```typescript
// POST /auth/register
Request: {
  email: string;
  password: string;
  name: string;
  role: 'cliente' | 'trabajador' | 'gerente';
}
Response: {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /auth/login
Request: {
  email: string;
  password: string;
}
Response: {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /auth/login/google
Request: {
  googleToken: string;
}
Response: {
  user: User;
  token: string;
  refreshToken: string;
}

// POST /auth/login/facebook
// POST /auth/login/apple
// Similar structure

// POST /auth/refresh
Request: {
  refreshToken: string;
}
Response: {
  token: string;
  refreshToken: string;
}

// POST /auth/logout
Request: {
  token: string;
}
Response: {
  success: boolean;
}

// POST /auth/forgot-password
Request: {
  email: string;
}
Response: {
  message: string;
}

// POST /auth/reset-password
Request: {
  token: string;
  newPassword: string;
}
Response: {
  success: boolean;
}
```

---

### **2. USUARIOS**

```typescript
// GET /users/me
Response: {
  user: User;
  empresas?: Empresa[];  // Si es cliente
  empresa?: Empresa;     // Si es trabajador/gerente
}

// PUT /users/me
Request: Partial<User>
Response: {
  user: User;
}

// PUT /users/me/password
Request: {
  currentPassword: string;
  newPassword: string;
}
Response: {
  success: boolean;
}

// POST /users/me/avatar
Request: FormData (multipart/form-data)
Response: {
  avatarUrl: string;
}

// DELETE /users/me
Request: {
  password: string;
  confirmacion: string;  // "eliminar"
}
Response: {
  success: boolean;
}
```

---

### **3. EMPRESAS**

```typescript
// GET /empresas
// Query params: ?clienteId=xxx (solo si es admin)
Response: {
  empresas: Empresa[];
}

// GET /empresas/:id
Response: {
  empresa: Empresa;
  marcas: Marca[];
  puntosVenta: PuntoVenta[];
}

// POST /empresas
Request: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  empresa: Empresa;
}

// PUT /empresas/:id
Request: Partial<Empresa>
Response: {
  empresa: Empresa;
}

// DELETE /empresas/:id
Response: {
  success: boolean;
}
```

---

### **4. MARCAS**

```typescript
// GET /marcas
// Query params: ?empresaId=xxx
Response: {
  marcas: Marca[];
}

// GET /marcas/:id
Response: {
  marca: Marca;
  puntosVenta: PuntoVenta[];
}

// POST /marcas
Request: Omit<Marca, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  marca: Marca;
}

// PUT /marcas/:id
Request: Partial<Marca>
Response: {
  marca: Marca;
}

// DELETE /marcas/:id
Response: {
  success: boolean;
}
```

---

### **5. PUNTOS DE VENTA**

```typescript
// GET /puntos-venta
// Query params: ?empresaId=xxx&marcaId=xxx
Response: {
  puntosVenta: PuntoVenta[];
}

// GET /puntos-venta/:id
Response: {
  puntoVenta: PuntoVenta;
  configuracion: any;  // Config TPV, impresoras, etc.
}

// POST /puntos-venta
Request: Omit<PuntoVenta, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  puntoVenta: PuntoVenta;
}

// PUT /puntos-venta/:id
Request: Partial<PuntoVenta>
Response: {
  puntoVenta: PuntoVenta;
}

// DELETE /puntos-venta/:id
Response: {
  success: boolean;
}
```

---

### **6. PRODUCTOS**

```typescript
// GET /productos
// Query params: ?empresaId=xxx&marcaId=xxx&categoria=xxx&activo=true
Response: {
  productos: Producto[];
  total: number;
  page: number;
  limit: number;
}

// GET /productos/:id
Response: {
  producto: Producto;
  stock: MovimientoStock[];  // Últimos movimientos
}

// POST /productos
Request: Omit<Producto, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  producto: Producto;
}

// PUT /productos/:id
Request: Partial<Producto>
Response: {
  producto: Producto;
}

// DELETE /productos/:id
Response: {
  success: boolean;
}

// GET /productos/:id/stock
// Query params: ?puntoVentaId=xxx
Response: {
  stock: number;
  stockMinimo: number;
  movimientos: MovimientoStock[];
}

// POST /productos/:id/stock/ajustar
Request: {
  puntoVentaId: string;
  cantidad: number;  // Positivo o negativo
  tipo: 'ajuste' | 'merma' | 'entrada' | 'salida';
  motivo?: string;
}
Response: {
  movimiento: MovimientoStock;
  nuevoStock: number;
}
```

---

### **7. PEDIDOS (TPV)**

```typescript
// GET /pedidos
// Query params: ?empresaId=xxx&marcaId=xxx&puntoVentaId=xxx&estado=xxx&fecha=yyyy-mm-dd
Response: {
  pedidos: Pedido[];
  total: number;
}

// GET /pedidos/:id
Response: {
  pedido: Pedido;
  lineas: PedidoLinea[];
  cliente?: User;
}

// POST /pedidos
Request: {
  empresaId: string;
  marcaId: string;
  puntoVentaId: string;
  tipo: 'mesa' | 'recoger' | 'domicilio';
  mesa?: string;
  clienteId?: string;
  clienteNombre?: string;
  lineas: Array<{
    productoId: string;
    cantidad: number;
    modificadores?: any;
  }>;
  metodoPago: string;
  notas?: string;
}
Response: {
  pedido: Pedido;
  numeroPedido: string;
}

// PUT /pedidos/:id
Request: {
  estado?: 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  notas?: string;
}
Response: {
  pedido: Pedido;
}

// POST /pedidos/:id/pagar
Request: {
  metodoPago: 'efectivo' | 'tarjeta' | 'mixto';
  montoEfectivo?: number;
  montoTarjeta?: number;
  propina?: number;
}
Response: {
  pedido: Pedido;
  operacionCaja: OperacionCaja;
}

// POST /pedidos/:id/cancelar
Request: {
  motivo: string;
}
Response: {
  pedido: Pedido;
}

// DELETE /pedidos/:id
Response: {
  success: boolean;
}
```

---

### **8. CAJA**

```typescript
// POST /caja/apertura
Request: {
  cajaId: string;
  efectivoInicial: number;
  puntoVentaId: string;
}
Response: {
  turno: TurnoCaja;
}

// POST /caja/retirada
Request: {
  turnoCajaId: string;
  monto: number;
  motivo?: string;
}
Response: {
  operacion: OperacionCaja;
}

// POST /caja/arqueo
Request: {
  turnoCajaId: string;
  efectivoContado: number;
}
Response: {
  operacion: OperacionCaja;
  diferencia: number;
}

// POST /caja/cierre
Request: {
  turnoCajaId: string;
  efectivoReal: number;
  notas?: string;
}
Response: {
  turno: TurnoCaja;
  resumen: {
    ventas: number;
    retiradas: number;
    diferencia: number;
  };
}

// GET /caja/turno/:id
Response: {
  turno: TurnoCaja;
  operaciones: OperacionCaja[];
  resumen: any;
}

// GET /caja/historial
// Query params: ?puntoVentaId=xxx&fechaInicio=xxx&fechaFin=xxx
Response: {
  turnos: TurnoCaja[];
}
```

---

### **9. EMPLEADOS**

```typescript
// GET /empleados
// Query params: ?empresaId=xxx&marcaId=xxx&activo=true
Response: {
  empleados: Empleado[];
}

// GET /empleados/:id
Response: {
  empleado: Empleado;
  permisos: PermisoEmpleado[];
  fichajes: Fichaje[];
}

// POST /empleados
Request: Omit<Empleado, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  empleado: Empleado;
  usuario: User;  // Usuario creado automáticamente
}

// PUT /empleados/:id
Request: Partial<Empleado>
Response: {
  empleado: Empleado;
}

// DELETE /empleados/:id
Response: {
  success: boolean;
}

// POST /empleados/:id/documentos
Request: FormData
Response: {
  documento: Documento;
}

// GET /empleados/:id/documentos
Response: {
  documentos: Documento[];
}
```

---

### **10. PERMISOS**

```typescript
// GET /permisos
// Query params: ?empleadoId=xxx&estado=xxx
Response: {
  permisos: PermisoEmpleado[];
}

// GET /permisos/:id
Response: {
  permiso: PermisoEmpleado;
  empleado: Empleado;
}

// POST /permisos
Request: {
  empleadoId: string;
  tipo: string;
  fechaInicio: Date;
  fechaFin: Date;
  motivo?: string;
}
Response: {
  permiso: PermisoEmpleado;
}

// PUT /permisos/:id/aprobar
Request: {
  aprobadoPorId: string;
}
Response: {
  permiso: PermisoEmpleado;
}

// PUT /permisos/:id/rechazar
Request: {
  aprobadoPorId: string;
  motivoRechazo: string;
}
Response: {
  permiso: PermisoEmpleado;
}

// DELETE /permisos/:id
Response: {
  success: boolean;
}
```

---

### **11. FICHAJES**

```typescript
// POST /fichajes/entrada
Request: {
  empleadoId: string;
  puntoVentaId: string;
  latitud?: number;
  longitud?: number;
}
Response: {
  fichaje: Fichaje;
}

// POST /fichajes/salida
Request: {
  empleadoId: string;
  puntoVentaId: string;
  latitud?: number;
  longitud?: number;
}
Response: {
  fichaje: Fichaje;
  horasTrabajadas: number;
}

// GET /fichajes
// Query params: ?empleadoId=xxx&fecha=yyyy-mm-dd
Response: {
  fichajes: Fichaje[];
  horasTotales: number;
}

// GET /fichajes/resumen
// Query params: ?empleadoId=xxx&mes=11&año=2025
Response: {
  diasTrabajados: number;
  horasTotales: number;
  fichajes: Fichaje[];
}
```

---

### **12. CONVERSACIONES Y CHAT**

```typescript
// GET /conversaciones
// Query params: ?tipo=xxx&estado=xxx&clienteId=xxx
Response: {
  conversaciones: Conversacion[];
}

// GET /conversaciones/:id
Response: {
  conversacion: Conversacion;
  mensajes: Mensaje[];
  participantes: User[];
}

// POST /conversaciones
Request: {
  tipo: string;
  asunto: string;
  mensaje: string;
  empresaId: string;
  puntoVentaId?: string;
}
Response: {
  conversacion: Conversacion;
  mensaje: Mensaje;
}

// POST /conversaciones/:id/mensajes
Request: {
  contenido: string;
  adjuntos?: string[];
}
Response: {
  mensaje: Mensaje;
}

// PUT /conversaciones/:id/estado
Request: {
  estado: 'abierto' | 'en_proceso' | 'resuelto' | 'cerrado';
}
Response: {
  conversacion: Conversacion;
}

// PUT /conversaciones/:id/valorar
Request: {
  valoracion: number;  // 1-5
}
Response: {
  conversacion: Conversacion;
}

// PUT /mensajes/:id/leer
Response: {
  mensaje: Mensaje;
}
```

---

### **13. NOTIFICACIONES**

```typescript
// GET /notificaciones
// Query params: ?leido=false&tipo=xxx
Response: {
  notificaciones: Notificacion[];
  noLeidas: number;
}

// PUT /notificaciones/:id/leer
Response: {
  notificacion: Notificacion;
}

// PUT /notificaciones/leer-todas
Response: {
  marcadas: number;
}

// DELETE /notificaciones/:id
Response: {
  success: boolean;
}

// POST /notificaciones/configuracion
Request: {
  email: boolean;
  push: boolean;
  sms: boolean;
  tipos: string[];  // Qué tipos de notificaciones recibir
}
Response: {
  configuracion: any;
}
```

---

### **14. PROVEEDORES**

```typescript
// GET /proveedores
// Query params: ?empresaId=xxx&activo=true
Response: {
  proveedores: Proveedor[];
}

// GET /proveedores/:id
Response: {
  proveedor: Proveedor;
  pedidos: PedidoProveedor[];
}

// POST /proveedores
Request: Omit<Proveedor, 'id' | 'createdAt' | 'updatedAt'>
Response: {
  proveedor: Proveedor;
}

// PUT /proveedores/:id
Request: Partial<Proveedor>
Response: {
  proveedor: Proveedor;
}

// DELETE /proveedores/:id
Response: {
  success: boolean;
}

// POST /proveedores/:id/pedidos
Request: {
  puntoVentaId: string;
  productos: Array<{
    productoId: string;
    cantidad: number;
  }>;
  fechaEsperada?: Date;
}
Response: {
  pedido: PedidoProveedor;
}
```

---

### **15. REPORTES Y ANALYTICS**

```typescript
// GET /reportes/ventas
// Query params: ?empresaId=xxx&marcaId=xxx&puntoVentaId=xxx&fechaInicio=xxx&fechaFin=xxx
Response: {
  ventasTotales: number;
  pedidosTotales: number;
  ticketPromedio: number;
  productosMasVendidos: Array<{
    producto: Producto;
    cantidad: number;
    ingresos: number;
  }>;
  ventasPorDia: Array<{
    fecha: string;
    ventas: number;
  }>;
}

// GET /reportes/caja
// Query params: ?puntoVentaId=xxx&fechaInicio=xxx&fechaFin=xxx
Response: {
  totalEfectivo: number;
  totalTarjeta: number;
  totalRetiradas: number;
  diferencias: number;
  turnos: TurnoCaja[];
}

// GET /reportes/stock
// Query params: ?empresaId=xxx&marcaId=xxx&puntoVentaId=xxx
Response: {
  productosStockBajo: Producto[];
  productosStockCero: Producto[];
  valorInventario: number;
}

// GET /reportes/empleados
// Query params: ?empresaId=xxx&mes=11&año=2025
Response: {
  horasTrabajadas: Array<{
    empleado: Empleado;
    horasTotales: number;
    diasTrabajados: number;
  }>;
  permisosAprobados: number;
  permisosPendientes: number;
}

// GET /reportes/ebitda
// Query params: ?empresaId=xxx&periodo=mes&año=2025
Response: {
  ingresos: number;
  gastos: number;
  ebitda: number;
  margen: number;
  desglose: {
    ventas: number;
    costoVentas: number;
    gastosOperativos: number;
    gastosPersonal: number;
  };
}
```

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### **JWT Token**

```typescript
// Token payload
{
  userId: string;
  email: string;
  role: 'cliente' | 'trabajador' | 'gerente';
  empresaId?: string;
  iat: number;
  exp: number;
}

// Headers requeridos en cada petición
Authorization: Bearer <token>
```

### **Refresh Token**

- Válido por 30 días
- Se usa para obtener un nuevo access token
- Se invalida al hacer logout

### **Permisos por Rol**

```typescript
// CLIENTE
- Ver/editar sus empresas, marcas y puntos de venta
- Ver pedidos de sus empresas
- Chatear con sus puntos de venta
- Ver reportes de sus empresas

// TRABAJADOR
- Ver pedidos de su punto de venta
- Crear/editar pedidos
- Fichar entrada/salida
- Solicitar permisos
- Chatear con gerentes
- Ver su documentación laboral

// GERENTE
- Todo lo que puede hacer un trabajador
- Gestionar empleados
- Aprobar/rechazar permisos
- Ver todos los reportes
- Gestionar configuración de la empresa
- Gestionar proveedores
- Ver EBITDA y finanzas
```

---

## 🔄 WEBSOCKETS (TIEMPO REAL)

### **Namespace:** `/ws`

#### **Eventos del Cliente → Servidor**

```typescript
// Conectar
socket.emit('authenticate', { token: 'jwt-token' });

// Unirse a sala de empresa
socket.emit('join:empresa', { empresaId: 'xxx' });

// Unirse a sala de punto de venta
socket.emit('join:puntoVenta', { puntoVentaId: 'xxx' });

// Nuevo mensaje en chat
socket.emit('mensaje:enviar', {
  conversacionId: 'xxx',
  contenido: 'Hola',
});

// Actualizar estado de pedido
socket.emit('pedido:actualizar', {
  pedidoId: 'xxx',
  estado: 'preparando',
});
```

#### **Eventos del Servidor → Cliente**

```typescript
// Nuevo pedido
socket.on('pedido:nuevo', (pedido: Pedido) => {
  // Mostrar notificación
  // Actualizar lista de pedidos
});

// Pedido actualizado
socket.on('pedido:actualizado', (pedido: Pedido) => {
  // Actualizar UI
});

// Nuevo mensaje
socket.on('mensaje:nuevo', (mensaje: Mensaje) => {
  // Mostrar en chat
  // Notificación push
});

// Nueva notificación
socket.on('notificacion:nueva', (notificacion: Notificacion) => {
  // Mostrar badge
  // Toast notification
});

// Fichaje de empleado
socket.on('fichaje:nuevo', (fichaje: Fichaje) => {
  // Actualizar lista de empleados activos
});

// Stock bajo
socket.on('stock:bajo', (producto: Producto) => {
  // Alerta al gerente
});
```

---

## 🔗 INTEGRACIÓN CON MAKE.COM

### **Webhooks Configurados**

#### **1. Nuevo Pedido**
```
URL: https://hook.eu2.make.com/xxx/nuevo-pedido
Method: POST
Trigger: Cuando se crea un pedido

Payload:
{
  pedidoId: string;
  numeroPedido: string;
  cliente: { nombre, telefono, email };
  lineas: PedidoLinea[];
  total: number;
  puntoVenta: PuntoVenta;
}

Acciones en Make.com:
- Enviar email de confirmación al cliente
- Enviar SMS si es delivery
- Notificar a cocina (impresión automática)
- Actualizar Google Sheets de pedidos
```

#### **2. Nuevo Empleado**
```
URL: https://hook.eu2.make.com/xxx/nuevo-empleado
Method: POST
Trigger: Cuando se crea un empleado

Payload:
{
  empleadoId: string;
  nombre: string;
  email: string;
  puesto: string;
  fechaIngreso: Date;
}

Acciones en Make.com:
- Enviar email de bienvenida
- Crear carpeta en Google Drive
- Añadir a calendario de turnos
- Notificar a RRHH
```

#### **3. Stock Bajo**
```
URL: https://hook.eu2.make.com/xxx/stock-bajo
Method: POST
Trigger: Cuando stock < stockMinimo

Payload:
{
  productoId: string;
  nombre: string;
  stock: number;
  stockMinimo: number;
  puntoVenta: PuntoVenta;
}

Acciones en Make.com:
- Enviar email al gerente
- Crear tarea en Trello
- Enviar mensaje a Slack
- Actualizar hoja de inventario
```

#### **4. Permiso Solicitado**
```
URL: https://hook.eu2.make.com/xxx/permiso-solicitado
Method: POST
Trigger: Cuando empleado solicita permiso

Payload:
{
  permisoId: string;
  empleado: Empleado;
  tipo: string;
  fechas: { inicio, fin };
  motivo: string;
}

Acciones en Make.com:
- Enviar email al gerente para aprobación
- Notificar a RRHH
- Crear evento en Google Calendar (pendiente)
```

**Documentación completa:** Ver `/docs/MAKE_AUTOMATION_TPV360.md`

---

## ⚙️ VARIABLES DE ENTORNO

### **Archivo: `.env`**

```bash
# ============================================================================
# BACKEND CONFIGURATION - UDAR EDGE
# ============================================================================

# -----------------------------------------------------------------------------
# APPLICATION
# -----------------------------------------------------------------------------
NODE_ENV=production
APP_NAME=UdarEdge
APP_URL=https://udaredge.com
API_URL=https://api.udaredge.com/v1
PORT=3000

# -----------------------------------------------------------------------------
# DATABASE (PostgreSQL recomendado)
# -----------------------------------------------------------------------------
DB_HOST=localhost
DB_PORT=5432
DB_NAME=udar_edge
DB_USER=postgres
DB_PASSWORD=tu_password_seguro
DB_SSL=true
DB_POOL_MIN=2
DB_POOL_MAX=10

# -----------------------------------------------------------------------------
# JWT & AUTHENTICATION
# -----------------------------------------------------------------------------
JWT_SECRET=tu_secreto_jwt_muy_seguro_aqui_256_bits
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=tu_secreto_refresh_muy_seguro_aqui
REFRESH_TOKEN_EXPIRATION=30d

# -----------------------------------------------------------------------------
# OAUTH (Social Login)
# -----------------------------------------------------------------------------
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
GOOGLE_REDIRECT_URI=https://udaredge.com/auth/google/callback

FACEBOOK_APP_ID=tu_facebook_app_id
FACEBOOK_APP_SECRET=tu_facebook_app_secret
FACEBOOK_REDIRECT_URI=https://udaredge.com/auth/facebook/callback

APPLE_CLIENT_ID=tu_apple_client_id
APPLE_TEAM_ID=tu_apple_team_id
APPLE_KEY_ID=tu_apple_key_id
APPLE_PRIVATE_KEY=tu_apple_private_key

# -----------------------------------------------------------------------------
# EMAIL (SendGrid recomendado)
# -----------------------------------------------------------------------------
SENDGRID_API_KEY=tu_sendgrid_api_key
EMAIL_FROM=noreply@udaredge.com
EMAIL_FROM_NAME=Udar Edge

# -----------------------------------------------------------------------------
# SMS (Twilio recomendado)
# -----------------------------------------------------------------------------
TWILIO_ACCOUNT_SID=tu_twilio_account_sid
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=+34912345678

# -----------------------------------------------------------------------------
# STORAGE (AWS S3 recomendado)
# -----------------------------------------------------------------------------
AWS_ACCESS_KEY_ID=tu_aws_access_key
AWS_SECRET_ACCESS_KEY=tu_aws_secret_key
AWS_REGION=eu-west-1
AWS_S3_BUCKET=udar-edge-documents
AWS_S3_URL=https://udar-edge-documents.s3.eu-west-1.amazonaws.com

# Alternativa: Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloudinary_cloud_name
CLOUDINARY_API_KEY=tu_cloudinary_api_key
CLOUDINARY_API_SECRET=tu_cloudinary_api_secret

# -----------------------------------------------------------------------------
# WEBSOCKETS
# -----------------------------------------------------------------------------
SOCKET_IO_PORT=3001
SOCKET_IO_CORS_ORIGIN=https://udaredge.com,http://localhost:5173

# -----------------------------------------------------------------------------
# MAKE.COM WEBHOOKS
# -----------------------------------------------------------------------------
MAKE_WEBHOOK_NUEVO_PEDIDO=https://hook.eu2.make.com/xxx/nuevo-pedido
MAKE_WEBHOOK_NUEVO_EMPLEADO=https://hook.eu2.make.com/xxx/nuevo-empleado
MAKE_WEBHOOK_STOCK_BAJO=https://hook.eu2.make.com/xxx/stock-bajo
MAKE_WEBHOOK_PERMISO_SOLICITADO=https://hook.eu2.make.com/xxx/permiso-solicitado

# -----------------------------------------------------------------------------
# REDIS (Para cache y sessions)
# -----------------------------------------------------------------------------
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password
REDIS_DB=0

# -----------------------------------------------------------------------------
# STRIPE (Para pagos y suscripciones)
# -----------------------------------------------------------------------------
STRIPE_PUBLIC_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# -----------------------------------------------------------------------------
# MONITORING & LOGGING
# -----------------------------------------------------------------------------
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info

# -----------------------------------------------------------------------------
# RATE LIMITING
# -----------------------------------------------------------------------------
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------
CORS_ORIGINS=https://udaredge.com,http://localhost:5173
```

---

## 🧪 TESTING

### **Tests Requeridos**

```bash
# Unit Tests
npm run test:unit

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage (mínimo 80%)
npm run test:coverage
```

### **Casos de Prueba Críticos**

1. **Autenticación**
   - ✅ Login exitoso
   - ✅ Login con credenciales incorrectas
   - ✅ Registro de nuevo usuario
   - ✅ Refresh token
   - ✅ Logout

2. **Multiempresa**
   - ✅ Crear empresa
   - ✅ Crear marca dentro de empresa
   - ✅ Crear punto de venta
   - ✅ Filtrado correcto por EmpresaId/MarcaId/PuntoVentaId

3. **Pedidos**
   - ✅ Crear pedido
   - ✅ Actualizar estado de pedido
   - ✅ Pago de pedido (efectivo/tarjeta/mixto)
   - ✅ Cancelar pedido
   - ✅ Descuento de stock automático

4. **Caja**
   - ✅ Apertura de caja
   - ✅ Registro de venta
   - ✅ Retirada de efectivo
   - ✅ Arqueo de caja
   - ✅ Cierre de caja con diferencia

5. **Empleados**
   - ✅ Crear empleado
   - ✅ Fichaje entrada/salida
   - ✅ Solicitud de permiso
   - ✅ Aprobación/rechazo de permiso

6. **Websockets**
   - ✅ Conexión exitosa
   - ✅ Autenticación con JWT
   - ✅ Unirse a salas
   - ✅ Recepción de eventos en tiempo real

---

## 📦 DESPLIEGUE

### **Stack Tecnológico Recomendado**

```
Frontend:  Vercel / Netlify / AWS Amplify
Backend:   AWS EC2 / DigitalOcean / Heroku / Railway
Database:  AWS RDS (PostgreSQL) / Supabase / PlanetScale
Storage:   AWS S3 / Cloudinary
Cache:     Redis (AWS ElastiCache / Upstash)
WebSocket: Socket.io en mismo servidor backend
Monitoring: Sentry + DataDog / New Relic
```

### **Proceso de Despliegue**

```bash
# 1. Build del backend
npm run build

# 2. Migraciones de BD
npm run db:migrate

# 3. Seeds (datos iniciales)
npm run db:seed

# 4. Start en producción
npm run start:prod
```

### **Health Checks**

```typescript
// GET /health
Response: {
  status: 'ok',
  timestamp: Date,
  uptime: number,
  database: 'connected',
  redis: 'connected'
}

// GET /health/ready
Response: {
  ready: boolean,
  services: {
    database: boolean,
    redis: boolean,
    s3: boolean
  }
}
```

---

## 📞 CONTACTO Y SOPORTE

### **Equipo Frontend**
- **Desarrollador:** [Nombre]
- **Email:** frontend@udaredge.com

### **Documentación Adicional**

1. `/AMARRE_GLOBAL_UDAR_DELIVERY360.md` - Reglas de multiempresa
2. `/ARQUITECTURA_MULTIEMPRESA_SAAS.md` - Arquitectura completa
3. `/SISTEMA_PERMISOS_EMPLEADO.md` - Sistema de permisos
4. `/SISTEMA_FILTRO_UNIVERSAL_UDAR.md` - Filtro jerárquico
5. `/docs/DATABASE_SCHEMA_TPV360.sql` - Schema completo de BD
6. `/docs/MAKE_AUTOMATION_TPV360.md` - Automatizaciones Make.com

### **Repositorio**
- GitHub: `https://github.com/udaredge/frontend`
- Docs: `https://docs.udaredge.com`

---

## ✅ CHECKLIST PARA EL BACKEND DEVELOPER

### **Antes de empezar:**
- [ ] Leer esta guía completa
- [ ] Revisar `/AMARRE_GLOBAL_UDAR_DELIVERY360.md`
- [ ] Revisar schema de BD en `/docs/DATABASE_SCHEMA_TPV360.sql`
- [ ] Configurar variables de entorno
- [ ] Crear base de datos local

### **Durante el desarrollo:**
- [ ] Implementar autenticación JWT
- [ ] Crear endpoints de empresas/marcas/puntos de venta
- [ ] Implementar AMARRE GLOBAL en todas las queries
- [ ] Crear endpoints de productos y stock
- [ ] Crear endpoints de pedidos (TPV)
- [ ] Crear endpoints de caja
- [ ] Crear endpoints de empleados y permisos
- [ ] Implementar WebSockets para tiempo real
- [ ] Configurar webhooks de Make.com
- [ ] Implementar subida de archivos (S3/Cloudinary)
- [ ] Crear endpoints de reportes
- [ ] Testing completo (>80% coverage)

### **Antes del despliegue:**
- [ ] Revisar toda la documentación de endpoints
- [ ] Validar que todos los endpoints incluyen EmpresaId/MarcaId/PuntoVentaId
- [ ] Testing en staging
- [ ] Configurar monitoring (Sentry)
- [ ] Configurar backups de BD
- [ ] Documentar API con Swagger/OpenAPI
- [ ] Crear postman collection
- [ ] Deploy en producción

---

## 🎉 ¡LISTO PARA EMPEZAR!

Esta guía contiene toda la información necesaria para desarrollar el backend de **Udar Edge**. 

**Recuerda:** La regla más importante es el **AMARRE GLOBAL** - todas las queries deben filtrar por EmpresaId, MarcaId y PuntoVentaId cuando corresponda.

**¡Mucha suerte con el desarrollo! 🚀**

---

**Versión:** 1.0.0  
**Última actualización:** 27 Noviembre 2025
