import Link from 'next/link';

const subjectResults = [
  { subject: 'Mathematics', score: 28, total: 30, percentage: 93, time: '18 min' },
  { subject: 'English Language', score: 22, total: 30, percentage: 73, time: '22 min' },
  { subject: 'Physics', score: 25, total: 30, percentage: 83, time: '20 min' },
];

const weakTopics = [
  { subject: 'English', topic: 'Comprehension', accuracy: 45 },
  { subject: 'Physics', topic: 'Waves & Optics', accuracy: 55 },
  { subject: 'Mathematics', topic: 'Statistics', accuracy: 60 },
];

export default function ResultsPage() {
  const totalScore = subjectResults.reduce((acc, r) => acc + r.score, 0);
  const totalQuestions = subjectResults.reduce((acc, r) => acc + r.total, 0);
  const overallPercentage = Math.round((totalScore / totalQuestions) * 100);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Exam Results</h1>
        <p className="text-neutral-600">JAMB/UTME Practice - September 10, 2026</p>
      </div>

      {/* Score Card */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-3xl p-8 text-white mb-8">
        <div className="grid grid-cols-3 gap-8">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#F5C518"
                  strokeWidth="8"
                  strokeDasharray={`${overallPercentage * 2.83} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl font-bold">{overallPercentage}%</span>
              </div>
            </div>
            <p className="text-white/70">Overall Score</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-1">Total Score</p>
              <p className="text-3xl font-bold">{totalScore}/{totalQuestions}</p>
            </div>
            <div className="mb-4">
              <p className="text-white/70 text-sm mb-1">Estimated JAMB Score</p>
              <p className="text-3xl font-bold text-primary-500">{Math.round((totalScore / totalQuestions) * 400)}/400</p>
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Time Taken</p>
              <p className="text-3xl font-bold">60 min</p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="bg-white/10 rounded-2xl p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Correct</span>
                <span className="font-semibold text-success-400">{totalScore}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-success-400 rounded-full" style={{ width: `${overallPercentage}%` }} />
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">Incorrect</span>
                <span className="font-semibold text-error-400">{totalQuestions - totalScore}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-error-400 rounded-full" style={{ width: `${100 - overallPercentage}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        {/* Subject Breakdown */}
        <div className="col-span-2">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Subject Breakdown</h2>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100">
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Subject</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Score</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Percentage</th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-neutral-500">Time</th>
                </tr>
              </thead>
              <tbody>
                {subjectResults.map((result) => (
                  <tr key={result.subject} className="border-b border-neutral-50 last:border-0">
                    <td className="py-4 px-6 font-medium text-neutral-900">{result.subject}</td>
                    <td className="py-4 px-6 text-neutral-700">{result.score}/{result.total}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              result.percentage >= 80 ? 'bg-success-500' : result.percentage >= 60 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          />
                        </div>
                        <span className={`font-semibold ${
                          result.percentage >= 80 ? 'text-success-600' : result.percentage >= 60 ? 'text-warning-600' : 'text-error-600'
                        }`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-neutral-500">{result.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weak Areas */}
        <div>
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Areas to Improve</h2>
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
            {weakTopics.map((topic) => (
              <div key={topic.topic} className="p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-neutral-900">{topic.topic}</p>
                    <p className="text-xs text-neutral-500">{topic.subject}</p>
                  </div>
                  <span className="text-sm font-semibold text-error-600">{topic.accuracy}%</span>
                </div>
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div className="h-full bg-error-400 rounded-full" style={{ width: `${topic.accuracy}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-primary-50 rounded-2xl p-6 border border-primary-200">
            <h3 className="font-semibold text-primary-800 mb-2">Study Tips</h3>
            <ul className="space-y-2 text-sm text-primary-700">
              <li>• Focus on weak topics daily</li>
              <li>• Practice timed exams weekly</li>
              <li>• Review explanations for wrong answers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
        >
          Back to Dashboard
        </Link>
        <div className="flex gap-4">
          <Link
            href="/dashboard/practice"
            className="px-6 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-all"
          >
            Practice Again
          </Link>
          <button className="px-6 py-3 bg-primary-500 text-neutral-900 rounded-full font-semibold hover:bg-primary-400 transition-all">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}
