import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear cliente normal
  await prisma.cliente.create({
    data: {
      codigo: 'CLI-TEST',
      nombre: 'Cliente Prueba',
      email: 'cliente@prueba.com',
      password: '1234',
      telefono: '600000001',
      role: 'cliente',
    },
  });

  // Crear gerente
  await prisma.cliente.create({
    data: {
      codigo: 'GER-TEST',
      nombre: 'Gerente Prueba',
      email: 'gerente@prueba.com',
      password: '5678',
      telefono: '600000002',
      role: 'gerente',
    },
  });

  console.log('Usuarios de prueba creados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
