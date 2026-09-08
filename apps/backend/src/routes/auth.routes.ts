import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { loginSchema, registerSchema } from '@exam-portal/utils/security';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authMiddleware, me);

export default router;
