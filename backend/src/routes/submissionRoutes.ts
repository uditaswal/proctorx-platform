import express from 'express';
import asyncHandler from 'express-async-handler';
import { verifyUser } from '../middleware/auth';
import { submitAnswer } from '../controllers/submissionController';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// Submit answer
router.post('/', verifyUser, submitAnswer);

// Get user's submissions for an exam attempt
router.get(
  '/attempt/:attempt_id',
  verifyUser,
  asyncHandler(async (req, res) => {
    const { attempt_id } = req.params;
    const user = (req as any).user;

    // Verify attempt belongs to user
    const { data: attempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .single();

    if (!attempt) {
      res.status(404).json({ error: 'Exam attempt not found' });
      return;
    }

    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        questions(question_text, type, points)
      `)
      .eq('exam_attempt_id', attempt_id)
      .order('submitted_at');

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(submissions); // ✅ don't return this
  })
);

export default router;
