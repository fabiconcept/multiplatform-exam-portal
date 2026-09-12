import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const SubjectIcon = ({ name, className = 'w-5 h-5' }: { name: string; className?: string }) => {
  const iconMap: Record<string, JSX.Element> = {
    'Use of English': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Mathematics: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
    Physics: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Chemistry: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    Biology: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    Economics: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Government: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Literature: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    Commerce: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    Geography: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Computer Studies': <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    History: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  };
  return iconMap[name] || <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
};

const subjects = [
  { name: 'Use of English', questions: 200 },
  { name: 'Mathematics', questions: 180 },
  { name: 'Physics', questions: 150 },
  { name: 'Chemistry', questions: 150 },
  { name: 'Biology', questions: 140 },
  { name: 'Economics', questions: 130 },
  { name: 'Government', questions: 120 },
  { name: 'Literature', questions: 110 },
  { name: 'Commerce', questions: 100 },
  { name: 'Geography', questions: 95 },
  { name: 'Computer Studies', questions: 90 },
  { name: 'History', questions: 85 },
];

const features = [
  {
    title: 'University-Specific',
    description: 'Questions tailored to specific university screening formats.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  },
  {
    title: 'Timed Tests',
    description: 'Practice under time pressure like the real screening test.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    title: 'Score Prediction',
    description: 'Get an estimated score based on your practice performance.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
  {
    title: 'Study Materials',
    description: 'Access comprehensive study materials for each subject.',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  },
];

export default function PostUTMEPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Hero */}
        <div className="bg-success-500 py-16 md:py-24 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="section-container relative">
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
                    <Image src="/images/post utme.webp" alt="Post-UTME Logo" width={56} height={56} className="object-contain" />
                  </div>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900">
                    Post-UTME
                  </h1>
                </div>
                <p className="text-lg md:text-xl text-neutral-700 mb-8">
                  University Post-UTME Screening Test. Prepare for university entrance screening 
                  with subject-specific practice and timed simulations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-4 bg-accent-500 text-white font-semibold rounded-full text-lg hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/25 active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
                  >
                    Start practicing Post-UTME
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
                    <p className="text-4xl font-bold text-success-500">1,500+</p>
                    <p className="text-neutral-600 mt-1">Past Questions</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                    <p className="text-4xl font-bold text-primary-500">12+</p>
                    <p className="text-neutral-600 mt-1">Subjects</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 text-center shadow-xl">
                    <p className="text-4xl font-bold text-accent-500">200K+</p>
                    <p className="text-neutral-600 mt-1">Students</p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 text-center shadow-xl relative overflow-hidden">
                    <Image src="/images/post utme.webp" alt="" width={96} height={96} className="absolute -bottom-4 -right-4 object-contain opacity-10" />
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
          <h2 className="text-3xl font-display font-bold text-center mb-12">Why practice Post-UTME with ExamScholars?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white rounded-3xl p-6 text-center">
                <div className="w-14 h-14 bg-success-100 rounded-2xl flex items-center justify-center text-success-600 mx-auto mb-4">
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
                className="bg-white rounded-2xl p-5 border-2 border-neutral-100 hover:border-success-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-success-100 rounded-xl flex items-center justify-center">
                    <SubjectIcon name={subject.name} className="w-5 h-5 text-success-600" />
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
