/*
  Warnings:

  - You are about to drop the `Promocion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Promocion";

-- CreateTable
CREATE TABLE "Cupon" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "descuento" TEXT NOT NULL,
    "validoHasta" TIMESTAMP(3) NOT NULL,
    "clienteId" INTEGER,
    "usado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Cupon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_codigo_key" ON "Cupon"("codigo");

-- AddForeignKey
ALTER TABLE "Cupon" ADD CONSTRAINT "Cupon_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;
