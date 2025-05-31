import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/api/auth', register);

export default router;
