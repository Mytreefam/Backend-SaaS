import { GarajeModel } from '../models/garaje.model';

export const getAllGarajes = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const garajes =
    req.user.role === 'gerente'
      ? await GarajeModel.findAll()
      : await GarajeModel.findAll({ clienteId: req.user.id });
  res.json(garajes);
};

export const getGarajeById = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const garaje = await GarajeModel.findById(Number(id));
  if (!garaje) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && garaje.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  res.json(garaje);
};

export const createGaraje = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const payload: any = {
    nombre: req.body?.nombre,
    ubicacion: req.body?.ubicacion,
  };
  if (req.user.role === 'gerente' && req.body?.clienteId) {
    payload.clienteId = Number(req.body.clienteId);
  } else {
    payload.clienteId = req.user.id;
  }
  const nuevo = await GarajeModel.create(payload);
  res.status(201).json(nuevo);
};

export const updateGaraje = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await GarajeModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  const payload: any = { nombre: req.body?.nombre, ubicacion: req.body?.ubicacion };
  const actualizado = await GarajeModel.update(Number(id), payload);
  res.json(actualizado);
};

export const deleteGaraje = async (req: any, res: any) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
  const { id } = req.params;
  const existing = await GarajeModel.findById(Number(id));
  if (!existing) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.role !== 'gerente' && existing.clienteId !== req.user.id) {
    return res.status(403).json({ success: false, error: 'FORBIDDEN' });
  }
  await GarajeModel.delete(Number(id));
  res.status(204).end();
};
