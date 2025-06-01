import { Router } from 'express';
import { recordViolation } from '../controllers/proctoringController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/violation', authenticate, recordViolation);

export default router;
