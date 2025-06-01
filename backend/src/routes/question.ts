import { Router } from 'express';
import {
  createQuestion,
  getExamQuestions,
  updateQuestion,
  deleteQuestion,
  getQuestionTemplates
} from '../controllers/questionController';
import { authenticate, requireInstructor } from '../middleware/auth';
import { questionValidation, validateRequest } from '../middleware/validation';

const router = Router();

router.post('/', authenticate, requireInstructor, questionValidation, validateRequest, createQuestion);
router.get('/exam/:examId', authenticate, getExamQuestions);
router.put('/:id', authenticate, requireInstructor, updateQuestion);
router.delete('/:id', authenticate, requireInstructor, deleteQuestion);
router.get('/:questionId/templates', authenticate, getQuestionTemplates);

export default router;
