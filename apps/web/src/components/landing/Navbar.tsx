'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/exams', label: 'Exams' },
  { href: '/download', label: 'Download' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-neutral-900/5'
          : 'bg-transparent'
      }`}
    >
      <div className="section-container">
        <div className="flex items-center justify-between py-5 md:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-neutral-900">E</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 font-display tracking-tight">
              ExamScholars
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium rounded-xl hover:bg-neutral-100/80 transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-5 py-2.5 text-neutral-700 hover:text-neutral-900 font-semibold rounded-full hover:bg-neutral-100 transition-all duration-200"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-all duration-200"
            >
              Start practising
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2.5 rounded-xl hover:bg-neutral-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="py-4 pb-6 border-t border-neutral-100">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl font-medium transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3 mt-4 px-4">
              <Link
                href="/login"
                className="py-3 text-center text-neutral-700 font-semibold rounded-full border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="py-3 text-center bg-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 active:scale-[0.98] transition-all"
                onClick={() => setIsOpen(false)}
              >
                Start practising
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
