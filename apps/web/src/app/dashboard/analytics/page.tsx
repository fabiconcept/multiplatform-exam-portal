'use client';

import { sessionApi, UserStats, ExamSession } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      sessionApi.getUserStats(token),
      sessionApi.listSessions(token),
    ])
      .then(([s, sess]) => {
        setStats(s);
        setSessions(sess.sessions);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const avgScore = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / completedSessions.length)
    : 0;

  const recentScores = completedSessions.slice(0, 10).map(s => ({
    date: new Date(s.started_at).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    score: s.score || 0,
    exam: s.exam_type,
  }));

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="h-8 w-48 bg-neutral-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-4 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Analytics</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Total Sessions</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{stats?.total_sessions || completedSessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Avg Score</p>
          <p className={`text-3xl font-bold mt-1 ${avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgScore}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Questions Answered</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{stats?.total_answered || 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Study Streak</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{stats?.study_streak || 0} {stats?.study_streak === 1 ? 'day' : 'days'}</p>
        </div>
      </div>

      {/* Score Trend */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Score Trend</h2>
        {recentScores.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No completed sessions yet</p>
        ) : (
          <div className="space-y-3">
            {recentScores.map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-neutral-400 w-16">{s.date}</span>
                <div className="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      s.score >= 70 ? 'bg-green-500' : s.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-neutral-700 w-12 text-right">{Math.round(s.score)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Breakdown */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Performance by Exam</h2>
        {completedSessions.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No data yet</p>
        ) : (
          <div className="space-y-4">
            {Array.from(new Set(completedSessions.map(s => s.exam_type))).map(exam => {
              const examSessions = completedSessions.filter(s => s.exam_type === exam);
              const examAvg = Math.round(examSessions.reduce((sum, s) => sum + (s.score || 0), 0) / examSessions.length);
              return (
                <div key={exam} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-medium text-neutral-900">{exam}</p>
                    <p className="text-xs text-neutral-500">{examSessions.length} sessions</p>
                  </div>
                  <span className={`text-lg font-bold ${examAvg >= 70 ? 'text-green-600' : examAvg >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {examAvg}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard/history" className="flex-1 py-3 bg-neutral-100 text-neutral-700 font-medium rounded-full text-center hover:bg-neutral-200 transition-colors">
          View History
        </Link>
        <Link href="/dashboard/practice" className="flex-1 py-3 bg-primary-600 text-white font-medium rounded-full text-center hover:bg-primary-700 transition-colors">
          Practice Now
        </Link>
      </div>
    </div>
  );
}
