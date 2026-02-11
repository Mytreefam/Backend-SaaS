-- CreateTable
CREATE TABLE "IntegracionDelivery" (
    "id" SERIAL NOT NULL,
    "empresaId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT false,
    "conectada" BOOLEAN NOT NULL DEFAULT false,
    "ultimaSincronizacion" TIMESTAMP(3),
    "errores" INTEGER NOT NULL DEFAULT 0,
    "productosSync" INTEGER NOT NULL DEFAULT 0,
    "pedidosHoy" INTEGER NOT NULL DEFAULT 0,
    "configuracion" JSONB,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegracionDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IntegracionDelivery_empresaId_idx" ON "IntegracionDelivery"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegracionDelivery_empresaId_codigo_key" ON "IntegracionDelivery"("empresaId", "codigo");
