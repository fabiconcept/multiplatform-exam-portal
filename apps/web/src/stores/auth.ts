import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, ApiError, type User } from '@/lib/api';

function setCookie(name: string, value: string, days: number) {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string, deviceInfo?: string) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string; phone?: string; school?: string; target_exam?: string }) => Promise<boolean>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,
      error: null,

      login: async (email, password, deviceInfo) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.login({ email, password, device_info: deviceInfo });
          setCookie('token', token, 30);
          set({ user, token, isLoading: false });
          return true;
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.register(data);
          setCookie('token', token, 30);
          set({ user, token, isLoading: false });
          return true;
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Registration failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        removeCookie('token');
        set({ user: null, token: null, error: null });
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await authApi.me(token);
          setCookie('token', token, 30);
          set({ user, isLoading: false });
        } catch (e) {
          removeCookie('token');
          set({ user: null, token: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'exam-scholars-auth',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
