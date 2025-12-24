import { Request, Response } from 'express';
import { CuponService } from '../services/cupon.service';

export const CuponController = {
  async getAll(req: Request, res: Response) {
    const cupones = await CuponService.getAll();
    res.json(cupones);
  },
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const cupon = await CuponService.getById(Number(id));
    if (!cupon) return res.status(404).json({ error: 'No encontrado' });
    res.json(cupon);
  },
  async create(req: Request, res: Response) {
    const nuevo = await CuponService.create(req.body);
    res.status(201).json(nuevo);
  },
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const actualizado = await CuponService.update(Number(id), req.body);
    res.json(actualizado);
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await CuponService.delete(Number(id));
    res.status(204).end();
  }
};
