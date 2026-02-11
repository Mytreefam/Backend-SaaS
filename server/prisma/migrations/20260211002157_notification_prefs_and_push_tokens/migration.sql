-- CreateTable
CREATE TABLE "NotificacionPreferencias" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "actualizadoEn" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificacionPreferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushDeviceToken" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "creadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedEn" TIMESTAMP(3),

    CONSTRAINT "PushDeviceToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificacionPreferencias_clienteId_key" ON "NotificacionPreferencias"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "PushDeviceToken_token_key" ON "PushDeviceToken"("token");

-- CreateIndex
CREATE INDEX "PushDeviceToken_clienteId_idx" ON "PushDeviceToken"("clienteId");

-- CreateIndex
CREATE INDEX "PushDeviceToken_revokedEn_idx" ON "PushDeviceToken"("revokedEn");

-- AddForeignKey
ALTER TABLE "NotificacionPreferencias" ADD CONSTRAINT "NotificacionPreferencias_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushDeviceToken" ADD CONSTRAINT "PushDeviceToken_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
