-- Fix for failed migration 20260211182442_empresas_marcas_pdv_alertas
-- Ensures Empresa HOYPCM000 exists and adds missing FK constraints.

INSERT INTO "Empresa" ("id", "codigo", "nombreFiscal", "nombreComercial", "activo", "modificadoEn")
VALUES ('HOYPCM000', 'HOYPCM000', 'HOYPCM000', 'HOYPCM000', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

DO $$
BEGIN
  ALTER TABLE "PuntoVenta"
    ADD CONSTRAINT "PuntoVenta_empresaId_fkey"
    FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

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

