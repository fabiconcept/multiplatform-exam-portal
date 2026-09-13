import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  const pathname = _request.nextUrl.pathname;
  const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/check-email', '/download', '/pricing', '/contact', '/about', '/blog', '/offline'];
  const publicPrefixes = ['/_next', '/api', '/exams', '/images'];
  const isPublic = publicPaths.some((p) => pathname === p) ||
    publicPrefixes.some((p) => pathname.startsWith(p)) ||
    pathname === '/';

  if (!isPublic) {
    const token = _request.cookies.get('token')?.value;
    if (!token) {
      const loginUrl = new URL('/login', _request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
