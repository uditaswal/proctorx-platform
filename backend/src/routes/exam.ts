import express, { Request, Response, NextFunction } from 'express';
import { verifyUser } from '../middleware/auth';
import { 
  createExam, 
  getExamDetails, 
  startExamAttempt,
   
} from '../controllers/examController';
import { 
  submitExam 
} from '../controllers/submissionController';
import supabase from '../utils/supabaseClient';

const router = express.Router();

// Create exam (admin/instructor only)
router.post('/create', verifyUser, createExam);

// Get exam details
router.get('/:id', verifyUser, getExamDetails);

// Start exam attempt
router.post('/start', verifyUser, startExamAttempt);

// Submit entire exam
router.post('/submit', verifyUser, submitExam);

// ✅ List exams for user (enrolled or created)
const listExams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = (req as any).user;

    const { data: exams, error } = await supabase
      .from('exams')
      .select(`
        *,
        exam_enrollments!inner(user_id),
        exam_attempts(status, score, submitted_at)
      `)
      .or(`created_by.eq.${user.id},exam_enrollments.user_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(exams);
  } catch (error) {
    next(error);
  }
};
router.get('/', verifyUser, listExams);

// ✅ Enroll student in exam (admin only)
const enrollStudent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: exam_id } = req.params;
    const { student_id } = req.body;
    const user = (req as any).user;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'instructor'].includes(profile.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { error } = await supabase
      .from('exam_enrollments')
      .insert([{
        exam_id,
        user_id: student_id,
        enrolled_by: user.id,
      }]);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({ message: 'Student enrolled successfully' });
  } catch (error) {
    next(error);
  }
};
router.post('/:id/enroll', verifyUser, enrollStudent);

// ✅ Get exam results (admin/instructor only)
const getExamResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: exam_id } = req.params;
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

    if (!exam || (exam.created_by !== user.id && profile?.role !== 'admin')) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const { data: results, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        user_profiles(full_name, role),
        submissions(question_id, points_earned, is_correct),
        proctor_sessions(violations_count)
      `)
      .eq('exam_id', exam_id)
      .eq('status', 'completed')
      .order('submitted_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
};
router.get('/:id/results', verifyUser, getExamResults);

export default router;
