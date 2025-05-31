import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// Create question
router.post('/create', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      exam_id,
      question_text,
      type,
      options,
      correct_answer,
      points = 1.0,
      time_limit_minutes,
      language_restrictions,
      starter_code,
      test_cases,
      order_index = 0
    } = req.body;

    const user = (req as any).user;

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', exam_id)
      .maybeSingle();

    if (examError || !exam || exam.created_by !== user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert([{
        exam_id,
        question_text,
        type,
        options: type === 'mcq' ? options : null,
        correct_answer: type === 'mcq' ? correct_answer : null,
        points,
        time_limit_minutes,
        language_restrictions: type === 'code' ? language_restrictions : null,
        starter_code: type === 'code' ? starter_code : null,
        test_cases: type === 'code' ? test_cases : null,
        order_index
      }])
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ question: data });
  } catch (err) {
    next(err);
  }
});

// Get questions for exam attempt
router.get('/exam/:exam_id/attempt/:attempt_id', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { exam_id, attempt_id } = req.params;
    const user = (req as any).user;

    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', attempt_id)
      .eq('user_id', user.id)
      .eq('exam_id', exam_id)
      .maybeSingle();

    if (attemptError || !attempt) {
      res.status(404).json({ error: 'Exam attempt not found' });
      return;
    }

    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        submissions(answer, code, language_id, is_correct, points_earned, submitted_at)
      `)
      .eq('exam_id', exam_id)
      .eq('submissions.exam_attempt_id', attempt_id)
      .order('order_index');

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    const sanitizedQuestions = questions?.map((q: any) => ({
      ...q,
      correct_answer: undefined,
      test_cases: q.test_cases ? q.test_cases.map((tc: any) => ({
        ...tc,
        expected_output: undefined
      })) : undefined
    }));

    res.json(sanitizedQuestions);
  } catch (err) {
    next(err);
  }
});

// Update question
router.put('/:id', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const updateData = req.body;

    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('exam_id')
      .eq('id', id)
      .maybeSingle();

    if (questionError || !question) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', question.exam_id)
      .maybeSingle();

    if (examError || !exam || exam.created_by !== user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Question updated successfully' });
  } catch (err) {
    next(err);
  }
});

// Delete question
router.delete('/:id', verifyUser, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('exam_id')
      .eq('id', id)
      .maybeSingle();

    if (questionError || !question) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', question.exam_id)
      .maybeSingle();

    if (examError || !exam || exam.created_by !== user.id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;