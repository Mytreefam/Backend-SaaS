import { Router } from 'express';
import { login, refresh, logout } from '../controllers/auth.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/login',
  validate({
    body: z.object({
      email: z.string().email(),
      password: z.string().min(1),
    }),
  }),
  login,
);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
