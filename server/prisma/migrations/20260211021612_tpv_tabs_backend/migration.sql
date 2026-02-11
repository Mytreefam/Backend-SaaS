-- DropForeignKey
ALTER TABLE "Turno" DROP CONSTRAINT "Turno_pedidoId_fkey";

-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "motivoCancelacion" TEXT,
ADD COLUMN     "motivoDevolucion" TEXT;

-- AlterTable
ALTER TABLE "Turno" ADD COLUMN     "fechaGeolocalizacion" TIMESTAMP(3),
ADD COLUMN     "geolocalizacionValidada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "origenPedido" TEXT NOT NULL DEFAULT 'presencial',
ALTER COLUMN "pedidoId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ImpresoraConfig" (
    "id" SERIAL NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "categorias" JSONB NOT NULL,
    "ipAddress" TEXT,
    "modelo" TEXT,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpresoraConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ImpresoraConfig_puntoVentaId_idx" ON "ImpresoraConfig"("puntoVentaId");

-- CreateIndex
CREATE INDEX "ImpresoraConfig_activa_idx" ON "ImpresoraConfig"("activa");

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE SET NULL ON UPDATE CASCADE;
