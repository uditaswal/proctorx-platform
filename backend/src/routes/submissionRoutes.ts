import express from 'express';
import { Request, Response } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';
import { submitCode, Judge0Result } from '../utils/judge0';

const router = express.Router();

router.post('/', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { exam_id, question_id, answer, code, language_id } = req.body;
    const user = (req as any).user;

    // Fetch question info to determine type
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('type, correct_answer')
      .eq('id', question_id)
      .single();

    if (questionError || !question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    let is_correct: boolean | null = null;
    let output: string | null = null;
    let stderr: string | null = null;
    let status: string | null = null;

    if (question.type === 'mcq') {
      is_correct = answer?.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase();
    }

    if (question.type === 'code' && code && language_id) {
      const result: Judge0Result = await submitCode(code, language_id);
      output = result.stdout || '';
      stderr = result.stderr || result.compile_output || '';
      status = result.status?.description || 'Unknown';
    }

    const { error: insertError } = await supabase.from('submissions').insert([{
      user_id: user.id,
      exam_id,
      question_id,
      answer,
      code,
      language_id,
      is_correct,
      output,
      stderr,
      status,
      submitted_at: new Date().toISOString()
    }]);

    if (insertError) {
      res.status(400).json({ error: insertError.message });
      return;
    }

    res.status(201).json({
      message: 'Submission saved successfully',
      result: { output, stderr, is_correct, status }
    });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
