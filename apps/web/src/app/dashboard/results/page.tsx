'use client';

import { sessionApi, SessionResult, ExamSession } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import toast from 'react-hot-toast';

function ResultsContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  const token = useAuthStore((s) => s.token);

  const [results, setResults] = useState<SessionResult | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (sessionId) {
      sessionApi.getResults(token, sessionId)
        .then(data => setResults(data))
        .catch(err => {
          setError(err instanceof Error ? err.message : 'Failed to load results');
          toast.error('Could not load results');
        })
        .finally(() => setLoading(false));
    } else {
      sessionApi.listSessions(token)
        .then(res => setSessions((res.sessions || []).filter(s => s.status === 'completed')))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [sessionId, token]);

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-NG', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  // ─── Results List View ──────────────────────────────────────────────
  if (!sessionId) {
    return (
      <div className="p-4 lg:p-8">
        <div className="mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900 mb-2">Results</h1>
            <p className="text-neutral-600">Your exam and practice session results</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-neutral-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">No Results Yet</h2>
              <p className="text-neutral-500 mb-8">Complete a practice session to see your results here.</p>
              <Link
                href="/dashboard/practice"
                className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all inline-block"
              >
                Start Practice
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(s => {
                const score = Math.round(s.score ?? 0);
                return (
                  <Link
                    key={s.id}
                    href={`/dashboard/results?session=${s.id}`}
                    className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold ${
                          score >= 70 ? 'bg-green-100 text-green-700'
                            : score >= 50 ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {score}%
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-neutral-900">{s.exam_type}</span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Completed
                            </span>
                          </div>
                          <p className="text-sm text-neutral-500">{s.mode} mode &middot; {s.question_count} questions &middot; {s.duration_minutes} min</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{formatDate(s.started_at)}</p>
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Loading State ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8">
        <div className="mx-auto space-y-8">
          <div className="h-10 w-48 bg-neutral-200 rounded-lg animate-pulse mb-2" />
          <div className="h-5 w-72 bg-neutral-100 rounded animate-pulse" />
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              <div className="flex justify-center">
                <div className="w-32 h-32 rounded-full border-8 border-white/10 animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
                <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error State ────────────────────────────────────────────────────
  if (error || !results) {
    return (
      <div className="p-8">
        <div className="mx-auto text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-error-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-error-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-4">Session Not Found</h1>
          <p className="text-neutral-600 mb-8">{error || 'The session you are looking for does not exist or has expired.'}</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard/results" className="px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all">
              View All Results
            </Link>
            <Link href="/dashboard/practice" className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all">
              Start Practice
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Detailed Result View ───────────────────────────────────────────
  const percentage = Math.round(results.session.score ?? results.score);
  const totalCorrect = results.total_correct;
  const totalAnswered = results.total_answered;
  const timeSpent = results.session.time_spent_seconds ?? 0;
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;

  const scoreColor =
    percentage >= 70 ? 'text-success-500'
      : percentage >= 50 ? 'text-warning-500'
        : 'text-error-500';

  const scoreRingColor =
    percentage >= 70 ? '#22c55e'
      : percentage >= 50 ? '#eab308'
        : '#ef4444';

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="p-4 lg:p-8">
      <div className="mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard/results" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-neutral-900">Exam Results</h1>
            <p className="text-neutral-600">
              {results.session.exam_type} &middot; {results.session.question_count} questions &middot;{' '}
              {results.session.duration_minutes} min
            </p>
          </div>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-6 lg:p-8 text-white">
          <div className="grid grid-cols-3 gap-6 lg:gap-8 items-center">
            {/* Score Ring */}
            <div className="flex justify-center">
              <div className="relative w-32 h-32 lg:w-36 lg:h-36">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke={scoreRingColor} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl lg:text-5xl font-bold ${scoreColor}`}>{percentage}%</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-4">
              <div>
                <p className="text-white/60 text-sm">Correct / Answered</p>
                <p className="text-2xl lg:text-3xl font-bold">
                  {totalCorrect} <span className="text-white/40">/</span> {totalAnswered}
                </p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Time Taken</p>
                <p className="text-xl lg:text-2xl font-bold">{minutes}m {seconds}s</p>
              </div>
            </div>

            {/* Correct / Incorrect bars */}
            <div className="space-y-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Correct</span>
                  <span className="font-semibold text-success-400">{totalCorrect}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-success-400 rounded-full transition-all duration-700" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70">Incorrect</span>
                  <span className="font-semibold text-error-400">{totalAnswered - totalCorrect}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-error-400 rounded-full transition-all duration-700" style={{ width: `${100 - percentage}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Subject Breakdown */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Subject Breakdown</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Subject</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Score</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {results.by_subject.map((sub) => (
                    <tr key={sub.subject_name} className="border-b border-neutral-50 last:border-0">
                      <td className="py-4 px-6 font-medium text-neutral-900">{sub.subject_name}</td>
                      <td className="py-4 px-6 text-neutral-700">{sub.correct}/{sub.total}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              sub.percentage >= 80 ? 'bg-success-500'
                                : sub.percentage >= 60 ? 'bg-warning-500'
                                  : 'bg-error-500'
                            }`} style={{ width: `${sub.percentage}%` }} />
                          </div>
                          <span className={`font-semibold ${
                            sub.percentage >= 80 ? 'text-success-600'
                              : sub.percentage >= 60 ? 'text-warning-600'
                                : 'text-error-600'
                          }`}>{Math.round(sub.percentage)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-4">Difficulty Breakdown</h2>
            <div className="space-y-4">
              {results.by_difficulty.map((diff) => {
                const icon = diff.difficulty === 'easy' ? '🟢' : diff.difficulty === 'medium' ? '🟡' : '🔴';
                const borderColor = diff.difficulty === 'easy' ? 'border-success-200' : diff.difficulty === 'medium' ? 'border-warning-200' : 'border-error-200';
                const bgColor = diff.difficulty === 'easy' ? 'bg-success-50' : diff.difficulty === 'medium' ? 'bg-warning-50' : 'bg-error-50';
                const textColor = diff.difficulty === 'easy' ? 'text-success-700' : diff.difficulty === 'medium' ? 'text-warning-700' : 'text-error-700';

                return (
                  <div key={diff.difficulty} className={`${bgColor} border ${borderColor} rounded-2xl p-5`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{icon}</span>
                        <span className="font-semibold capitalize text-neutral-900">{diff.difficulty}</span>
                      </div>
                      <span className={`text-2xl font-bold ${textColor}`}>{Math.round(diff.percentage)}%</span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{diff.correct} of {diff.total} correct</p>
                    <div className="h-2 bg-white/60 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${
                        diff.difficulty === 'easy' ? 'bg-success-500'
                          : diff.difficulty === 'medium' ? 'bg-warning-500'
                            : 'bg-error-500'
                      }`} style={{ width: `${diff.percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link href="/dashboard/results" className="w-full sm:w-auto px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all text-center">
            All Results
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                const text = `Examinery Results\n${results.session.exam_type} — ${results.session.question_count} questions\nScore: ${Math.round(percentage)}% (${totalCorrect}/${totalAnswered} correct)\nTime: ${minutes}m ${seconds}s`;
                if (navigator.share) {
                  navigator.share({ title: 'Exam Results', text });
                } else {
                  navigator.clipboard.writeText(text);
                  toast.success('Results copied to clipboard!');
                }
              }}
              className="flex-1 sm:flex-none px-4 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all inline-flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
            <Link href="/dashboard/practice" className="flex-1 sm:flex-none px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all text-center">
              Practice Again
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <div className="mx-auto space-y-8">
            <div className="h-10 w-48 bg-neutral-200 rounded-lg animate-pulse" />
            <div className="h-5 w-72 bg-neutral-100 rounded animate-pulse" />
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8">
              <div className="grid grid-cols-3 gap-8 items-center">
                <div className="flex justify-center">
                  <div className="w-36 h-36 rounded-full border-8 border-white/10 animate-pulse" />
                </div>
                <div className="space-y-4">
                  <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
                  <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                  <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
                  <div className="h-16 bg-white/10 rounded-xl animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
