const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Eliminar datos previos para evitar conflictos de claves únicas y relaciones
  await prisma.pedidoItem.deleteMany();
  await prisma.factura.deleteMany();
  await prisma.cita.deleteMany();
  await prisma.documento.deleteMany();
  await prisma.garaje.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.presupuesto.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.direccion.deleteMany();
  await prisma.cupon.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.cliente.deleteMany();

  // Seed clientes
  const cliente1 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-001',
      nombre: 'Juan Pérez',
      email: 'juan@example.com',
      password: 'hashedpassword1',
      telefono: '600123456',
      role: 'cliente',
    },
  });
  const cliente2 = await prisma.cliente.create({
    data: {
      codigo: 'CLI-002',
      nombre: 'Ana García',
      email: 'ana@example.com',
      password: 'hashedpassword2',
      telefono: '600654321',
      role: 'admin',
    },
  });

  // Seed productos
  const producto1 = await prisma.producto.create({
    data: {
      nombre: 'Café Espresso',
      descripcion: 'Café intenso y aromático',
      precio: 1.5,
      stock: 100,
      imagen: 'https://placehold.co/100x100',
    },
  });
  const producto2 = await prisma.producto.create({
    data: {
      nombre: 'Croissant',
      descripcion: 'Croissant recién horneado',
      precio: 1.2,
      stock: 50,
      imagen: 'https://placehold.co/100x100',
    },
  });

  // Seed cupones
  await prisma.cupon.create({
    data: {
      codigo: 'DESCUENTO10',
      descripcion: '10% de descuento en tu próxima compra',
      descuento: '10%',
      validoHasta: new Date('2025-12-31'),
      clienteId: cliente1.id,
      usado: false
    }
  });
  await prisma.cupon.create({
    data: {
      codigo: 'ENVIOGRATIS',
      descripcion: 'Envío gratis en pedidos superiores a 20€',
      descuento: 'Envío Gratis',
      validoHasta: new Date('2025-12-31'),
      clienteId: cliente2.id,
      usado: false
    }
  });

  // Seed direcciones
  await prisma.direccion.create({
    data: {
      clienteId: cliente1.id,
      calle: 'Calle Mayor 1',
      ciudad: 'Badalona',
      provincia: 'Barcelona',
      pais: 'España',
      codigoPostal: '08911',
    },
  });
  await prisma.direccion.create({
    data: {
      clienteId: cliente2.id,
      calle: 'Avenida Central 5',
      ciudad: 'Barcelona',
      provincia: 'Barcelona',
      pais: 'España',
      codigoPostal: '08001',
    },
  });

  // Seed pedidos

  // Pedidos con todos los estados
  const pedidoPendiente = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'pendiente',
      total: 2.7,
    },
  });
  const pedidoRecibido = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'recibido',
      total: 3.0,
    },
  });
  const pedidoPreparacion = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'preparacion',
      total: 4.5,
    },
  });
  const pedidoEnviado = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'enviado',
      total: 5.2,
    },
  });
  const pedidoEnCarretera = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'en-carretera',
      total: 6.8,
    },
  });

  const pedidoCompletado1 = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fecha: new Date(),
      estado: 'completado',
      total: 7.3,
    },
  });
  const pedidoCompletado2 = await prisma.pedido.create({
    data: {
      clienteId: cliente2.id,
      fecha: new Date(),
      estado: 'completado',
      total: 8.5,
    },
  });

  // Seed pedido items

  // Un producto para cada pedido
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoPendiente.id,
      productoId: producto1.id,
      cantidad: 1,
      precio: 1.5,
    },
  });
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoRecibido.id,
      productoId: producto2.id,
      cantidad: 2,
      precio: 1.2,
    },
  });
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoPreparacion.id,
      productoId: producto1.id,
      cantidad: 1,
      precio: 1.5,
    },
  });
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoEnviado.id,
      productoId: producto2.id,
      cantidad: 3,
      precio: 1.2,
    },
  });
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoEnCarretera.id,
      productoId: producto1.id,
      cantidad: 2,
      precio: 1.5,
    },
  });
  // (Ya migrado arriba: pedidoCompletado1 y pedidoCompletado2)
  await prisma.pedidoItem.create({
    data: {
      pedidoId: pedidoCompletado2.id,
      productoId: producto1.id,
      cantidad: 2,
      precio: 1.5,
    },
  });

  // Seed Cita
  await prisma.cita.create({
    data: {
      fecha: new Date(),
      motivo: 'Consulta médica',
      clienteId: cliente1.id,
    },
  });
  await prisma.cita.create({
    data: {
      fecha: new Date(),
      motivo: 'Revisión anual',
      clienteId: cliente2.id,
    },
  });

  // Seed Documento
  await prisma.documento.create({
    data: {
      nombre: 'DNI Juan',
      url: 'https://placehold.co/100x100',
      clienteId: cliente1.id,
    },
  });
  await prisma.documento.create({
    data: {
      nombre: 'Factura Ana',
      url: 'https://placehold.co/100x100',
      clienteId: cliente2.id,
    },
  });

  // Seed Factura

  await prisma.factura.create({
    data: {
      numero: 'FAC-001',
      fecha: new Date(),
      total: 2.7,
      subtotal: 2.0,
      impuestos: 0.7,
      clienteId: cliente1.id,
      pedidoId: pedidoPendiente.id,
    },
  });
  await prisma.factura.create({
    data: {
      numero: 'FAC-002',
      fecha: new Date(),
      total: 1.2,
      subtotal: 1.0,
      impuestos: 0.2,
      clienteId: cliente2.id,
      pedidoId: pedidoCompletado1.id,
    },
  });

  // Seed Garaje
  await prisma.garaje.create({
    data: {
      nombre: 'Garaje Centro',
      ubicacion: 'Badalona',
      clienteId: cliente1.id,
    },
  });
  await prisma.garaje.create({
    data: {
      nombre: 'Garaje Norte',
      ubicacion: 'Barcelona',
      clienteId: cliente2.id,
    },
  });

  // Seed Notificacion
  await prisma.notificacion.create({
    data: {
      mensaje: 'Tu pedido está listo',
      leida: false,
      clienteId: cliente1.id,
    },
  });
  await prisma.notificacion.create({
    data: {
      mensaje: 'Factura disponible',
      leida: true,
      clienteId: cliente2.id,
    },
  });

  // Seed Presupuesto
  await prisma.presupuesto.create({
    data: {
      fecha: new Date(),
      monto: 100.0,
      clienteId: cliente1.id,
    },
  });
  await prisma.presupuesto.create({
    data: {
      fecha: new Date(),
      monto: 200.0,
      clienteId: cliente2.id,
    },
  });

  // Seed Promocion
  await prisma.promocion.create({
    data: {
      titulo: 'Descuento Café',
      descripcion: '20% en café espresso',
      descuento: '20%',
      validoHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.promocion.create({
    data: {
      titulo: 'Promo Croissant',
      descripcion: '2x1 en croissants',
      descuento: '2x1',
      validoHasta: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
