import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';

const router = Router();

router.get('/', chatController.getAllChats);
router.get('/:id', chatController.getChatById);
router.post('/', chatController.createChat);
router.put('/:id', chatController.updateChat);
router.delete('/:id', chatController.deleteChat);

router.post('/:chatId/mensajes', chatController.addMensaje);
router.delete('/mensajes/:id', chatController.deleteMensaje);

export default router;
