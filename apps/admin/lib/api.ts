const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080/api';

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

export async function api<T = unknown>(endpoint: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const { method = 'GET', body, token } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data.error || 'Something went wrong', data);
  return data as T;
}

export type AdminUser = { id: string; name: string; email: string; phone?: string; school?: string; target_exam?: string; target_score?: string; is_active: boolean; is_banned: boolean; ban_reason?: string; role: string; created_at?: string; };
export type ActivationKey = { id: string; key_code: string; exam_type: string; max_uses: number; used_count: number; created_by: string; created_at: string; expires_at?: string; is_active: boolean; };
export type Exam = { id: string; name: string; slug: string; description?: string; total_questions: number; time_limit_minutes: number; min_subjects: number; max_subjects: number; is_active: boolean; icon_url?: string; created_at: string; subject_count?: number; question_count?: number; };
export type Subject = { id: string; exam_id: string; name: string; slug: string; description?: string; is_active: boolean; created_at: string; };
export type Topic = { id: string; subject_id: string; name: string; slug: string; is_active: boolean; created_at: string; };
export type Question = { id: string; subject_id: string; topic_id?: string; exam_type: string; question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_answer: string; explanation?: string; difficulty: string; is_active: boolean; created_at: string; updated_at: string; };
export type AuditLogEntry = { id: string; admin_id: string; admin_email: string; action: string; target_type: string; target_id?: string; details?: string; ip_address?: string; created_at: string; };
export type DashboardStats = { total_users: number; new_users_today: number; new_users_week: number; total_questions: number; total_exams: number; total_keys: number; used_keys: number; active_users: number; };

export const adminApi = {
  login: (body: { email: string; password: string }) => api<{ token: string; admin: AdminUser }>('/admin/login', { method: 'POST', body }),
  me: (token: string) => api<AdminUser>('/admin/me', { token }),
  logout: (token: string) => api<{ message: string }>('/admin/logout', { method: 'POST', token }),
  
  dashboard: (token: string) => api<DashboardStats>('/admin/dashboard', { token }),
  
  listUsers: (token: string, params?: { page?: number; limit?: number; search?: string; role?: string; is_active?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.search) q.set('search', params.search);
    if (params?.role) q.set('role', params.role);
    if (params?.is_active) q.set('is_active', params.is_active);
    const qs = q.toString();
    return api<{ users: AdminUser[]; total: number; page: number; limit: number }>(`/admin/users${qs ? '?' + qs : ''}`, { token });
  },
  getUser: (token: string, id: string) => api<AdminUser>(`/admin/users/${id}`, { token }),
  updateUser: (token: string, id: string, body: Partial<AdminUser>) => api<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body, token }),
  deleteUser: (token: string, id: string) => api<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE', token }),
  banUser: (token: string, id: string, reason: string) => api<{ message: string }>(`/admin/users/${id}/ban`, { method: 'POST', body: { reason }, token }),
  unbanUser: (token: string, id: string) => api<{ message: string }>(`/admin/users/${id}/unban`, { method: 'POST', token }),
  resetPassword: (token: string, id: string) => api<{ message: string; temp_password: string }>(`/admin/users/${id}/reset-password`, { method: 'POST', token }),
  
  listKeys: (token: string, params?: { page?: number; limit?: number; exam_type?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.exam_type) q.set('exam_type', params.exam_type);
    const qs = q.toString();
    return api<{ keys: ActivationKey[]; total: number; page: number; limit: number }>(`/admin/keys${qs ? '?' + qs : ''}`, { token });
  },
  generateKeys: (token: string, body: { exam_type: string; count?: number; expires_at?: string }) => api<{ keys: ActivationKey[] }>(`/admin/keys`, { method: 'POST', body, token }),
  deleteKey: (token: string, id: string) => api<{ message: string }>(`/admin/keys/${id}`, { method: 'DELETE', token }),
  keyStats: (token: string) => api<{ total: number; used: number; unused: number; expired: number }>('/admin/keys/stats', { token }),
  
  listExams: (token: string) => api<{ exams: Exam[]; total: number }>('/admin/exams', { token }),
  createExam: (token: string, body: { name: string; description?: string; total_questions?: number; time_limit_minutes?: number; icon_url?: string; min_subjects?: number; max_subjects?: number }) => api<Exam>('/admin/exams', { method: 'POST', body, token }),
  updateExam: (token: string, id: string, body: Partial<Exam>) => api<Exam>(`/admin/exams/${id}`, { method: 'PUT', body, token }),
  deleteExam: (token: string, id: string) => api<{ message: string }>(`/admin/exams/${id}`, { method: 'DELETE', token }),
  listSubjects: (token: string, examId: string) => api<{ subjects: Subject[]; total: number }>(`/admin/exams/${examId}/subjects`, { token }),
  createSubject: (token: string, examId: string, body: { name: string; description?: string }) => api<Subject>(`/admin/exams/${examId}/subjects`, { method: 'POST', body, token }),
  updateSubject: (token: string, id: string, body: { name: string; description?: string }) => api<Subject>(`/admin/subjects/${id}`, { method: 'PUT', body, token }),
  deleteSubject: (token: string, id: string) => api<{ message: string }>(`/admin/subjects/${id}`, { method: 'DELETE', token }),
  createTopic: (token: string, subjectId: string, body: { name: string }) => api<Topic>(`/admin/subjects/${subjectId}/topics`, { method: 'POST', body, token }),
  listTopics: (token: string, subjectId: string) => api<{ topics: Topic[]; total: number }>(`/admin/subjects/${subjectId}/topics`, { token }),
  updateTopic: (token: string, id: string, body: { name: string }) => api<Topic>(`/admin/topics/${id}`, { method: 'PUT', body, token }),
  deleteTopic: (token: string, id: string) => api<{ message: string }>(`/admin/topics/${id}`, { method: 'DELETE', token }),
  importTopicsCsv: (token: string, body: { csv: string; subject_id: string }) => api<{ total: number; success: number; failed: number; errors: { row: number; reason: string }[] }>('/admin/topics/import/csv', { method: 'POST', body, token }),
  importTopicsJson: (token: string, body: { topics: Record<string, unknown>[]; subject_id: string }) => api<{ total: number; success: number; failed: number; errors: { row: number; reason: string }[] }>('/admin/topics/import/json', { method: 'POST', body, token }),
  
  listQuestions: (token: string, params?: { page?: number; limit?: number; exam_type?: string; subject_id?: string; difficulty?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.exam_type) q.set('exam_type', params.exam_type);
    if (params?.subject_id) q.set('subject_id', params.subject_id);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString();
    return api<{ questions: Question[]; total: number; page: number; limit: number }>(`/admin/questions${qs ? '?' + qs : ''}`, { token });
  },
  createQuestion: (token: string, body: Omit<Question, 'id' | 'is_active' | 'created_at' | 'updated_at'>) => api<Question>('/admin/questions', { method: 'POST', body, token }),
  updateQuestion: (token: string, id: string, body: Partial<Question>) => api<Question>(`/admin/questions/${id}`, { method: 'PUT', body, token }),
  deleteQuestion: (token: string, id: string) => api<{ message: string }>(`/admin/questions/${id}`, { method: 'DELETE', token }),
  importCsv: (token: string, body: { csv: string }) => api<{ total: number; success: number; failed: number; errors: { row: number; reason: string }[] }>('/admin/questions/import/csv', { method: 'POST', body, token }),
  importJson: (token: string, body: { questions: Record<string, unknown>[] }) => api<{ total: number; success: number; failed: number; errors: { row: number; reason: string }[] }>('/admin/questions/import/json', { method: 'POST', body, token }),
  exportQuestions: (token: string, format: 'csv' | 'json') => api(`/admin/questions/export?format=${format}`, { token }),
  questionStats: (token: string) => api<{ total: number; by_exam: { exam_type: string; count: number }[]; by_difficulty: { difficulty: string; count: number }[] }>('/admin/questions/stats', { token }),
  
  listAuditLog: (token: string, params?: { page?: number; limit?: number; admin_id?: string; action?: string }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.admin_id) q.set('admin_id', params.admin_id);
    if (params?.action) q.set('action', params.action);
    const qs = q.toString();
    return api<{ entries: AuditLogEntry[]; total: number; page: number; limit: number }>(`/admin/audit-log${qs ? '?' + qs : ''}`, { token });
  },
};
