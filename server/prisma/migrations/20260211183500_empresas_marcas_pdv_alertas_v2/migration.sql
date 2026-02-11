-- Re-apply Empresa/Marca/PDV + alertas resueltas
-- (Previous migration was marked rolled-back due to FK ordering issues.)

-- 1) Empresa
CREATE TABLE IF NOT EXISTS "Empresa" (
  "id" TEXT NOT NULL,
  "codigo" TEXT,
  "nombreFiscal" TEXT NOT NULL,
  "nombreComercial" TEXT,
  "cif" TEXT,
  "domicilioFiscal" TEXT,
  "logoComercial" TEXT,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modificadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Empresa" ("id", "codigo", "nombreFiscal", "nombreComercial", "activo", "modificadoEn")
VALUES ('HOYPCM000', 'HOYPCM000', 'HOYPCM000', 'HOYPCM000', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 2) PuntoVenta.empresaId + FK
ALTER TABLE "PuntoVenta" ADD COLUMN IF NOT EXISTS "empresaId" TEXT NOT NULL DEFAULT 'HOYPCM000';

CREATE INDEX IF NOT EXISTS "PuntoVenta_empresaId_idx" ON "PuntoVenta"("empresaId");

DO $$
BEGIN
  ALTER TABLE "PuntoVenta"
    ADD CONSTRAINT "PuntoVenta_empresaId_fkey"
    FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- 3) Marca
CREATE TABLE IF NOT EXISTS "Marca" (
  "id" TEXT NOT NULL,
  "codigo" TEXT,
  "nombre" TEXT NOT NULL,
  "colorIdentidad" TEXT,
  "icono" TEXT,
  "logoUrl" TEXT,
  "empresaId" TEXT NOT NULL,
  "activo" BOOLEAN NOT NULL DEFAULT true,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modificadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Marca_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Marca_empresaId_idx" ON "Marca"("empresaId");
CREATE INDEX IF NOT EXISTS "Marca_activo_idx" ON "Marca"("activo");

DO $$
BEGIN
  ALTER TABLE "Marca"
    ADD CONSTRAINT "Marca_empresaId_fkey"
    FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

-- 4) Alertas resueltas
CREATE TABLE IF NOT EXISTS "DashboardAlertaResuelta" (
  "id" SERIAL NOT NULL,
  "empresaId" TEXT NOT NULL,
  "puntoVentaId" TEXT,
  "alertaId" TEXT NOT NULL,
  "resueltaPorId" INTEGER,
  "resueltaEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DashboardAlertaResuelta_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DashboardAlertaResuelta_empresaId_idx" ON "DashboardAlertaResuelta"("empresaId");
CREATE INDEX IF NOT EXISTS "DashboardAlertaResuelta_puntoVentaId_idx" ON "DashboardAlertaResuelta"("puntoVentaId");
CREATE UNIQUE INDEX IF NOT EXISTS "DashboardAlertaResuelta_empresaId_puntoVentaId_alertaId_key"
  ON "DashboardAlertaResuelta"("empresaId", "puntoVentaId", "alertaId");

