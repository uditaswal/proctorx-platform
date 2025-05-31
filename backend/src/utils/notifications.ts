export const sendExamNotification = async (
  userEmail: string, 
  examTitle: string, 
  type: 'started' | 'completed' | 'violation'
) => {
  // Implementation would depend on email service (SendGrid, AWS SES, etc.)
  // For now, just log
  console.log(`Email notification: ${type} for exam "${examTitle}" to ${userEmail}`);
};
