-- AlterTable
ALTER TABLE "PuntoVenta" ADD COLUMN     "empresaId" TEXT NOT NULL DEFAULT 'HOYPCM000';

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombreFiscal" TEXT NOT NULL,
    "nombreComercial" TEXT,
    "cif" TEXT,
    "domicilioFiscal" TEXT,
    "logoComercial" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- Ensure default empresa exists before adding FK constraints
INSERT INTO "Empresa" ("id", "codigo", "nombreFiscal", "nombreComercial", "activo", "modificadoEn")
VALUES ('HOYPCM000', 'HOYPCM000', 'HOYPCM000', 'HOYPCM000', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- CreateTable
CREATE TABLE "Marca" (
    "id" TEXT NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "colorIdentidad" TEXT,
    "icono" TEXT,
    "logoUrl" TEXT,
    "empresaId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardAlertaResuelta" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puntoVentaId" TEXT,
    "alertaId" TEXT NOT NULL,
    "resueltaPorId" INTEGER,
    "resueltaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DashboardAlertaResuelta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Marca_empresaId_idx" ON "Marca"("empresaId");

-- CreateIndex
CREATE INDEX "Marca_activo_idx" ON "Marca"("activo");

-- CreateIndex
CREATE UNIQUE INDEX "Marca_empresaId_id_key" ON "Marca"("empresaId", "id");

-- CreateIndex
CREATE INDEX "DashboardAlertaResuelta_empresaId_idx" ON "DashboardAlertaResuelta"("empresaId");

-- CreateIndex
CREATE INDEX "DashboardAlertaResuelta_puntoVentaId_idx" ON "DashboardAlertaResuelta"("puntoVentaId");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardAlertaResuelta_empresaId_puntoVentaId_alertaId_key" ON "DashboardAlertaResuelta"("empresaId", "puntoVentaId", "alertaId");

-- CreateIndex
CREATE INDEX "PuntoVenta_empresaId_idx" ON "PuntoVenta"("empresaId");

-- AddForeignKey
ALTER TABLE "PuntoVenta" ADD CONSTRAINT "PuntoVenta_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Marca" ADD CONSTRAINT "Marca_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
