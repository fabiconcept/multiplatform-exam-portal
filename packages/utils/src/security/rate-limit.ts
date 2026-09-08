import type { RateLimitConfig } from '@exam-portal/types';

export const RATE_LIMIT_TIERS: Record<RateLimitConfig['tier'], RateLimitConfig> = {
  critical: { tier: 'critical', maxRequests: 5, windowMs: 15 * 60 * 1000 },
  strict: { tier: 'strict', maxRequests: 20, windowMs: 15 * 60 * 1000 },
  medium: { tier: 'medium', maxRequests: 60, windowMs: 15 * 60 * 1000 },
  lenient: { tier: 'lenient', maxRequests: 150, windowMs: 15 * 60 * 1000 },
  public: { tier: 'public', maxRequests: 300, windowMs: 15 * 60 * 1000 },
};

export const ENDPOINT_RATE_LIMITS: Record<string, RateLimitConfig['tier']> = {
  '/auth/login': 'critical',
  '/auth/register': 'critical',
  '/auth/reset-password': 'critical',
  '/auth/forgot-password': 'critical',
  '/exams/*/submit': 'strict',
  '/admin/*': 'strict',
  '/questions/*': 'medium',
  '/exams/*': 'medium',
  '/subjects/*': 'lenient',
  '/results/*': 'lenient',
  '/': 'public',
  '/about': 'public',
  '/sitemap.xml': 'public',
};

export function getRateLimitTier(path: string): RateLimitConfig {
  for (const [pattern, tier] of Object.entries(ENDPOINT_RATE_LIMITS)) {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    if (regex.test(path)) return RATE_LIMIT_TIERS[tier];
  }
  return RATE_LIMIT_TIERS.medium;
}

export function createRateLimitStore() {
  const hits = new Map<string, { count: number; resetTime: number }>();

  function cleanup() {
    const now = Date.now();
    for (const [key, value] of hits.entries()) {
      if (now > value.resetTime) hits.delete(key);
    }
  }

  setInterval(cleanup, 60 * 1000);

  return {
    increment(key: string, windowMs: number): { count: number; resetTime: number } {
      const now = Date.now();
      const existing = hits.get(key);

      if (existing && now < existing.resetTime) {
        existing.count++;
        return existing;
      }

      const entry = { count: 1, resetTime: now + windowMs };
      hits.set(key, entry);
      return entry;
    },
    get(key: string) {
      return hits.get(key);
    },
    reset(key: string) {
      hits.delete(key);
    },
  };
}
