import { Router } from 'express';
import { listSubjects, getSubject, createSubject, updateSubject, deleteSubject } from '../controllers/subject.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', listSubjects);
router.get('/:id', getSubject);
router.post('/', authMiddleware, adminMiddleware, createSubject);
router.put('/:id', authMiddleware, adminMiddleware, updateSubject);
router.delete('/:id', authMiddleware, adminMiddleware, deleteSubject);

export default router;
