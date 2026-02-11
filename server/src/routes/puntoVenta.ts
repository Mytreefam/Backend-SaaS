import { Router } from 'express';
import * as puntoVentaController from '../controllers/puntoVenta.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', puntoVentaController.getAllPuntosVenta);
router.get('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), puntoVentaController.getPuntoVentaById);

router.post(
  '/',
  validate({
    body: z.object({
      id: z.string().min(3),
      nombre: z.string().min(1),
      direccion: z.string().min(1),
      latitud: z.number(),
      longitud: z.number(),
      marcasIds: z.array(z.string().min(1)).optional(),
      activo: z.boolean().optional(),
    }),
  }),
  puntoVentaController.createPuntoVenta,
);

router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        nombre: z.string().min(1).optional(),
        direccion: z.string().min(1).optional(),
        latitud: z.number().optional(),
        longitud: z.number().optional(),
        marcasIds: z.array(z.string().min(1)).optional(),
        activo: z.boolean().optional(),
      })
      .passthrough(),
  }),
  puntoVentaController.updatePuntoVenta,
);

router.delete('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), puntoVentaController.deletePuntoVenta);

export default router;

