import Link from 'next/link';

const stats = [
  { value: '300,000+', label: 'Students prepared with Examinery' },
  { value: '10,000+', label: 'Past questions with explanations' },
  { value: '5', label: 'Major Nigerian exams covered' },
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-400 to-accent-400" />

      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-neutral-900 text-sm font-medium px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Free practice, no credit card needed
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-[1.08] mb-6">
              300,000 students used Examinery
              <span className="block text-accent-600 mt-1">to pass their exams. You can too.</span>
            </h1>

            <p className="text-lg md:text-xl text-neutral-700 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Practice JAMB, WAEC, Post-UTME, BECE &amp; NCEE with real past questions,
              instant grading, and detailed explanations, online or offline.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/register"
                className="px-8 py-4 bg-neutral-900 text-white font-semibold rounded-full text-lg hover:bg-neutral-800 hover:shadow-xl active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Start practising free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/exams"
                className="px-8 py-4 bg-white/80 backdrop-blur text-neutral-900 font-semibold rounded-full text-lg hover:bg-white hover:shadow-lg active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center"
              >
                Browse exams
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-left">
                  <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-sm text-neutral-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - App Preview */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Decorative ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-dashed border-white/30 animate-[spin_60s_linear_infinite]" />
            </div>

            {/* Main card */}
            <div className="relative bg-white rounded-3xl p-6 md:p-8 shadow-2xl shadow-neutral-900/15 w-full max-w-md">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">JAMB/UTME Practice</p>
                    <p className="text-xs text-neutral-500">Mathematics</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-success-600 bg-success-50 px-3 py-1 rounded-full">
                  83% score
                </span>
              </div>

              {/* Question */}
              <p className="text-neutral-700 mb-4 text-sm leading-relaxed">
                Solve for x: if 2x + 5 = 15, what is the value of x?
              </p>

              {/* Options */}
              <div className="space-y-2 mb-4">
                {['A. 5', 'B. 10', 'C. 7.5', 'D. 8'].map((option, i) => (
                  <div
                    key={option}
                    className={`p-3 rounded-xl border-2 text-sm font-medium ${
                      i === 0
                        ? 'border-success-500 bg-success-50 text-success-700'
                        : 'border-neutral-200 text-neutral-500'
                    }`}
                  >
                    {option}
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div className="p-3 bg-primary-50 rounded-xl border border-primary-200">
                <p className="text-xs font-medium text-primary-700">Explanation</p>
                <p className="text-xs text-primary-600 mt-1">
                  Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5
                </p>
              </div>

              {/* Progress bar */}
              <div className="mt-6 flex items-center gap-3">
                <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '65%' }} />
                </div>
                <span className="text-xs font-medium text-neutral-500">13/20</span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 left-4 md:left-0 bg-neutral-900 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl">
              <div className="w-10 h-10 bg-success-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">Works offline</p>
                <p className="text-xs text-neutral-400">No data required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
