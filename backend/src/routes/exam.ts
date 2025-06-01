import { Router } from 'express';
import { 
  createExam, 
  getExamDetails, 
  startExamAttempt 
} from '../controllers/examController';

import { authenticate, requireInstructor } from '../middleware/auth';
import { createExamSchema } from '../middleware/validation';
import { validate } from '../middleware/validation'; // the new one

const router = Router();

router.post(
  '/',
  authenticate,
  requireInstructor,
  validate(createExamSchema),  // ✅ only validate for this route
  createExam
);

router.get('/:id', authenticate, getExamDetails);
router.post('/start', authenticate, startExamAttempt);
export default router; 