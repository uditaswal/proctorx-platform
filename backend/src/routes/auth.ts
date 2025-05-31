import express from 'express';
import { register, login } from '../controllers/authController';

const router = express.Router();


// register()
router.post('/api/auth', register);
 router.post('/login', login);


export default router;
