import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://fabicbt.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/register`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  const studentRoutes = [
    { url: `${SITE_URL}/student`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${SITE_URL}/student/exams`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${SITE_URL}/student/results`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 },
  ];

  return [...publicRoutes, ...studentRoutes];
}
