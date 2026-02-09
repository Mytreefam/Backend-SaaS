import { Router } from 'express';
import * as garajeController from '../controllers/garaje.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', garajeController.getAllGarajes);
router.get('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), garajeController.getGarajeById);
router.post(
  '/',
  validate({
    body: z.object({
      nombre: z.string().min(1),
      ubicacion: z.string().min(1),
      clienteId: z.number().int().optional(),
    }),
  }),
  garajeController.createGaraje,
);
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      nombre: z.string().min(1).optional(),
      ubicacion: z.string().min(1).optional(),
    }),
  }),
  garajeController.updateGaraje,
);
router.delete('/:id', garajeController.deleteGaraje);

export default router;
