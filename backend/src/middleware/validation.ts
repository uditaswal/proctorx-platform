import { Request, Response, NextFunction } from 'express';
import { z } from 'zod/v4'; // use `zod`, no need for `/v4` path

// Validation schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['student', 'instructor', 'admin']).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const createExamSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  start_time: z.string().datetime('Invalid start time format'),
  end_time: z.string().datetime('Invalid end time format'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute'),
  max_attempts: z.number().min(1).optional(),
  passing_score: z.number().min(0).max(100).optional()
});

export const createQuestionSchema = z.object({
  exam_id: z.string().uuid('Invalid exam ID'),
  question_text: z.string().min(1, 'Question text is required'),
  type: z.enum(['mcq', 'code', 'essay']),
  options: z.array(z.string()).optional(),
  correct_answer: z.string().optional(),
  points: z.number().min(0).optional(),
  time_limit_minutes: z.number().min(1).optional(),
  language_restrictions: z.array(z.number()).optional(),
  starter_code: z.string().optional(),
  test_cases: z.array(z.object({
    input: z.string(),
    expected_output: z.string(),
    description: z.string().optional()
  })).optional()
});

// Generic validation middleware
export const validate = (schema: z.ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};
