import { Router } from 'express';
import {
  enrollInExam,
  getMyEnrollments,
  getExamEnrollments
} from '../controllers/enrollmentController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, enrollInExam);
router.get('/my', authenticate, getMyEnrollments);
router.get('/exam/:examId', authenticate, requireInstructor, getExamEnrollments);

export default router;
