import { Router } from 'express';
import { CuponController } from '../controllers/cupon.controller';

const router = Router();

router.get('/', CuponController.getAll);
router.get('/:id', CuponController.getById);
router.post('/', CuponController.create);
router.put('/:id', CuponController.update);
router.delete('/:id', CuponController.delete);

export default router;
