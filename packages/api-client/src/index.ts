import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  User,
  Subject,
  Question,
  Exam,
  ExamResult,
  PaginatedResponse,
} from '@exam-portal/types';

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
}

export class ApiClient {
  private baseUrl: string;
  private getToken?: () => string | null;
  private onUnauthorized?: () => void;

  constructor(config: ApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.getToken = config.getToken;
    this.onUnauthorized = config.onUnauthorized;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken?.();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401) {
      this.onUnauthorized?.();
      return { success: false, error: 'Unauthorized' };
    }

    const data = await res.json();
    return data;
  }

  auth = {
    login: (data: LoginRequest) => this.request<AuthTokens>('POST', '/auth/login', data),
    register: (data: RegisterRequest) => this.request<AuthTokens>('POST', '/auth/register', data),
    refreshToken: (refreshToken: string) => this.request<AuthTokens>('POST', '/auth/refresh', { refreshToken }),
    me: () => this.request<User>('GET', '/auth/me'),
  };

  subjects = {
    list: () => this.request<Subject[]>('GET', '/subjects'),
    get: (id: string) => this.request<Subject>('GET', `/subjects/${id}`),
  };

  questions = {
    list: (subjectId: string, page = 1, limit = 20) =>
      this.request<PaginatedResponse<Question>>('GET', `/questions?subjectId=${subjectId}&page=${page}&limit=${limit}`),
    get: (id: string) => this.request<Question>('GET', `/questions/${id}`),
  };

  exams = {
    list: () => this.request<Exam[]>('GET', '/exams'),
    get: (id: string) => this.request<Exam>('GET', `/exams/${id}`),
    submit: (examId: string, answers: { questionId: string; selectedAnswer: string }[], timeTakenMins?: number) =>
      this.request<ExamResult>('POST', `/exams/${examId}/submit`, { answers, timeTakenMins }, crypto.randomUUID()),
  };

  results = {
    list: () => this.request<ExamResult[]>('GET', '/results'),
    get: (id: string) => this.request<ExamResult>('GET', `/results/${id}`),
  };
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}
