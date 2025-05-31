import express, { Request, Response } from 'express';
import { verifyUser } from '../middleware/auth';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// POST /api/proctor/snapshot
router.post('/snapshot', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64 } = req.body;
    const user = (req as any).user;

    if (!imageBase64) {
      res.status(400).json({ error: 'Image missing' });
      return;
    }

    const fileName = `snapshots/${user.id}_${Date.now()}.jpg`;
    const base64Data = Buffer.from(imageBase64.split(',')[1], 'base64');

    const { error } = await supabase.storage
      .from('proctor-snaps')
      .upload(fileName, base64Data, {
        contentType: 'image/jpeg',
      });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Snapshot saved' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

// POST /api/proctor/activity
router.post('/activity', verifyUser, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const { type, timestamp } = req.body;

    const { error } = await supabase
      .from('proctor_logs')
      .insert([{ user_id: user.id, type, timestamp: timestamp || new Date().toISOString() }]);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(200).json({ message: 'Activity logged' });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

export default router;
