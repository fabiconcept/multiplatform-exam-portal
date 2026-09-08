export interface ThrottleConfig {
  maxRequests: number;
  windowMs: number;
}

export const THROTTLE_CONFIGS: Record<string, ThrottleConfig> = {
  unauthenticated: { maxRequests: 30, windowMs: 60 * 1000 },
  student: { maxRequests: 120, windowMs: 60 * 1000 },
  admin: { maxRequests: 200, windowMs: 60 * 1000 },
};

export function createThrottleStore() {
  const buckets = new Map<string, { tokens: number; lastRefill: number; maxTokens: number }>();

  function refill(bucket: { tokens: number; lastRefill: number; maxTokens: number }, refillRate: number) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor(elapsed / (60 * 1000 / refillRate));
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
  }

  return {
    consume(key: string, config: ThrottleConfig): { allowed: boolean; remaining: number; retryAfterMs: number } {
      let bucket = buckets.get(key);
      const refillRate = config.maxRequests;

      if (!bucket) {
        bucket = { tokens: config.maxRequests - 1, lastRefill: Date.now(), maxTokens: config.maxRequests };
        buckets.set(key, bucket);
        return { allowed: true, remaining: bucket.tokens, retryAfterMs: 0 };
      }

      refill(bucket, refillRate);

      if (bucket.tokens <= 0) {
        const retryAfterMs = 60 * 1000 / refillRate;
        return { allowed: false, remaining: 0, retryAfterMs };
      }

      bucket.tokens--;
      return { allowed: true, remaining: bucket.tokens, retryAfterMs: 0 };
    },
    reset(key: string) {
      buckets.delete(key);
    },
  };
}
