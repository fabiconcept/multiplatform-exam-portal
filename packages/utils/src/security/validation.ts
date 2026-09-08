import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  options: z.array(z.object({
    label: z.string().length(1, 'Label must be a single character'),
    text: z.string().min(1, 'Option text is required'),
  })).min(2, 'At least 2 options required').max(6, 'Maximum 6 options'),
  correctAnswer: z.string().length(1, 'Correct answer must be a single character'),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  subjectId: z.string().uuid('Invalid subject ID'),
});

export const examSchema = z.object({
  title: z.string().min(1, 'Exam title is required').max(200),
  subjectId: z.string().uuid('Invalid subject ID'),
  durationMins: z.number().int().min(1).max(300),
  totalQuestions: z.number().int().min(1).max(200),
  questionIds: z.array(z.string().uuid()).min(1),
});

export const submitExamSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  answers: z.array(z.object({
    questionId: z.string().uuid(),
    selectedAnswer: z.string().length(1),
  })),
  timeTakenMins: z.number().int().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type ExamInput = z.infer<typeof examSchema>;
export type SubmitExamInput = z.infer<typeof submitExamSchema>;

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, errors: result.error.errors.map(e => e.message) };
}
