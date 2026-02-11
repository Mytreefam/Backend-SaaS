
import { Router } from 'express';
import { getAllPromociones, getPromocionById, createPromocion, updatePromocion, deletePromocion } from '../controllers/promocion.controller';

const router = Router();

// Normalize responses to standard envelope for `envelopedFetch`
router.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  (res as any).json = (body: any) => {
    if (body && typeof body.success === 'boolean') return originalJson(body);
    const status = res.statusCode || 200;
    const maybeError =
      (body && typeof body === 'object' && typeof body.error === 'string' && body.error) ||
      (typeof body === 'string' && body) ||
      null;
    if (status >= 400 || maybeError) return originalJson({ success: false, error: maybeError || 'ERROR' });
    return originalJson({ success: true, data: body });
  };
  next();
});

router.get('/', getAllPromociones as any);
router.get('/:id', getPromocionById as any);
router.post('/', createPromocion as any);
router.put('/:id', updatePromocion as any);
router.delete('/:id', deletePromocion as any);

export default router;
