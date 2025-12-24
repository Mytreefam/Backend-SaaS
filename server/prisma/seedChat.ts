import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Crear clientes y pedidos de ejemplo si no existen
  const cliente = await prisma.cliente.upsert({
    where: { email: 'cliente@demo.com' },
    update: {},
    create: {
      nombre: 'Cliente Demo',
      email: 'cliente@demo.com',
      password: 'demo123',
    },
  });
  const pedido = await prisma.pedido.create({
    data: {
      clienteId: cliente.id,
      estado: 'pendiente',
      total: 100,
    },
  });
  // Crear chat de ejemplo
  const chat = await prisma.chat.create({
    data: {
      asunto: 'Consulta sobre pedido PED-002',
      estado: 'abierto',
      clienteId: cliente.id,
      pedidoId: pedido.id,
      mensajes: {
        create: [
          {
            autor: 'cliente',
            texto: '¿Cuándo estará listo mi pedido?',
          },
          {
            autor: 'soporte',
            texto: 'Te avisaré cuando esté preparado y empaquetado.',
          },
        ],
      },
    },
    include: { mensajes: true },
  });
  console.log('Chat y mensajes de ejemplo creados:', chat);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
