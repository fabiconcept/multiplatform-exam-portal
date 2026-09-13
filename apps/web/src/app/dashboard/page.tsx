'use client';

import { useState, useEffect } from 'react';
import { authApi, examApi, sessionApi, Exam, UserStats } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { StreakCalendar } from '@/components/dashboard/StreakCalendar';
import { ActivationModal } from '@/components/dashboard/ActivationModal';

function ExamIcon({ iconUrl, name, size = 'md' }: { iconUrl?: string; name: string; size?: 'sm' | 'md' | 'lg' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = size === 'lg' ? 'w-10 h-10 lg:w-12 lg:h-12' : size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const iconSize = size === 'lg' ? 40 : size === 'md' ? 20 : 16;

  if (iconUrl && !imgError) {
    return (
      <div className={`${sizeClasses} rounded-xl flex items-center justify-center overflow-hidden bg-primary-50 shrink-0`}>
        <img
          src={iconUrl}
          alt={name}
          width={iconSize}
          height={iconSize}
          className="object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClasses} rounded-xl flex items-center justify-center bg-primary-50 shrink-0`}>
      <svg className={`${size === 'lg' ? 'w-5 h-5 lg:w-6 lg:h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'} text-primary-500`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    </div>
  );
}

function ExamCardContent({ exam }: { exam: Exam }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 lg:gap-4 min-w-0">
        <ExamIcon iconUrl={exam.icon_url} name={exam.name} size="lg" />
        <div className="min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">{exam.name}</h3>
          <p className="text-sm text-neutral-500 truncate">{exam.description || 'Exam preparation package'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 lg:gap-8 shrink-0 ml-3">
        <div className="text-center hidden sm:block">
          <p className="text-lg font-bold text-neutral-900">{exam.subject_count ?? 0}</p>
          <p className="text-xs text-neutral-500">Subjects</p>
        </div>
        <div className="text-center hidden sm:block">
          <p className="text-lg font-bold text-neutral-900">{exam.question_count ?? 0}</p>
          <p className="text-xs text-neutral-500">Questions</p>
        </div>
      </div>
    </div>
  );
}

interface ExamSession {
  id: string;
  exam_type: string;
  mode: string;
  status: string;
  started_at: string;
  score: number | null;
  total_correct: number | null;
  total_answered: number | null;
}

export default function DashboardPage() {
  const { user, token } = useAuthStore();
  const [usageStatus, setUsageStatus] = useState<{ total_used: number; limit: number; remaining: number; is_activated: boolean } | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoading, setExamsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  const isActivated = user?.is_active || false;
  const isBanned = user?.is_banned || false;
  const [showActivationModal, setShowActivationModal] = useState(false);

  useEffect(() => {
    if (!token) return;
    authApi.usageStatus(token).then(setUsageStatus).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    authApi.checkVerificationStatus(token)
      .then(res => setIsVerified(res.verified))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setExamsLoading(true);
    examApi.listExams(token)
      .then(res => setExams(res.exams || []))
      .catch(() => {})
      .finally(() => setExamsLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    sessionApi.getUserStats(token)
      .then(setStats)
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setSessionsLoading(true);
    sessionApi.listSessions(token)
      .then(res => setSessions(res.sessions || []))
      .catch(() => {})
      .finally(() => setSessionsLoading(false));
  }, [token]);

  const recentSessions = sessions.slice(0, 5);
  const avgScore = stats?.avg_score ?? 0;

  return (
    <div className="p-4 lg:p-8 pt-14 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-1">Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
          <p className="text-neutral-600">Continue your exam preparation journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-sm font-medium text-primary-700">{user?.target_exam || 'JAMB/UTME'} Package</span>
          </div>
          {isBanned ? (
            <div className="px-4 py-2 bg-red-100 rounded-full">
              <span className="text-sm font-medium text-red-700">Banned</span>
            </div>
          ) : isActivated ? (
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
      {!isActivated && !isBanned && (
        <div className="bg-gradient-to-r dark:from-warning-50/5 from-warning-50 dark:to-warning-100/5 to-warning-100 border border-warning-200 rounded-2xl p-4 lg:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warning-200 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onClick={() => setShowActivationModal(true)}
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

      {/* Email Verification Banner */}
      {isVerified === false && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Verify your email address</span> to secure your account and enable all features.
            </p>
          </div>
          <button
            onClick={() => {
              if (user?.email) {
                authApi.sendVerification(user.email).then(() => toast.success('Verification email sent!')).catch(() => toast.error('Failed to send verification'));
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Send Verification
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats?.total_answered || 0}</p>
          <p className="text-xs text-neutral-500">Questions Done</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats ? `${Math.round(stats.avg_score)}%` : '0%'}</p>
          <p className="text-xs text-neutral-500">Avg Score</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-accent-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats ? `${Math.round(stats.study_time_hours * 100) / 100}h` : '0h'}</p>
          <p className="text-xs text-neutral-500">Study Time</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats?.study_streak || 0}</p>
          <p className="text-xs text-neutral-500">Day Streak</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-neutral-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{stats?.bookmark_count || 0}</p>
          <p className="text-xs text-neutral-500">Bookmarked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Exam Packages */}
        <div className="lg:col-span-2">
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
              exams.map((exam) => {
                const hasQuestions = (exam.question_count ?? 0) > 0;
                return (
                <div
                  key={exam.id}
                  className={`block bg-white rounded-2xl p-5 shadow-sm transition-shadow ${hasQuestions ? 'hover:shadow-md' : 'opacity-60'}`}
                >
                  {hasQuestions ? (
                    <Link href={`/dashboard/practice?exam=${exam.slug}`} className="block">
                      <ExamCardContent exam={exam} />
                    </Link>
                  ) : (
                    <div className="cursor-not-allowed">
                      <ExamCardContent exam={exam} />
                      <p className="text-xs text-neutral-400 mt-2 italic">Coming soon — no questions yet</p>
                    </div>
                  )}
                </div>
                );
              })
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

          {/* Study Streak */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-neutral-900">Study Streak</h3>
              <span className="text-sm font-bold text-warning-600">{stats?.study_streak || 0} {stats?.study_streak === 1 ? 'day' : 'days'}</span>
            </div>
            <StreakCalendar sessions={sessions} />
            <div className="flex items-center justify-between mt-3 text-xs text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-success-500 rounded-sm" /> Practiced</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-neutral-100 rounded-sm" /> No practice</span>
            </div>
          </div>

          {/* Goal Progress */}
          {user?.target_score && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-neutral-900 mb-2">Goal Progress</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-2xl font-bold text-neutral-900">{Math.round(avgScore)}%</span>
                <span className="text-sm text-neutral-500 mb-1">/ {user.target_score}% target</span>
              </div>
              <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (avgScore / parseInt(user.target_score)) * 100)}%` }}
                />
              </div>
              <Link href="/dashboard/analytics" className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                View detailed analytics →
              </Link>
            </div>
          )}

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
          {(() => {
            const mockExam = exams.find(e => e.slug?.toLowerCase().includes('mock'));
            if (!mockExam) return null;
            return (
              <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <ExamIcon iconUrl={mockExam.icon_url} name={mockExam.name} />
                  <div>
                    <h3 className="font-semibold text-neutral-900">{mockExam.name}</h3>
                    <p className="text-xs text-neutral-500">{mockExam.description || 'Practice for CBT mock exam'}</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-600 mb-3">Simulate the official {mockExam.name} examination</p>
                <Link
                  href={`/dashboard/practice?exam=${mockExam.slug}`}
                  className="block w-full py-2.5 border-2 border-primary-500 text-primary-600 rounded-xl font-medium text-center hover:bg-primary-50 transition-colors text-sm"
                >
                  Start Mock Exam
                </Link>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
          <Link href="/dashboard/history" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all history →
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {sessionsLoading ? (
            <div className="p-6 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-neutral-200 rounded-xl" />
                    <div>
                      <div className="h-4 bg-neutral-200 rounded w-24 mb-2" />
                      <div className="h-3 bg-neutral-100 rounded w-32" />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-neutral-200 rounded w-16 mb-2 ml-auto" />
                    <div className="h-3 bg-neutral-100 rounded w-20 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="divide-y divide-neutral-100">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 lg:p-5 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center gap-3 lg:gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      session.status === 'completed'
                        ? 'bg-success-100'
                        : session.status === 'in_progress'
                        ? 'bg-warning-100'
                        : 'bg-neutral-100'
                    }`}>
                      {session.status === 'completed' ? (
                        <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : session.status === 'in_progress' ? (
                        <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-neutral-900 truncate">{session.exam_type}</p>
                      <p className="text-sm text-neutral-500 capitalize">{session.mode} • {new Date(session.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-semibold text-neutral-900">
                      {session.score !== null ? `${Math.round(session.score)}%` : '—'}
                    </p>
                    <p className="text-sm text-neutral-500 capitalize">{session.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-neutral-500 text-sm">No recent activity yet. Start practicing!</p>
            </div>
          )}
        </div>
      </div>
      <ActivationModal
        open={showActivationModal}
        onClose={() => setShowActivationModal(false)}
        showLimit={usageStatus?.limit}
        showUsed={usageStatus?.total_used}
      />
    </div>
  );
}
