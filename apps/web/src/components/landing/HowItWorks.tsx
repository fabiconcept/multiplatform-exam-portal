import Link from 'next/link';

const steps = [
  {
    number: '01',
    title: 'Get Started',
    description: 'Download the app to your device',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Select Subjects',
    description: 'Choose subjects you would like to practice to test your strengths',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Practice Exams',
    description: 'Explore and attempt different questions to see your superpowers',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Activation',
    description: 'Optionally activate your app with a pocket friendly fee of ₦3,000 or use the free features',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-background-100">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-accent mb-4 inline-block">How It Works</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            How Exam Scholars works
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            We value your time, here&apos;s how it works
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-primary-200" />
              )}
              
              <div className="card-hover text-center relative">
                {/* Step Number Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-neutral-900">{step.number}</span>
                </div>
                
                {/* Icon */}
                <div className="w-20 h-20 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/register" className="btn-primary text-lg px-8 py-4">
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
