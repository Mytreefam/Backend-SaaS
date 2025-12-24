// Test específico para tabla CierreCaja
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCierreCajaTable() {
  try {
    console.log('🔍 Verificando tabla CierreCaja...');
    
    // Verificar estructura de la tabla CierreCaja
    console.log('\n🏗️  Estructura de CierreCaja:');
    const cierreStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'CierreCaja' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;
    console.log(cierreStructure);

    // Contar registros en CierreCaja
    console.log('\n📊 Contando registros en CierreCaja...');
    const cierresCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "CierreCaja"`;
    console.log('Total de cierres:', cierresCount);

    // Si hay registros, mostrar algunos ejemplos
    if (cierresCount[0].count > 0) {
      console.log('\n📋 Ejemplos de cierres de caja:');
      const ejemplosCierres = await prisma.$queryRaw`
        SELECT * FROM "CierreCaja" 
        ORDER BY id DESC 
        LIMIT 5;
      `;
      console.log(JSON.stringify(ejemplosCierres, null, 2));
    } else {
      console.log('\n⚠️  No hay datos en la tabla CierreCaja');
      
      // Crear algunos datos de ejemplo
      console.log('\n🔧 Creando datos de ejemplo...');
      try {
        const nuevoCierre = await prisma.$queryRaw`
          INSERT INTO "CierreCaja" 
          (fecha, ventas_efectivo, ventas_tarjeta, diferencia, tipo_accion, created_at, updated_at) 
          VALUES 
          ('2025-12-18', 150.50, 280.75, 2.25, 'cierre', NOW(), NOW());
        `;
        console.log('✅ Datos de ejemplo creados');
      } catch (insertError) {
        console.log('❌ Error insertando datos:', insertError.message);
        
        // Mostrar las columnas disponibles para entender qué insertar
        console.log('\n📋 Columnas de CierreCaja:');
        console.log(cierreStructure.map(col => `${col.column_name} (${col.data_type})`).join('\n'));
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

testCierreCajaTable();