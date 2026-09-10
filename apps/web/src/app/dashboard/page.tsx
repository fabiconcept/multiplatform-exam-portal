import Link from 'next/link';

const examPackages = [
  {
    id: 'utme',
    name: 'JAMB/UTME',
    description: '180 questions • 4 subjects • 2 hours',
    subjects: 12,
    questions: '30,000+',
    progress: 65,
    color: 'bg-primary-500',
    preloaded: true,
    image: '/images/jamb.webp',
  },
  {
    id: 'waec',
    name: 'WAEC/SSCE',
    description: 'Senior secondary certificate exam',
    subjects: 9,
    questions: '15,000+',
    progress: 40,
    color: 'bg-accent-500',
    preloaded: false,
    image: '/images/waec.png',
  },
  {
    id: 'postutme',
    name: 'Post-UTME',
    description: 'University screening test',
    subjects: 6,
    questions: '8,000+',
    progress: 20,
    color: 'bg-success-500',
    preloaded: false,
    image: '/images/post utme.webp',
  },
  {
    id: 'bece',
    name: 'BECE',
    description: 'Junior WAEC/NECO certificate',
    subjects: 8,
    questions: '5,000+',
    progress: 0,
    color: 'bg-warning-500',
    preloaded: false,
    image: '/images/neco.webp',
  },
  {
    id: 'ncee',
    name: 'NCEE',
    description: 'Common Entrance (Primary school)',
    subjects: 4,
    questions: '3,000+',
    progress: 0,
    color: 'bg-background-500',
    preloaded: false,
    image: '/images/ncee.webp',
  },
];

const recentActivity = [
  { subject: 'Mathematics', score: 85, time: '2 hours ago', mode: 'Exam', questions: '40/40' },
  { subject: 'English Language', score: 72, time: 'Yesterday', mode: 'Study', questions: '35/60' },
  { subject: 'Physics', score: 90, time: '2 days ago', mode: 'Exam', questions: '38/40' },
  { subject: 'Chemistry', score: 68, time: '3 days ago', mode: 'Study', questions: '28/40' },
];

const keyPoints = [
  { subject: 'Mathematics', topics: 15, lastStudied: '2 hours ago' },
  { subject: 'English Language', topics: 12, lastStudied: 'Yesterday' },
  { subject: 'Physics', topics: 10, lastStudied: '3 days ago' },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-1">Welcome back, Adebayo!</h1>
          <p className="text-neutral-600">Continue your exam preparation journey</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-primary-100 rounded-full">
            <span className="text-sm font-medium text-primary-700">JAMB/UTME Package</span>
          </div>
          <div className="px-4 py-2 bg-success-100 rounded-full">
            <span className="text-sm font-medium text-success-700">Activated ✓</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-neutral-900">156</p>
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
            {examPackages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/dashboard/practice?exam=${pkg.id}`}
                className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden">
                      <img src={pkg.image} alt={pkg.name} className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-neutral-900">{pkg.name}</h3>
                        {pkg.preloaded && (
                          <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium">
                            Preloaded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-500">{pkg.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900">{pkg.subjects}</p>
                      <p className="text-xs text-neutral-500">Subjects</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-900">{pkg.questions}</p>
                      <p className="text-xs text-neutral-500">Questions</p>
                    </div>
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-500">{pkg.progress}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${pkg.color} rounded-full`}
                          style={{ width: `${pkg.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Start */}
          <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Quick Start</h3>
            <p className="text-white/80 text-sm mb-4">Practice UTME with 4 subjects</p>
            <Link
              href="/dashboard/practice?exam=utme"
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
              {keyPoints.map((kp) => (
                <div key={kp.subject} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{kp.subject}</p>
                    <p className="text-xs text-neutral-500">{kp.topics} topics</p>
                  </div>
                  <span className="text-xs text-neutral-400">{kp.lastStudied}</span>
                </div>
              ))}
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
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-3 px-5 text-xs font-medium text-neutral-500 uppercase">Subject</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-neutral-500 uppercase">Mode</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-neutral-500 uppercase">Score</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-neutral-500 uppercase">Questions</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-neutral-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity, index) => (
                <tr key={index} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50">
                  <td className="py-3 px-5 font-medium text-neutral-900">{activity.subject}</td>
                  <td className="py-3 px-5">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      activity.mode === 'Exam' ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'
                    }`}>
                      {activity.mode}
                    </span>
                  </td>
                  <td className="py-3 px-5">
                    <span className={`font-semibold ${
                      activity.score >= 80 ? 'text-success-600' : activity.score >= 60 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {activity.score}%
                    </span>
                  </td>
                  <td className="py-3 px-5 text-neutral-600 text-sm">{activity.questions}</td>
                  <td className="py-3 px-5 text-neutral-500 text-sm">{activity.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
