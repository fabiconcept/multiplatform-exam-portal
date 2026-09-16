'use client';

import { sessionApi, ExamSession, examApi, Exam } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';

export default function HistoryPage() {
  const { token } = useAuthStore();
  const router = useRouter();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress' | 'expired'>('all');
  const [examFilter, setExamFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    sessionApi.listSessions(token)
      .then(res => setSessions(res.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    examApi.listExams(token)
      .then(res => setExams(res.exams || []))
      .catch(() => {});
  }, [token]);

  const uniqueExamTypes = useMemo(() => {
    const types = new Set(sessions.map(s => s.exam_type));
    return Array.from(types);
  }, [sessions]);

  const uniqueClasses = useMemo(() => {
    const classes = new Set<string>();
    sessions.forEach(s => {
      if (s.filter_values) {
        try {
          const fv = JSON.parse(typeof s.filter_values === 'string' ? s.filter_values : '{}');
          if (fv.year_of_study) classes.add(fv.year_of_study);
        } catch {}
      }
    });
    return Array.from(classes).sort();
  }, [sessions]);

  const filtered = sessions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
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

  const formatDate = (d: number | string) => {
    const date = typeof d === 'number' ? new Date(d * 1000) : new Date(d);
    return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getExamName = (slug: string) => {
    const exam = exams.find(e => e.slug === slug || e.id === slug);
    return exam?.name || slug;
  };

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Exam History</h1>
      <p className="text-sm text-neutral-500 mb-6">View and filter your practice sessions</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Status Filter */}
        <div className="flex gap-1.5 bg-neutral-100 p-1 rounded-full">
          {(['all', 'completed', 'in_progress', 'expired'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === f ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : f === 'expired' ? 'Timed Out' : 'In Progress'}
            </button>
          ))}
        </div>

        {/* Exam Type Filter */}
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

        {/* Class Filter */}
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

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-neutral-500">No exam sessions found</p>
          <Link href="/dashboard/practice" className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700">
            Start practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => {
            let className = '';
            if (s.filter_values) {
              try {
                const fv = JSON.parse(typeof s.filter_values === 'string' ? s.filter_values : '{}');
                className = fv.year_of_study || '';
              } catch {}
            }
            const isExpired = s.status === 'expired';
            const isCompleted = s.status === 'completed';
            const isInProgress = s.status === 'in_progress';
            return (
              <div
                key={s.id}
                className={`block bg-white rounded-2xl p-5 shadow-sm transition-shadow ${isInProgress ? 'hover:shadow-md cursor-pointer' : 'hover:shadow-md'}`}
                onClick={() => {
                  if (isInProgress) {
                    localStorage.setItem('Examinery-practice-continue', s.id);
                    router.push('/dashboard/practice');
                  } else {
                    router.push(`/dashboard/results?session=${s.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-900">{getExamName(s.exam_type)}</span>
                      {className && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                          {className}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        isCompleted ? 'bg-green-100 text-green-700'
                          : isExpired ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isCompleted ? 'Completed' : isExpired ? 'Timed Out' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">{s.mode} mode &middot; {s.question_count} questions</p>
                    <p className="text-xs text-neutral-400 mt-1">{formatDate(s.started_at)}</p>
                  </div>
                  {(isCompleted || isExpired) && s.score !== null && (
                    <div className={`text-2xl font-bold ${
                      s.score >= 70 ? 'text-green-600' : s.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(s.score)}%
                    </div>
                  )}
                  {isInProgress && (
                    <span className="px-4 py-2 bg-primary-500 text-neutral-900 rounded-full text-sm font-semibold hover:bg-primary-400 transition-colors shrink-0">
                      Continue
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
