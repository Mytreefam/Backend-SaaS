import { Request, Response } from 'express';
import { CuponService } from '../services/cupon.service';

export const CuponController = {
  async getAll(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    const cupones = await CuponService.getAll();
    res.json({ success: true, data: cupones });
  },
  async getById(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    const { id } = req.params;
    const cupon = await CuponService.getById(Number(id));
    if (!cupon) return res.status(404).json({ error: 'No encontrado' });
    res.json({ success: true, data: cupon });
  },
  async create(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    const nuevo = await CuponService.create(req.body);
    res.status(201).json({ success: true, data: nuevo });
  },
  async update(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    const { id } = req.params;
    const actualizado = await CuponService.update(Number(id), req.body);
    res.json({ success: true, data: actualizado });
  },
  async delete(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    if (req.user.role !== 'gerente') return res.status(403).json({ success: false, error: 'FORBIDDEN' });
    const { id } = req.params;
    await CuponService.delete(Number(id));
    res.status(200).json({ success: true, data: { deleted: true } });
  },

  async validar(req: Request, res: Response) {
    if (!req.user) return res.status(401).json({ success: false, error: 'UNAUTHORIZED' });
    const { codigo, total } = req.body as { codigo: string; total?: number };

    const result = await CuponService.validar({
      codigo,
      total,
      requester: req.user,
    });

    if (!result.valido) {
      // Back-compat: keep {valido, mensaje...} at top-level
      return res.status(400).json({ success: false, error: 'CUPON_INVALID', data: result, ...result });
    }
    return res.status(200).json({ success: true, data: result, ...result });
  },
};
