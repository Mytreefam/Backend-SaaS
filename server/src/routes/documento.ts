import { Router } from 'express';
import * as documentoController from '../controllers/documento.controller';

const router = Router();

router.get('/', documentoController.getAllDocumentos);
router.get('/:id', documentoController.getDocumentoById);
router.post('/', documentoController.createDocumento);
router.put('/:id', documentoController.updateDocumento);
router.delete('/:id', documentoController.deleteDocumento);

export default router;
