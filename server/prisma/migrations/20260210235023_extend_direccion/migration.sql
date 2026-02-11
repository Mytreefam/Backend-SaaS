-- AlterTable
ALTER TABLE "Direccion" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "esPredeterminada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechaUltimoUso" TIMESTAMP(3),
ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "numero" TEXT NOT NULL DEFAULT 'S/N',
ADD COLUMN     "piso" TEXT,
ADD COLUMN     "puerta" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'casa',
ALTER COLUMN "provincia" DROP NOT NULL,
ALTER COLUMN "pais" SET DEFAULT 'España';

-- CreateIndex
CREATE INDEX "Direccion_clienteId_idx" ON "Direccion"("clienteId");

-- CreateIndex
CREATE INDEX "Direccion_esPredeterminada_idx" ON "Direccion"("esPredeterminada");
