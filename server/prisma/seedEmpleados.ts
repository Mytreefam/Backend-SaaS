/**
 * 🏢 SEEDER: EMPLEADOS Y GERENTES
 * Crea empleados de prueba con diferentes roles y datos realistas
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🏢 Iniciando seeder de empleados...');

  // Limpiar empleados existentes
  await prisma.empleado.deleteMany();
  console.log('🗑️  Empleados anteriores eliminados');

  // ============================================================================
  // EMPLEADOS DE PRUEBA
  // ============================================================================

  // 1️⃣ GERENTE PRINCIPAL
  const gerente = await prisma.empleado.create({
    data: {
      nombre: 'Carlos Rodríguez',
      email: 'gerente@udaredge.com',
      telefono: '+34 666 555 001',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      puesto: 'Gerente',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '08:00',
      horarioSalida: '18:00',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 3500.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 9.2,
      horasMes: 176.0
    }
  });

  // 2️⃣ SUBGERENTE
  const subgerente = await prisma.empleado.create({
    data: {
      nombre: 'María González',
      email: 'subgerente@udaredge.com',
      telefono: '+34 666 555 002',
      foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      puesto: 'Gerente',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV002',
      
      // Horarios
      horarioEntrada: '14:00',
      horarioSalida: '22:00',
      turno: 'tarde',
      
      // Condiciones laborales
      salarioBase: 3000.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 8.7,
      horasMes: 168.0
    }
  });

  // 3️⃣ PANADERO JEFE
  const panaderoJefe = await prisma.empleado.create({
    data: {
      nombre: 'Antonio López',
      email: 'panadero.jefe@udaredge.com',
      telefono: '+34 666 555 003',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      puesto: 'Panadero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '04:00',
      horarioSalida: '12:00',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 2200.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 9.0,
      horasMes: 176.0
    }
  });

  // 4️⃣ PANADERO
  const panadero = await prisma.empleado.create({
    data: {
      nombre: 'José Martín',
      email: 'panadero@udaredge.com',
      telefono: '+34 666 555 004',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      puesto: 'Panadero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '05:00',
      horarioSalida: '13:00',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 1800.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 8.3,
      horasMes: 168.0
    }
  });

  // 5️⃣ CAJERA PRINCIPAL
  const cajeraPrincipal = await prisma.empleado.create({
    data: {
      nombre: 'Laura Fernández',
      email: 'cajera.principal@udaredge.com',
      telefono: '+34 666 555 005',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      puesto: 'Cajero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '08:00',
      horarioSalida: '16:00',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 1600.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 8.9,
      horasMes: 168.0
    }
  });

  // 6️⃣ CAJERO
  const cajero = await prisma.empleado.create({
    data: {
      nombre: 'David Ruiz',
      email: 'cajero@udaredge.com',
      telefono: '+34 666 555 006',
      foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      puesto: 'Cajero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV002',
      
      // Horarios
      horarioEntrada: '16:00',
      horarioSalida: '22:00',
      turno: 'tarde',
      
      // Condiciones laborales
      salarioBase: 1500.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 7.8,
      horasMes: 144.0
    }
  });

  // 7️⃣ REPARTIDOR PRINCIPAL
  const repartidorPrincipal = await prisma.empleado.create({
    data: {
      nombre: 'Miguel Sánchez',
      email: 'repartidor.principal@udaredge.com',
      telefono: '+34 666 555 007',
      foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      puesto: 'Repartidor',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '12:00',
      horarioSalida: '20:00',
      turno: 'tarde',
      
      // Condiciones laborales
      salarioBase: 1700.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 8.5,
      horasMes: 160.0
    }
  });

  // 8️⃣ REPARTIDOR
  const repartidor = await prisma.empleado.create({
    data: {
      nombre: 'Pablo García',
      email: 'repartidor@udaredge.com',
      telefono: '+34 666 555 008',
      foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      puesto: 'Repartidor',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV002',
      
      // Horarios
      horarioEntrada: '18:00',
      horarioSalida: '24:00',
      turno: 'noche',
      
      // Condiciones laborales
      salarioBase: 1600.00,
      estado: 'activo',
      
      // Métricas
      desempeno: 7.9,
      horasMes: 152.0
    }
  });

  // 9️⃣ EMPLEADO DE VACACIONES
  const empleadoVacaciones = await prisma.empleado.create({
    data: {
      nombre: 'Carmen Torres',
      email: 'carmen.vacaciones@udaredge.com',
      telefono: '+34 666 555 009',
      foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      puesto: 'Cajero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV001',
      
      // Horarios
      horarioEntrada: '09:00',
      horarioSalida: '17:00',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 1550.00,
      estado: 'vacaciones',
      
      // Métricas
      desempeno: 8.1,
      horasMes: 0.0 // En vacaciones este mes
    }
  });

  // 🔟 EMPLEADO INACTIVO
  const empleadoInactivo = await prisma.empleado.create({
    data: {
      nombre: 'Roberto Silva',
      email: 'roberto.inactivo@udaredge.com',
      telefono: '+34 666 555 010',
      puesto: 'Panadero',
      
      // Multiempresa
      empresaId: 'UDAR001',
      marcaId: 'CAFE01',
      puntoVentaId: 'PDV002',
      
      // Horarios
      horarioEntrada: '04:30',
      horarioSalida: '12:30',
      turno: 'mañana',
      
      // Condiciones laborales
      salarioBase: 1750.00,
      estado: 'baja',
      fechaBaja: new Date('2024-11-15'),
      
      // Métricas
      desempeno: 7.2,
      horasMes: 0.0
    }
  });

  console.log('✅ Empleados creados exitosamente:');
  console.log(`   👑 Gerentes: 2`);
  console.log(`   👨‍🍳 Panaderos: 2`);
  console.log(`   💰 Cajeros: 2`);
  console.log(`   🛵 Repartidores: 2`);
  console.log(`   🏖️  En vacaciones: 1`);
  console.log(`   ❌ De baja: 1`);
  console.log('');
  
  // ============================================================================
  // CREAR FICHAJES DE EJEMPLO (OPCIONAL)
  // ============================================================================
  
  console.log('📋 Creando fichajes de ejemplo...');
  
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  // Fichajes de hoy para el gerente
  await prisma.fichaje.create({
    data: {
      empleadoId: gerente.id,
      tipo: 'entrada',
      fecha: hoy,
      hora: '08:00',
      horaTeorica: '08:00',
      diferenciaMinutos: 0,
      puntoVentaId: 'PDV001',
      validado: true
    }
  });

  // Fichajes de ayer para varios empleados
  await prisma.fichaje.createMany({
    data: [
      {
        empleadoId: panaderoJefe.id,
        tipo: 'entrada',
        fecha: ayer,
        hora: '04:00',
        horaTeorica: '04:00',
        diferenciaMinutos: 0,
        puntoVentaId: 'PDV001',
        validado: true
      },
      {
        empleadoId: panaderoJefe.id,
        tipo: 'salida',
        fecha: ayer,
        hora: '12:00',
        horaTeorica: '12:00',
        diferenciaMinutos: 0,
        puntoVentaId: 'PDV001',
        validado: true
      },
      {
        empleadoId: cajeraPrincipal.id,
        tipo: 'entrada',
        fecha: ayer,
        hora: '08:05',
        horaTeorica: '08:00',
        diferenciaMinutos: 5,
        puntoVentaId: 'PDV001',
        validado: false,
        observaciones: 'Llegada con retraso - tráfico'
      },
      {
        empleadoId: cajeraPrincipal.id,
        tipo: 'salida',
        fecha: ayer,
        hora: '16:00',
        horaTeorica: '16:00',
        diferenciaMinutos: 0,
        puntoVentaId: 'PDV001',
        validado: true
      }
    ]
  });
  
  console.log('✅ Fichajes de ejemplo creados');
  console.log('');
  
  // ============================================================================
  // MOSTRAR CREDENCIALES
  // ============================================================================
  
  console.log('🔑 CREDENCIALES PARA TESTING:');
  console.log('');
  console.log('👑 GERENTE PRINCIPAL:');
  console.log(`   Email: gerente@udaredge.com`);
  console.log(`   Nombre: Carlos Rodríguez`);
  console.log(`   Puesto: Gerente`);
  console.log(`   Turno: Mañana (08:00 - 18:00)`);
  console.log('');
  console.log('👑 SUBGERENTE:');
  console.log(`   Email: subgerente@udaredge.com`);
  console.log(`   Nombre: María González`);
  console.log(`   Puesto: Gerente`);
  console.log(`   Turno: Tarde (14:00 - 22:00)`);
  console.log('');
  console.log('📊 ESTADÍSTICAS:');
  console.log(`   Total empleados activos: 8`);
  console.log(`   Empleados de vacaciones: 1`);
  console.log(`   Empleados de baja: 1`);
  console.log(`   Total empleados: 10`);
  
}

main()
  .catch((e) => {
    console.error('❌ Error creando empleados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('');
    console.log('✨ Seeder completado. ¡Empleados listos para usar!');
  });