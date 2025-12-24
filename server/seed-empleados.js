/**
 * SEED: Crear empleados de ejemplo en la base de datos
 * 
 * Ejecución: node seed-empleados.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de empleados...\n');

  // Limpiar en orden correcto debido a las relaciones
  console.log('🧹 Limpiando datos existentes...');
  try {
    // Primero eliminar fichajes (dependen de empleados)
    await prisma.fichaje.deleteMany({});
    console.log('✓ Fichajes eliminados');
    
    // Luego eliminar empleados
    await prisma.empleado.deleteMany({});
    console.log('✓ Empleados eliminados');
  } catch (error) {
    console.warn('⚠️  Error al limpiar datos:', error.message);
  }

  // Crear empleados de ejemplo
  const empleados = [
    {
      nombre: 'Antonio',
      email: 'panadero.jefe@udaredge.com',
      telefono: '+34 666 555 003',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Antonio',
      puesto: 'Panadero',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV001',
      horarioEntrada: '06:00',
      horarioSalida: '14:30',
      salarioBase: 1500,
      estado: 'activo',
      horasMes: 160,
      desempeno: 95
    },
    {
      nombre: 'Carlos',
      email: 'gerente@udaredge.com',
      telefono: '+34 666 555 001',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      puesto: 'Gerente',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV001',
      horarioEntrada: '08:00',
      horarioSalida: '17:00',
      salarioBase: 2000,
      estado: 'activo',
      horasMes: 160,
      desempeno: 98
    },
    {
      nombre: 'Carmen',
      email: 'carmen.vacaciones@udaredge.com',
      telefono: '+34 666 555 009',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen',
      puesto: 'Cajero',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV001',
      horarioEntrada: '09:00',
      horarioSalida: '18:00',
      salarioBase: 1200,
      estado: 'vacaciones',
      horasMes: 120,
      desempeno: 88
    },
    {
      nombre: 'David',
      email: 'david.ruiz@udaredge.com',
      telefono: '+34 666 555 004',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
      puesto: 'Repostero',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV001',
      horarioEntrada: '07:00',
      horarioSalida: '15:30',
      salarioBase: 1400,
      estado: 'activo',
      horasMes: 155,
      desempeno: 92
    },
    {
      nombre: 'Elena',
      email: 'elena.lopez@udaredge.com',
      telefono: '+34 666 555 005',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      puesto: 'Dependienta',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV001',
      horarioEntrada: '09:00',
      horarioSalida: '17:30',
      salarioBase: 1100,
      estado: 'activo',
      horasMes: 160,
      desempeno: 85
    },
    {
      nombre: 'Fernando',
      email: 'fernando.martinez@udaredge.com',
      telefono: '+34 666 555 006',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fernando',
      puesto: 'Cocinero',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV002',
      horarioEntrada: '10:00',
      horarioSalida: '22:00',
      salarioBase: 1600,
      estado: 'activo',
      horasMes: 160,
      desempeno: 90
    },
    {
      nombre: 'Gloria',
      email: 'gloria.fernandez@udaredge.com',
      telefono: '+34 666 555 007',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gloria',
      puesto: 'Camarera',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV002',
      horarioEntrada: '11:00',
      horarioSalida: '23:00',
      salarioBase: 1050,
      estado: 'activo',
      horasMes: 150,
      desempeno: 87
    },
    {
      nombre: 'Héctor',
      email: 'hector.garcia@udaredge.com',
      telefono: '+34 666 555 008',
      foto: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hector',
      puesto: 'Auxiliar Cocina',
      empresaId: 'EMP-001',
      puntoVentaId: 'PDV002',
      horarioEntrada: '09:00',
      horarioSalida: '17:00',
      salarioBase: 950,
      estado: 'baja',
      horasMes: 0,
      desempeno: 0
    }
  ];

  // Crear empleados
  for (const empleado of empleados) {
    await prisma.empleado.create({
      data: {
        nombre: empleado.nombre,
        email: empleado.email,
        telefono: empleado.telefono,
        foto: empleado.foto,
        puesto: empleado.puesto,
        empresaId: empleado.empresaId,
        puntoVentaId: empleado.puntoVentaId,
        horarioEntrada: empleado.horarioEntrada,
        horarioSalida: empleado.horarioSalida,
        salarioBase: empleado.salarioBase,
        estado: empleado.estado,
        horasMes: empleado.horasMes,
        desempeno: empleado.desempeno,
        fechaAlta: new Date('2023-01-15'),
        creadoEn: new Date()
      }
    });
    console.log(`✓ Empleado creado: ${empleado.nombre} (${empleado.puesto})`);
  }

  console.log('\n✅ Seed de empleados completado');
  console.log(`📊 Total de empleados creados: ${empleados.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
