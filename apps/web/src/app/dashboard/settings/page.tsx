'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    soundEffects: true,
    darkMode: false,
    autoSave: true,
    showExplanations: true,
    timerWarning: true,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success('Settings updated');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Settings</h1>
        <p className="text-neutral-600">Customize your exam preparation experience</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Push Notifications</p>
              <p className="text-sm text-neutral-500">Receive reminders for daily practice</p>
            </div>
            <button
              onClick={() => toggleSetting('notifications')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.notifications ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Email Updates</p>
              <p className="text-sm text-neutral-500">Get exam tips and updates via email</p>
            </div>
            <button
              onClick={() => toggleSetting('emailUpdates')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.emailUpdates ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.emailUpdates ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Practice Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Practice Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Sound Effects</p>
              <p className="text-sm text-neutral-500">Play sounds for correct/wrong answers</p>
            </div>
            <button
              onClick={() => toggleSetting('soundEffects')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.soundEffects ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.soundEffects ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Auto-save Progress</p>
              <p className="text-sm text-neutral-500">Automatically save your practice progress</p>
            </div>
            <button
              onClick={() => toggleSetting('autoSave')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.autoSave ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.autoSave ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Show Explanations</p>
              <p className="text-sm text-neutral-500">Display explanations after each question in Study mode</p>
            </div>
            <button
              onClick={() => toggleSetting('showExplanations')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.showExplanations ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.showExplanations ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Timer Warning</p>
              <p className="text-sm text-neutral-500">Alert when 5 minutes remaining in exam mode</p>
            </div>
            <button
              onClick={() => toggleSetting('timerWarning')}
              className={`w-12 h-7 rounded-full transition-colors ${
                settings.timerWarning ? 'bg-primary-500' : 'bg-neutral-200'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.timerWarning ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900">Dark Mode</p>
            <p className="text-sm text-neutral-500">Switch to dark theme</p>
          </div>
          <button
            onClick={() => toggleSetting('darkMode')}
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.darkMode ? 'bg-primary-500' : 'bg-neutral-200'
            }`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
              settings.darkMode ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
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
          <button className="w-full flex items-center justify-between p-4 bg-error-50 rounded-xl hover:bg-error-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-error-700">Delete All Data</p>
              <p className="text-sm text-error-500">Remove all practice history</p>
            </div>
            <svg className="w-5 h-5 text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
