import { Router } from 'express';
import { ProductoController } from '../controllers/producto.controller';
import { requireAuth, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Public catalog (Cliente)
router.get('/', ProductoController.getAll);
router.get('/:id', ProductoController.getById);

// Protected mutations (Gerente)
router.post('/', requireAuth, requireRole('gerente'), ProductoController.create);
router.put('/:id', requireAuth, requireRole('gerente'), ProductoController.update);
router.delete('/:id', requireAuth, requireRole('gerente'), ProductoController.delete);

export default router;
