/**
 * 🔁 SEED: Reset users passwords and create one user per role
 *
 * WARNING: This will overwrite passwords for ALL `Cliente` rows.
 * Use only in environments where you intentionally want to reset access.
 */
import bcrypt from 'bcryptjs';
import prisma from '../src/prisma/client';

const SIMPLE_PASSWORD = '123456789';

function normalizeRole(role: unknown): 'cliente' | 'trabajador' | 'gerente' {
  const r = String(role || '').trim().toLowerCase();
  if (r === 'gerente' || r === 'trabajador' || r === 'cliente') return r as any;
  // legacy roles like "admin" become "gerente" or "cliente" depending on your policy
  if (r === 'admin') return 'gerente';
  return 'cliente';
}

async function upsertUser(params: { email: string; role: 'cliente' | 'trabajador' | 'gerente'; codigo: string; nombre: string; telefono?: string }) {
  const passwordHash = await bcrypt.hash(SIMPLE_PASSWORD, 12);
  await prisma.cliente.upsert({
    where: { email: params.email },
    update: {
      role: params.role,
      password: passwordHash,
      nombre: params.nombre,
      codigo: params.codigo,
      telefono: params.telefono || null,
    },
    create: {
      email: params.email,
      role: params.role,
      password: passwordHash,
      nombre: params.nombre,
      codigo: params.codigo,
      telefono: params.telefono || null,
    },
  });
}

async function main() {
  console.log('🔁 Resetting ALL Cliente passwords...');

  // Revoke all sessions so old refresh tokens stop working
  await prisma.refreshToken.updateMany({
    where: { revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const hash = await bcrypt.hash(SIMPLE_PASSWORD, 12);

  // Normalize roles and reset passwords for all existing users
  const existing = await prisma.cliente.findMany({ select: { id: true, role: true } });
  for (const u of existing) {
    await prisma.cliente.update({
      where: { id: u.id },
      data: {
        password: hash,
        role: normalizeRole(u.role),
      },
    });
  }

  // Ensure one user per role exists (known credentials)
  await upsertUser({
    email: 'cliente@prueba.com',
    role: 'cliente',
    codigo: 'CLI-RESET',
    nombre: 'Cliente Reset',
    telefono: '600000001',
  });
  await upsertUser({
    email: 'trabajador@prueba.com',
    role: 'trabajador',
    codigo: 'TRB-RESET',
    nombre: 'Trabajador Reset',
    telefono: '600000003',
  });
  await upsertUser({
    email: 'gerente@prueba.com',
    role: 'gerente',
    codigo: 'GER-RESET',
    nombre: 'Gerente Reset',
    telefono: '600000002',
  });

  console.log('✅ Usuarios restablecidos.');
  console.log('🔑 Credenciales (todas con la misma contraseña):');
  console.log(`- cliente@prueba.com / ${SIMPLE_PASSWORD}`);
  console.log(`- trabajador@prueba.com / ${SIMPLE_PASSWORD}`);
  console.log(`- gerente@prueba.com / ${SIMPLE_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ seed-reset-users error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

