import { Request, Response, RequestHandler } from 'express';
import supabase from '../utils/supabaseClient';

export const createQuestion: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      exam_id,
      type,
      question_text,
      options,
      correct_answer,
      code_template,
      test_cases,
      points,
      language_id,
      difficulty = 'medium'
    } = req.body;
    const user = (req as any).user;

    // Verify user has permission to add questions to this exam
    const { data: exam } = await supabase
      .from('exams')
      .select('created_by')
      .eq('id', exam_id)
      .single();

    if (!exam || exam.created_by !== user.id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'instructor'].includes(profile.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }
    }

    // Create question
    const { data: question, error } = await supabase
      .from('questions')
      .insert([{
        exam_id,
        type,
        question_text,
        options: type === 'mcq' ? options : null,
        correct_answer: type === 'mcq' ? correct_answer : null,
        points,
        difficulty,
        created_by: user.id
      }])
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // Add code template if it's a coding question
    if (type === 'code' && code_template && language_id) {
      await supabase
        .from('code_templates')
        .insert([{
          question_id: question.id,
          language_id,
          template_code: code_template
        }]);
    }

    // Add test cases if provided
    if (type === 'code' && test_cases && Array.isArray(test_cases)) {
      const testCaseInserts = test_cases.map((tc: any) => ({
        question_id: question.id,
        input: tc.input,
        expected_output: tc.expected_output,
        is_sample: tc.is_sample || false
      }));

      await supabase
        .from('test_cases')
        .insert(testCaseInserts);
    }

    res.status(201).json({ question });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExamQuestions: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { examId } = req.params;
    const user = (req as any).user;

    // Check if user has access to this exam
    const { data: exam } = await supabase
      .from('exams')
      .select(`
        *,
        exam_enrollments!inner(user_id)
      `)
      .eq('id', examId)
      .or(`created_by.eq.${user.id},exam_enrollments.user_id.eq.${user.id}`)
      .single();

    if (!exam) {
      res.status(404).json({ error: 'Exam not found or access denied' });
      return;
    }

    // Get questions with related data
    const { data: questions, error } = await supabase
      .from('questions')
      .select(`
        *,
        code_templates(*),
        test_cases(*)
      `)
      .eq('exam_id', examId)
      .order('created_at');

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    // For students, only show sample test cases and hide correct answers for MCQ
    const isStudent = user.profile?.role === 'student';
    const filteredQuestions = questions?.map(q => {
      if (isStudent) {
        // Hide correct answers for MCQ questions
        if (q.type === 'mcq') {
          const { correct_answer, ...questionWithoutAnswer } = q;
          return {
            ...questionWithoutAnswer,
            test_cases: q.test_cases?.filter((tc: any) => tc.is_sample)
          };
        }
        // For code questions, only show sample test cases
        return {
          ...q,
          test_cases: q.test_cases?.filter((tc: any) => tc.is_sample)
        };
      }
      return q;
    });

    res.json({ questions: filteredQuestions });
  } catch (err) {
    console.error('Get exam questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateQuestion: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const user = (req as any).user;

    // Check if user has permission to update this question
    const { data: question } = await supabase
      .from('questions')
      .select(`
        *,
        exams!inner(created_by)
      `)
      .eq('id', id)
      .single();

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const canUpdate = question.exams.created_by === user.id || 
                      ['admin', 'instructor'].includes(user.profile?.role);

    if (!canUpdate) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Update question
    const { data, error } = await supabase
      .from('questions')
      .update({
        question_text: updateData.question_text,
        options: updateData.options,
        correct_answer: updateData.correct_answer,
        points: updateData.points,
        difficulty: updateData.difficulty
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ question: data });
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteQuestion: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Check permissions
    const { data: question } = await supabase
      .from('questions')
      .select(`
        *,
        exams!inner(created_by)
      `)
      .eq('id', id)
      .single();

    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const canDelete = question.exams.created_by === user.id || 
                      ['admin'].includes(user.profile?.role);

    if (!canDelete) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    // Delete question (cascades to test_cases and code_templates)
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getQuestionTemplates: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;

    const { data: templates, error } = await supabase
      .from('code_templates')
      .select('*')
      .eq('question_id', questionId);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ templates });
  } catch (err) {
    console.error('Get question templates error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
