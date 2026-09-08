import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'csrf-secret';
const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = '_csrf';
const CSRF_HEADER_NAME = 'x-csrf-token';

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

export function signCsrfToken(token: string): string {
  const hmac = crypto.createHmac('sha256', CSRF_SECRET);
  hmac.update(token);
  return hmac.digest('hex');
}

export function verifyCsrfToken(token: string, signature: string): boolean {
  const expected = signCsrfToken(token);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function createCsrfProtection() {
  const tokens = new Map<string, { token: string; expiresAt: number }>();

  return {
    generate(sessionId: string): { token: string; signedToken: string } {
      const token = generateCsrfToken();
      const signedToken = signCsrfToken(token);
      tokens.set(sessionId, { token, expiresAt: Date.now() + 60 * 60 * 1000 });
      return { token, signedToken };
    },
    validate(sessionId: string, token: string): boolean {
      const stored = tokens.get(sessionId);
      if (!stored) return false;
      if (Date.now() > stored.expiresAt) {
        tokens.delete(sessionId);
        return false;
      }
      return verifyCsrfToken(token, stored.token);
    },
    revoke(sessionId: string) {
      tokens.delete(sessionId);
    },
  };
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
