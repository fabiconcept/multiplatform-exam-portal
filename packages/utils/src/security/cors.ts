export interface CorsConfig {
  origin: string | string[] | ((origin: string) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Idempotency-Key',
  'X-Requested-With',
  'Accept',
];

const DEFAULT_EXPOSED_HEADERS = [
  'X-RateLimit-Limit',
  'X-RateLimit-Remaining',
  'X-RateLimit-Reset',
  'X-Request-Id',
];

export const corsConfigs = {
  development: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    exposedHeaders: DEFAULT_EXPOSED_HEADERS,
    credentials: true,
    maxAge: 86400,
  },
  production: {
    origin: [
      process.env.WEB_URL || 'https://fabicbt.com',
      process.env.ADMIN_URL || 'https://admin.fabicbt.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    exposedHeaders: DEFAULT_EXPOSED_HEADERS,
    credentials: true,
    maxAge: 86400,
  },
} as const;

export function isOriginAllowed(origin: string, config: CorsConfig): boolean {
  if (config.origin === '*') return true;
  if (typeof config.origin === 'string') return origin === config.origin;
  if (Array.isArray(config.origin)) return config.origin.includes(origin);
  return config.origin(origin);
}
