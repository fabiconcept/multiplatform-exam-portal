'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { authApi, examApi, Exam } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [usageStatus, setUsageStatus] = useState<{ total_used: number; limit: number; remaining: number; is_activated: boolean } | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);

  const isActivated = user?.is_active || false;

  useEffect(() => {
    if (!token) return;
    authApi.usageStatus(token).then(setUsageStatus).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setExamsLoading(true);
    examApi.listExams(token)
      .then(res => setExams(res.exams || []))
      .catch(() => {})
      .finally(() => setExamsLoading(false));
  }, [token]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-neutral-600">Continue your exam preparation journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-sm font-medium text-primary-700">{user?.target_exam || 'JAMB/UTME'} Package</span>
          </div>
          {isActivated ? (
            <div className="px-4 py-2 bg-success-100 rounded-full">
              <span className="text-sm font-medium text-success-700">Activated ✓</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-warning-100 rounded-full">
              <span className="text-sm font-medium text-warning-700">Free Plan</span>
            </div>
          )}
        </div>
      </div>

      {/* Activation Banner */}
      {!isActivated && (
        <div className="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-warning-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-warning-900">
                  {usageStatus && usageStatus.remaining > 0
                    ? `${usageStatus.remaining} of ${usageStatus.limit} free questions remaining`
                    : 'Start with 5 free questions'}
                </h3>
                <p className="text-sm text-warning-700">
                  Activate your account for unlimited practice questions and full features.
                </p>
              </div>
            </div>
            <button
              onClick={() => toast.success('Activation flow coming soon!')}
              className="px-6 py-3 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 transition-all whitespace-nowrap"
            >
              Activate Account
            </button>
          </div>
          {usageStatus && (
            <>
              <div className="mt-4 h-2 bg-warning-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-warning-500 rounded-full transition-all"
                  style={{ width: `${(usageStatus.total_used / usageStatus.limit) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-warning-600">{usageStatus.total_used} used</span>
                <span className="text-xs text-warning-600">{usageStatus.limit} limit</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{usageStatus?.total_used || 0}</p>
          <p className="text-xs text-neutral-500">Questions Done</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">285</p>
          <p className="text-xs text-neutral-500">Est. JAMB Score</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">18h</p>
          <p className="text-xs text-neutral-500">Study Time</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">7</p>
          <p className="text-xs text-neutral-500">Day Streak</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">24</p>
          <p className="text-xs text-neutral-500">Bookmarked</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Exam Packages */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-neutral-900">Exam Packages</h2>
            <Link href="/dashboard/practice" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Practice now →
            </Link>
          </div>
          <div className="space-y-3">
            {examsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-neutral-200 rounded-xl" />
                      <div>
                        <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
                        <div className="h-3 bg-neutral-100 rounded w-48" />
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <div className="h-5 bg-neutral-200 rounded w-8 mx-auto mb-1" />
                        <div className="h-2 bg-neutral-100 rounded w-12" />
                      </div>
                      <div className="text-center">
                        <div className="h-5 bg-neutral-200 rounded w-8 mx-auto mb-1" />
                        <div className="h-2 bg-neutral-100 rounded w-14" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : exams.length > 0 ? (
              exams.map((exam) => (
                <Link
                  key={exam.id}
                  href={`/dashboard/practice?exam=${exam.slug}`}
                  className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden bg-primary-50">
                        {exam.icon_url ? (
                          <img src={exam.icon_url} alt={exam.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{exam.name}</h3>
                        <p className="text-sm text-neutral-500">{exam.description || 'Exam preparation package'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900">{exam.subject_count ?? 0}</p>
                        <p className="text-xs text-neutral-500">Subjects</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-neutral-900">{exam.question_count ?? 0}</p>
                        <p className="text-xs text-neutral-500">Questions</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
                <p className="text-neutral-500 text-sm">No exam packages available yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Start */}
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Quick Start</h3>
            <p className="text-white/80 text-sm mb-4">
              {exams.length > 0
                ? `Practice ${exams[0].name} with ${exams[0].subject_count ?? 0} subjects`
                : 'Practice with available exam packages'}
            </p>
            <Link
              href={exams.length > 0 ? `/dashboard/practice?exam=${exams[0].slug}` : '/dashboard/practice'}
              className="block w-full py-3 bg-white text-accent-600 rounded-xl font-semibold text-center hover:bg-white/90 transition-colors"
            >
              Start Practice →
            </Link>
          </div>

          {/* Key Points */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-neutral-900 mb-3">Key Points</h3>
            <p className="text-xs text-neutral-500 mb-3">Study materials from major subjects</p>
            <div className="space-y-2">
              <div className="p-3 bg-neutral-50 rounded-xl text-center">
                <p className="text-sm text-neutral-500">Start practicing to see your key points</p>
              </div>
            </div>
            <Link href="/dashboard/keypoints" className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all topics →
            </Link>
          </div>

          {/* Mock Exam */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-primary-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900">JAMB Mock</h3>
                <p className="text-xs text-neutral-500">Practice for CBT mock exam</p>
              </div>
            </div>
            <p className="text-sm text-neutral-600 mb-3">Simulate the official JAMB mock examination</p>
            <Link
              href="/dashboard/practice?exam=mock"
              className="block w-full py-2.5 border-2 border-primary-500 text-primary-600 rounded-xl font-medium text-center hover:bg-primary-50 transition-colors text-sm"
            >
              Start Mock Exam
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
          <Link href="/dashboard/results" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all results →
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-8 text-center">
            <p className="text-neutral-500 text-sm">No recent activity yet. Start practicing to see your results here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
