'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/auth';
import { authApi } from '@/lib/api';

export function useDarkMode() {
  const { token } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    authApi.getSettings(token)
      .then((settings) => {
        if (settings?.dark_mode) {
          setDarkMode(true);
          document.documentElement.classList.add('dark');
          localStorage.setItem('darkMode', 'true');
        }
      })
      .catch(() => {});
  }, [token]);

  const toggle = async () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(newValue));
    if (token) {
      try {
        await authApi.updateSettings(token, { dark_mode: newValue });
      } catch {}
    }
  };

  return { darkMode, toggle };
}
