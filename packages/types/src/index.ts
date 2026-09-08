export type Role = 'STUDENT' | 'ADMIN';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  userId: string;
  avatar?: string;
  school?: string;
  level?: string;
  bio?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  subjectId: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
  difficulty: Difficulty;
  createdAt: string;
}

export interface Option {
  label: string;
  text: string;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  subject?: Subject;
  durationMins: number;
  totalQuestions: number;
  isActive: boolean;
  createdAt: string;
}

export interface ExamQuestion {
  id: string;
  examId: string;
  questionId: string;
  order: number;
  question?: Question;
}

export interface ExamResult {
  id: string;
  userId: string;
  examId: string;
  exam?: Exam;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenMins?: number;
  answers: Answer[];
  completedAt: string;
}

export interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RateLimitConfig {
  tier: 'critical' | 'strict' | 'medium' | 'lenient' | 'public';
  maxRequests: number;
  windowMs: number;
}
