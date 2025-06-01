import { Router } from 'express';
import { register, login, logout } from '../controllers/authController';
import { registerSchema, loginSchema, createExamSchema,createQuestionSchema } from '../middleware/validation';

const router = Router();

router.post('/register', registerValidation, validateRequest, register);
router.post('/login', loginValidation, validateRequest, login);
router.post('/logout', logout);

export default router;

