-- CreateTable
CREATE TABLE IF NOT EXISTS "InvitacionEmpleado" (
  "id" TEXT NOT NULL,
  "empresaId" TEXT NOT NULL,
  "empresaNombre" TEXT,
  "metodo" TEXT NOT NULL DEFAULT 'email',
  "email" TEXT NOT NULL,
  "nombre" TEXT,
  "apellidos" TEXT,
  "puesto" TEXT,
  "departamento" TEXT,
  "estado" TEXT NOT NULL DEFAULT 'pendiente',
  "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fechaExpiracion" TIMESTAMP(3) NOT NULL,
  "fechaAceptacion" TIMESTAMP(3),
  "creadoPor" TEXT,
  "creadoPorNombre" TEXT,
  "codigoInvitacion" TEXT,
  "linkInvitacion" TEXT,
  "usuarioTemporal" TEXT,
  "passwordTemporal" TEXT,
  "notas" TEXT,
  "horasSemanales" DOUBLE PRECISION,
  "tipoContrato" TEXT,

  CONSTRAINT "InvitacionEmpleado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "InvitacionEmpleado_empresaId_idx" ON "InvitacionEmpleado"("empresaId");
CREATE INDEX IF NOT EXISTS "InvitacionEmpleado_email_idx" ON "InvitacionEmpleado"("email");
CREATE INDEX IF NOT EXISTS "InvitacionEmpleado_estado_idx" ON "InvitacionEmpleado"("estado");
CREATE INDEX IF NOT EXISTS "InvitacionEmpleado_fechaExpiracion_idx" ON "InvitacionEmpleado"("fechaExpiracion");

