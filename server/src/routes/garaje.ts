import { Router } from 'express';
import * as garajeController from '../controllers/garaje.controller';

const router = Router();

router.get('/', garajeController.getAllGarajes);
router.get('/:id', garajeController.getGarajeById);
router.post('/', garajeController.createGaraje);
router.put('/:id', garajeController.updateGaraje);
router.delete('/:id', garajeController.deleteGaraje);

export default router;
