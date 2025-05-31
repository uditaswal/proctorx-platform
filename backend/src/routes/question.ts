import express, { Request, Response } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

router.post('/create', verifyUser, async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase
      .from('exams')
      .insert([{ title, created_by: user.id }])
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

router.get('/list', verifyUser, async (req: Request, res: Response) => {
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

export default router;
