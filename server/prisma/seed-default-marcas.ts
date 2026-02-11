/**
 * Seed default Marca rows for HOYPCM000.
 *
 * This fixes cases where PuntoVenta.marcasIds already contains IDs
 * (e.g. ["MRC-001","MRC-002"]) but the Marca table is empty.
 */
import prisma from '../src/prisma/client';

async function main() {
  const empresaId = 'HOYPCM000';

  // Ensure base Empresa exists (safe upsert)
  await prisma.empresa.upsert({
    where: { id: empresaId },
    update: { activo: true },
    create: {
      id: empresaId,
      codigo: empresaId,
      nombreFiscal: empresaId,
      nombreComercial: empresaId,
      activo: true,
    },
  });

  const marcas = [
    {
      id: 'MRC-001',
      codigo: 'MRC-001',
      nombre: 'Marca 1',
      colorIdentidad: '#4DB8BA',
      icono: '🍞',
      logoUrl: null as string | null,
      empresaId,
      activo: true,
    },
    {
      id: 'MRC-002',
      codigo: 'MRC-002',
      nombre: 'Marca 2',
      colorIdentidad: '#111827',
      icono: '🥐',
      logoUrl: null as string | null,
      empresaId,
      activo: true,
    },
  ];

  for (const m of marcas) {
    await prisma.marca.upsert({
      where: { id: m.id },
      update: {
        codigo: m.codigo,
        nombre: m.nombre,
        colorIdentidad: m.colorIdentidad,
        icono: m.icono,
        logoUrl: m.logoUrl,
        empresaId: m.empresaId,
        activo: true,
      },
      create: m,
    });
  }

  console.log(`✅ Seeded ${marcas.length} marcas for empresa ${empresaId}`);
}

main()
  .catch((e) => {
    console.error('❌ seed-default-marcas error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

