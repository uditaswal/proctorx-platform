import express, { Request, Response } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// ✅ Create exam
router.post('/create', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, start_time, end_time } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('exams')
      .insert([{ title, description, start_time, end_time, created_by: user.id }])
      .select();

    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(201).json({ exam: data?.[0] });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ List all exams
router.get('/list', verifyUser, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase.from('exams').select('*');
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Get a specific exam by ID
router.get('/:id', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('exams').select('*').eq('id', id).single();
    if (error) {
      res.status(404).json({ error: 'Exam not found' });
    } else {
      res.json(data);
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update/edit exam
router.put('/edit/:id', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, start_time, end_time } = req.body;

    const { error } = await supabase
      .from('exams')
      .update({ title, description, start_time, end_time })
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(200).json({ message: 'Exam updated successfully' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
