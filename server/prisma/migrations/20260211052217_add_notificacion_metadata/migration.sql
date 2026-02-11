-- AlterTable
ALTER TABLE "Notificacion" ADD COLUMN     "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "prioridad" TEXT,
ADD COLUMN     "tipo" TEXT,
ADD COLUMN     "titulo" TEXT;

-- CreateIndex
CREATE INDEX "Notificacion_clienteId_idx" ON "Notificacion"("clienteId");

-- CreateIndex
CREATE INDEX "Notificacion_creadoEn_idx" ON "Notificacion"("creadoEn");
