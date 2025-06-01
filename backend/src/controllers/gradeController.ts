import { Request, Response, RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

// ==========================
// GET EXAM GRADES (Instructor/Admin)
// ==========================
export const getExamGrades: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const user = (req as any).user;

    // ✅ Include 'passing_score' in select
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('created_by, title, passing_score')
      .eq('id', examId)
      .single();

    if (examError || !exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const canView = exam.created_by === user.id || ['admin', 'instructor'].includes(user.profile?.role);

    if (!canView) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        user_profiles(
          id,
          full_name
        )
      `)
      .eq('exam_id', examId)
      .eq('status', 'completed')
      .order('submitted_at', { ascending: false });

    if (attemptsError) {
      res.status(400).json({ error: attemptsError.message });
      return;
    }

    const scores = attempts?.map(a => a.score || 0) || [];
    const stats = {
      total_attempts: scores.length,
      average_score: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      highest_score: scores.length > 0 ? Math.max(...scores) : 0,
      lowest_score: scores.length > 0 ? Math.min(...scores) : 0,
      pass_rate: 0
    };

    if (exam.passing_score && exam.passing_score > 0) {
      const passedAttempts = scores.filter(score => score >= exam.passing_score);
      stats.pass_rate = (passedAttempts.length / scores.length) * 100;
    }

    res.json({
      exam_title: exam.title,
      attempts,
      statistics: stats
    });
  } catch (err) {
    console.error('Get exam grades error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==========================
// GET MY GRADES (Student)
// ==========================
export const getMyGrades: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    const { data: attempts, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        exams(
          id,
          title,
          passing_score
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('submitted_at', { ascending: false });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ grades: attempts });
  } catch (err) {
    console.error('Get my grades error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ==========================
// GRADE A SUBMISSION (Instructor/Admin)
// ==========================
export const gradeSubmission: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { points_earned, feedback } = req.body;
    const user = (req as any).user;

    const { data: submission, error: submissionError } = await supabase
      .from('submissions')
      .select(`
        *,
        exam_attempts!inner(
          id,
          exam_id,
          exams!inner(created_by)
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      res.status(404).json({ error: 'Submission not found' });
      return;
    }

    const canGrade = submission.exam_attempts.exams.created_by === user.id ||
                     ['admin', 'instructor'].includes(user.profile?.role);

    if (!canGrade) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { error: updateError } = await supabase
      .from('submissions')
      .update({
        points_earned,
        feedback,
        graded_by: user.id,
        graded_at: new Date().toISOString()
      })
      .eq('id', submissionId);

    if (updateError) {
      res.status(400).json({ error: updateError.message });
      return;
    }

    const { data: allSubmissions, error: fetchSubsError } = await supabase
      .from('submissions')
      .select('points_earned')
      .eq('exam_attempt_id', submission.exam_attempt_id);

    if (fetchSubsError) {
      res.status(400).json({ error: fetchSubsError.message });
      return;
    }

    const totalScore = allSubmissions?.reduce((sum, sub) => sum + (sub.points_earned || 0), 0) || 0;

    const { error: updateAttemptError } = await supabase
      .from('exam_attempts')
      .update({ score: totalScore })
      .eq('id', submission.exam_attempt_id);

    if (updateAttemptError) {
      res.status(400).json({ error: updateAttemptError.message });
      return;
    }

    res.json({ message: 'Submission graded successfully' });
  } catch (err) {
    console.error('Grade submission error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
