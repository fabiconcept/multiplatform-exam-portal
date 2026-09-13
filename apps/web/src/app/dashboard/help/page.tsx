'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'How does the JAMB 8-key system work?',
    answer: 'The JAMB CBT uses 8 shortcut keys: A, B, C, D to select answers, P for previous question, N for next question, S to skip, and R to reveal the answer (in study mode). These keys work just like the actual JAMB exam interface.',
  },
  {
    question: 'What is the difference between Study Mode and Exam Mode?',
    answer: 'Study Mode shows explanations after each question and allows unlimited time. Exam Mode simulates real exam conditions with a timer, no explanations, and follows the exact JAMB format (180 questions, 2 hours).',
  },
  {
    question: 'How is the JAMB score calculated?',
    answer: 'Your score is calculated out of 400. English carries 60 questions and each of the other 3 subjects carries 40 questions. Each correct answer contributes equally to your total score.',
  },
  {
    question: 'Can I practice offline?',
    answer: 'Yes! Once you download the app and activate it, you can practice completely offline. All questions, explanations, and features work without internet connection.',
  },
  {
    question: 'How do I activate the app?',
    answer: 'The app costs a one-time fee of ₦3,000. You can pay via bank transfer, card, or USSD. After payment, your account is instantly activated with lifetime access.',
  },
  {
    question: 'Are the questions up to date?',
    answer: 'Yes, Examinery updates content every year to match the latest exam syllabus and past questions. You get access to questions from recent exam years.',
  },
  {
    question: 'Can I use the calculator during exams?',
    answer: 'Yes, the built-in calculator mimics the one in the actual JAMB CBT software. You can access it anytime during practice by clicking the calculator icon.',
  },
  {
    question: 'How do I bookmark questions?',
    answer: 'Click the bookmark icon on any question during practice. Bookmarked questions are saved and can be accessed from the Bookmarks page in your dashboard.',
  },
];

const shortcuts = [
  { key: 'A / B / C / D', description: 'Select answer option' },
  { key: 'P', description: 'Go to previous question' },
  { key: 'N', description: 'Go to next question' },
  { key: 'S', description: 'Skip current question' },
  { key: 'R', description: 'Reveal answer (Study mode only)' },
];

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Help & Support</h1>
        <p className="text-neutral-600">Get help with using Examinery</p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900">FAQs</h3>
          <p className="text-sm text-neutral-500">Common questions</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900">Shortcuts</h3>
          <p className="text-sm text-neutral-500">Keyboard keys</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm text-center">
          <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-neutral-900">Contact</h3>
          <p className="text-sm text-neutral-500">Get in touch</p>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">JAMB 8-Key Shortcuts</h2>
        <p className="text-sm text-neutral-500 mb-4">Use these keyboard shortcuts during practice for faster navigation</p>
        <div className="grid grid-cols-2 gap-3">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.key} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl">
              <kbd className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-sm font-mono font-semibold text-neutral-700 min-w-[80px] text-center">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-neutral-600">{shortcut.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-5 text-left flex items-center justify-between"
              >
                <span className="font-medium text-neutral-900 pr-4">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openFaq === index && (
                <div className="px-5 pb-5">
                  <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl p-8 text-white">
        <h2 className="text-xl font-bold mb-2">Still need help?</h2>
        <p className="text-neutral-400 mb-6">Our support team is available to help you</p>
        <div className="flex gap-4">
          <a
            href="mailto:support@Examinery.com"
            className="px-6 py-3 bg-white text-neutral-900 rounded-full font-semibold hover:bg-white/90 transition-colors"
          >
            Email Support
          </a>
          <a
            href="tel:08133744803"
            className="px-6 py-3 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 transition-colors"
          >
            Call: 08133744803
          </a>
        </div>
      </div>
    </div>
  );
}
