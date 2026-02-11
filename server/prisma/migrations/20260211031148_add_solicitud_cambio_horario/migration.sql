-- CreateTable
CREATE TABLE "SolicitudCambioHorario" (
    "id" SERIAL NOT NULL,
    "empleadoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "fechaSolicitada" TIMESTAMP(3) NOT NULL,
    "motivoSolicitud" TEXT NOT NULL,
    "detalles" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "respuesta" TEXT,
    "solicitadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revisadoPorId" INTEGER,
    "revisadoEn" TIMESTAMP(3),

    CONSTRAINT "SolicitudCambioHorario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SolicitudCambioHorario_empleadoId_idx" ON "SolicitudCambioHorario"("empleadoId");

-- CreateIndex
CREATE INDEX "SolicitudCambioHorario_fechaSolicitada_idx" ON "SolicitudCambioHorario"("fechaSolicitada");

-- CreateIndex
CREATE INDEX "SolicitudCambioHorario_estado_idx" ON "SolicitudCambioHorario"("estado");

-- AddForeignKey
ALTER TABLE "SolicitudCambioHorario" ADD CONSTRAINT "SolicitudCambioHorario_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitudCambioHorario" ADD CONSTRAINT "SolicitudCambioHorario_revisadoPorId_fkey" FOREIGN KEY ("revisadoPorId") REFERENCES "Empleado"("id") ON DELETE SET NULL ON UPDATE CASCADE;
