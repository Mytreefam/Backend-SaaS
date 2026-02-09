import { Router } from 'express';
import * as facturaController from '../controllers/factura.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', facturaController.getAllFacturas);
router.get('/:id', facturaController.getFacturaById);
router.get('/:id/pdf', facturaController.downloadPdf);
router.post(
  '/',
  validate({
    body: z.object({
      numero: z.string().min(1).optional(),
      clienteId: z.number().int().optional(),
      pedidoId: z.number().int().nullable().optional(),
      total: z.number().positive(),
      subtotal: z.number().nonnegative(),
      impuestos: z.number().nonnegative().optional(),
      metodoPago: z.string().min(1).optional(),
      estadoVerifactu: z.string().min(1).optional(),
      marcaId: z.string().min(1).optional(),
      puntoVentaId: z.string().min(1).nullable().optional(),
      notas: z.string().nullable().optional(),
    }),
  }),
  facturaController.createFactura,
);
router.put(
  '/:id',
  validate({
    body: z.object({
      total: z.number().positive().optional(),
      subtotal: z.number().nonnegative().optional(),
      impuestos: z.number().nonnegative().optional(),
      metodoPago: z.string().min(1).optional(),
      estadoVerifactu: z.string().min(1).optional(),
      notas: z.string().nullable().optional(),
      puntoVentaId: z.string().min(1).nullable().optional(),
    }),
    params: z.object({ id: z.string().min(1) }),
  }),
  facturaController.updateFactura,
);
router.delete('/:id', facturaController.deleteFactura);

export default router;
