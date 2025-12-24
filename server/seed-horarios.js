/**
 * SEED: Horarios de Trabajo
 * Populate database with example schedules and assignments
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de horarios...');

  // Limpiar asignaciones y horarios anteriores
  console.log('🗑️  Limpiando asignaciones y horarios...');
  await prisma.asignacionTurno.deleteMany();
  await prisma.horarioEmpleado.deleteMany();
  await prisma.horario.deleteMany();

  // Crear plantillas de horarios
  const horarios = await prisma.horario.createMany({
    data: [
      {
        nombre: 'Turno Mañana',
        descripcion: 'Horario de mañana: 08:00 - 14:00',
        empresaId: 'EMP-001',
        lunes: '08:00-14:00',
        martes: '08:00-14:00',
        miercoles: '08:00-14:00',
        jueves: '08:00-14:00',
        viernes: '08:00-14:00',
        sabado: '08:00-14:00',
        domingo: null,
        horasSemana: 40,
        activo: true
      },
      {
        nombre: 'Turno Tarde',
        descripcion: 'Horario de tarde: 14:00 - 21:00',
        empresaId: 'EMP-001',
        lunes: '14:00-21:00',
        martes: '14:00-21:00',
        miercoles: '14:00-21:00',
        jueves: '14:00-21:00',
        viernes: '14:00-21:00',
        sabado: '14:00-21:00',
        domingo: null,
        horasSemana: 40,
        activo: true
      },
      {
        nombre: 'Turno Noche',
        descripcion: 'Horario de noche: 21:00 - 06:00',
        empresaId: 'EMP-001',
        lunes: '21:00-06:00',
        martes: '21:00-06:00',
        miercoles: '21:00-06:00',
        jueves: '21:00-06:00',
        viernes: '21:00-06:00',
        sabado: '21:00-06:00',
        domingo: null,
        horasSemana: 40,
        activo: true
      },
      {
        nombre: 'Jornada Completa',
        descripcion: 'Horario completo: 08:00 - 17:00',
        empresaId: 'EMP-001',
        lunes: '08:00-17:00',
        martes: '08:00-17:00',
        miercoles: '08:00-17:00',
        jueves: '08:00-17:00',
        viernes: '08:00-17:00',
        sabado: null,
        domingo: null,
        horasSemana: 40,
        activo: true
      },
      {
        nombre: 'Flexible Fin de Semana',
        descripcion: 'Horario flexible para fines de semana',
        empresaId: 'EMP-001',
        lunes: null,
        martes: null,
        miercoles: null,
        jueves: null,
        viernes: '14:00-23:00',
        sabado: '10:00-21:00',
        domingo: '10:00-21:00',
        horasSemana: 30,
        activo: true
      }
    ]
  });

  console.log(`✅ ${horarios.count} plantillas de horarios creadas`);

  // Obtener empleados
  const empleados = await prisma.empleado.findMany({
    take: 8,
    orderBy: { id: 'asc' }
  });

  console.log(`📦 Encontrados ${empleados.length} empleados`);

  // Asignar horarios a empleados
  const asignacionesData = [];
  const hoy = new Date();
  const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
  const en60Dias = new Date(hoy.getTime() + 60 * 24 * 60 * 60 * 1000);

  // Obtener todos los horarios creados
  const horariosCreados = await prisma.horario.findMany();
  const horarioMañana = horariosCreados.find(h => h.nombre === 'Turno Mañana');
  const horarioTarde = horariosCreados.find(h => h.nombre === 'Turno Tarde');
  const horarioNoche = horariosCreados.find(h => h.nombre === 'Turno Noche');
  const jornada = horariosCreados.find(h => h.nombre === 'Jornada Completa');

  // Asignar turnos a empleados
  if (empleados.length > 0 && horarioMañana) {
    asignacionesData.push({
      empleadoId: empleados[0].id,
      horarioId: horarioMañana.id,
      fechaVigenciaDesde: hace30Dias,
      fechaVigenciaHasta: en60Dias,
      estado: 'activo'
    });
  }

  if (empleados.length > 1 && horarioTarde) {
    asignacionesData.push({
      empleadoId: empleados[1].id,
      horarioId: horarioTarde.id,
      fechaVigenciaDesde: hace30Dias,
      fechaVigenciaHasta: en60Dias,
      estado: 'activo'
    });
  }

  if (empleados.length > 2 && horarioNoche) {
    asignacionesData.push({
      empleadoId: empleados[2].id,
      horarioId: horarioNoche.id,
      fechaVigenciaDesde: hace30Dias,
      fechaVigenciaHasta: en60Dias,
      estado: 'activo'
    });
  }

  if (empleados.length > 3 && jornada) {
    asignacionesData.push({
      empleadoId: empleados[3].id,
      horarioId: jornada.id,
      fechaVigenciaDesde: hace30Dias,
      fechaVigenciaHasta: null,
      estado: 'activo'
    });
  }

  if (empleados.length > 4 && horarioMañana) {
    asignacionesData.push({
      empleadoId: empleados[4].id,
      horarioId: horarioMañana.id,
      fechaVigenciaDesde: hace30Dias,
      fechaVigenciaHasta: en60Dias,
      estado: 'activo'
    });
  }

  if (asignacionesData.length > 0) {
    const asignaciones = await prisma.asignacionTurno.createMany({
      data: asignacionesData
    });
    console.log(`✅ ${asignaciones.count} asignaciones de turnos creadas`);
  }

  // Crear algunos horarios específicos para empleados (excepciones)
  const horariosEspeciales = [];
  
  if (empleados.length > 0) {
    // Mañana especial para el primer empleado
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    horariosEspeciales.push({
      empleadoId: empleados[0].id,
      fecha: manana,
      horaEntrada: '07:00',
      horaSalida: '13:00',
      tipodia: 'laboral',
      observaciones: 'Entrada anticipada por evento especial'
    });
  }

  if (empleados.length > 1) {
    // Día de descanso
    const descanso = new Date(hoy);
    descanso.setDate(descanso.getDate() + 3);
    
    horariosEspeciales.push({
      empleadoId: empleados[1].id,
      fecha: descanso,
      horaEntrada: '00:00',
      horaSalida: '00:00',
      tipodia: 'descanso',
      observaciones: 'Día de descanso semanal'
    });
  }

  if (horariosEspeciales.length > 0) {
    const especiales = await prisma.horarioEmpleado.createMany({
      data: horariosEspeciales
    });
    console.log(`✅ ${especiales.count} horarios especiales/excepciones creados`);
  }

  console.log('🎉 Seed completado exitosamente');
}

main()
  .catch(error => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
