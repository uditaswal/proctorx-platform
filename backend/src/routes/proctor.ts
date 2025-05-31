import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler'; // ✅ new
import { verifyUser } from '../middleware/auth';
import { recordViolation } from '../controllers/proctoringController';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// Record proctoring violation
router.post('/violation', verifyUser, asyncHandler(recordViolation));

// Save webcam snapshot
router.post('/snapshot', verifyUser, asyncHandler(async (req: Request, res: Response) => {
  const { exam_attempt_id, image_base64 } = req.body;
  const user = (req as any).user;

  if (!image_base64) {
    res.status(400).json({ error: 'Image data missing' });
    return;
  }

  const { data: session } = await supabase
    .from('proctor_sessions')
    .select('*')
    .eq('exam_attempt_id', exam_attempt_id)
    .eq('user_id', user.id)
    .single();

  if (!session) {
    res.status(404).json({ error: 'Proctor session not found' });
    return;
  }

  const fileName = `snapshots/${user.id}_${Date.now()}.jpg`;
  const base64Data = Buffer.from(image_base64.split(',')[1], 'base64');

  const { error: uploadError } = await supabase.storage
    .from('proctor-snaps')
    .upload(fileName, base64Data, {
      contentType: 'image/jpeg',
    });

  if (uploadError) {
    res.status(500).json({ error: uploadError.message });
    return;
  }

  const { data: urlData } = supabase.storage
    .from('proctor-snaps')
    .getPublicUrl(fileName);

  const { error: dbError } = await supabase
    .from('snapshots')
    .insert([{
      proctor_session_id: session.id,
      user_id: user.id,
      image_url: urlData.publicUrl
    }]);

  if (dbError) {
    res.status(400).json({ error: dbError.message });
    return;
  }

  res.status(201).json({ message: 'Snapshot saved successfully' });
}));

// Log activity
router.post('/activity', verifyUser, asyncHandler(async (req: Request, res: Response) => {
  const { exam_attempt_id, activity_type, details } = req.body;
  const user = (req as any).user;

  const { error } = await supabase
    .from('activity_logs')
    .insert([{
      user_id: user.id,
      exam_attempt_id,
      activity_type,
      details,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    }]);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ message: 'Activity logged' });
}));

// Get proctoring data for exam (admin only)
router.get('/exam/:exam_id/data', verifyUser, asyncHandler(async (req: Request, res: Response) => {
  const { exam_id } = req.params;
  const user = (req as any).user;

  const { data: exam } = await supabase
    .from('exams')
    .select('created_by')
    .eq('id', exam_id)
    .single();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!exam || (exam.created_by !== user.id && !['admin'].includes(profile?.role))) {
    res.status(403).json({ error: 'Access denied' });
    return;
  }

  const { data: proctorData, error } = await supabase
    .from('proctor_sessions')
    .select(`
      *,
      exam_attempts(user_id, user_profiles(full_name)),
      proctor_violations(*),
      snapshots(*)
    `)
    .eq('exam_attempts.exam_id', exam_id);

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json(proctorData);
}));

export default router;
