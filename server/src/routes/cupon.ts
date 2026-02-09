import { Router } from 'express';
import { CuponController } from '../controllers/cupon.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', CuponController.getAll);
router.post(
  '/validar',
  validate({
    body: z.object({
      codigo: z.string().min(1),
      // client can send clienteId but it's ignored server-side (ownership comes from token)
      clienteId: z.number().int().optional(),
      total: z.number().positive().optional(),
    }),
  }),
  CuponController.validar,
);
router.get('/:id', CuponController.getById);
router.post('/', CuponController.create);
router.put('/:id', CuponController.update);
router.delete('/:id', CuponController.delete);

export default router;
