import { Router } from 'express';
import {
  getDashboardStats,
  getExamAnalytics
} from '../controllers/analyticsController';
import { authenticate, requireInstructor } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/exam/:examId', authenticate, requireInstructor, getExamAnalytics);

export default router;
