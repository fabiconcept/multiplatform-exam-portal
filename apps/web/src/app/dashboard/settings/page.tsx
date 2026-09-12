'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi, type UserSettings } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useDarkMode } from '@/hooks/use-dark-mode';

export default function SettingsPage() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    if (!token) return;
    authApi.getSettings(token)
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const toggleSetting = async (key: keyof UserSettings) => {
    if (!token || !settings) return;
    const newValue = !settings[key];
    setSettings({ ...settings, [key]: newValue });
    try {
      await authApi.updateSettings(token, { [key]: newValue });
    } catch {
      setSettings({ ...settings, [key]: !newValue });
      toast.error('Failed to update setting');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-48" />
          <div className="h-4 bg-neutral-200 rounded w-64" />
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-neutral-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const Toggle = ({ enabled, onClick }: { enabled: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`w-12 h-7 rounded-full transition-colors ${enabled ? 'bg-primary-500' : 'bg-neutral-200'}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Customize your exam preparation experience</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Push Notifications</p>
              <p className="text-sm text-neutral-500">Receive reminders for daily practice</p>
            </div>
            <Toggle enabled={settings.notifications} onClick={() => toggleSetting('notifications')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Email Updates</p>
              <p className="text-sm text-neutral-500">Get exam tips and updates via email</p>
            </div>
            <Toggle enabled={settings.email_updates} onClick={() => toggleSetting('email_updates')} />
          </div>
        </div>
      </div>

      {/* Practice Settings */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Practice Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Sound Effects</p>
              <p className="text-sm text-neutral-500">Play sounds for correct/wrong answers</p>
            </div>
            <Toggle enabled={settings.sound_effects} onClick={() => toggleSetting('sound_effects')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Auto-save Progress</p>
              <p className="text-sm text-neutral-500">Automatically save your practice progress</p>
            </div>
            <Toggle enabled={settings.auto_save} onClick={() => toggleSetting('auto_save')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Show Explanations</p>
              <p className="text-sm text-neutral-500">Display explanations after each question in Study mode</p>
            </div>
            <Toggle enabled={settings.show_explanations} onClick={() => toggleSetting('show_explanations')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Timer Warning</p>
              <p className="text-sm text-neutral-500">Alert when 5 minutes remaining in exam mode</p>
            </div>
            <Toggle enabled={settings.timer_warning} onClick={() => toggleSetting('timer_warning')} />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">Dark Mode</p>
            <p className="text-sm text-neutral-500">Switch to dark theme</p>
          </div>
          <Toggle enabled={settings.dark_mode} onClick={() => { toggleSetting('dark_mode'); toggleDark(); }} />
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Data & Storage</h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-neutral-900">Download Offline Content</p>
              <p className="text-sm text-neutral-500">2.4 GB used</p>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-neutral-900">Clear Cache</p>
              <p className="text-sm text-neutral-500">Free up storage space</p>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
