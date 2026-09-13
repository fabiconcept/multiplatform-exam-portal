'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What is Examinery?',
    answer:
      'Examinery is a CBT practice platform built for Nigerian students. It gives you real past questions from JAMB, WAEC, Post-UTME, BECE, and NCEE, with detailed explanations after every answer. You practice under real exam conditions, so nothing surprises you on exam day.',
  },
  {
    question: 'Is it free?',
    answer:
      'Yes. You can practice with a free set of questions to see how it works. For unlimited access to all subjects and features, there is a one-time activation fee of ₦3,000. No subscriptions. No hidden charges. Pay once, use forever.',
  },
  {
    question: 'Does it work without internet?',
    answer:
      'Yes. Download the app, pick your exam content, and everything works offline. Practice at home, in school, on the bus, no data needed. Examinery was built for students who do not always have reliable internet access.',
  },
  {
    question: 'What makes Examinery different from other apps?',
    answer:
      'Three things. First, every question has a detailed explanation, you learn the concept, not just the answer. Second, the exam mode simulates real JAMB conditions with the approved 8-key shortcut. Third, it works fully offline on Android, iPhone, Windows, and Mac. One account works across all your devices.',
  },
  {
    question: 'Can I track my progress?',
    answer:
      'Yes. Examinery tracks your scores, study streak, time spent, and performance by subject. You can see exactly where you are strong and where you need more practice. The more you practice, the more accurate your progress data becomes.',
  },
  {
    question: 'Are the questions current?',
    answer:
      'We update our question bank regularly to include the most recent past questions and exam patterns. You are always practicing with material that reflects what you will actually see in the exam.',
  },
  {
    question: 'Which devices can I use?',
    answer:
      'Examinery works on Android phones and tablets, iPhones and iPads, Windows PCs (7, 8, 10, and 11), and macOS computers. One account works across all your devices. Start on your phone, continue on your laptop.',
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left px-6 py-5 hover:bg-neutral-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="text-base font-semibold text-neutral-900 pr-4">
          {faq.question}
        </span>
        <span
          className={`w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg
            className="w-4 h-4 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-5 text-neutral-600 leading-relaxed text-sm">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Header */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="badge-accent mb-4 inline-block">FAQ</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
              Questions? Answered.
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Everything you need to know about Examinery. Can&apos;t find your answer?
              {' '}
              <Link href="/contact" className="text-primary-600 font-semibold hover:underline">
                Contact us
              </Link>.
            </p>
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Start practising free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Right - FAQ Items */}
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={faq.question}
                faq={faq}
                isOpen={openIndex === index}
                onToggle={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
