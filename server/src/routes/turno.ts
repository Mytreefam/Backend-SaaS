import { Router } from 'express';
import {
  getAllTurnos,
  getTurnoById,
  createTurno,
  updateTurno,
  deleteTurno
} from '../controllers/turno.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', getAllTurnos);
router.get('/:id', getTurnoById);
router.post(
  '/',
  validate({
    body: z.object({
      numero: z.string().min(1),
      estado: z.string().min(1).optional(),
      tiempoEstimado: z.string().min(1).optional(),
      clienteId: z.number().int().optional(),
      pedidoId: z.number().int().optional(),
      origenPedido: z.string().min(1).optional(),
      geolocalizacionValidada: z.boolean().optional(),
      fechaGeolocalizacion: z.string().optional(),
    }),
  }),
  createTurno,
);
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      estado: z.string().min(1).optional(),
      tiempoEstimado: z.string().min(1).optional(),
      geolocalizacionValidada: z.boolean().optional(),
      fechaGeolocalizacion: z.string().optional(),
    }),
  }),
  updateTurno,
);
router.delete('/:id', deleteTurno);

export default router;
