const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    if (res.status === 403) {
      const message = data.message || data.error || 'Your account has been deactivated. Please contact support.';
      throw new ApiError(403, message, data);
    }
    throw new ApiError(res.status, data.error || 'Something went wrong', data);
  }

  return data as T;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string; school?: string; target_exam?: string }) =>
    api<{ token: string; user: User }>('/auth/register', { method: 'POST', body }),

  login: (body: { email: string; password: string; device_info?: string }) =>
    api<{ token: string; user: User }>('/auth/login', { method: 'POST', body }),

  me: (token: string) =>
    api<User>('/auth/me', { token }),

  forgotPassword: (email: string) =>
    api<{ message: string; token?: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, password: string) =>
    api<{ message: string }>('/auth/reset-password', { method: 'POST', body: { token, password } }),

  sendVerification: (email: string) =>
    api<{ message: string }>('/auth/send-verification', { method: 'POST', body: { email } }),

  verifyEmail: (token: string) =>
    api<{ message: string }>('/auth/verify-email', { method: 'POST', body: { token } }),

  checkVerificationStatus: (token: string) =>
    api<{ verified: boolean }>('/auth/verification-status', { token }),

  trackUsage: (token: string, questionKey: string, examType: string) =>
    api<{ allowed: boolean; is_activated: boolean; total_used?: number; limit?: number; remaining?: number; error?: string }>('/auth/track-usage', { method: 'POST', body: { question_key: questionKey, exam_type: examType }, token }),

  usageStatus: (token: string) =>
    api<{ total_used: number; limit: number; remaining: number; is_activated: boolean }>('/auth/usage-status', { token }),

  updateProfile: (token: string, body: { name?: string; phone?: string; school?: string; target_exam?: string; target_score?: string }) =>
    api<User>('/auth/profile', { method: 'PUT', body, token }),

  updatePassword: (token: string, body: { current_password: string; new_password: string }) =>
    api<{ message: string }>('/auth/password', { method: 'PUT', body, token }),

  getSettings: (token: string) =>
    api<UserSettings>('/auth/settings', { token }),

  updateSettings: (token: string, body: Partial<UserSettings>) =>
    api<UserSettings>('/auth/settings', { method: 'PUT', body, token }),

  activate: (token: string, key: string) =>
    api<{ message: string; user: User }>('/auth/activate', { method: 'POST', body: { key_code: key }, token }),
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  school?: string;
  target_exam?: string;
  target_score?: string;
  is_active: boolean;
  is_banned: boolean;
  ban_reason?: string;
};

export type UserSettings = {
  user_id: string;
  notifications: boolean;
  email_updates: boolean;
  sound_effects: boolean;
  dark_mode: boolean;
  auto_save: boolean;
  show_explanations: boolean;
  timer_warning: boolean;
};

export type Exam = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  total_questions: number;
  time_limit_minutes: number;
  min_subjects: number;
  max_subjects: number;
  is_active: boolean;
  icon_url?: string;
  created_at: string;
  subject_count?: number;
  question_count?: number;
};

export type Subject = {
  id: string;
  exam_id: string;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: string;
};

export type Topic = {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
};

export const examApi = {
  listExams: (token: string) =>
    api<{ exams: Exam[]; total: number }>('/auth/exams', { token }),

  listExamSubjects: (token: string, examId: string) =>
    api<{ subjects: Subject[]; total: number }>(`/auth/exams/${examId}/subjects`, { token }),

  listSubjectTopics: (token: string, subjectId: string) =>
    api<{ topics: Topic[]; total: number }>(`/auth/subjects/${subjectId}/topics`, { token }),
};

// ---------------------------------------------------------------------------
// Exam Sessions
// ---------------------------------------------------------------------------

export type ExamSession = {
  id: string;
  user_id: string;
  exam_type: string;
  mode: string;
  subjects: string;
  question_count: number;
  duration_minutes: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  expires_at: string | null;
  score: number | null;
  total_correct: number | null;
  total_answered: number | null;
  time_spent_seconds: number | null;
};

export type SessionQuestion = {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  subject_name: string | null;
  topic_name: string | null;
  difficulty: string;
  user_answer: string | null;
  is_correct: boolean | null;
  explanation?: string | null;
  correct_answer?: string;
};

export type SessionResult = {
  session: ExamSession;
  total_correct: number;
  total_answered: number;
  score: number;
  by_subject: { subject_name: string; correct: number; total: number; percentage: number }[];
  by_difficulty: { difficulty: string; correct: number; total: number; percentage: number }[];
};

export type UserStats = {
  total_answered: number;
  total_correct: number;
  avg_score: number;
  study_streak: number;
  study_time_hours: number;
  total_sessions: number;
  bookmark_count: number;
};

export type BookmarkedQuestion = {
  id: string;
  question_id: string;
  question_text: string;
  exam_type: string;
  subject_name: string | null;
  difficulty: string;
  created_at: string;
};

export const sessionApi = {
  createSession: (token: string, body: { exam_type: string; mode?: string; subjects?: string[]; question_count?: number; duration_minutes?: number }) =>
    api<ExamSession>('/auth/exam-sessions', { method: 'POST', body, token }),

  getSession: (token: string, sessionId: string) =>
    api<{ session: ExamSession; questions: SessionQuestion[] }>(`/auth/exam-sessions/${sessionId}`, { token }),

  submitAnswer: (token: string, sessionId: string, body: { question_id: string; selected_answer: string; time_spent_seconds?: number }) =>
    api<{ correct: boolean; correct_answer: string }>(`/auth/exam-sessions/${sessionId}/answer`, { method: 'POST', body, token }),

  submitSession: (token: string, sessionId: string, body: { answers: { question_id: string; selected_answer: string; time_spent_seconds?: number }[]; time_spent_seconds?: number }) =>
    api<SessionResult>(`/auth/exam-sessions/${sessionId}/submit`, { method: 'POST', body, token }),

  getResults: (token: string, sessionId: string) =>
    api<SessionResult>(`/auth/exam-sessions/${sessionId}/results`, { token }),

  listSessions: (token: string) =>
    api<{ sessions: ExamSession[]; total: number }>('/auth/exam-sessions', { token }),

  abandonSession: (token: string, sessionId: string) =>
    api<{ message: string }>(`/auth/exam-sessions/${sessionId}/abandon`, { method: 'POST', token }),

  getUserStats: (token: string) =>
    api<UserStats>('/auth/stats', { token }),
};

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export const bookmarkApi = {
  listBookmarks: (token: string) =>
    api<{ bookmarks: BookmarkedQuestion[]; total: number }>('/auth/bookmarks', { token }),

  createBookmark: (token: string, questionId: string) =>
    api<{ id: string; message: string }>('/auth/bookmarks', { method: 'POST', body: { question_id: questionId }, token }),

  deleteBookmark: (token: string, questionId: string) =>
    api<{ message: string }>(`/auth/bookmarks/${questionId}`, { method: 'DELETE', token }),
};
