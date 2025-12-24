// Crear datos de ejemplo para pedidos del mes actual
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearPedidosEjemplo() {
  try {
    console.log('🔧 Creando pedidos de ejemplo para diciembre 2025...');
    
    // Obtener cliente para asociar pedidos
    const clientes = await prisma.cliente.findMany({
      take: 3
    });

    if (clientes.length === 0) {
      console.error('❌ No hay clientes en la base de datos');
      return;
    }

    const hoy = new Date();
    const mes = hoy.getMonth() + 1;
    const año = hoy.getFullYear();

    // Crear varios pedidos distribuidos en el mes
    const pedidosNuevos = [];
    
    // Pedidos de mostrador (58% del total)
    for (let dia = 1; dia <= 18; dia++) {
      if (dia % 2 === 0) { // Cada 2 días
        pedidosNuevos.push({
          clienteId: clientes[0].id,
          fecha: new Date(año, mes - 1, dia, 12, 0, 0),
          estado: 'recibido',
          total: 150.50 + Math.random() * 100 // Entre 150-250€
        });
      }
    }

    // Pedidos app/web (27%)
    for (let dia = 3; dia <= 18; dia += 3) {
      pedidosNuevos.push({
        clienteId: clientes[1].id,
        fecha: new Date(año, mes - 1, dia, 15, 30, 0),
        estado: 'recibido',
        total: 45.75 + Math.random() * 80 // Entre 45-125€
      });
    }

    // Pedidos terceros (10%)
    for (let dia = 5; dia <= 18; dia += 5) {
      pedidosNuevos.push({
        clienteId: clientes[2].id,
        fecha: new Date(año, mes - 1, dia, 18, 0, 0),
        estado: 'recibido',
        total: 65.00 + Math.random() * 60 // Entre 65-125€
      });
    }

    // Insertar pedidos
    for (const pedido of pedidosNuevos) {
      try {
        const pedidoCreado = await prisma.pedido.create({
          data: pedido
        });
        console.log(`✅ Pedido creado: $${pedido.total.toFixed(2)} en ${pedido.fecha.toLocaleDateString()}`);
      } catch (err) {
        console.log(`⚠️  Error creando pedido: ${err.message}`);
      }
    }

    console.log(`\n✅ Creados ${pedidosNuevos.length} pedidos de ejemplo`);

    // Mostrar resumen
    const totalPedidos = await prisma.pedido.findMany({
      where: {
        fecha: {
          gte: new Date(año, mes - 1, 1),
          lte: new Date()
        }
      }
    });

    const totalVentas = totalPedidos.reduce((sum, p) => sum + p.total, 0);
    console.log(`\n📊 Resumen del mes ${mes}/${año}:`);
    console.log(`   - Total pedidos: ${totalPedidos.length}`);
    console.log(`   - Total ventas: €${totalVentas.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

crearPedidosEjemplo();