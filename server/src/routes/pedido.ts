import { Router } from 'express';
import * as pedidoController from '../controllers/pedido.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();
router.get('/', pedidoController.getAllPedidos);
router.get('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), pedidoController.getPedidoById);
router.post(
  '/',
  validate({
    body: z.object({
      clienteId: z.union([z.number().int(), z.string().min(1)]).optional(),
      fecha: z.string().optional(),
      estado: z.string().optional(),
      total: z.number().nonnegative(),
      tipoEntrega: z.string().optional(),
      direccionEntrega: z.string().min(1).optional(),
      metodoPago: z.string().optional(),
      puntoVentaId: z.string().min(1).optional(),
      items: z.array(
        z.object({
          productoId: z.number().int().optional(),
          nombre: z.string().optional(),
          cantidad: z.number().int().positive(),
          precio: z.number().nonnegative(),
        }),
      ),
    }),
  }),
  pedidoController.createPedido,
);
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      estado: z.string().optional(),
      total: z.number().nonnegative().optional(),
      tipoEntrega: z.string().optional(),
      direccionEntrega: z.string().min(1).optional(),
      metodoPago: z.string().optional(),
      puntoVentaId: z.string().min(1).optional(),
      motivoCancelacion: z.string().optional(),
      motivoDevolucion: z.string().optional(),
    }),
  }),
  pedidoController.updatePedido,
);
router.post(
  '/:id/cobrar',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  pedidoController.cobrarPedido,
);
router.delete('/:id', pedidoController.deletePedido);

export default router;
