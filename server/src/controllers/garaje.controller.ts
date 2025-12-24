import { GarajeModel } from '../models/garaje.model';

export const getAllGarajes = async (req: any, res: any) => {
  const garajes = await GarajeModel.findAll();
  res.json(garajes);
};

export const getGarajeById = async (req: any, res: any) => {
  const { id } = req.params;
  const garaje = await GarajeModel.findById(Number(id));
  if (!garaje) return res.status(404).json({ error: 'No encontrado' });
  res.json(garaje);
};

export const createGaraje = async (req: any, res: any) => {
  const nuevo = await GarajeModel.create(req.body);
  res.status(201).json(nuevo);
};

export const updateGaraje = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizado = await GarajeModel.update(Number(id), req.body);
  res.json(actualizado);
};

export const deleteGaraje = async (req: any, res: any) => {
  const { id } = req.params;
  await GarajeModel.delete(Number(id));
  res.status(204).end();
};
