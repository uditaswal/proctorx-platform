import express from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';
import { submitCode } from '../utils/judge0';

const router = express.Router();

interface Judge0Result {
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  status: { id: number; description: string };
}

// POST /api/submissions
router.post('/', verifyUser, async (req, res): Promise<void> => {
  try {
    const { exam_id, question_id, answer, language_id, code } = req.body;
    const user = (req as any).user;

    // 🔍 Fetch question
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
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

    // 🧠 MCQ grading
    if (question.type === 'mcq') {
      is_correct = answer === question.correct_answer;
    }

    // 🧪 Run code via Judge0
    if (question.type === 'code' && code && language_id) {
      const result: Judge0Result = await submitCode(code, language_id);
      output = result.stdout || '';
      stderr = result.stderr || result.compile_output || '';
      status = result.status.description;
    console.log(result.stdout); // 
}

    // 📝 Insert into submissions table
    const { data, error } = await supabase.from('submissions').insert([{
      user_id: user.id,
      exam_id,
      question_id,
      answer,
      language_id,
      code,
      is_correct,
      output,
      stderr,
      status,
      submitted_at: new Date().toISOString(),
    }]);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ message: 'Submission saved', data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
