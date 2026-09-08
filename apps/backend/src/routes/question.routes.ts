import { Router } from 'express';
import { listQuestions, getQuestion, createQuestion, updateQuestion, deleteQuestion } from '../controllers/question.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listQuestions);
router.get('/:id', getQuestion);
router.post('/', authMiddleware, adminMiddleware, createQuestion);
router.put('/:id', authMiddleware, adminMiddleware, updateQuestion);
router.delete('/:id', authMiddleware, adminMiddleware, deleteQuestion);

export default router;
