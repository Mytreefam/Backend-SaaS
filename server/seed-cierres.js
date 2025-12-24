// Crear datos de ejemplo para CierreCaja
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function crearDatosCierreEjemplo() {
  try {
    console.log('🔧 Creando datos de ejemplo para CierreCaja...');
    
    // Insertar algunos cierres de caja de ejemplo
    const cierres = await prisma.$transaction([
      prisma.$queryRaw`
        INSERT INTO "CierreCaja" 
        (numero, "puntoVentaId", "empresaId", fecha, turno, "efectivoInicial", 
         "totalVentasEfectivo", "totalVentasTarjeta", "totalVentasOnline", 
         "gastosCaja", "efectivoEsperado", "efectivoContado", diferencia, 
         estado, "creadoEn", "modificadoEn") 
        VALUES 
        ('CIERRE-001', 'PDV-001', 'EMP-001', '2025-12-18 09:00:00', 'mañana', 
         100.00, 250.50, 180.75, 95.25, 15.00, 335.50, 337.75, 2.25, 
         'cerrado', NOW(), NOW())
      `,
      prisma.$queryRaw`
        INSERT INTO "CierreCaja" 
        (numero, "puntoVentaId", "empresaId", fecha, turno, "efectivoInicial", 
         "totalVentasEfectivo", "totalVentasTarjeta", "totalVentasOnline", 
         "gastosCaja", "efectivoEsperado", "efectivoContado", diferencia, 
         estado, "creadoEn", "modificadoEn") 
        VALUES 
        ('CIERRE-002', 'PDV-001', 'EMP-001', '2025-12-18 15:30:00', 'tarde', 
         150.00, 320.25, 225.50, 145.75, 8.50, 461.75, 459.50, -2.25, 
         'cerrado', NOW(), NOW())
      `,
      prisma.$queryRaw`
        INSERT INTO "CierreCaja" 
        (numero, "puntoVentaId", "empresaId", fecha, turno, "efectivoInicial", 
         "totalVentasEfectivo", "totalVentasTarjeta", "totalVentasOnline", 
         "gastosCaja", "efectivoEsperado", "efectivoContado", diferencia, 
         estado, "creadoEn", "modificadoEn") 
        VALUES 
        ('CIERRE-003', 'PDV-002', 'EMP-001', '2025-12-17 20:45:00', 'noche', 
         80.00, 180.00, 165.25, 75.50, 12.00, 248.00, 248.00, 0.00, 
         'cerrado', NOW(), NOW())
      `
    ]);

    console.log('✅ Datos de ejemplo insertados correctamente');

    // Verificar los datos insertados
    const cierresCreados = await prisma.$queryRaw`
      SELECT * FROM "CierreCaja" 
      ORDER BY fecha DESC;
    `;
    
    console.log('\n📋 Cierres de caja creados:');
    console.log(JSON.stringify(cierresCreados, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Conexión cerrada');
  }
}

crearDatosCierreEjemplo();