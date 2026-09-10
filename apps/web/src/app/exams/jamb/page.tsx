import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const subjects = [
  { name: 'Mathematics', questions: 350, icon: '📐' },
  { name: 'English Language', questions: 280, icon: '📖' },
  { name: 'Physics', questions: 220, icon: '⚡' },
  { name: 'Chemistry', questions: 200, icon: '🧪' },
  { name: 'Biology', questions: 180, icon: '🧬' },
  { name: 'Economics', questions: 160, icon: '📊' },
  { name: 'Government', questions: 140, icon: '🏛️' },
  { name: 'Literature', questions: 120, icon: '📚' },
  { name: 'History', questions: 110, icon: '📜' },
  { name: 'Geography', questions: 100, icon: '🌍' },
  { name: 'Computer Studies', questions: 90, icon: '💻' },
  { name: 'Agricultural Science', questions: 80, icon: '🌾' },
];

const features = [
  {
    title: 'Real CBT Interface',
    description: 'Practice with the exact same interface used in the actual JAMB examination.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'JAMB 8-Key Navigation',
    description: 'Master the 8 shortcut keys approved by JAMB for efficient exam navigation.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    title: 'Detailed Explanations',
    description: 'Every question comes with a step-by-step solution to help you understand.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Performance Tracking',
    description: 'Track your progress, identify weak areas, and improve your scores.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function JAMBPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Hero */}
        <div className="bg-primary-500 py-16 md:py-24 mb-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Link href="/exams" className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Exams
                </Link>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
                  JAMB / UTME
                </h1>
                <p className="text-lg md:text-xl text-neutral-700 mb-8">
                  Joint Admissions and Matriculation Board - Unified Tertiary Matriculation Examination. 
                  Prepare with thousands of past questions and realistic CBT simulation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-accent-500 text-white font-semibold rounded-full text-lg hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/25 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Start practicing JAMB
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    href="/download"
                    className="px-8 py-4 bg-white/80 backdrop-blur text-neutral-900 font-semibold rounded-full text-lg hover:bg-white hover:shadow-lg active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center"
                  >
                    Download app
                  </Link>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-primary-500">2,000+</p>
                  <p className="text-neutral-600 mt-1">Past Questions</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-accent-500">12+</p>
                  <p className="text-neutral-600 mt-1">Subjects</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-success-500">300K+</p>
                  <p className="text-neutral-600 mt-1">Students</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-warning-500">100%</p>
                  <p className="text-neutral-600 mt-1">Offline</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="section-container mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Why practice JAMB with ExamScholars?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-3xl p-6 text-center">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subjects */}
        <div className="section-container">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Available Subjects</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="bg-white rounded-2xl p-5 border-2 border-neutral-100 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{subject.icon}</span>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{subject.name}</h3>
                    <p className="text-sm text-neutral-500">{subject.questions} questions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
