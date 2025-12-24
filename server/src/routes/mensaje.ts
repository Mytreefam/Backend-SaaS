import { Router } from 'express';
import * as mensajeController from '../controllers/mensaje.controller';

const router = Router();

router.get('/chat/:chatId', mensajeController.getMensajesByChat);
router.get('/:id', mensajeController.getMensajeById);
router.post('/', mensajeController.createMensaje);
router.put('/:id', mensajeController.updateMensaje);
router.delete('/:id', mensajeController.deleteMensaje);

export default router;
