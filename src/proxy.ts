import { isPublicPath } from '@/lib/public-paths';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  // Logged-in users hitting auth pages → dashboard (skip if already there).
  if (sessionCookie && pathname.startsWith('/auth/')) {
    if (pathname === DEFAULT_LOGIN_REDIRECT) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!sessionCookie) {
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
