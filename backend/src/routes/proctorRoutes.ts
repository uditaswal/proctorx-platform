import express from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// POST /api/proctor/snapshot
router.post('/snapshot', verifyUser, async (req, res): Promise<void> => {
  try {
    const { imageBase64, exam_id } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase.from('snapshots').insert([{
      user_id: user.id,
      exam_id,
      image_base64: imageBase64,
      timestamp: new Date()
    }]);

    if (error)  res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Snapshot saved', data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/proctor/activity
router.post('/activity', verifyUser, async (req, res): Promise<void> => {
  try {
    const { activity, exam_id } = req.body;
    const user = (req as any).user;

    const { data, error } = await supabase.from('activity_logs').insert([{
      user_id: user.id,
      exam_id,
      activity,
      timestamp: new Date()
    }]);

    if (error)  res.status(400).json({ error: error.message });

    res.status(201).json({ message: 'Activity logged', data });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
