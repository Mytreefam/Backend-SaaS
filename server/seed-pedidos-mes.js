// Script para popular pedidos del mes actual con datos reales
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearPedidosDelMes() {
  try {
    console.log('📝 Creando pedidos del mes actual...');
    
    // Obtener un cliente existente
    const clientes = await prisma.cliente.findMany({ take: 3 });
    if (clientes.length === 0) {
      console.log('⚠️  No hay clientes en la BD. Creando cliente de ejemplo...');
      await prisma.cliente.create({
        data: {
          nombre: 'Cliente Ejemplo',
          email: `cliente${Date.now()}@example.com`,
          password: 'password123',
          telefono: '123456789'
        }
      });
    }

    const clientesDisponibles = await prisma.cliente.findMany({ take: 5 });
    
    // Obtener productos existentes
    const productos = await prisma.producto.findMany({ take: 10 });
    if (productos.length === 0) {
      console.log('⚠️  No hay productos. Creando productos de ejemplo...');
      for (let i = 1; i <= 5; i++) {
        await prisma.producto.create({
          data: {
            nombre: `Producto ${i}`,
            descripcion: `Descripción del producto ${i}`,
            precio: Math.random() * 50 + 10,
            stock: Math.floor(Math.random() * 100) + 10
          }
        });
      }
    }

    const productosDisponibles = await prisma.producto.findMany({ take: 10 });

    // Crear pedidos distribuidos por el mes
    const ahora = new Date();
    const primerDia = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const numerosPedidos = 15;

    const pedidosCreados = [];

    for (let i = 0; i < numerosPedidos; i++) {
      // Distribuir fechas por todo el mes
      const diasPasados = Math.floor((i / numerosPedidos) * ahora.getDate());
      const fechaPedido = new Date(primerDia);
      fechaPedido.setDate(fechaPedido.getDate() + diasPasados);
      
      // Hora aleatoria del día
      fechaPedido.setHours(Math.floor(Math.random() * 24));
      fechaPedido.setMinutes(Math.floor(Math.random() * 60));

      const clienteAleatorio = clientesDisponibles[Math.floor(Math.random() * clientesDisponibles.length)];
      const cantidadItems = Math.floor(Math.random() * 3) + 1;
      
      let totalPedido = 0;
      const items = [];

      for (let j = 0; j < cantidadItems; j++) {
        const productoAleatorio = productosDisponibles[Math.floor(Math.random() * productosDisponibles.length)];
        const cantidad = Math.floor(Math.random() * 3) + 1;
        const precio = productoAleatorio.precio;
        const subtotal = cantidad * precio;
        totalPedido += subtotal;

        items.push({
          productoId: productoAleatorio.id,
          cantidad,
          precio
        });
      }

      // Estados variados
      const estados = ['pendiente', 'confirmado', 'preparacion', 'enviado', 'entregado', 'recibido'];
      const estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];

      const pedido = await prisma.pedido.create({
        data: {
          clienteId: clienteAleatorio.id,
          fecha: fechaPedido,
          estado: estadoAleatorio,
          total: Math.round(totalPedido * 100) / 100,
          items: {
            create: items
          }
        },
        include: {
          items: true
        }
      });

      pedidosCreados.push(pedido);
      console.log(`✅ Pedido ${i + 1}/${numerosPedidos} creado - Total: €${pedido.total.toFixed(2)} - Fecha: ${fechaPedido.toLocaleDateString()}`);
    }

    console.log(`\n✅ Se crearon ${pedidosCreados.length} pedidos del mes actual`);

    // Mostrar resumen de ventas
    const totalVentas = pedidosCreados.reduce((sum, p) => sum + p.total, 0);
    console.log(`\n📊 Resumen:`);
    console.log(`   Total ventas: €${totalVentas.toFixed(2)}`);
    console.log(`   Promedio por pedido: €${(totalVentas / pedidosCreados.length).toFixed(2)}`);
    console.log(`   Número de pedidos: ${pedidosCreados.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexión cerrada');
  }
}

crearPedidosDelMes();