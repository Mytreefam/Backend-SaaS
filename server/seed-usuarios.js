/**
 * SEED: Usuarios de prueba para autenticación y roles
 * Ejecutar con: node seed-usuarios.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Creando usuarios de prueba...');

  // Usuarios de prueba
  const usuarios = [
    {
      nombre: 'Admin',
      email: 'admin@udar.com',
      password: 'Admin1234',
      role: 'admin',
    },
    {
      nombre: 'Gerente',
      email: 'gerente@udar.com',
      password: 'Gerente1234',
      role: 'gerente',
    },
    {
      nombre: 'Empleado',
      email: 'empleado@udar.com',
      password: 'Empleado1234',
      role: 'empleado',
    },
    {
      nombre: 'Invitado',
      email: 'invitado@udar.com',
      password: 'Invitado1234',
      role: 'invitado',
    },
  ];

  for (const usuario of usuarios) {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    await prisma.cliente.upsert({
      where: { email: usuario.email },
      update: {},
      create: {
        codigo: `USR-${usuario.role.toUpperCase()}`,
        nombre: usuario.nombre,
        email: usuario.email,
        password: hashedPassword,
        role: usuario.role,
        telefono: '600000000',
        avatar: null,
        ciudad: 'Pruebas',
        idioma: 'es',
      },
    });
    console.log(`✓ Usuario creado: ${usuario.email} (${usuario.role})`);
  }

  console.log('✅ Usuarios de prueba creados.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
