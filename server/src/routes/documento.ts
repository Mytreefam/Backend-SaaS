import { Router } from 'express';
import * as documentoController from '../controllers/documento.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', documentoController.getAllDocumentos);
router.get('/:id', documentoController.getDocumentoById);
router.post(
  '/',
  validate({
    body: z.object({
      nombre: z.string().min(1),
      url: z.string().min(1),
      clienteId: z.number().int().optional(),
    }),
  }),
  documentoController.createDocumento,
);
router.put(
  '/:id',
  validate({
    body: z.object({
      nombre: z.string().min(1).optional(),
      url: z.string().min(1).optional(),
    }),
    params: z.object({ id: z.string().min(1) }),
  }),
  documentoController.updateDocumento,
);
router.delete('/:id', documentoController.deleteDocumento);

export default router;
