import { Router } from 'express';
import {
  getExamGrades,
  getMyGrades,
  gradeSubmission
} from '../controllers/gradeController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

router.get('/exam/:examId', authenticate, requireInstructor, getExamGrades);
router.get('/my', authenticate, getMyGrades);
router.post('/submission/:submissionId', authenticate, requireInstructor, gradeSubmission);

export default router;
