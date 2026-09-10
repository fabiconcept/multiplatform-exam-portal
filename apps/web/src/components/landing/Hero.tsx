import Link from 'next/link';

const stats = [
  { value: '300,000+', label: 'Students reached' },
  { value: '100%', label: 'Offline capable' },
  { value: '5+', label: 'Exam categories' },
];

const features = [
  'Detailed explanations',
  'Performance insights',
  'All major devices',
];

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-primary-500" />
      <div className="absolute inset-0 bg-mesh opacity-60" />
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-40 left-10 w-16 h-16 bg-white/20 rounded-2xl rotate-12 animate-float" />
      <div className="absolute top-56 right-20 w-12 h-12 bg-accent-500/30 rounded-full animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-40 left-1/4 w-8 h-8 bg-white/30 rounded-lg -rotate-12 animate-float" style={{ animationDelay: '2s' }} />

      <div className="section-container relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 leading-[1.1] mb-6">
              Prepare smarter.{' '}
              <span className="text-accent-500">Practise confidently.</span>{' '}
              Excel in every exam.
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-700 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Master JAMB UTME, WAEC/SSCE, Post-UTME, BECE and NCEE with thousands of past questions, 
              clear explanations and realistic CBT simulations—online or offline.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Link
                href="/register"
                className="px-8 py-4 bg-accent-500 text-white font-semibold rounded-full text-lg hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/25 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
              >
                Start practising free
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/download"
                className="px-8 py-4 bg-white/80 backdrop-blur text-neutral-900 font-semibold rounded-full text-lg hover:bg-white hover:shadow-lg active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center"
              >
                Download the app
              </Link>
            </div>

            {/* Feature List */}
            <ul className="flex flex-wrap gap-5 justify-center lg:justify-start">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-neutral-700">
                  <svg className="w-5 h-5 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Content - Stats Cards */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-5">
              {/* Main Stats Card */}
              <div className="col-span-2 bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-neutral-900/10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Practice progress</p>
                    <p className="font-semibold text-neutral-900">Ready to improve</p>
                  </div>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              {/* Stat Cards */}
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`rounded-3xl p-5 text-center shadow-lg ${
                    index === 1
                      ? 'bg-accent-500 text-white shadow-accent-500/25'
                      : 'bg-white text-neutral-900 shadow-neutral-900/10'
                  }`}
                >
                  <p className={`text-3xl md:text-4xl font-bold ${index === 1 ? 'text-white' : 'text-primary-500'}`}>
                    {stat.value}
                  </p>
                  <p className={`text-sm mt-1 ${index === 1 ? 'text-white/80' : 'text-neutral-600'}`}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Study Offline Badge */}
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-neutral-900/20">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-neutral-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div>
                <p className="font-semibold">Study offline</p>
                <p className="text-sm text-neutral-400">No data required</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
