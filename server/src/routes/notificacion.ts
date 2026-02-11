import { Router } from 'express';
import * as notificacionController from '../controllers/notificacion.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Preferencias (debe ir antes que `/:id`)
router.get('/preferences', notificacionController.getPreferencias);
router.put(
  '/preferences',
  validate({
    body: z
      .object({
        canalesActivos: z
          .object({
            email: z.boolean().optional(),
            push: z.boolean().optional(),
            sms: z.boolean().optional(),
            in_app: z.boolean().optional(),
          })
          .optional(),
        preferencias: z.record(z.string(), z.any()).optional(),
        horarioSilencioso: z
          .object({
            activo: z.boolean().optional(),
            inicio: z.string().optional(),
            fin: z.string().optional(),
          })
          .optional(),
        frecuenciaEmail: z.enum(['inmediato', 'diario', 'semanal']).optional(),
        agruparNotificaciones: z.boolean().optional(),
      })
      .passthrough(),
  }),
  notificacionController.updatePreferencias,
);

// Dispositivos push (registro de token)
router.post(
  '/devices',
  validate({
    body: z.object({
      token: z.string().min(10),
      platform: z.string().min(1).optional(),
    }),
  }),
  notificacionController.registerPushDeviceToken,
);

// Notificación de prueba (para validar push/email/in-app)
router.post('/test', notificacionController.sendTestNotification);

router.get('/', notificacionController.getAllNotificaciones);
router.get('/:id', notificacionController.getNotificacionById);
router.post(
  '/',
  validate({
    body: z
      .object({
        mensaje: z.string().min(1),
        leida: z.boolean().optional(),
        titulo: z.string().min(1).optional(),
        tipo: z.string().min(1).optional(),
        prioridad: z.string().min(1).optional(),
        // solo gerente puede enviar clienteId (en controller se ignora para no-gerente)
        clienteId: z.number().int().optional(),
      })
      .passthrough(),
  }),
  notificacionController.createNotificacion,
);
router.put(
  '/:id',
  validate({
    params: z.object({ id: z.string().min(1) }),
    body: z
      .object({
        mensaje: z.string().min(1).optional(),
        leida: z.boolean().optional(),
        titulo: z.string().min(1).nullable().optional(),
        tipo: z.string().min(1).nullable().optional(),
        prioridad: z.string().min(1).nullable().optional(),
      })
      .passthrough(),
  }),
  notificacionController.updateNotificacion,
);
router.delete(
  '/:id',
  validate({ params: z.object({ id: z.string().min(1) }) }),
  notificacionController.deleteNotificacion,
);

export default router;
