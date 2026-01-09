import { Router } from 'express';
import { crearCierreCaja, listarCierresCaja, obtenerCierreCaja } from '../controllers/caja.controller';

const router = Router();

router.post('/', crearCierreCaja);
router.get('/', listarCierresCaja);
router.get('/:id', obtenerCierreCaja);

export default router;
