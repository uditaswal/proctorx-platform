import { Router } from 'express';
import { submitAnswer, submitExam } from '../controllers/submissionController';
import { gradeSubmission } from '../controllers/gradeController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

router.post('/answer', authenticate, submitAnswer);
router.post('/exam', authenticate, submitExam);
router.post('/:submissionId/grade', authenticate, requireInstructor, gradeSubmission);

export default router;
