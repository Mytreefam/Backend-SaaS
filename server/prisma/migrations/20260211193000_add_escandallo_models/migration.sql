-- Add Escandallo tables (real costs per product)

CREATE TABLE IF NOT EXISTS "Escandallo" (
  "id" SERIAL NOT NULL,
  "productoId" INTEGER NOT NULL,
  "empresaId" TEXT,
  "puntoVentaId" TEXT,
  "costeTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notas" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "modificadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Escandallo_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Escandallo_productoId_key" ON "Escandallo"("productoId");
CREATE INDEX IF NOT EXISTS "Escandallo_empresaId_idx" ON "Escandallo"("empresaId");
CREATE INDEX IF NOT EXISTS "Escandallo_puntoVentaId_idx" ON "Escandallo"("puntoVentaId");

DO $$
BEGIN
  ALTER TABLE "Escandallo"
    ADD CONSTRAINT "Escandallo_productoId_fkey"
    FOREIGN KEY ("productoId") REFERENCES "Producto"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS "EscandalloIngrediente" (
  "id" SERIAL NOT NULL,
  "escandalloId" INTEGER NOT NULL,
  "articuloId" INTEGER,
  "nombre" TEXT NOT NULL,
  "unidad" TEXT NOT NULL,
  "cantidad" DOUBLE PRECISION NOT NULL,
  "costeUnitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "costeTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "proveedorId" INTEGER,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EscandalloIngrediente_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EscandalloIngrediente_escandalloId_idx" ON "EscandalloIngrediente"("escandalloId");
CREATE INDEX IF NOT EXISTS "EscandalloIngrediente_articuloId_idx" ON "EscandalloIngrediente"("articuloId");

DO $$
BEGIN
  ALTER TABLE "EscandalloIngrediente"
    ADD CONSTRAINT "EscandalloIngrediente_escandalloId_fkey"
    FOREIGN KEY ("escandalloId") REFERENCES "Escandallo"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "EscandalloIngrediente"
    ADD CONSTRAINT "EscandalloIngrediente_articuloId_fkey"
    FOREIGN KEY ("articuloId") REFERENCES "ArticuloStock"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

