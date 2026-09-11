import type { Metadata } from 'next';
import { inter, poppins } from '../styles/fonts';
import '../styles/globals.css';
import { Providers } from './providers';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://examscholars.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | ExamScholars',
    default: 'ExamScholars — CBT & Exam Preparation Platform',
  },
  description:
    'Practice CBT exams, track your progress, and ace your tests. The leading computer-based test platform for Nigerian students.',
  keywords: ['CBT', 'exam preparation', 'practice tests', 'computer-based test', 'Nigerian exams', 'WAEC', 'JAMB', 'NECO'],
  authors: [{ name: 'ExamScholars' }],
  creator: 'ExamScholars',
  publisher: 'ExamScholars',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: 'ExamScholars',
    title: 'ExamScholars — CBT & Exam Preparation Platform',
    description: 'Practice CBT exams, track your progress, and ace your tests.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ExamScholars',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ExamScholars — CBT & Exam Preparation Platform',
    description: 'Practice CBT exams, track your progress, and ace your tests.',
    images: [`${SITE_URL}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
