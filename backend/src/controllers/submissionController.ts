import { Request, Response,RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

export const submitAnswer: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      exam_attempt_id, 
      question_id, 
      answer, 
      code, 
      language_id 
    } = req.body;
    const user = (req as any).user;

    // Verify exam attempt belongs to user and is active
    const { data: attempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', exam_attempt_id)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single();

    if (!attempt) {
      res.status(404).json({ error: 'Invalid or inactive exam attempt' });
      return;
    }

    // Get question details
    const { data: question } = await supabase
      .from('questions')
      .select('*')
      .eq('id', question_id)
      .single();

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    let is_correct: boolean | null = null;
    let points_earned = 0;
    let output = null;
    let stderr = null;
    let execution_time = null;
    let status = null;

    // Process based on question type
    if (question.type === 'mcq' && answer) {
      is_correct = answer.trim().toLowerCase() === question.correct_answer?.trim().toLowerCase();
      points_earned = is_correct ? question.points : 0;
    }

    if (question.type === 'code' && code && language_id) {
      try {
        const { submitCode } = await import('../utils/judge0');
        const result = await submitCode(code, language_id);
        
        output = result.stdout || '';
        stderr = result.stderr || result.compile_output || '';
        status = result.status?.description || 'Unknown';
        
        // Auto-grade based on test cases (if available)
        if (question.test_cases && Array.isArray(question.test_cases)) {
          let passed_tests = 0;
          
          for (const testCase of question.test_cases) {
            const testResult = await submitCode(code, language_id, testCase.input);
            if (testResult.stdout?.trim() === testCase.expected_output?.trim()) {
              passed_tests++;
            }
          }
          
          const pass_rate = passed_tests / question.test_cases.length;
          points_earned = pass_rate * question.points;
          is_correct = pass_rate >= 0.8; // 80% pass rate required
        }
        
      } catch (error) {
        console.error('Code execution error:', error);
        stderr = 'Execution failed';
        status = 'Error';
      }
    }

    // Save submission (upsert to handle multiple submissions for same question)
    const { error } = await supabase
      .from('submissions')
      .upsert([{
        exam_attempt_id,
        question_id,
        user_id: user.id,
        answer,
        code,
        language_id,
        output,
        stderr,
        execution_time,
        status,
        is_correct,
        points_earned,
        auto_graded: question.type !== 'essay'
      }], {
        onConflict: 'exam_attempt_id,question_id'
      });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: 'Answer submitted successfully',
      result: {
        is_correct,
        points_earned,
        output,
        stderr,
        status
      }
    });

  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitExam: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { exam_attempt_id } = req.body;
    const user = (req as any).user;

    // Verify attempt belongs to user
    const { data: attempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('id', exam_attempt_id)
      .eq('user_id', user.id)
      .eq('status', 'in_progress')
      .single();

    if (!attempt) {
      res.status(404).json({ error: 'Invalid exam attempt' });
      return;
    }

    // Calculate total score
    const { data: submissions } = await supabase
      .from('submissions')
      .select('points_earned')
      .eq('exam_attempt_id', exam_attempt_id);

    const total_score = submissions?.reduce((sum, sub) => sum + (sub.points_earned || 0), 0) || 0;

    // Update attempt status
    const { error } = await supabase
      .from('exam_attempts')
      .update({
        status: 'completed',
        submitted_at: new Date().toISOString(),
        score: total_score
      })
      .eq('id', exam_attempt_id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // End proctoring session
    await supabase
      .from('proctor_sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('exam_attempt_id', exam_attempt_id);

    res.status(200).json({
      message: 'Exam submitted successfully',
      score: total_score
    });

  } catch (err) {
    console.error('Submit exam error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
