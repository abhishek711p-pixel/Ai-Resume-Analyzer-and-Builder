import { Router } from 'express';
import { enhanceSummary, enhanceBullet, auditResume, askTechStack, suggestProjectTechStack, generateFromJd } from '../controllers/aiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Public Tech Stack Q&A route (accessible to all visitors)
router.post('/tech-stack-qa', askTechStack);
router.post('/suggest-project-techstack', suggestProjectTechStack);

// Protect sensitive AI routes with JWT authentication
router.use(authenticateToken);

// /api/ai/enhance/summary
router.post('/enhance/summary', enhanceSummary);

// /api/ai/enhance/bullet
router.post('/enhance/bullet', enhanceBullet);

// /api/ai/audit
router.post('/audit', auditResume);

// /api/ai/generate-from-jd
router.post('/generate-from-jd', generateFromJd);

export default router;

