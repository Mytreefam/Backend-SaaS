import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';

const router = Router();

router.get('/', ProductoController.getAll);
router.get('/:id', ProductoController.getById);
router.post('/', ProductoController.create);
router.put('/:id', ProductoController.update);
router.delete('/:id', ProductoController.delete);

export default router;
