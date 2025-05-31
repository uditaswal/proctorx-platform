import express, { Request, Response } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// Create MCQ under an exam
router.post('/create', verifyUser, async (req: Request, res: Response) => {
  try {
    const { exam_id, question_text, options, correct_answer } = req.body;

    const { data, error } = await supabase
      .from('questions')
      .insert([{
        exam_id,
        question_text,
        options, // must be array
        correct_answer,
        type: 'mcq'
      }])
      .select();

    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(201).json({ question: data?.[0] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all questions for an exam
router.get('/exam/:exam_id', verifyUser, async (req: Request, res: Response) => {
  try {
    const { exam_id } = req.params;

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('exam_id', exam_id);

    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
