import { Router } from 'express';
import { createResume, getUserResumes, getResumeById, updateResume, deleteResume } from '../controllers/resumeController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Protect all resume routes with JWT authentication
router.use(authenticateToken);

// /api/resumes
router.post('/', createResume);
router.get('/', getUserResumes);

// /api/resumes/:id
router.get('/:id', getResumeById);
router.put('/:id', updateResume);
router.delete('/:id', deleteResume);

export default router;
