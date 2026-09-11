import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adminApi, ApiError, type AdminUser } from '@/lib/api';

interface AuthState {
  admin: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  hydrated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadAdmin: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      admin: null,
      token: null,
      isLoading: true,
      error: null,
      hydrated: false,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { token, admin } = await adminApi.login({ email, password });
          set({ admin, token, isLoading: false });
          return true;
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Login failed';
          set({ error: message, isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ admin: null, token: null, error: null });
      },

      loadAdmin: async () => {
        const { token } = get();
        if (!token) return;
        set({ isLoading: true });
        try {
          const admin = await adminApi.me(token);
          set({ admin, isLoading: false });
        } catch {
          set({ admin: null, token: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'exam-scholars-admin',
      partialize: (state) => ({ token: state.token }),
    }
  )
);
