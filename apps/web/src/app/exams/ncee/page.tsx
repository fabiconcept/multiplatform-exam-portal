import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const SubjectIcon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    'English Language and Social Studies': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Verbal: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
    'Mathematics and General Science': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    'Quantitative Reasoning and Vocational Aptitude': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  };
  return iconMap[name] || <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
};

const subjects = [
  { name: 'English Language and Social Studies', questions: 150 },
  { name: 'Verbal', questions: 150 },
  { name: 'Mathematics and General Science', questions: 150 },
  { name: 'Quantitative Reasoning and Vocational Aptitude', questions: 150 },
];

const features = [
  {
    title: 'Primary School Level',
    description: 'Questions designed for Primary 6 students preparing for Common Entrance.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
  {
    title: 'Simple Interface',
    description: 'Easy-to-use interface designed for younger students.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: 'Parent Tracking',
    description: 'Parents can monitor their child\'s progress and performance.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    title: 'Federal Unity Schools',
    description: 'Targeted practice for admission into federal government colleges.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  },
];

export default function NCEEPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Hero */}
        <div className="bg-background-500 py-16 md:py-24 mb-16">
          <div className="section-container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Link href="/exams" className="inline-flex items-center gap-2 text-neutral-700 hover:text-neutral-900 mb-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  All Exams
                </Link>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden">
                    <img src="/images/ncee.webp" alt="NCEE Logo" className="w-14 h-14 object-contain" />
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900">
                    NCEE
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-neutral-700 mb-8">
                  National Common Entrance Examination.
                  Prepare for admission into Federal Government Colleges across Nigeria.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-background-500 text-white font-semibold rounded-full text-lg hover:bg-background-600 hover:shadow-xl hover:shadow-background-500/25 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Start practicing NCEE
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
              <div className="relative">
                <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                <div className="relative grid grid-cols-2 gap-4">
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-background-500">600+</p>
                  <p className="text-neutral-600 mt-1">Past Questions</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-primary-500">4</p>
                  <p className="text-neutral-600 mt-1">Subjects</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                  <p className="text-4xl font-bold text-success-500">100K+</p>
                  <p className="text-neutral-600 mt-1">Students</p>
                </div>
                <div className="bg-white rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
                  <img src="/images/ncee.webp" alt="" className="absolute -bottom-4 -right-4 w-24 h-24 object-contain opacity-10" />
                  <p className="text-4xl font-bold text-warning-500">100%</p>
                  <p className="text-neutral-600 mt-1">Offline</p>
                </div>
              </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="section-container mb-16">
          <h2 className="text-3xl font-display font-bold text-center mb-12">Why practice NCEE with ExamScholars?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-3xl p-6 text-center">
                <div className="w-14 h-14 bg-background-100 rounded-2xl flex items-center justify-center text-background-600 mx-auto mb-4">
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="bg-white rounded-2xl p-5 border-2 border-neutral-100 hover:border-background-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-background-100 rounded-xl flex items-center justify-center">
                    <SubjectIcon name={subject.name} className="w-5 h-5 text-background-600" />
                  </div>
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
