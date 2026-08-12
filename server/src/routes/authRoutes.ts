import { Router } from 'express';
import { signup, login, getMe, clearAllUsers, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// /api/auth/signup
router.post('/signup', signup);

// /api/auth/login
router.post('/login', login);

// /api/auth/me
router.get('/me', authenticateToken, getMe);

// /api/auth/update-profile
router.put('/update-profile', authenticateToken, updateProfile);

// /api/auth/clear-all (Fresh Start)
router.delete('/clear-all', clearAllUsers);

export default router;
