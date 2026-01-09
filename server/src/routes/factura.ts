import { Router } from 'express';
import * as facturaController from '../controllers/factura.controller';

const router = Router();

router.get('/', facturaController.getAllFacturas);
router.get('/:id', facturaController.getFacturaById);
router.get('/:id/pdf', facturaController.downloadPdf);
router.post('/', facturaController.createFactura);
router.put('/:id', facturaController.updateFactura);
router.delete('/:id', facturaController.deleteFactura);

export default router;
