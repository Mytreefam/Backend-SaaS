import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

// Public catalog endpoints for Cliente app (no RBAC).

router.get('/marcas', async (_req, res) => {
  try {
    const marcas = await prisma.marca.findMany({
      where: { activo: true },
      orderBy: [{ empresaId: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        codigo: true,
        nombre: true,
        colorIdentidad: true,
        icono: true,
        logoUrl: true,
        empresaId: true,
        activo: true,
      },
    });
    return res.json(marcas);
  } catch (e) {
    console.error('public/marcas error:', e);
    return res.status(500).json({ error: 'PUBLIC_MARCAS_FAILED' });
  }
});

router.get('/puntos-venta', async (_req, res) => {
  try {
    const pdvs = await prisma.puntoVenta.findMany({
      where: { activo: true },
      orderBy: [{ empresaId: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        nombre: true,
        direccion: true,
        latitud: true,
        longitud: true,
        empresaId: true,
        marcasIds: true,
        activo: true,
      },
    });
    return res.json(pdvs);
  } catch (e) {
    console.error('public/puntos-venta error:', e);
    return res.status(500).json({ error: 'PUBLIC_PDV_FAILED' });
  }
});

router.get('/empresas', async (_req, res) => {
  try {
    const empresas = await prisma.empresa.findMany({
      where: { activo: true },
      orderBy: { id: 'asc' },
      include: {
        marcas: { where: { activo: true }, orderBy: { id: 'asc' } },
        puntosVenta: { where: { activo: true }, orderBy: { id: 'asc' } },
      },
    });
    return res.json(empresas);
  } catch (e) {
    console.error('public/empresas error:', e);
    return res.status(500).json({ error: 'PUBLIC_EMPRESAS_FAILED' });
  }
});

export default router;

