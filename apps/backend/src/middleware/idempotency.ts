import { Request, Response, NextFunction } from 'express';
import { createIdempotencyStore, extractIdempotencyKey } from '@exam-portal/utils/security';

const idempotencyStore = createIdempotencyStore();

export function idempotencyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.method !== 'POST') return next();

  const key = extractIdempotencyKey(req.headers as Record<string, string>);
  if (!key) return next();

  const existing = idempotencyStore.get(key);
  if (existing) {
    res.set('Idempotency-Key', key);
    return res.status(existing.statusCode).json(existing.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      idempotencyStore.set(key, res.statusCode, body);
    }
    return originalJson(body);
  };

  next();
}
