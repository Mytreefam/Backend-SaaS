import { PresupuestoModel } from '../models/presupuesto.model';

export const getAllPresupuestos = async (req: any, res: any) => {
  const presupuestos = await PresupuestoModel.findAll();
  res.json(presupuestos);
};

export const getPresupuestoById = async (req: any, res: any) => {
  const { id } = req.params;
  const presupuesto = await PresupuestoModel.findById(Number(id));
  if (!presupuesto) return res.status(404).json({ error: 'No encontrado' });
  res.json(presupuesto);
};

export const createPresupuesto = async (req: any, res: any) => {
  const nuevo = await PresupuestoModel.create(req.body);
  res.status(201).json(nuevo);
};

export const updatePresupuesto = async (req: any, res: any) => {
  const { id } = req.params;
  const actualizado = await PresupuestoModel.update(Number(id), req.body);
  res.json(actualizado);
};

export const deletePresupuesto = async (req: any, res: any) => {
  const { id } = req.params;
  await PresupuestoModel.delete(Number(id));
  res.status(204).end();
};
