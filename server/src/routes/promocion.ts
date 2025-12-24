
import { Router } from 'express';
import { getAllPromociones, getPromocionById, createPromocion, updatePromocion, deletePromocion } from '../controllers/promocion.controller';

const router = Router();

router.get('/', getAllPromociones as any);
router.get('/:id', getPromocionById as any);
router.post('/', createPromocion as any);
router.put('/:id', updatePromocion as any);
router.delete('/:id', deletePromocion as any);

export default router;
