'use client'

import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { admin } = useAuthStore()

  const [profile, setProfile] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    role: admin?.role || 'admin',
  })

  const [passwords, setPasswords] = useState({ current: '', newPassword: '', confirm: '' })

  const handleProfileSave = () => { toast.success('Profile updated') }

  const handlePasswordUpdate = () => {
    if (passwords.newPassword !== passwords.confirm) { toast.error('Passwords do not match'); return }
    if (passwords.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
    toast.success('Password updated'); setPasswords({ current: '', newPassword: '', confirm: '' })
  }

  const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100";
  const disabledCls = "w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-950">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your admin account</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-950">Profile Information</h2>
        <p className="mb-5 mt-1 text-sm text-gray-500">Update your personal details</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={profile.email} disabled className={disabledCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Role</label>
            <input type="text" value={profile.role} disabled className={disabledCls} />
          </div>
          <div className="pt-2">
            <button onClick={handleProfileSave} className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">Save Changes</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-950">Change Password</h2>
        <p className="mb-5 mt-1 text-sm text-gray-500">Keep your account secure</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Current Password</label>
            <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className={inputCls} placeholder="Enter current password" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">New Password</label>
            <input type="password" value={passwords.newPassword} onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} className={inputCls} placeholder="Enter new password" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className={inputCls} placeholder="Confirm new password" />
          </div>
          <div className="pt-2">
            <button onClick={handlePasswordUpdate} className="rounded-xl bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800">Update Password</button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-950">Platform Settings</h2>
        <p className="mb-5 mt-1 text-sm text-gray-500">System configuration (read-only)</p>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">API URL</label>
            <input type="text" value="http://127.0.0.1:8080" disabled className={disabledCls} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Admin Port</label>
            <input type="text" value="3002" disabled className={disabledCls} />
          </div>
          <p className="text-xs text-gray-400">Only super admins can modify platform settings.</p>
        </div>
      </div>
    </div>
  )
}
