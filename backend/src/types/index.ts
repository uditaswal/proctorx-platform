export interface User {
  id: string;
  email: string;
  profile?: UserProfile;
}

export interface UserProfile {
  id: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student';
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  max_attempts: number;
  passing_score: number;
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  type: 'mcq' | 'code' | 'essay';
  question_text: string;
  options?: string[];
  correct_answer?: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  created_by: string;
  created_at: string;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  user_id: string;
  attempt_number: number;
  status: 'in_progress' | 'completed' | 'suspended';
  started_at: string;
  submitted_at?: string;
  score?: number;
  time_remaining: number;
  ip_address?: string;
  user_agent?: string;
}

export interface Submission {
  id: string;
  exam_attempt_id: string;
  question_id: string;
  user_id: string;
  answer?: string;
  code?: string;
  language_id?: number;
  output?: string;
  stderr?: string;
  status?: string;
  is_correct?: boolean;
  points_earned: number;
  auto_graded: boolean;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  created_at: string;
}

export interface ProctoringViolation {
  id: string;
  proctor_session_id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high';
  details?: string;
  snapshot_url?: string;
  created_at: string;
}

export interface TestCase {
  id: string;
  question_id: string;
  input: string;
  expected_output: string;
  is_sample: boolean;
  created_at: string;
}

export interface CodeTemplate {
  id: string;
  question_id: string;
  language_id: number;
  template_code: string;
  created_at: string;
}