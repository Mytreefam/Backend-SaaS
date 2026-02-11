-- RRHH trabajador: vacaciones, horas extra, consumos internos, gastos

CREATE TABLE IF NOT EXISTS "TrabajadorSolicitudVacaciones" (
  "id" SERIAL NOT NULL,
  "empleadoId" INTEGER NOT NULL,
  "desde" TIMESTAMP(3) NOT NULL,
  "hasta" TIMESTAMP(3) NOT NULL,
  "motivo" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resueltoEn" TIMESTAMP(3),
  CONSTRAINT "TrabajadorSolicitudVacaciones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudVacaciones_empleadoId_idx" ON "TrabajadorSolicitudVacaciones"("empleadoId");
CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudVacaciones_estado_idx" ON "TrabajadorSolicitudVacaciones"("estado");
CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudVacaciones_desde_hasta_idx" ON "TrabajadorSolicitudVacaciones"("desde", "hasta");

DO $$
BEGIN
  ALTER TABLE "TrabajadorSolicitudVacaciones"
    ADD CONSTRAINT "TrabajadorSolicitudVacaciones_empleadoId_fkey"
    FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS "TrabajadorSolicitudHoraExtra" (
  "id" SERIAL NOT NULL,
  "empleadoId" INTEGER NOT NULL,
  "fecha" TIMESTAMP(3) NOT NULL,
  "horaInicio" TEXT NOT NULL,
  "horaFin" TEXT NOT NULL,
  "motivo" TEXT NOT NULL,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resueltoEn" TIMESTAMP(3),
  CONSTRAINT "TrabajadorSolicitudHoraExtra_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudHoraExtra_empleadoId_idx" ON "TrabajadorSolicitudHoraExtra"("empleadoId");
CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudHoraExtra_estado_idx" ON "TrabajadorSolicitudHoraExtra"("estado");
CREATE INDEX IF NOT EXISTS "TrabajadorSolicitudHoraExtra_fecha_idx" ON "TrabajadorSolicitudHoraExtra"("fecha");

DO $$
BEGIN
  ALTER TABLE "TrabajadorSolicitudHoraExtra"
    ADD CONSTRAINT "TrabajadorSolicitudHoraExtra_empleadoId_fkey"
    FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS "TrabajadorConsumoInterno" (
  "id" SERIAL NOT NULL,
  "empleadoId" INTEGER NOT NULL,
  "producto" TEXT NOT NULL,
  "categoria" TEXT NOT NULL,
  "cantidad" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "precio" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notas" TEXT,
  CONSTRAINT "TrabajadorConsumoInterno_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrabajadorConsumoInterno_empleadoId_idx" ON "TrabajadorConsumoInterno"("empleadoId");
CREATE INDEX IF NOT EXISTS "TrabajadorConsumoInterno_fecha_idx" ON "TrabajadorConsumoInterno"("fecha");
CREATE INDEX IF NOT EXISTS "TrabajadorConsumoInterno_categoria_idx" ON "TrabajadorConsumoInterno"("categoria");

DO $$
BEGIN
  ALTER TABLE "TrabajadorConsumoInterno"
    ADD CONSTRAINT "TrabajadorConsumoInterno_empleadoId_fkey"
    FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS "TrabajadorGasto" (
  "id" SERIAL NOT NULL,
  "empleadoId" INTEGER NOT NULL,
  "concepto" TEXT NOT NULL,
  "categoria" TEXT NOT NULL,
  "importe" DOUBLE PRECISION NOT NULL,
  "fechaGasto" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "justificanteUrl" TEXT,
  "notas" TEXT,
  "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TrabajadorGasto_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "TrabajadorGasto_empleadoId_idx" ON "TrabajadorGasto"("empleadoId");
CREATE INDEX IF NOT EXISTS "TrabajadorGasto_estado_idx" ON "TrabajadorGasto"("estado");
CREATE INDEX IF NOT EXISTS "TrabajadorGasto_fechaGasto_idx" ON "TrabajadorGasto"("fechaGasto");

DO $$
BEGIN
  ALTER TABLE "TrabajadorGasto"
    ADD CONSTRAINT "TrabajadorGasto_empleadoId_fkey"
    FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN
    NULL;
END $$;

