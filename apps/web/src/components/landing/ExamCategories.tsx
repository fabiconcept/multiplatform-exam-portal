import Link from 'next/link';

const exams = [
  {
    id: 'jamb',
    name: 'JAMB / UTME',
    description: 'Joint Admissions and Matriculation Board - Unified Tertiary Matriculation Examination',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'primary',
    href: '/exams/jamb',
  },
  {
    id: 'waec',
    name: 'WAEC / SSCE',
    description: 'West African Examinations Council - Senior School Certificate Examination',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    color: 'accent',
    href: '/exams/waec',
  },
  {
    id: 'postutme',
    name: 'Post-UTME',
    description: 'University post-university matriculation examination screening',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    color: 'success',
    href: '/exams/postutme',
  },
  {
    id: 'bece',
    name: 'BECE / Junior WAEC',
    description: 'Basic Education Certificate Examination',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
    color: 'warning',
    href: '/exams/bece',
  },
  {
    id: 'ncee',
    name: 'NCEE / Common Entrance',
    description: 'National Common Entrance Examination',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'background',
    href: '/exams/ncee',
  },
];

const colorClasses: Record<string, { bg: string; text: string; hover: string }> = {
  primary: {
    bg: 'bg-primary-100',
    text: 'text-primary-600',
    hover: 'group-hover:bg-primary-500 group-hover:text-white',
  },
  accent: {
    bg: 'bg-accent-100',
    text: 'text-accent-600',
    hover: 'group-hover:bg-accent-500 group-hover:text-white',
  },
  success: {
    bg: 'bg-success-100',
    text: 'text-success-600',
    hover: 'group-hover:bg-success-500 group-hover:text-white',
  },
  warning: {
    bg: 'bg-warning-100',
    text: 'text-warning-600',
    hover: 'group-hover:bg-warning-500 group-hover:text-white',
  },
  background: {
    bg: 'bg-background-100',
    text: 'text-background-600',
    hover: 'group-hover:bg-background-500 group-hover:text-white',
  },
};

export default function ExamCategories() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-primary mb-4 inline-block">Exam Categories</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Prepare for every exam
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Master all major Nigerian exams with our comprehensive practice platform
          </p>
        </div>

        {/* Exam Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {exams.map((exam) => {
            const colors = colorClasses[exam.color];
            return (
              <Link
                key={exam.id}
                href={exam.href}
                className="group card-hover text-center"
              >
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${colors.bg} ${colors.text} ${colors.hover}`}
                >
                  {exam.icon}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {exam.name}
                </h3>
                <p className="text-sm text-neutral-600">
                  {exam.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/exams" className="btn-outline text-lg px-8 py-4">
            Compare all exam products
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
