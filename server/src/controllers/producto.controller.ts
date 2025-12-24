import { Request, Response } from 'express';
import { ProductoService } from '../services/producto.service';

export const ProductoController = {
  async getAll(req: Request, res: Response) {
    const productos = await ProductoService.getAll();
    res.json(productos);
  },
  async getById(req: Request, res: Response) {
    const { id } = req.params;
    const producto = await ProductoService.getById(Number(id));
    if (!producto) return res.status(404).json({ error: 'No encontrado' });
    res.json(producto);
  },
  async create(req: Request, res: Response) {
    const nuevo = await ProductoService.create(req.body);
    res.status(201).json(nuevo);
  },
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const actualizado = await ProductoService.update(Number(id), req.body);
    res.json(actualizado);
  },
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await ProductoService.delete(Number(id));
    res.status(204).end();
  }
};
