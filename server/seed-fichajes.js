const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Limpiar fichajes existentes
  await prisma.fichaje.deleteMany();

  // Crear fichajes de ejemplo
  const fichajes = await prisma.fichaje.createMany({
    data: [
      {
        empleadoId: 11,
        tipo: 'entrada',
        fecha: new Date('2025-12-19T06:05:00'),
        hora: '06:05',
        horaTeorica: '06:00',
        diferenciaMinutos: 5,
        puntoVentaId: 'PDV-001',
        validado: true,
        observaciones: null,
      },
      {
        empleadoId: 12,
        tipo: 'entrada',
        fecha: new Date('2025-12-19T07:15:00'),
        hora: '07:15',
        horaTeorica: '07:00',
        diferenciaMinutos: 15,
        puntoVentaId: 'PDV-002',
        validado: false,
        observaciones: 'Tráfico en la C-32',
      },
      {
        empleadoId: 13,
        tipo: 'entrada',
        fecha: new Date('2025-12-19T08:55:00'),
        hora: '08:55',
        horaTeorica: '09:00',
        diferenciaMinutos: -5,
        puntoVentaId: 'PDV-001',
        validado: true,
        observaciones: null,
      },
      {
        empleadoId: 14,
        tipo: 'entrada',
        fecha: new Date('2025-12-19T08:25:00'),
        hora: '08:25',
        horaTeorica: '08:00',
        diferenciaMinutos: 25,
        puntoVentaId: 'PDV-002',
        validado: false,
        observaciones: null,
      },
      {
        empleadoId: 11,
        tipo: 'salida',
        fecha: new Date('2025-12-19T14:20:00'),
        hora: '14:20',
        horaTeorica: '14:30',
        diferenciaMinutos: -10,
        puntoVentaId: 'PDV-001',
        validado: true,
        observaciones: null,
      },
    ],
  });

  console.log(`✅ Creados ${fichajes.count} fichajes de ejemplo`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
