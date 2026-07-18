import { isPublicPath } from '@/lib/public-paths';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

function hasClientSession(request: NextRequest): boolean {
  if (getSessionCookie(request)) return true;
  // Mock DX: non-httpOnly presence marker — NOT identity/role (rule 45 / 20 #5).
  return request.cookies.get(MOCK_SESSION_MARKER)?.value === '1';
}

/**
 * Edge auth is presence-only. Role-based landing (e.g. super_admin admin
 * dashboard) is corrected on the client via getPostLoginPath / karvita guards.
 * Do not invent role claims from client-writable cookies.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasClientSession(request);

  if (loggedIn && pathname.startsWith('/auth/')) {
    if (pathname === DEFAULT_LOGIN_REDIRECT) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!loggedIn) {
    if (pathname === '/auth/login') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
