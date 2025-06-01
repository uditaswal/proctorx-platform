import supabase from './supabaseClient';
export const checkExamPermission = async (examId: string, userId: string, userRole: string) => {
  const { data: exam } = await supabase
    .from('exams')
    .select('created_by')
    .eq('id', examId)
    .single();
    
  if (!exam) return { hasPermission: false, error: 'Exam not found' };
  
  const hasPermission = exam.created_by === userId || 
                       ['admin', 'instructor'].includes(userRole);
  
  return { hasPermission, exam };
};