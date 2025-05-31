import { Request, Response,RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';


export const recordViolation: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      exam_attempt_id, 
      violation_type, 
      severity = 'medium', 
      details,
      snapshot_base64 
    } = req.body;
    const user = (req as any).user;

    // Get proctor session
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

    let snapshot_url = null;

    // Save snapshot if provided
    if (snapshot_base64) {
      const fileName = `violations/${user.id}_${Date.now()}.jpg`;
      const base64Data = Buffer.from(snapshot_base64.split(',')[1], 'base64');

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proctor-snaps')
        .upload(fileName, base64Data, {
          contentType: 'image/jpeg',
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('proctor-snaps')
          .getPublicUrl(fileName);
        snapshot_url = urlData.publicUrl;
      }
    }

    // Record violation
    const { error } = await supabase
      .from('proctor_violations')
      .insert([{
        proctor_session_id: session.id,
        violation_type,
        severity,
        details,
        snapshot_url
      }]);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Update violations count
    await supabase
      .from('proctor_sessions')
      .update({ violations_count: session.violations_count + 1 })
      .eq('id', session.id);

    // Check if exam should be suspended (e.g., more than 5 violations)
    if (session.violations_count + 1 >= 5) {
      await supabase
        .from('exam_attempts')
        .update({ status: 'suspended' })
        .eq('id', exam_attempt_id);
    }

    res.status(201).json({ message: 'Violation recorded' });

  } catch (err) {
    console.error('Record violation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

