import { Router } from 'express';
import * as onboardingController from '../controllers/onboarding.controller';

const router = Router();

// GET /onboarding/estadisticas?empresaId=EMPRESA-001
router.get('/estadisticas', onboardingController.obtenerEstadisticas);

export default router;
