import type { Response } from 'express';
import prisma from '../../prisma/client';

export const listImpresoras = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const puntoVentaId = req.query?.puntoVentaId ? String(req.query.puntoVentaId) : undefined;
  if (!puntoVentaId) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: puntoVentaId es requerido' });

  const items = await prisma.impresoraConfig.findMany({
    where: { puntoVentaId },
    orderBy: { creadoEn: 'asc' },
  });
  return res.json({ success: true, data: items });
};

export const createImpresora = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const puntoVentaId = String(req.body?.puntoVentaId || '').trim();
  const nombre = String(req.body?.nombre || '').trim();
  const categorias = req.body?.categorias;

  if (!puntoVentaId) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: puntoVentaId es requerido' });
  if (!nombre) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: nombre es requerido' });
  if (!Array.isArray(categorias) || categorias.length === 0) {
    return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: categorias es requerido' });
  }

  const created = await prisma.impresoraConfig.create({
    data: {
      puntoVentaId,
      nombre,
      activa: req.body?.activa !== undefined ? Boolean(req.body.activa) : true,
      categorias,
      ipAddress: req.body?.ipAddress ? String(req.body.ipAddress) : null,
      modelo: req.body?.modelo ? String(req.body.modelo) : null,
    },
  });
  return res.status(201).json({ success: true, data: created });
};

export const updateImpresora = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: INVALID_ID' });

  const existing = await prisma.impresoraConfig.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  const data: any = {};
  if (req.body?.nombre !== undefined) data.nombre = String(req.body.nombre);
  if (req.body?.activa !== undefined) data.activa = Boolean(req.body.activa);
  if (req.body?.categorias !== undefined) data.categorias = req.body.categorias;
  if (req.body?.ipAddress !== undefined) data.ipAddress = req.body.ipAddress ? String(req.body.ipAddress) : null;
  if (req.body?.modelo !== undefined) data.modelo = req.body.modelo ? String(req.body.modelo) : null;

  const updated = await prisma.impresoraConfig.update({ where: { id }, data });
  return res.json({ success: true, data: updated });
};

export const deleteImpresora = async (req: any, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, error: 'VALIDATION_ERROR: INVALID_ID' });

  const existing = await prisma.impresoraConfig.findUnique({ where: { id } });
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  await prisma.impresoraConfig.delete({ where: { id } });
  return res.status(200).json({ success: true, data: { deleted: true } });
};

