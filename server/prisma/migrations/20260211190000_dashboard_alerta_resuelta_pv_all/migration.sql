-- Make DashboardAlertaResuelta.puntoVentaId NOT NULL with sentinel "ALL"

ALTER TABLE "DashboardAlertaResuelta"
  ALTER COLUMN "puntoVentaId" SET DEFAULT 'ALL';

UPDATE "DashboardAlertaResuelta"
  SET "puntoVentaId" = 'ALL'
  WHERE "puntoVentaId" IS NULL;

ALTER TABLE "DashboardAlertaResuelta"
  ALTER COLUMN "puntoVentaId" SET NOT NULL;

