import { Router } from 'express';
import * as notificacionController from '../controllers/notificacion.controller';

const router = Router();
router.get('/', notificacionController.getAllNotificaciones);
router.get('/:id', notificacionController.getNotificacionById);
router.post('/', notificacionController.createNotificacion);
router.put('/:id', notificacionController.updateNotificacion);
router.delete('/:id', notificacionController.deleteNotificacion);

export default router;
