'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { publicExamApi, Exam } from '@/lib/api';

const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  primary: { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-200', hover: 'hover:border-primary-400' },
  accent: { bg: 'bg-accent-100', text: 'text-accent-600', border: 'border-accent-200', hover: 'hover:border-accent-400' },
  success: { bg: 'bg-success-100', text: 'text-success-600', border: 'border-success-200', hover: 'hover:border-success-400' },
  warning: { bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-200', hover: 'hover:border-warning-400' },
  neutral: { bg: 'bg-neutral-100', text: 'text-neutral-600', border: 'border-neutral-200', hover: 'hover:border-neutral-400' },
};

const colorCycle = ['primary', 'accent', 'success', 'warning', 'neutral'];

function ExamIcon({ iconUrl, name }: { iconUrl?: string; name: string }) {
  const [imgError, setImgError] = useState(false);
  if (iconUrl && !imgError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        width={56}
        height={56}
        className="object-contain"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicExamApi.listExams()
      .then(res => setExams(res.exams || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-8 border-2 border-neutral-200 animate-pulse">
                  <div className="w-16 h-16 rounded-2xl bg-neutral-100 mb-6" />
                  <div className="h-6 bg-neutral-100 rounded w-2/3 mb-2" />
                  <div className="h-4 bg-neutral-100 rounded w-1/2 mb-4" />
                  <div className="h-4 bg-neutral-100 rounded w-full mb-2" />
                  <div className="h-4 bg-neutral-100 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500 text-lg">No exams available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {exams.map((exam, idx) => {
                const colorKey = colorCycle[idx % colorCycle.length];
                const colors = colorMap[colorKey];
                return (
                  <Link
                    key={exam.id}
                    href={`/exams/${exam.slug || exam.id}`}
                    className={`group bg-white rounded-3xl p-8 border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300`}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden ${colors.bg}`}>
                      <ExamIcon iconUrl={exam.icon_url} name={exam.name} />
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">{exam.name}</h2>
                    <p className="text-neutral-600 mb-6">{exam.description || 'Exam preparation package'}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {exam.subject_count != null && exam.subject_count > 0 && (
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {exam.subject_count} subjects
                        </span>
                      )}
                      {exam.question_count != null && exam.question_count > 0 && (
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {exam.question_count} questions
                        </span>
                      )}
                      {exam.time_limit_minutes > 0 && (
                        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {exam.time_limit_minutes} min
                        </span>
                      )}
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
          )}

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
