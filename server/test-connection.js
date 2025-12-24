// Test básico de conexión Prisma
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Probando conexión a la base de datos...');
    
    // Test simple de conexión
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Conexión exitosa:', result);
    
    // Contar registros en algunas tablas
    const clienteCount = await prisma.cliente.count();
    console.log('📊 Clientes en BD:', clienteCount);
    
    const pedidoCount = await prisma.pedido.count();
    console.log('📊 Pedidos en BD:', pedidoCount);
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

testConnection();