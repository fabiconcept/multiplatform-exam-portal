'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { publicExamApi, Exam } from '@/lib/api';

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
  neutral: {
    bg: 'bg-neutral-100',
    text: 'text-neutral-600',
    hover: 'group-hover:bg-neutral-500 group-hover:text-white',
  },
};

const colorCycle = ['primary', 'accent', 'success', 'warning', 'neutral'];

const defaultIcons: Record<string, JSX.Element> = {
  jamb: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

function ExamIcon({ iconUrl, name, slug }: { iconUrl?: string; name: string; slug: string }) {
  const [imgError, setImgError] = useState(false);
  if (iconUrl && !imgError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        width={32}
        height={32}
        className="object-contain"
        onError={() => setImgError(true)}
      />
    );
  }
  return defaultIcons[slug] || (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export default function ExamCategories() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicExamApi.listExams()
      .then(res => setExams(res.exams || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="badge-primary mb-4 inline-block">Exam Categories</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
            Choose your exam. Start practicing today.
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Five major Nigerian exams. Thousands of real past questions. One platform.
          </p>
        </div>

        {/* Exam Cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="card-hover text-center animate-pulse">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100" />
                <div className="h-5 bg-neutral-100 rounded w-2/3 mx-auto mb-2" />
                <div className="h-4 bg-neutral-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {exams.map((exam, idx) => {
              const colorKey = colorCycle[idx % colorCycle.length];
              const colors = colorClasses[colorKey];
              return (
                <Link
                  key={exam.id}
                  href={`/exams/${exam.slug || exam.id}`}
                  className="group card-hover text-center"
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center transition-all duration-300 ${colors.bg} ${colors.text} ${colors.hover}`}
                  >
                    <ExamIcon iconUrl={exam.icon_url} name={exam.name} slug={exam.slug} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    {exam.name}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {exam.description || 'Exam preparation package'}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/exams" className="btn-outline text-lg px-8 py-4">
            See all exams and subjects
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
