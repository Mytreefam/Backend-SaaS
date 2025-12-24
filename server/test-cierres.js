// Test de datos de cierres de caja
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCierresData() {
  try {
    console.log('🔍 Verificando datos de cierres en la base de datos...');
    
    // Verificar si existe la tabla de cierres
    console.log('\n📋 Buscando tablas relacionadas con cierres...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%cierre%';
    `;
    console.log('Tablas encontradas:', tables);

    // Buscar cualquier tabla que pueda contener datos de cierres
    console.log('\n📋 Todas las tablas en la BD...');
    const allTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Todas las tablas:', allTables);

    // Verificar si hay datos de pedidos (que podrían usarse para calcular cierres)
    console.log('\n💰 Verificando pedidos para calcular cierres...');
    const pedidosCount = await prisma.pedido.count();
    console.log('Total de pedidos:', pedidosCount);

    if (pedidosCount > 0) {
      // Obtener algunos pedidos de ejemplo
      const pedidosEjemplo = await prisma.pedido.findMany({
        take: 5,
        include: {
          items: true
        }
      });
      console.log('Pedidos de ejemplo:', JSON.stringify(pedidosEjemplo, null, 2));
    }

    // Verificar estructura del modelo Pedido
    console.log('\n🏗️  Verificando estructura de tabla pedidos...');
    const pedidoStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'Pedido' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    console.log('Estructura de Pedido:', pedidoStructure);

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

testCierresData();