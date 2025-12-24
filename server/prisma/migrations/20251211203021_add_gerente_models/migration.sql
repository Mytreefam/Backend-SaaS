-- CreateTable
CREATE TABLE "Empleado" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "foto" TEXT,
    "puesto" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "marcaId" TEXT,
    "puntoVentaId" TEXT NOT NULL,
    "horarioEntrada" TEXT NOT NULL,
    "horarioSalida" TEXT NOT NULL,
    "turno" TEXT,
    "salarioBase" DOUBLE PRECISION NOT NULL,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "desempeno" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "horasMes" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fichaje" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "horaRealTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horaTeorica" TEXT,
    "diferenciaMinutos" INTEGER NOT NULL DEFAULT 0,
    "puntoVentaId" TEXT NOT NULL,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "validadoPor" INTEGER,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fichaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarea" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3),
    "fechaCompletada" TIMESTAMP(3),
    "requiereReporte" BOOLEAN NOT NULL DEFAULT false,
    "reporteEmpleado" TEXT,
    "asignadoPor" INTEGER NOT NULL,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "aprobada" BOOLEAN,
    "comentarioGerente" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticuloStock" (
    "id" SERIAL NOT NULL,
    "codigoInterno" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "unidadMedida" TEXT NOT NULL,
    "stockActual" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMinimo" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stockMaximo" DOUBLE PRECISION NOT NULL DEFAULT 999999,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "proveedorId" INTEGER,
    "precioUltimaCompra" DOUBLE PRECISION,
    "fechaUltimaCompra" TIMESTAMP(3),
    "ubicacionAlmacen" TEXT,
    "alertaStockBajo" BOOLEAN NOT NULL DEFAULT false,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArticuloStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" SERIAL NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "stockAnterior" DOUBLE PRECISION NOT NULL,
    "stockPosterior" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "observaciones" TEXT,
    "usuarioId" INTEGER,
    "usuarioNombre" TEXT,
    "pedidoProveedorId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT,
    "categoria" TEXT NOT NULL,
    "contactoNombre" TEXT,
    "contactoTelefono" TEXT,
    "contactoEmail" TEXT,
    "direccion" TEXT,
    "ciudad" TEXT,
    "codigoPostal" TEXT,
    "pais" TEXT NOT NULL DEFAULT 'España',
    "empresaId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "diasEntrega" INTEGER,
    "formaPago" TEXT,
    "descuentoAplicado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalPedidos" INTEGER NOT NULL DEFAULT 0,
    "totalCompras" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fechaUltimoPedido" TIMESTAMP(3),
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoProveedor" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "proveedorId" INTEGER NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "fechaPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntregaEstimada" TIMESTAMP(3),
    "fechaRecepcion" TIMESTAMP(3),
    "subtotal" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "observaciones" TEXT,
    "creadoPor" INTEGER,
    "recibidoPor" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedidoProveedor" (
    "id" SERIAL NOT NULL,
    "pedidoProveedorId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "nombreArticulo" TEXT NOT NULL,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "cantidadRecibida" DOUBLE PRECISION,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedidoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CierreCaja" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "turno" TEXT NOT NULL,
    "empleadoAperturaId" INTEGER,
    "empleadoCierreId" INTEGER,
    "efectivoInicial" DOUBLE PRECISION NOT NULL,
    "totalVentasEfectivo" DOUBLE PRECISION NOT NULL,
    "totalVentasTarjeta" DOUBLE PRECISION NOT NULL,
    "totalVentasOnline" DOUBLE PRECISION NOT NULL,
    "gastosCaja" DOUBLE PRECISION NOT NULL,
    "efectivoEsperado" DOUBLE PRECISION NOT NULL,
    "efectivoContado" DOUBLE PRECISION NOT NULL,
    "diferencia" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'cerrado',
    "observaciones" TEXT,
    "validadoPor" INTEGER,
    "fechaValidacion" TIMESTAMP(3),
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CierreCaja_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_email_key" ON "Empleado"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ArticuloStock_codigoInterno_key" ON "ArticuloStock"("codigoInterno");

-- CreateIndex
CREATE UNIQUE INDEX "PedidoProveedor_numero_key" ON "PedidoProveedor"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "CierreCaja_numero_key" ON "CierreCaja"("numero");

-- AddForeignKey
ALTER TABLE "Fichaje" ADD CONSTRAINT "Fichaje_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarea" ADD CONSTRAINT "Tarea_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticuloStock" ADD CONSTRAINT "ArticuloStock_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_articuloId_fkey" FOREIGN KEY ("articuloId") REFERENCES "ArticuloStock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoProveedor" ADD CONSTRAINT "PedidoProveedor_proveedorId_fkey" FOREIGN KEY ("proveedorId") REFERENCES "Proveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedidoProveedor" ADD CONSTRAINT "ItemPedidoProveedor_pedidoProveedorId_fkey" FOREIGN KEY ("pedidoProveedorId") REFERENCES "PedidoProveedor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreCaja" ADD CONSTRAINT "CierreCaja_empleadoAperturaId_fkey" FOREIGN KEY ("empleadoAperturaId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CierreCaja" ADD CONSTRAINT "CierreCaja_empleadoCierreId_fkey" FOREIGN KEY ("empleadoCierreId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
