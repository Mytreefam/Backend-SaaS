-- CreateTable
CREATE TABLE "EmpresaConfiguracion" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmpresaConfiguracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgenteExternoConfiguracion" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgenteExternoConfiguracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TerminalTPV" (
    "id" TEXT NOT NULL,
    "puntoVentaId" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'secundario',
    "estado" TEXT NOT NULL DEFAULT 'disponible',
    "marcas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TerminalTPV_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Okr" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT,
    "equipo" TEXT NOT NULL,
    "objetivo" TEXT NOT NULL,
    "progreso" INTEGER NOT NULL DEFAULT 0,
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "fechaLimite" TIMESTAMP(3),
    "responsable" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Okr_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TerminalTPV_puntoVentaId_idx" ON "TerminalTPV"("puntoVentaId");

-- CreateIndex
CREATE INDEX "TerminalTPV_activo_idx" ON "TerminalTPV"("activo");

-- CreateIndex
CREATE INDEX "Okr_empresaId_idx" ON "Okr"("empresaId");

-- CreateIndex
CREATE INDEX "Okr_equipo_idx" ON "Okr"("equipo");

-- CreateIndex
CREATE INDEX "Okr_activo_idx" ON "Okr"("activo");
