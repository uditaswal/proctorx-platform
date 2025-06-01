import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

// Async handler helper to wrap async functions and forward errors to Express error handler
const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const router = express.Router();

// Middleware to check admin role
const requireAdmin = asyncHandler(async (req: any, res: any, next: any) => {
  const user = req.user;

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
});

// Get dashboard stats
router.get(
  '/dashboard',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const [
      { count: totalUsers },
      { count: totalExams },
      { count: activeExams },
      { count: completedAttempts }
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*', { count: 'exact', head: true }),
      supabase.from('exams').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('exam_attempts').select('*', { count: 'exact', head: true }).eq('status', 'completed')
    ]);

    res.json({
      totalUsers,
      totalExams,
      activeExams,
      completedAttempts
    });
  })
);

// Get all users
router.get(
  '/users',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { data: users, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(users);
  })
);

// Update user role
router.put(
  '/users/:id/role',
  authenticate,
  requireAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['student', 'instructor', 'admin'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'User role updated successfully' });
  })
);

export default router;
