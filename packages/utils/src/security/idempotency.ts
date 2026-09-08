import crypto from 'crypto';

export interface IdempotencyEntry {
  key: string;
  statusCode: number;
  body: unknown;
  createdAt: number;
}

export function createIdempotencyStore(ttlMs: number = 24 * 60 * 60 * 1000) {
  const store = new Map<string, IdempotencyEntry>();

  function cleanup() {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now - entry.createdAt > ttlMs) store.delete(key);
    }
  }

  setInterval(cleanup, 60 * 60 * 1000);

  return {
    generateKey(): string {
      return crypto.randomUUID();
    },
    get(key: string): IdempotencyEntry | undefined {
      return store.get(key);
    },
    set(key: string, statusCode: number, body: unknown): void {
      store.set(key, { key, statusCode, body, createdAt: Date.now() });
    },
    has(key: string): boolean {
      return store.has(key);
    },
  };
}

export function extractIdempotencyKey(headers: Record<string, string | undefined>): string | undefined {
  return headers['idempotency-key'] || headers['x-idempotency-key'];
}
