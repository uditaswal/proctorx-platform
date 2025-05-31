import express from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// POST /api/submissions
router.post('/', verifyUser, async (req, res): Promise<void> => {
  try {
    const { exam_id, question_id, answer, language_id, code } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase.from('submissions').insert([{
      user_id: user.id,
      exam_id,
      question_id,
      answer,
      language_id,
      code
    }]);

    if (error) 
         res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Submission saved', data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// GET /api/submissions/:examId
router.get('/:examId', verifyUser, async (req, res): Promise<void> => {
  try {
    const examId = req.params.examId;
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('exam_id', examId)
      .eq('user_id', user.id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ submissions: data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
