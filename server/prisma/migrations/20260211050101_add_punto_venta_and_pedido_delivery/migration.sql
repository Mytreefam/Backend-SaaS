-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "direccionEntrega" TEXT,
ADD COLUMN     "puntoVentaId" TEXT;

-- CreateTable
CREATE TABLE "PuntoVenta" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DOUBLE PRECISION NOT NULL,
    "longitud" DOUBLE PRECISION NOT NULL,
    "marcasIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuntoVenta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PuntoVenta_activo_idx" ON "PuntoVenta"("activo");

-- CreateIndex
CREATE INDEX "PuntoVenta_creadoEn_idx" ON "PuntoVenta"("creadoEn");

-- CreateIndex
CREATE INDEX "Pedido_clienteId_fecha_idx" ON "Pedido"("clienteId", "fecha");

-- CreateIndex
CREATE INDEX "Pedido_estado_idx" ON "Pedido"("estado");

-- CreateIndex
CREATE INDEX "Pedido_puntoVentaId_idx" ON "Pedido"("puntoVentaId");
