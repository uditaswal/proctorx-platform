import { Request, Response, RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

export const enrollInExam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exam_id } = req.body;
    const user = (req as any).user;

    // Check if exam exists and is available for enrollment
    const { data: exam } = await supabase
      .from('exams')
      .select('*')
      .eq('id', exam_id)
      .single();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabase
      .from('exam_enrollments')
      .select('*')
      .eq('exam_id', exam_id)
      .eq('user_id', user.id)
      .single();

    if (existingEnrollment) {
      res.status(400).json({ error: 'Already enrolled in this exam' });
      return;
    }

    // Enroll user
    const { data, error } = await supabase
      .from('exam_enrollments')
      .insert([{
        exam_id,
        user_id: user.id
      }])
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ 
      message: 'Successfully enrolled in exam',
      enrollment: data 
    });
  } catch (err) {
    console.error('Enroll in exam error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyEnrollments: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    const { data: enrollments, error } = await supabase
      .from('exam_enrollments')
      .select(`
        *,
        exams(
          id,
          title,
          description,
          start_time,
          end_time,
          duration_minutes,
          max_attempts,
          passing_score
        )
      `)
      .eq('user_id', user.id)
      .order('enrolled_at', { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ enrollments });
  } catch (err) {
    console.error('Get enrollments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExamEnrollments: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const user = (req as any).user;

    // Check if user has permission to view enrollments
    const { data: exam } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', examId)
      .single();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const canView = exam.created_by === user.id || 
                    ['admin', 'instructor'].includes(user.profile?.role);

    if (!canView) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { data: enrollments, error } = await supabase
      .from('exam_enrollments')
      .select(`
        *,
        user_profiles(
          id,
          full_name,
          role
        )
      `)
      .eq('exam_id', examId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ enrollments });
  } catch (err) {
    console.error('Get exam enrollments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
