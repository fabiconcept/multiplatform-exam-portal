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
    throw new ApiError(res.status, data.error || 'Something went wrong', data);
  }

  return data as T;
}

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string; school?: string; target_exam?: string }) =>
    api<{ token: string; user: User }>('/auth/register', { method: 'POST', body }),

  login: (body: { email: string; password: string }) =>
    api<{ token: string; user: User }>('/auth/login', { method: 'POST', body }),

  me: (token: string) =>
    api<User>('/auth/me', { token }),
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
};
