'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/exams', label: 'Exams' },
  { href: '/download', label: 'Download' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg shadow-neutral-900/10 dark:bg-[#232340]/95'
          : 'bg-white/70 backdrop-blur-md dark:bg-[#1a1a2e]/80'
      }`}
      style={{ WebkitBackdropFilter: 'blur(12px)', backdropFilter: 'blur(12px)' }}
    >
      <div className="section-container">
        <div className="flex items-center justify-between py-4 md:py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 bg-primary-500 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold text-[#2A241E]">E</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 dark:text-gray-100 font-display tracking-tight">
              Examinery
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 font-medium rounded-xl transition-colors duration-200 ${
                    isActive
                      ? 'text-primary-700 bg-primary-100 dark:text-primary-400 dark:bg-primary-500/15'
                      : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100/80 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2.5 font-semibold rounded-full transition-colors duration-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-white/10"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 dark:hover:bg-gray-100 hover:shadow-lg hover:shadow-neutral-900/20 active:scale-[0.98] transition-all duration-200"
            >
              Start practising
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="lg:hidden p-2.5 rounded-xl transition-colors text-neutral-800 hover:bg-neutral-100/80 dark:text-gray-200 dark:hover:bg-white/10"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu — hidden attribute (reliable in all browsers) */}
        <div
          id="mobile-menu"
          className={`lg:hidden ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="py-4 pb-6 border-t border-neutral-200 dark:border-[#333355] bg-white/95 dark:bg-[#232340]/95">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive
                        ? 'text-primary-700 bg-primary-100 dark:text-primary-400 dark:bg-primary-500/15'
                        : 'text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-white/10'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 mt-4 px-4">
              <Link
                href="/login"
                className="py-3 text-center text-neutral-700 dark:text-gray-200 font-semibold rounded-full border-2 border-neutral-300 dark:border-[#333355] hover:border-neutral-400 dark:hover:border-gray-500 hover:bg-neutral-50 dark:hover:bg-[#2a2a4a] transition-all"
                onClick={() => setIsOpen(false)}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="py-3 text-center bg-neutral-900 dark:bg-white dark:text-neutral-900 text-white font-semibold rounded-full hover:bg-neutral-800 dark:hover:bg-gray-100 active:scale-[0.98] transition-all"
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
