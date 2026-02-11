import { PuntoVentaModel } from '../models/puntoVenta.model';

export const getAllPuntosVenta = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const includeInactivos = req.user.role === 'gerente' && String(req.query?.includeInactivos || '') === 'true';
  const puntos = await PuntoVentaModel.findAll({ includeInactivos });
  res.json({ success: true, data: puntos });
};

export const getPuntoVentaById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const pv = await PuntoVentaModel.findById(String(id));
  if (!pv) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  // Non-managers cannot access inactive PDVs
  if (req.user.role !== 'gerente' && pv.activo === false) {
    return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  }
  res.json({ success: true, data: pv });
};

export const createPuntoVenta = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });

  const payload: any = {
    id: req.body?.id,
    nombre: req.body?.nombre,
    direccion: req.body?.direccion,
    latitud: req.body?.latitud,
    longitud: req.body?.longitud,
    marcasIds: req.body?.marcasIds ?? [],
    activo: req.body?.activo ?? true,
  };
  const created = await PuntoVentaModel.create(payload);
  res.status(201).json({ success: true, data: created });
};

export const updatePuntoVenta = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });

  const { id } = req.params;
  const existing = await PuntoVentaModel.findById(String(id));
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });

  const payload: any = {
    nombre: req.body?.nombre,
    direccion: req.body?.direccion,
    latitud: req.body?.latitud,
    longitud: req.body?.longitud,
    marcasIds: req.body?.marcasIds,
    activo: req.body?.activo,
  };
  const updated = await PuntoVentaModel.update(String(id), payload);
  res.json({ success: true, data: updated });
};

export const deletePuntoVenta = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  const { id } = req.params;
  const existing = await PuntoVentaModel.findById(String(id));
  if (!existing) return res.status(404).json({ success: false, error: 'NOT_FOUND' });
  await PuntoVentaModel.delete(String(id));
  res.status(200).json({ success: true, data: { deleted: true } });
};

