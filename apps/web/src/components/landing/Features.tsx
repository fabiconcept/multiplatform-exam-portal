const features = [
  {
    title: 'Detailed Result',
    description:
      'The result system gives you a rich array of data, including time spent, speed and questions attempted thus enhancing learning and improves performance.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: 'Practice Mode',
    description:
      'Select different modes (Study and Exam). Study mode provides a learning platform while the Exam mode simulates real exam conditions.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Simplicity',
    description:
      'The software is technically easy to understand and operate. It is user friendly and mimics the UTME exam interface with emphasis on the eight keys adopted by JAMB.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Works Offline',
    description:
      'Software works offline without use of internet. Practice anywhere, anytime—even without a data connection.',
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
          <span className="badge-primary mb-4 inline-block">Our Features</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Why students love ExamScholars
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover the features that make ExamScholars the preferred choice for exam preparation
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
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                  index % 2 === 0
                    ? 'bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white'
                    : 'bg-accent-100 text-accent-600 group-hover:bg-accent-500 group-hover:text-white'
                }`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 card bg-gradient-to-br from-primary-500 to-primary-600 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-neutral-900">
              <h3 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Detailed explanations for every question
              </h3>
              <p className="text-lg text-neutral-800 mb-6">
                Don&apos;t just practice—learn. Every question comes with a clear, detailed explanation 
                to help you understand the concept and improve your performance.
              </p>
              <ul className="space-y-3">
                {[
                  'Step-by-step solutions',
                  'Concept breakdowns',
                  'Common mistakes highlighted',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-bold">Q</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Question 5</p>
                    <p className="text-sm text-neutral-500">Mathematics</p>
                  </div>
                </div>
                <p className="text-neutral-700 mb-4">
                  What is the value of x in the equation 2x + 5 = 15?
                </p>
                <div className="space-y-2">
                  {['A. 5', 'B. 10', 'C. 7.5', 'D. 8'].map((option, i) => (
                    <div
                      key={option}
                      className={`p-3 rounded-xl border-2 ${
                        i === 0
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-success-50 rounded-xl border border-success-200">
                  <p className="text-sm font-medium text-success-700 mb-1">✓ Correct Answer: A. 5</p>
                  <p className="text-sm text-success-600">
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
