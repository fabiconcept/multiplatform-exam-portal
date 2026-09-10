'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Adebayo Johnson',
    email: 'adebayo@example.com',
    phone: '08123456789',
    exam: 'JAMB/UTME',
    school: 'Lagos Model Secondary School',
    targetScore: '300',
  });

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Profile</h1>
        <p className="text-neutral-600">Manage your account settings</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-600">AJ</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-neutral-800 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-neutral-900">{profile.name}</h2>
            <p className="text-neutral-500">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="text-xs px-3 py-1 bg-primary-100 text-primary-700 rounded-full font-medium">
                {profile.exam}
              </span>
              <span className="text-xs px-3 py-1 bg-success-100 text-success-700 rounded-full font-medium">
                Activated ✓
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 border-2 border-neutral-200 rounded-full text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-primary-500">285</p>
          <p className="text-xs text-neutral-500">Best Score</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-accent-500">156</p>
          <p className="text-xs text-neutral-500">Questions Done</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-success-500">7</p>
          <p className="text-xs text-neutral-500">Day Streak</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-warning-500">18h</p>
          <p className="text-xs text-neutral-500">Study Time</p>
        </div>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
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
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              disabled={!isEditing}
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
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Preparing For</label>
            <select
              value={profile.exam}
              onChange={(e) => setProfile({ ...profile, exam: e.target.value })}
              disabled={!isEditing}
              className={`w-full px-4 py-3 rounded-xl border-2 text-neutral-900 ${
                isEditing ? 'border-primary-300 bg-white' : 'border-neutral-100 bg-neutral-50'
              } disabled:cursor-not-allowed`}
            >
              <option>JAMB/UTME</option>
              <option>WAEC/SSCE</option>
              <option>Post-UTME</option>
              <option>BECE</option>
              <option>NCEE</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Target Score</label>
            <input
              type="number"
              value={profile.targetScore}
              onChange={(e) => setProfile({ ...profile, targetScore: e.target.value })}
              disabled={!isEditing}
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
              className="px-6 py-3 bg-neutral-900 text-white rounded-full font-semibold hover:bg-neutral-800 transition-all"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Account</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-neutral-900">Change Password</p>
              <p className="text-sm text-neutral-500">Update your account password</p>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-neutral-900">Activation Status</p>
              <p className="text-sm text-success-600">Activated ✓ Lifetime access</p>
            </div>
            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-error-50 rounded-xl hover:bg-error-100 transition-colors">
            <div className="text-left">
              <p className="font-medium text-error-700">Delete Account</p>
              <p className="text-sm text-error-500">Permanently delete your account and data</p>
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
