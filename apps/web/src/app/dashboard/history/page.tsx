'use client';

import { sessionApi, ExamSession } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HistoryPage() {
  const { token } = useAuthStore();
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    sessionApi.listSessions(token)
      .then(res => setSessions(res.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = sessions.filter(s => filter === 'all' || s.status === filter);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Exam History</h1>

      <div className="flex gap-2 mb-6">
        {(['all', 'completed', 'in_progress'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'completed' ? 'Completed' : 'In Progress'}
          </button>
        ))}
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
          <p className="text-neutral-500">No exam sessions yet</p>
          <Link href="/dashboard/practice" className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-full text-sm font-medium hover:bg-primary-700">
            Start practicing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(s => (
            <Link
              key={s.id}
              href={s.status === 'completed' ? `/dashboard/results?session=${s.id}` : `/dashboard/practice?session=${s.id}`}
              className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-neutral-900">{s.exam_type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      s.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {s.status === 'completed' ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">{s.mode} • {s.question_count} questions</p>
                  <p className="text-xs text-neutral-400 mt-1">{formatDate(s.started_at)}</p>
                </div>
                {s.status === 'completed' && s.score !== null && (
                  <div className={`text-2xl font-bold ${
                    s.score >= 70 ? 'text-green-600' : s.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {Math.round(s.score)}%
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
