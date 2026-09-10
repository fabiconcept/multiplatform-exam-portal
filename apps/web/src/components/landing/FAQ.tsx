'use client';

import { useState } from 'react';
import Link from 'next/link';

const faqs = [
  {
    question: 'What is ExamScholars?',
    answer:
      'ExamScholars is a CBT Practice Software designed to help students prepare for Nigerian exams including JAMB/UTME, WAEC/SSCE, BECE and NCEE. It provides a platform for practicing past questions, improving subject knowledge, and enhancing speed and accuracy.',
  },
  {
    question: 'How do I use this platform?',
    answer:
      'ExamScholars is created to help you practice past questions in real exam conditions. Download and install either the Mobile or Desktop version of the app and start practicing. You can use it offline without internet access.',
  },
  {
    question: 'What sets ExamScholars apart from other exam preparation tools?',
    answer:
      'ExamScholars distinguishes itself by offering professionally evaluated past questions and answers with detailed explanations. It also simulates real-time exam conditions, helping students become better prepared. Our software works offline and is available on all major devices.',
  },
  {
    question: 'Does ExamScholars help with my exam speed and accuracy?',
    answer:
      'Yes, ExamScholars simulates real exam conditions, which helps students become familiar with the format and time constraints. Regular practice with the software can improve speed and accuracy in answering questions.',
  },
  {
    question: 'Does this app have Calculator and standard shortcut keys?',
    answer:
      'Yes, our exam interface is built to JAMB/UTME standard. It has a standard calculator and is equipped with the JAMB approved 8 keys shortcut which can help you take exams without using your mouse.',
  },
  {
    question: 'Are the questions error free?',
    answer:
      'All our questions are carefully vetted by highly competent professionals to ensure highest possible degree of accuracy. So, our questions are error free. However, if you notice anything you believe to be an error, you are welcome to share it with us and we will rectify it as soon as possible.',
  },
  {
    question: 'Can I track my progress and performance?',
    answer:
      'Yes, ExamScholars contains features to track your progress, review your performance, and identify areas where you need improvement. It provides valuable insights to help you focus your study efforts effectively.',
  },
  {
    question: 'Are the past questions up to date?',
    answer:
      'Yes, ExamScholars updates the content of the application every year to ensure you have access to the most recent past questions and exam patterns.',
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
    <div className="card bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-neutral-900 pr-4">
          {faq.question}
        </span>
        <span
          className={`w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <svg
            className="w-5 h-5 text-primary-600"
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
        className={`overflow-hidden transition-all duration-200 ${
          isOpen ? 'max-h-96 mt-4' : 'max-h-0'
        }`}
      >
        <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Header */}
          <div>
            <span className="badge-accent mb-4 inline-block">FAQ</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-neutral-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-neutral-600 mb-8">
              Get excellent scores in exams by preparing yourself with the best CBT simulation app for 
              your exam. Say goodbye to exam malpractice.
            </p>
            <Link href="/register" className="btn-primary text-lg px-8 py-4">
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Right - FAQ Items */}
          <div className="space-y-4">
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
