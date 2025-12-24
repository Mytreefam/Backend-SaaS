/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `Cliente` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[numero]` on the table `Factura` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `Cliente` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modificadoEn` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero` to the `Factura` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `Factura` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "Factura" DROP CONSTRAINT "Factura_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Factura" DROP CONSTRAINT "Factura_pedidoId_fkey";

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'informacion',
ALTER COLUMN "pedidoId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "codigo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Factura" ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "estadoVerifactu" TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "impuestos" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "marcaId" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "metodoPago" TEXT NOT NULL DEFAULT 'tarjeta',
ADD COLUMN     "modificadoEn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL,
ADD COLUMN     "puntoVentaId" TEXT,
ADD COLUMN     "subtotal" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "fecha" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "pedidoId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LineaFactura" (
    "id" SERIAL NOT NULL,
    "facturaId" INTEGER NOT NULL,
    "productoId" INTEGER,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "descuento" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "LineaFactura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionInventario" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'ciclico',
    "almacen" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "progreso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diferenciasUnidades" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diferenciasValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "responsables" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaLimite" TIMESTAMP(3),
    "fechaFinalizacion" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "observaciones" TEXT,
    "creadoPor" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesionInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LineaInventario" (
    "id" SERIAL NOT NULL,
    "sesionInventarioId" INTEGER NOT NULL,
    "articuloId" INTEGER NOT NULL,
    "codigoArticulo" TEXT NOT NULL,
    "nombreArticulo" TEXT NOT NULL,
    "stockTeorico" DOUBLE PRECISION NOT NULL,
    "stockContado" DOUBLE PRECISION,
    "diferencia" DOUBLE PRECISION,
    "valorDiferencia" DOUBLE PRECISION,
    "contadoPor" INTEGER,
    "fechaConteo" TIMESTAMP(3),
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LineaInventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TareaOperativa" (
    "id" SERIAL NOT NULL,
    "numero" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'operativa',
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "instrucciones" TEXT,
    "empresaId" TEXT NOT NULL,
    "empresaNombre" TEXT,
    "marcaId" TEXT,
    "marcaNombre" TEXT,
    "puntoVentaId" TEXT,
    "puntoVentaNombre" TEXT,
    "asignadoAId" INTEGER,
    "asignadoANombre" TEXT,
    "asignadoPorId" INTEGER,
    "asignadoPorNombre" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "requiereReporte" BOOLEAN NOT NULL DEFAULT true,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT true,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicio" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "fechaCompletada" TIMESTAMP(3),
    "fechaAprobada" TIMESTAMP(3),
    "fechaRevision" TIMESTAMP(3),
    "recurrente" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia" TEXT,
    "diasSemana" TEXT,
    "comentarioTrabajador" TEXT,
    "evidenciaUrls" TEXT,
    "tiempoEmpleado" INTEGER,
    "comentarioGerente" TEXT,
    "esFormacion" BOOLEAN NOT NULL DEFAULT false,
    "moduloFormacionId" TEXT,
    "certificadoUrl" TEXT,
    "puntuacion" DOUBLE PRECISION,
    "duracionEstimada" INTEGER,
    "urlRecurso" TEXT,
    "etiquetas" TEXT,
    "categoria" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TareaOperativa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoEmpresa" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT,
    "categoria" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "archivoUrl" TEXT,
    "archivoNombre" TEXT,
    "tamanoArchivo" INTEGER,
    "mimeType" TEXT,
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3),
    "fechaEmision" TIMESTAMP(3),
    "estado" TEXT NOT NULL DEFAULT 'vigente',
    "costeAsociado" DOUBLE PRECISION,
    "categoriaEBITDA" TEXT,
    "responsable" TEXT,
    "subidoPorId" INTEGER,
    "observaciones" TEXT,
    "etiquetas" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GastoEmpresa" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT,
    "concepto" TEXT NOT NULL,
    "proveedorNombre" TEXT,
    "nifProveedor" TEXT,
    "numeroFactura" TEXT,
    "importe" DOUBLE PRECISION NOT NULL,
    "iva" DOUBLE PRECISION,
    "total" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "subtipo" TEXT,
    "centroCoste" TEXT,
    "fechaGasto" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "metodoPago" TEXT,
    "estadoPago" TEXT NOT NULL DEFAULT 'pendiente',
    "contabilizado" BOOLEAN NOT NULL DEFAULT false,
    "cuentaContable" TEXT,
    "ticketUrl" TEXT,
    "facturaUrl" TEXT,
    "pagoCalendarioId" INTEGER,
    "datosOCR" TEXT,
    "observaciones" TEXT,
    "registradoPorId" INTEGER,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GastoEmpresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PagoCalendario" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT,
    "concepto" TEXT NOT NULL,
    "descripcion" TEXT,
    "monto" DOUBLE PRECISION NOT NULL,
    "categoria" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "fechaRecordatorio" TIMESTAMP(3),
    "estadoPago" TEXT NOT NULL DEFAULT 'pendiente',
    "recurrente" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia" TEXT,
    "diaDelMes" INTEGER,
    "metodoPago" TEXT,
    "observaciones" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PagoCalendario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SesionInventario_numero_key" ON "SesionInventario"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "TareaOperativa_numero_key" ON "TareaOperativa"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoEmpresa_codigo_key" ON "DocumentoEmpresa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "GastoEmpresa_codigo_key" ON "GastoEmpresa"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "PagoCalendario_codigo_key" ON "PagoCalendario"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_codigo_key" ON "Cliente"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Factura_numero_key" ON "Factura"("numero");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Factura" ADD CONSTRAINT "Factura_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaFactura" ADD CONSTRAINT "LineaFactura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "Factura"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LineaInventario" ADD CONSTRAINT "LineaInventario_sesionInventarioId_fkey" FOREIGN KEY ("sesionInventarioId") REFERENCES "SesionInventario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaOperativa" ADD CONSTRAINT "TareaOperativa_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TareaOperativa" ADD CONSTRAINT "TareaOperativa_asignadoPorId_fkey" FOREIGN KEY ("asignadoPorId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoEmpresa" ADD CONSTRAINT "DocumentoEmpresa_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoEmpresa" ADD CONSTRAINT "GastoEmpresa_pagoCalendarioId_fkey" FOREIGN KEY ("pagoCalendarioId") REFERENCES "PagoCalendario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoEmpresa" ADD CONSTRAINT "GastoEmpresa_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
