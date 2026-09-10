import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const exams = [
  {
    id: 'jamb',
    name: 'JAMB / UTME',
    fullName: 'Joint Admissions and Matriculation Board',
    description: 'Prepare for the Unified Tertiary Matriculation Examination with thousands of past questions and realistic CBT simulation.',
    features: ['15+ subjects', '2000+ questions', 'Real CBT interface', 'Detailed explanations'],
    color: 'primary',
    href: '/exams/jamb',
    image: '/images/jamb.webp',
  },
  {
    id: 'waec',
    name: 'WAEC / SSCE',
    fullName: 'West African Examinations Council',
    description: 'Master your Senior School Certificate Examination with comprehensive practice materials and performance tracking.',
    features: ['All subjects', '1500+ questions', 'Exam mode', 'Performance analytics'],
    color: 'accent',
    href: '/exams/waec',
    image: '/images/waec.png',
  },
  {
    id: 'postutme',
    name: 'Post-UTME',
    fullName: 'University Post-UTME Screening',
    description: 'Get ready for university entrance screening tests with subject-specific practice and timed simulations.',
    features: ['University-specific', 'Timed tests', 'Score prediction', 'Study materials'],
    color: 'success',
    href: '/exams/postutme',
    image: '/images/post utme.webp',
  },
  {
    id: 'bece',
    name: 'BECE / Junior WAEC',
    fullName: 'Basic Education Certificate Examination',
    description: 'Excel in your Junior WAEC examination with structured practice and comprehensive subject coverage.',
    features: ['Core subjects', '800+ questions', 'Study mode', 'Progress tracking'],
    color: 'warning',
    href: '/exams/bece',
    image: '/images/neco.webp',
  },
  {
    id: 'ncee',
    name: 'NCEE / Common Entrance',
    fullName: 'National Common Entrance Examination',
    description: 'Prepare effectively for Common Entrance into federal unity schools with targeted practice questions.',
    features: ['Primary school level', '600+ questions', 'Simple interface', 'Parent tracking'],
    color: 'background',
    href: '/exams/ncee',
    image: '/images/ncee.webp',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  primary: { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-200', hover: 'hover:border-primary-400' },
  accent: { bg: 'bg-accent-100', text: 'text-accent-600', border: 'border-accent-200', hover: 'hover:border-accent-400' },
  success: { bg: 'bg-success-100', text: 'text-success-600', border: 'border-success-200', hover: 'hover:border-success-400' },
  warning: { bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200', hover: 'hover:border-warning-400' },
  background: { bg: 'bg-background-100', text: 'text-background-600', border: 'border-background-200', hover: 'hover:border-background-400' },
};

export default function ExamsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="bg-primary-500 py-16 md:py-24 mb-16">
          <div className="section-container text-center">
            <span className="badge bg-white/20 text-neutral-900 mb-4 inline-block">Exam Categories</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-neutral-900 mb-6">
              Prepare for every exam
            </h1>
            <p className="text-lg md:text-xl text-neutral-700 max-w-2xl mx-auto">
              Choose your exam category and start practicing with thousands of past questions, 
              detailed explanations, and realistic CBT simulations.
            </p>
          </div>
        </div>

        {/* Exam Cards */}
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam) => {
              const colors = colorMap[exam.color];
              return (
                <Link
                  key={exam.id}
                  href={exam.href}
                  className={`group bg-white rounded-3xl p-8 border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300`}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden">
                    <img src={exam.image} alt={exam.name} className="w-14 h-14 object-contain" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">{exam.name}</h2>
                  <p className="text-sm text-neutral-500 mb-4">{exam.fullName}</p>
                  <p className="text-neutral-600 mb-6">{exam.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {exam.features.map((feature) => (
                      <span key={feature} className={`text-xs font-medium px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className={`flex items-center gap-2 font-semibold ${colors.text} group-hover:gap-3 transition-all`}>
                    Start practicing
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <p className="text-neutral-600 mb-4">Not sure which exam to prepare for?</p>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              Contact us for guidance
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
