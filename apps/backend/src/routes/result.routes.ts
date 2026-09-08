import { Router } from 'express';
import { listResults, getResult, adminListAllResults } from '../controllers/result.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', authMiddleware, listResults);
router.get('/admin', authMiddleware, adminMiddleware, adminListAllResults);
router.get('/:id', authMiddleware, getResult);

export default router;
