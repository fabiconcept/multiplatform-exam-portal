import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import crypto from 'crypto';
import { getRateLimitTier, createRateLimitStore, createThrottleStore, THROTTLE_CONFIGS } from '@exam-portal/utils/security';
import { corsConfigs } from '@exam-portal/utils/security';

const rateLimitStore = createRateLimitStore();
const throttleStore = createThrottleStore();

export function applySecurityMiddleware(app: import('express').Express) {
  const env = process.env.NODE_ENV || 'development';
  const corsConfig = env === 'production' ? corsConfigs.production : corsConfigs.development;

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    hsts: { maxAge: 63072000, includeSubDomains: true, preload: true },
  }));

  app.use(cors(corsConfig));
  app.use(compression());
  app.use(morgan(env === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const tier = getRateLimitTier(req.path);
  const key = `${req.ip}:${req.path}`;
  const result = rateLimitStore.increment(key, tier.windowMs);

  res.set('X-RateLimit-Limit', String(tier.maxRequests));
  res.set('X-RateLimit-Remaining', String(Math.max(0, tier.maxRequests - result.count)));
  res.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));

  if (result.count > tier.maxRequests) {
    res.set('Retry-After', String(Math.ceil((result.resetTime - Date.now()) / 1000)));
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfterMs: result.resetTime - Date.now(),
    });
  }

  next();
}

export function throttleMiddleware(req: Request, res: Response, next: NextFunction) {
  const role = (req as any).user?.role || 'unauthenticated';
  const config = THROTTLE_CONFIGS[role] || THROTTLE_CONFIGS.unauthenticated;
  const key = `${req.ip}:${role}`;
  const result = throttleStore.consume(key, config);

  res.set('X-Throttle-Limit', String(config.maxRequests));
  res.set('X-Throttle-Remaining', String(result.remaining));

  if (!result.allowed) {
    res.set('Retry-After', String(Math.ceil(result.retryAfterMs / 1000)));
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Please slow down.',
      retryAfterMs: result.retryAfterMs,
    });
  }

  next();
}

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction) {
  res.set('X-DNS-Prefetch-Control', 'on');
  res.set('X-Frame-Options', 'SAMEORIGIN');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('X-Request-Id', crypto.randomUUID());
  next();
}
