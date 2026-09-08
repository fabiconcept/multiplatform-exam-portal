import { Router } from 'express';
import { listExams, getExam, createExam, submitExam } from '../controllers/exam.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { idempotencyMiddleware } from '../middleware/idempotency';

const router = Router();

router.get('/', listExams);
router.get('/:id', getExam);
router.post('/', authMiddleware, adminMiddleware, createExam);
router.post('/:id/submit', authMiddleware, idempotencyMiddleware, submitExam);

export default router;
