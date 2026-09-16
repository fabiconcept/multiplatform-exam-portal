'use client';

import { sessionApi, UserStats, ExamSession, examApi, Exam } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';

export default function AnalyticsPage() {
  const { token } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

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
    examApi.listExams(token)
      .then(res => setExams(res.exams || []))
      .catch(() => {});
  }, [token]);

  const completedSessions = sessions.filter(s => s.status === 'completed' || s.status === 'expired');

  const uniqueExamTypes = useMemo(() => {
    const types = new Set(completedSessions.map(s => s.exam_type));
    return Array.from(types);
  }, [completedSessions]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    completedSessions.forEach(s => {
      if (s.filter_values) {
        try {
          const fv = JSON.parse(typeof s.filter_values === 'string' ? s.filter_values : '{}');
          if (fv.year_of_study) classes.add(fv.year_of_study);
        } catch {}
      }
    });
    return Array.from(classes).sort();
  }, [completedSessions]);

  const filteredSessions = useMemo(() => {
    return completedSessions.filter(s => {
      if (examFilter !== 'all' && s.exam_type !== examFilter) return false;
      if (classFilter !== 'all') {
        if (!s.filter_values) return false;
        try {
          const fv = JSON.parse(typeof s.filter_values === 'string' ? s.filter_values : '{}');
          if (fv.year_of_study !== classFilter) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [completedSessions, examFilter, classFilter]);

  const avgScore = filteredSessions.length > 0
    ? Math.round(filteredSessions.reduce((sum, s) => sum + (s.score || 0), 0) / filteredSessions.length)
    : 0;

  const totalAnswered = filteredSessions.reduce((sum, s) => sum + (s.total_answered || 0), 0);

  const recentScores = filteredSessions.slice(0, 10).map(s => ({
    date: (typeof s.started_at === 'number' ? new Date(s.started_at * 1000) : new Date(s.started_at)).toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }),
    score: s.score || 0,
    exam: s.exam_type,
  }));

  const getExamName = (slug: string) => {
    const exam = exams.find(e => e.slug === slug || e.id === slug);
    return exam?.name || slug;
  };

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
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Analytics</h1>
      <p className="text-sm text-neutral-500 mb-6">Track your performance across sessions</p>

      {/* Filters */}
      {(uniqueExamTypes.length > 1 || uniqueClasses.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {uniqueExamTypes.length > 1 && (
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="all">All Exams</option>
              {uniqueExamTypes.map(t => (
                <option key={t} value={t}>{getExamName(t)}</option>
              ))}
            </select>
          )}
          {uniqueClasses.length > 0 && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-full text-sm font-medium text-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            >
              <option value="all">All Classes</option>
              {uniqueClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Total Sessions</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{filteredSessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Avg Score</p>
          <p className={`text-3xl font-bold mt-1 ${avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgScore}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Questions Answered</p>
          <p className="text-3xl font-bold text-neutral-900 mt-1">{totalAnswered}</p>
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
          <p className="text-neutral-500 text-center py-8">No completed sessions found</p>
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
        {filteredSessions.length === 0 ? (
          <p className="text-neutral-500 text-center py-8">No data found</p>
        ) : (
          <div className="space-y-4">
            {Array.from(new Set(filteredSessions.map(s => s.exam_type))).map(exam => {
              const examSessions = filteredSessions.filter(s => s.exam_type === exam);
              const examAvg = Math.round(examSessions.reduce((sum, s) => sum + (s.score || 0), 0) / examSessions.length);
              return (
                <div key={exam} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-medium text-neutral-900">{getExamName(exam)}</p>
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
