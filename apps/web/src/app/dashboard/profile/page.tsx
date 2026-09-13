'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { authApi, api, type Exam } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function ProfilePage() {
  const { user, token } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    school: '',
    target_exam: '',
    target_score: '',
  });
  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [examOptions, setExamOptions] = useState<string[]>([]);

  useEffect(() => {
    api<{ exams: Exam[] }>('/auth/exams')
      .then((res) => setExamOptions(res.exams.map((e) => e.name)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        phone: user.phone || '',
        school: user.school || '',
        target_exam: user.target_exam || '',
        target_score: user.target_score || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const updated = await authApi.updateProfile(token, profile);
      useAuthStore.setState({ user: { ...user!, ...updated } });
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!token) return;
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await authApi.updatePassword(token, {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      toast.success('Password updated successfully');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  if (!user) {
    return (
      <div className="p-4 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-neutral-200 rounded-lg mb-2" />
          <div className="h-4 w-64 bg-neutral-100 rounded" />
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-neutral-200 rounded-full" />
              <div className="flex-1 space-y-3">
                <div className="h-6 w-48 bg-neutral-200 rounded" />
                <div className="h-4 w-32 bg-neutral-100 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Profile</h1>
        <p className="text-neutral-600">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
          <div className="relative shrink-0">
            <div className="w-20 h-20 lg:w-24 lg:h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl lg:text-3xl font-bold text-primary-600">{userInitials}</span>
            </div>
          </div>
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">{user?.name || 'Student'}</h2>
            <p className="text-neutral-500 truncate">{user?.email}</p>
            <div className="flex gap-2 mt-2 justify-center sm:justify-start flex-wrap">
              <span className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                {user?.target_exam || 'No exam selected'}
              </span>
              {user?.is_banned ? (
                <span className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                  Banned
                </span>
              ) : user?.is_active ? (
                <span className="text-xs px-3 py-1 bg-success-100 text-success-700 rounded-full font-medium">
                  Activated
                </span>
              ) : (
                <span className="text-xs px-3 py-1 bg-warning-100 text-warning-700 rounded-full font-medium">
                  Free Plan
                </span>
              )}
              {user?.email_verified === false && (
                <span className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                  Email Unverified
                </span>
              )}
              {user?.email_verified === true && (
                <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  Email Verified
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (isEditing) {
                if (user) {
                  setProfile({
                    name: user.name || '',
                    phone: user.phone || '',
                    school: user.school || '',
                    target_exam: user.target_exam || '',
                    target_score: user.target_score || '',
                  });
                }
              }
              setIsEditing(!isEditing);
            }}
            className="px-4 py-2 border-2 border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-neutral-500 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter phone number"
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">School</label>
            <input
              type="text"
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              disabled={!isEditing}
              placeholder="Enter school name"
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Preparing For</label>
            <select
              value={profile.target_exam}
              onChange={(e) => setProfile({ ...profile, target_exam: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            >
              <option value="">Select exam</option>
              {examOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Target Score</label>
            <input
              type="number"
              value={profile.target_score}
              onChange={(e) => setProfile({ ...profile, target_score: e.target.value })}
              disabled={!isEditing}
              placeholder="e.g. 300"
              max="400"
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
        </div>
        {isEditing && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Change Password</h3>
        <div className="grid grid-cols-1 gap-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
              placeholder="Enter current password"
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-neutral-900 focus:border-primary-300 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-neutral-900 focus:border-primary-300 focus:bg-white outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirm_password}
              onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-100 bg-neutral-50 text-neutral-900 focus:border-primary-300 focus:bg-white outline-none"
            />
          </div>
          <div>
            <button
              onClick={handlePasswordChange}
              disabled={changingPassword || !passwords.current_password || !passwords.new_password}
              className="px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold hover:bg-neutral-800 transition-all disabled:opacity-50"
            >
              {changingPassword ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : 'Update Password'}
            </button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
            <div className="text-left">
              <p className="font-medium text-neutral-900">Activation Status</p>
              <p className={`text-sm ${user?.is_banned ? 'text-red-600' : user?.is_active ? 'text-success-600' : 'text-warning-600'}`}>
                {user?.is_banned ? 'Banned — Contact support' : user?.is_active ? 'Activated ✓ Lifetime access' : 'Free Plan — 5 questions limit'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
