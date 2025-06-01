import { Request, Response, RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

// Types
type QuestionAnalytics = {
  total_submissions: number;
  correct_submissions: number;
  average_score: number;
  question_type: string;
};

type Analytics = {
  participation: {
    total_enrolled: number;
    total_attempts: number;
    completion_rate: number;
  };
  performance: {
    average_score: number;
    score_distribution: Record<string, number>;
    question_analytics: Record<string, QuestionAnalytics>;
  };
  proctoring: {
    total_violations: number;
    violation_types: Record<string, number>;
    suspended_attempts: number;
  };
  time_analytics: {
    average_duration: number;
    early_submissions: number;
  };
};

export const getDashboardStats: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const isInstructor = ['admin', 'instructor'].includes(user.profile?.role);

    if (isInstructor) {
      const { data: exams } = await supabase
        .from('exams')
        .select('id')
        .eq('created_by', user.id);

      const examIds = exams?.map(e => e.id) || [];

      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('status, score')
        .in('exam_id', examIds);

      const { data: enrollments } = await supabase
        .from('exam_enrollments')
        .select('id')
        .in('exam_id', examIds);

      const stats = {
        total_exams: exams?.length || 0,
        total_enrollments: enrollments?.length || 0,
        total_attempts: attempts?.length || 0,
        completed_attempts: attempts?.filter(a => a.status === 'completed').length || 0,
        average_score: 0
      };

      const completedScores = attempts?.filter(a => a.status === 'completed' && a.score != null).map(a => a.score) || [];
      if (completedScores.length > 0) {
        stats.average_score = completedScores.reduce((a, b) => a + b, 0) / completedScores.length;
      }

      res.json({ stats });
    } else {
      const { data: enrollments } = await supabase
        .from('exam_enrollments')
        .select('id')
        .eq('user_id', user.id);

      const { data: attempts } = await supabase
        .from('exam_attempts')
        .select('status, score')
        .eq('user_id', user.id);

      const stats = {
        total_enrollments: enrollments?.length || 0,
        total_attempts: attempts?.length || 0,
        completed_attempts: attempts?.filter(a => a.status === 'completed').length || 0,
        average_score: 0
      };

      const completedScores = attempts?.filter(a => a.status === 'completed' && a.score != null).map(a => a.score) || [];
      if (completedScores.length > 0) {
        stats.average_score = completedScores.reduce((a, b) => a + b, 0) / completedScores.length;
      }

      res.json({ stats });
    }
  } catch (err) {
    console.error('Get dashboard stats error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExamAnalytics: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const user = (req as any).user;

    const { data: exam } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', examId)
      .single();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found' });
      return;
    }

    const canView = exam.created_by === user.id || ['admin'].includes(user.profile?.role);
    if (!canView) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', examId);

    const { data: violations } = await supabase
      .from('proctor_violations')
      .select(`
        *,
        proctor_sessions!inner(
          exam_attempt_id,
          exam_attempts!inner(exam_id)
        )
      `)
      .eq('proctor_sessions.exam_attempts.exam_id', examId);

    const { data: submissions } = await supabase
      .from('submissions')
      .select(`
        *,
        exam_attempts!inner(exam_id),
        questions(type, points)
      `)
      .eq('exam_attempts.exam_id', examId);

    const analytics: Analytics = {
      participation: {
        total_enrolled: 0,
        total_attempts: attempts?.length || 0,
        completion_rate: 0,
      },
      performance: {
        average_score: 0,
        score_distribution: {},
        question_analytics: {},
      },
      proctoring: {
        total_violations: violations?.length || 0,
        violation_types: {},
        suspended_attempts: attempts?.filter(a => a.status === 'suspended').length || 0,
      },
      time_analytics: {
        average_duration: 0,
        early_submissions: 0,
      }
    };

    const completedAttempts = attempts?.filter(a => a.status === 'completed') || [];

    if (completedAttempts.length > 0) {
      analytics.performance.average_score =
        completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length;

      analytics.participation.completion_rate =
        (completedAttempts.length / (attempts?.length || 1)) * 100;
    }

    // Count violations by type
    violations?.forEach(v => {
      const type = v.violation_type;
      analytics.proctoring.violation_types[type] = (analytics.proctoring.violation_types[type] || 0) + 1;
    });

    // Question analytics
    submissions?.forEach(s => {
      const qId = s.question_id;
      if (!analytics.performance.question_analytics[qId]) {
        analytics.performance.question_analytics[qId] = {
          total_submissions: 0,
          correct_submissions: 0,
          average_score: 0,
          question_type: s.questions.type
        };
      }

      const qa = analytics.performance.question_analytics[qId];
      qa.total_submissions++;
      if (s.is_correct) qa.correct_submissions++;
    });

    res.json({ analytics });
  } catch (err) {
    console.error('Get exam analytics error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
