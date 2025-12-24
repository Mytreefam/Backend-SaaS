import { Router } from 'express';
import * as presupuestoController from '../controllers/presupuesto.controller';

const router = Router();

router.get('/', presupuestoController.getAllPresupuestos);
router.get('/:id', presupuestoController.getPresupuestoById);
router.post('/', presupuestoController.createPresupuesto);
router.put('/:id', presupuestoController.updatePresupuesto);
router.delete('/:id', presupuestoController.deletePresupuesto);

export default router;
