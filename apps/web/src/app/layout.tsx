import type { Metadata } from 'next';
import '../styles/globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fabicbt.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | Fabi CBT',
    default: 'Fabi CBT — CBT & Exam Preparation Platform',
  },
  description:
    'Practice CBT exams, track your progress, and ace your tests. The leading computer-based test platform for students.',
  keywords: ['CBT', 'exam preparation', 'practice tests', 'computer-based test', 'Nigerian exams', 'WAEC', 'JAMB', 'NECO'],
  authors: [{ name: 'Fabi Concept' }],
  creator: 'Fabi Concept',
  publisher: 'Fabi Concept',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: 'Fabi CBT',
    title: 'Fabi CBT — CBT & Exam Preparation Platform',
    description: 'Practice CBT exams, track your progress, and ace your tests.',
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Fabi CBT',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fabi CBT — CBT & Exam Preparation Platform',
    description: 'Practice CBT exams, track your progress, and ace your tests.',
    images: [`${SITE_URL}/og-image.png`],
    creator: '@fabicbt',
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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
