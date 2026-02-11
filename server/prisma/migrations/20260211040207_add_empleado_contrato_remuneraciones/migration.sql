-- CreateTable
CREATE TABLE "EmpleadoModificacionContrato" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "nuevoSalario" DOUBLE PRECISION,
    "nuevasFunciones" TEXT,
    "motivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'registrado',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpleadoModificacionContrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpleadoFinalizacionContrato" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "fechaFinalizacion" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'registrado',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpleadoFinalizacionContrato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmpleadoRemuneracion" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "importe" DOUBLE PRECISION NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'registrado',
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmpleadoRemuneracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmpleadoModificacionContrato_empleadoId_idx" ON "EmpleadoModificacionContrato"("empleadoId");

-- CreateIndex
CREATE INDEX "EmpleadoModificacionContrato_fechaInicio_idx" ON "EmpleadoModificacionContrato"("fechaInicio");

-- CreateIndex
CREATE INDEX "EmpleadoFinalizacionContrato_empleadoId_idx" ON "EmpleadoFinalizacionContrato"("empleadoId");

-- CreateIndex
CREATE INDEX "EmpleadoFinalizacionContrato_fechaFinalizacion_idx" ON "EmpleadoFinalizacionContrato"("fechaFinalizacion");

-- CreateIndex
CREATE INDEX "EmpleadoRemuneracion_empleadoId_idx" ON "EmpleadoRemuneracion"("empleadoId");

-- CreateIndex
CREATE INDEX "EmpleadoRemuneracion_creadoEn_idx" ON "EmpleadoRemuneracion"("creadoEn");

-- AddForeignKey
ALTER TABLE "EmpleadoModificacionContrato" ADD CONSTRAINT "EmpleadoModificacionContrato_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoFinalizacionContrato" ADD CONSTRAINT "EmpleadoFinalizacionContrato_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmpleadoRemuneracion" ADD CONSTRAINT "EmpleadoRemuneracion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;
