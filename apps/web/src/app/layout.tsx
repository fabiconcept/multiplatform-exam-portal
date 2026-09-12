import type { Metadata, Viewport } from 'next';
import { inter, poppins } from '../styles/fonts';
import '../styles/globals.css';
import { Providers } from './providers';
import { ServiceWorkerRegistration, InstallPrompt } from '@/components/pwa';

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

export const viewport: Viewport = {
  themeColor: '#F5C518',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ExamScholars',
    url: SITE_URL,
    description: 'Practice CBT exams, track your progress, and ace your tests. The leading computer-based test platform for Nigerian students.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NGN',
    },
    author: {
      '@type': 'Organization',
      name: 'ExamScholars',
      url: SITE_URL,
    },
  };

  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ExamScholars" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <ServiceWorkerRegistration />
        <InstallPrompt />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
