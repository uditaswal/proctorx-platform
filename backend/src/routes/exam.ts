import { Router } from 'express';
import { 
  createExam, 
  getExamDetails, 
  startExamAttempt 
} from '../controllers/examController';
import { authenticate, requireInstructor } from '../middleware/auth';
import { examValidation, validateRequest } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, requireInstructor, examValidation, validateRequest, createExam);
router.get('/:id', authenticate, getExamDetails);
router.post('/start', authenticate, startExamAttempt);

