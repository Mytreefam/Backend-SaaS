import { Router } from 'express';
import prisma from '../prisma/client';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    // Minimal DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false });
  }
});

export default router;

