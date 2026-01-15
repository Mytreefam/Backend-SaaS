-- CreateTable
CREATE TABLE "Ticket" (
    "id" SERIAL NOT NULL,
    "asunto" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierto',
    "prioridad" TEXT NOT NULL DEFAULT 'media',
    "categoria" TEXT NOT NULL DEFAULT 'general',
    "creadoPor" TEXT NOT NULL,
    "creadoPorId" INTEGER,
    "asignadoA" TEXT,
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaActualizacion" TIMESTAMP(3) NOT NULL,
    "respuestas" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);
