-- ================================================
-- EXTENSIONES SCHEMA PRISMA PARA MÓDULO GERENTE
-- ================================================
-- Este archivo documenta los modelos y campos que deben agregarse
-- al schema.prisma para soportar las funcionalidades del gerente

-- ================================================
-- 1. MODELO: Empleado
-- ================================================
model Empleado {
  id                  Int       @id @default(autoincrement())
  nombre              String
  email               String    @unique
  telefono            String?
  foto                String?
  puesto              String    // Panadero, Cajero, Repartidor, Gerente
  
  // Multiempresa
  empresaId           String
  marcaId             String?
  puntoVentaId        String
  
  // Horarios
  horarioEntrada      String    // HH:mm
  horarioSalida       String    // HH:mm
  turno               String?   // mañana, tarde, noche
  
  // Condiciones laborales
  salarioBase         Float
  fechaAlta           DateTime  @default(now())
  fechaBaja           DateTime?
  estado              String    @default("activo") // activo, inactivo, vacaciones, baja
  
  // Métricas
  desempeño           Float     @default(0)
  horasMes            Float     @default(0)
  
  // Relaciones
  fichajes            Fichaje[]
  tareas              Tarea[]
  
  creadoEn            DateTime  @default(now())
  modificadoEn        DateTime  @updatedAt
}

-- ================================================
-- 2. MODELO: Fichaje
-- ================================================
model Fichaje {
  id                  Int       @id @default(autoincrement())
  
  empleadoId          Int
  empleado            Empleado  @relation(fields: [empleadoId], references: [id])
  
  tipo                String    // entrada, salida, descanso
  fecha               DateTime
  hora                String    // HH:mm
  horaRealTimestamp   DateTime  @default(now())
  
  horaTeorica         String?   // HH:mm - hora que debería haber fichado
  diferenciaMinutos   Int       @default(0)
  
  puntoVentaId        String
  
  validado            Boolean   @default(false)
  validadoPor         Int?
  observaciones       String?
  
  creadoEn            DateTime  @default(now())
}

-- ================================================
-- 3. MODELO: Tarea
-- ================================================
model Tarea {
  id                  Int       @id @default(autoincrement())
  
  empleadoId          Int
  empleado            Empleado  @relation(fields: [empleadoId], references: [id])
  
  titulo              String
  descripcion         String?
  prioridad           String    @default("media") // baja, media, alta, urgente
  estado              String    @default("pendiente") // pendiente, en-progreso, completada, cancelada
  
  fechaAsignacion     DateTime  @default(now())
  fechaLimite         DateTime?
  fechaCompletada     DateTime?
  
  requiereReporte     Boolean   @default(false)
  reporteEmpleado     String?
  
  asignadoPor         Int       // ID del gerente
  requiereAprobacion  Boolean   @default(false)
  aprobada            Boolean?
  comentarioGerente   String?
  
  creadoEn            DateTime  @default(now())
  modificadoEn        DateTime  @updatedAt
}

-- ================================================
-- 4. MODELO: ArticuloStock
-- ================================================
model ArticuloStock {
  id                  Int       @id @default(autoincrement())
  
  codigoInterno       String    @unique
  nombre              String
  categoria           String    // Materias Primas, Envases, Limpieza, etc.
  unidadMedida        String    // kg, litro, unidad
  
  // Stock
  stockActual         Float     @default(0)
  stockMinimo         Float     @default(0)
  stockMaximo         Float     @default(999999)
  
  // Multiempresa
  empresaId           String
  puntoVentaId        String
  
  // Proveedor
  proveedorId         Int?
  proveedor           Proveedor? @relation(fields: [proveedorId], references: [id])
  
  precioUltimaCompra  Float?
  fechaUltimaCompra   DateTime?
  
  ubicacionAlmacen    String?
  alertaStockBajo     Boolean   @default(false)
  
  // Relaciones
  movimientos         MovimientoStock[]
  
  creadoEn            DateTime  @default(now())
  modificadoEn        DateTime  @updatedAt
}

-- ================================================
-- 5. MODELO: MovimientoStock
-- ================================================
model MovimientoStock {
  id                  Int       @id @default(autoincrement())
  
  articuloId          Int
  articulo            ArticuloStock @relation(fields: [articuloId], references: [id])
  
  tipo                String    // entrada, salida, ajuste, merma
  cantidad            Float
  
  stockAnterior       Float
  stockPosterior      Float
  
  motivo              String?
  observaciones       String?
  
  // Usuario que realiza el movimiento
  usuarioId           Int?
  usuarioNombre       String?
  
  // Relación con pedido a proveedor (si es entrada)
  pedidoProveedorId   Int?
  
  fecha               DateTime  @default(now())
  creadoEn            DateTime  @default(now())
}

-- ================================================
-- 6. MODELO: Proveedor
-- ================================================
model Proveedor {
  id                  Int       @id @default(autoincrement())
  
  nombre              String
  cif                 String?
  categoria           String    // Materia Prima, Servicios, Equipamiento
  
  // Contacto
  contactoNombre      String?
  contactoTelefono    String?
  contactoEmail       String?
  
  // Dirección
  direccion           String?
  ciudad              String?
  codigoPostal        String?
  pais                String    @default("España")
  
  // Multiempresa
  empresaId           String
  
  // Estado
  activo              Boolean   @default(true)
  
  // Condiciones comerciales
  diasEntrega         Int?
  formaPago           String?   // Transferencia 30 días, Contado, etc.
  descuentoAplicado   Float     @default(0)
  
  // Estadísticas
  totalPedidos        Int       @default(0)
  totalCompras        Float     @default(0)
  fechaUltimoPedido   DateTime?
  
  // Relaciones
  articulos           ArticuloStock[]
  pedidos             PedidoProveedor[]
  
  fechaAlta           DateTime  @default(now())
  creadoEn            DateTime  @default(now())
  modificadoEn        DateTime  @updatedAt
}

-- ================================================
-- 7. MODELO: PedidoProveedor
-- ================================================
model PedidoProveedor {
  id                      Int       @id @default(autoincrement())
  
  numero                  String    @unique
  
  proveedorId             Int
  proveedor               Proveedor @relation(fields: [proveedorId], references: [id])
  
  puntoVentaId            String
  empresaId               String
  
  estado                  String    @default("pendiente") // pendiente, enviado, recibido, cancelado
  
  fechaPedido             DateTime  @default(now())
  fechaEntregaEstimada    DateTime?
  fechaRecepcion          DateTime?
  
  subtotal                Float
  iva                     Float
  total                   Float
  
  observaciones           String?
  
  // Items del pedido
  items                   ItemPedidoProveedor[]
  
  // Usuario que crea el pedido
  creadoPor               Int?
  recibidoPor             Int?
  
  creadoEn                DateTime  @default(now())
  modificadoEn            DateTime  @updatedAt
}

-- ================================================
-- 8. MODELO: ItemPedidoProveedor
-- ================================================
model ItemPedidoProveedor {
  id                  Int       @id @default(autoincrement())
  
  pedidoProveedorId   Int
  pedidoProveedor     PedidoProveedor @relation(fields: [pedidoProveedorId], references: [id])
  
  articuloId          Int
  nombreArticulo      String
  
  cantidad            Float
  precioUnitario      Float
  total               Float
  
  cantidadRecibida    Float?
  observaciones       String?
  
  creadoEn            DateTime  @default(now())
}

-- ================================================
-- 9. MODELO: CierreCaja
-- ================================================
model CierreCaja {
  id                      Int       @id @default(autoincrement())
  
  numero                  String    @unique
  
  puntoVentaId            String
  empresaId               String
  
  fecha                   DateTime  @default(now())
  turno                   String    // mañana, tarde, noche
  
  // Empleados
  empleadoAperturaId      Int?
  empleadoCierreId        Int?
  
  // Efectivo
  efectivoInicial         Float
  totalVentasEfectivo     Float
  totalVentasTarjeta      Float
  totalVentasOnline       Float
  gastosCaja              Float
  
  efectivoEsperado        Float
  efectivoContado         Float
  diferencia              Float
  
  // Estado
  estado                  String    @default("cerrado") // abierto, cerrado, validado
  observaciones           String?
  
  // Validación
  validadoPor             Int?
  fechaValidacion         DateTime?
  
  creadoEn                DateTime  @default(now())
  modificadoEn            DateTime  @updatedAt
}

-- ================================================
-- 10. EXTENSIONES A MODELOS EXISTENTES
-- ================================================

-- Agregar a modelo Producto:
-- empresaId           String
-- marcaId             String[]  // Array de marcas donde está disponible
-- puntoVentaId        String?   // null = disponible en todos
-- tipoProducto        String    @default("simple") // simple, manufacturado, combo
-- articuloStockId     Int?      // Si es producto simple vinculado a stock
-- escandalloId        Int?      // Si es producto manufacturado
-- costoIngredientes   Float?
-- costoEnvases        Float?
-- costoTotal          Float?
-- margenBrutoPct      Float?
-- precioCompra        Float
-- stockMinimo         Int       @default(0)
-- unidad              String    @default("unidad") // unidad, kg, litro
-- activo              Boolean   @default(true)
-- destacado           Boolean   @default(false)
-- visibleApp          Boolean   @default(true)
-- visibleTpv          Boolean   @default(true)
-- iva                 Float     @default(10)
-- categoria           String
-- notas               String?

-- Agregar a modelo Pedido:
-- empresaId           String
-- marcaId             String
-- puntoVentaId        String
-- canal               String    @default("tpv") // tpv, app, web, glovo, justeat, ubereats
-- tipoEntrega         String    // recogida, domicilio
-- direccionEntrega    String?
-- metodoPago          String    // efectivo, tarjeta, online, mixto

-- Agregar a modelo Cliente:
-- empresaId           String?
-- marcaPreferida      String?
-- puntoVentaHabitual  String?
-- tipoCliente         String?   // nuevo, regular, fidelizado, VIP
-- fechaCumpleaños     DateTime?
-- segmentos           String[]  // Tags dinámicos

-- Agregar a modelo Factura:
-- empresaId           String
-- marcaId             String
-- puntoVentaId        String
-- estadoPago          String    @default("pagado") // pendiente, pagado, impago
-- metodoPago          String
-- canal               String
-- estadoVerifactu     Boolean   @default(false)
