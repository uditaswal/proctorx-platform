import supabase from './supabaseClient';

export const isExamActive = (exam: any): boolean => {
  const now = new Date();
  const startTime = new Date(exam.start_time);
  const endTime = new Date(exam.end_time);
  
  return now >= startTime && now <= endTime && exam.is_active;
};

export const calculateTimeRemaining = (attempt: any, exam: any): number => {
  const now = new Date();
  const startedAt = new Date(attempt.started_at);
  const examEndTime = new Date(exam.end_time);
  
  // Time elapsed since exam started
  const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
  
  // Remaining time based on exam duration
  const durationRemaining = (exam.duration_minutes * 60) - elapsedSeconds;
  
  // Remaining time based on exam end time
  const examEndRemaining = Math.floor((examEndTime.getTime() - now.getTime()) / 1000);
  
  // Return the minimum of both
  return Math.max(0, Math.min(durationRemaining, examEndRemaining));
};

export const canUserAttemptExam = async (userId: string, examId: string): Promise<{
  canAttempt: boolean;
  reason?: string;
  attemptsUsed?: number;
  maxAttempts?: number;
}> => {
  try {
    // Check if user is enrolled
    const { data: enrollment } = await supabase
      .from('exam_enrollments')
      .select('*')
      .eq('exam_id', examId)
      .eq('user_id', userId)
      .single();

    if (!enrollment) {
      return { canAttempt: false, reason: 'Not enrolled in this exam' };
    }

    // Get exam details
    const { data: exam } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (!exam) {
      return { canAttempt: false, reason: 'Exam not found' };
    }

    // Check if exam is active
    if (!isExamActive(exam)) {
      return { canAttempt: false, reason: 'Exam is not currently active' };
    }

    // Check attempt limits
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('exam_id', examId)
      .eq('user_id', userId);

    const attemptsUsed = attempts?.length || 0;

    if (attemptsUsed >= exam.max_attempts) {
      return { 
        canAttempt: false, 
        reason: 'Maximum attempts exceeded',
        attemptsUsed,
        maxAttempts: exam.max_attempts
      };
    }

    // Check if user has an active attempt
    const activeAttempt = attempts?.find(a => a.status === 'in_progress');
    if (activeAttempt) {
      return { 
        canAttempt: false, 
        reason: 'You have an active exam attempt in progress',
        attemptsUsed,
        maxAttempts: exam.max_attempts
      };
    }

    return { 
      canAttempt: true,
      attemptsUsed,
      maxAttempts: exam.max_attempts
    };

  } catch (error) {
    console.error('Error checking exam attempt eligibility:', error);
    return { canAttempt: false, reason: 'Server error' };
  }
};

