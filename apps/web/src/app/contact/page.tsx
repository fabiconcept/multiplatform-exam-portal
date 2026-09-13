'use client';

import { useState } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

const contactInfo = [
  {
    title: 'Email',
    value: 'support@Examinery.com',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Phone',
    value: '08133744803',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    title: 'Social',
    value: '@exam_scholars',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
  },
];

const socialLinks = [
  { name: 'Facebook', href: 'https://www.facebook.com/Examinery.CBT.software' },
  { name: 'Twitter', href: 'https://x.com/exam_scholar' },
  { name: 'Instagram', href: 'https://www.instagram.com/exam_scholars_' },
  { name: 'TikTok', href: 'https://www.tiktok.com/@Examinery' },
  { name: 'YouTube', href: 'https://www.youtube.com/@Examinery_app' },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Build mailto link as fallback (no contact API endpoint exists)
    const mailtoUrl = `mailto:support@Examinery.com?subject=${encodeURIComponent(`[Contact] ${formData.subject}`)}&body=${encodeURIComponent(`Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)}`;
    window.location.href = mailtoUrl;
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Header */}
        <div className="bg-accent-500 py-16 md:py-24 mb-16">
          <div className="section-container text-center">
            <span className="badge bg-white/20 text-white mb-4 inline-block">Contact Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6">
              Get in touch
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
              Have questions? We&apos;re here to help. Reach out to us and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>

        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6 mb-8">
                {contactInfo.map((info) => (
                  <div key={info.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-600 flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-neutral-500">{info.title}</p>
                      <p className="font-medium text-neutral-900">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-neutral-100">
                <h3 className="font-semibold mb-4">Follow us</h3>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-neutral-100 rounded-full text-sm font-medium text-neutral-700 hover:bg-accent-100 hover:text-accent-600 transition-colors"
                    >
                      {social.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Message Sent!</h2>
                    <p className="text-neutral-500 mb-6">
                      Your email client should have opened. If not, you can reach us directly at{' '}
                      <a href="mailto:support@Examinery.com" className="text-accent-500 font-medium">support@Examinery.com</a>
                    </p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: '', message: '' }); }}
                      className="px-6 py-3 border-2 border-neutral-200 rounded-full font-medium text-neutral-700 hover:bg-neutral-50 transition-all"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                            Your name
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="input"
                            placeholder="Enter your name"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                            Email address
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="input"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-neutral-700 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className="input"
                          placeholder="What is this about?"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-2">
                          Message
                        </label>
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="input min-h-[150px] resize-none"
                          placeholder="Tell us how we can help..."
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-accent-500 text-white font-semibold rounded-full hover:bg-accent-600 hover:shadow-xl hover:shadow-accent-500/25 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <span className="inline-flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : 'Send message'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
