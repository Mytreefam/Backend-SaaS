/**
 * SEED: Gestión de Citas
 * Popula la base de datos con citas de ejemplo en diferentes estados
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔄 Limpiando citas existentes...');
    await prisma.cita.deleteMany();

    // Obtener algunos clientes para asociar con las citas
    const clientes = await prisma.cliente.findMany({ take: 5 });
    
    if (clientes.length === 0) {
      console.log('⚠️ No hay clientes en la base de datos. Creando clientes de ejemplo...');
      const clientesCreados = [];
      
      for (let i = 1; i <= 5; i++) {
        const cliente = await prisma.cliente.create({
          data: {
            nombre: `Cliente Test ${i}`,
            email: `cliente${i}@example.com`,
            password: 'hashedpassword',
            telefono: `60012345${i}`,
            role: 'cliente',
          },
        });
        clientesCreados.push(cliente);
      }
      
      // Usar los clientes creados
      const citasData = generarCitas(clientesCreados);
      await prisma.cita.createMany({ data: citasData });
    } else {
      // Usar los clientes existentes
      const citasData = generarCitas(clientes);
      await prisma.cita.createMany({ data: citasData });
    }

    console.log('✅ Citas creadas exitosamente');
  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

function generarCitas(clientes) {
  const estados = [
    'solicitada',
    'confirmada',
    'en_progreso',
    'completada',
    'cancelada',
    'no_presentado'
  ];

  const servicios = [
    'Consulta General',
    'Revisión de Documentos',
    'Asesoramiento',
    'Trámite Administrativo',
    'Seguimiento',
    'Evaluación',
    'Reunión de Coordinación',
    'Capacitación'
  ];

  const citas = [];
  let citaId = 0;

  // Generar citas para cada cliente
  clientes.forEach((cliente) => {
    // Cada cliente tendrá 3-4 citas en diferentes estados
    const numCitas = Math.floor(Math.random() * 2) + 3; // 3 o 4 citas

    for (let i = 0; i < numCitas; i++) {
      const estado = estados[citaId % estados.length];
      const servicio = servicios[Math.floor(Math.random() * servicios.length)];
      
      // Generar fecha aleatoria (últimos 30 días o próximos 30 días)
      const hoy = new Date();
      const diasOffset = Math.floor(Math.random() * 60) - 30; // -30 a +30 días
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() + diasOffset);

      // Generar hora aleatoria (8:00 - 17:00)
      const hora = `${String(Math.floor(Math.random() * 10) + 8).padStart(2, '0')}:${String(
        Math.floor(Math.random() * 60)
      ).padStart(2, '0')}`;

      let notas = '';
      let canceladaPor = null;
      let razonCancelacion = null;

      // Agregar notas y razones de cancelación según el estado
      if (estado === 'completada') {
        notas = 'Cita completada satisfactoriamente';
      } else if (estado === 'cancelada') {
        canceladaPor = 'admin';
        razonCancelacion = [
          'Cliente no disponible',
          'Cambio de planes',
          'Cancelación solicitada por el cliente'
        ][Math.floor(Math.random() * 3)];
        notas = razonCancelacion;
      } else if (estado === 'no_presentado') {
        notas = 'Cliente no se presentó a la cita';
      } else if (estado === 'en_progreso') {
        notas = 'Cita en curso';
      } else if (estado === 'confirmada') {
        notas = 'Cita confirmada por el cliente';
      }

      citas.push({
        fecha,
        hora,
        motivo: servicio,
        servicio,
        estado,
        clienteId: cliente.id,
        telefono: cliente.telefono,
        email: cliente.email,
        notas: notas || null,
        canceladaPor,
        razonCancelacion,
      });

      citaId++;
    }
  });

  return citas;
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
