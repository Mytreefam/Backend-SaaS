import { Router } from 'express';
import { login, refresh, logout, changePassword, listSessions, revokeAllSessions } from '../controllers/auth.controller';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { requireAuth } from '../middleware/auth.middleware';

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

router.post(
  '/change-password',
  requireAuth,
  validate({
    body: z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8),
    }),
  }),
  changePassword,
);

router.get('/sessions', requireAuth, listSessions);
router.post('/sessions/revoke-all', requireAuth, revokeAllSessions);

export default router;
