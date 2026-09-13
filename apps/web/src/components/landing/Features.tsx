const features = [
  {
    title: 'Know your score the moment you finish',
    description:
      'No waiting. No guessing. See your score, time spent, and subject breakdown immediately after your practice session, so you know exactly where you stand.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Learn first, then test yourself under pressure',
    description:
      'Study mode lets you learn at your own pace with explanations. Exam mode simulates real JAMB conditions with a timer, so nothing surprises you on exam day.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Understand every answer, not just the right one',
    description:
      'Every question comes with a step-by-step explanation. You don\'t just learn which answer is correct, you learn why. That\'s the difference between memorizing and understanding.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Practice anywhere, no internet needed',
    description:
      'Download the app, pick your exam, and start practicing. At home, in school, on the bus, Examinery works without an internet connection.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export default function Features() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-primary mb-4 inline-block">Why Examinery</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Everything you need to ace your exams
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Built for Nigerian students who want real results, not just another app to download.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-hover group"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${
                  index % 2 === 0
                    ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white'
                    : 'bg-accent-100 text-accent-600 group-hover:bg-accent-500 group-hover:text-white'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-neutral-900">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Don&apos;t just practice, understand
              </h3>
              <p className="text-lg text-neutral-800 mb-6">
                Most students memorize answers and forget them by exam day. Examinery is different.
                Every question includes a detailed explanation so you learn the concept behind the answer.
              </p>
              <ul className="space-y-3">
                {[
                  'Step-by-step solutions for every question',
                  'Concept breakdowns in plain language',
                  'Common mistakes flagged so you avoid them',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-accent-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold text-sm">Q5</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 text-sm">Mathematics</p>
                    <p className="text-xs text-neutral-500">Algebra</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4 text-sm">
                  What is the value of x in the equation 2x + 5 = 15?
                </p>
                <div className="space-y-2">
                  {['A. 5', 'B. 10', 'C. 7.5', 'D. 8'].map((option, i) => (
                    <div
                      key={option}
                      className={`p-3 rounded-xl border-2 text-sm ${
                        i === 0
                          ? 'border-success-500 bg-success-50 text-success-700 font-medium'
                          : 'border-neutral-200 text-neutral-500'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-success-50 rounded-xl border border-success-200">
                  <p className="text-sm font-medium text-success-700 mb-1">Correct: A. 5</p>
                  <p className="text-xs text-success-600 leading-relaxed">
                    Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
