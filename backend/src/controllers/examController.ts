import { Request, Response,RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

export const createExam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      title, 
      description, 
      start_time, 
      end_time, 
      duration_minutes,
      max_attempts = 1,
      passing_score = 0.0 
    } = req.body;
    const user = (req as any).user;

    // Validate admin/instructor role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'instructor'].includes(profile.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { data, error } = await supabase
      .from('exams')
      .insert([{ 
        title, 
        description, 
        start_time, 
        end_time, 
        duration_minutes,
        max_attempts,
        passing_score,
        created_by: user.id 
      }])
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ exam: data });
  } catch (err) {
    console.error('Create exam error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExamDetails: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Check if user is enrolled or is the creator
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select(`
        *,
        questions(*),
        exam_enrollments!inner(user_id)
      `)
      .eq('id', id)
      .or(`created_by.eq.${user.id},exam_enrollments.user_id.eq.${user.id}`)
      .single();

    if (examError || !exam) {
      res.status(404).json({ error: 'Exam not found or access denied' });
      return;
    }

    // Get user's attempt history
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', id)
      .eq('user_id', user.id)
      .order('attempt_number', { ascending: false });

    res.json({ 
      exam: {
        ...exam,
        user_attempts: attempts || [],
        can_attempt: (attempts?.length || 0) < exam.max_attempts
      }
    });

  } catch (err) {
    console.error('Get exam error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const startExamAttempt: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exam_id } = req.body;
    const user = (req as any).user;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');

    // Check if exam exists and user is enrolled
    const { data: exam } = await supabase
      .from('exams')
      .select(`
        *,
        exam_enrollments!inner(user_id)
      `)
      .eq('id', exam_id)
      .eq('exam_enrollments.user_id', user.id)
      .single();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found or not enrolled' });
      return;
    }

    // Check exam timing
    const now = new Date();
    const startTime = new Date(exam.start_time);
    const endTime = new Date(exam.end_time);

    if (now < startTime) {
      res.status(403).json({ error: 'Exam has not started yet' });
      return;
    }

    if (now > endTime) {
      res.status(403).json({ error: 'Exam has ended' });
      return;
    }

    // Check attempt limits
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', exam_id)
      .eq('user_id', user.id);

    if ((attempts?.length || 0) >= exam.max_attempts) {
      res.status(403).json({ error: 'Maximum attempts exceeded' });
      return;
    }

    // Create new attempt
    const { data: attempt, error } = await supabase
      .from('exam_attempts')
      .insert([{
        exam_id,
        user_id: user.id,
        attempt_number: (attempts?.length || 0) + 1,
        time_remaining: exam.duration_minutes * 60, // Convert to seconds
        ip_address,
        user_agent
      }])
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Initialize proctoring session
    const { error: proctorError } = await supabase
      .from('proctor_sessions')
      .insert([{
        exam_attempt_id: attempt.id,
        user_id: user.id,
        browser_info: { user_agent },
        screen_resolution: req.body.screen_resolution || 'unknown'
      }]);

    if (proctorError) {
      console.error('Proctor session error:', proctorError);
    }

    res.status(201).json({ 
      attempt,
      exam: {
        id: exam.id,
        title: exam.title,
        duration_minutes: exam.duration_minutes
      }
    });

  } catch (err) {
    console.error('Start exam error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

