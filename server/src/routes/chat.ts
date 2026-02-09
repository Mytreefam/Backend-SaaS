import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.get('/', chatController.getAllChats);
router.get('/:id', validate({ params: z.object({ id: z.string().min(1) }) }), chatController.getChatById);
router.post(
  '/',
  validate({
    body: z.object({
      asunto: z.string().min(1).optional(),
      estado: z.string().min(1).optional(),
      clienteId: z.number().int().optional(),
      pedidoId: z.number().int().nullable().optional(),
      mensajes: z
        .array(
          z.object({
            contenido: z.string().min(1),
            remitente: z.string().min(1).optional(),
            leido: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
  }),
  chatController.createChat,
);
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
      asunto: z.string().min(1).optional(),
      estado: z.string().min(1).optional(),
    }),
  }),
  chatController.updateChat,
);
router.delete('/:id', chatController.deleteChat);

router.post(
  '/:chatId/mensajes',
  validate({
    params: z.object({ chatId: z.string().min(1) }),
    body: z.object({
      contenido: z.string().min(1),
      remitente: z.string().min(1).optional(),
      leido: z.boolean().optional(),
    }),
  }),
  chatController.addMensaje,
);
router.delete('/mensajes/:id', chatController.deleteMensaje);

export default router;
