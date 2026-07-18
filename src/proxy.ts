import { isPublicPath } from '@/lib/public-paths';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import {
  RETURN_URL_PARAM,
  parseSafeReturnUrl,
} from '@/lib/return-url';
import { RouteService } from '@/services/route.service';
import { getSessionCookie } from 'better-auth/cookies';
import { NextRequest, NextResponse } from 'next/server';

function hasClientSession(request: NextRequest): boolean {
  if (getSessionCookie(request)) return true;
  // Mock DX: non-httpOnly presence marker — NOT identity/role (rule 45 / 20 #5).
  return request.cookies.get(MOCK_SESSION_MARKER)?.value === '1';
}

function loginRedirectUrl(request: NextRequest, intendedPath: string): URL {
  const loginUrl = new URL(RouteService.auth.login(), request.url);
  const safe = parseSafeReturnUrl(intendedPath);
  if (safe) {
    loginUrl.searchParams.set(RETURN_URL_PARAM, safe);
  }
  return loginUrl;
}

/**
 * Edge auth is presence-only. Role-based landing (e.g. super_admin admin
 * dashboard) is corrected on the client via getPostLoginPath / karvita guards.
 * Do not invent role claims from client-writable cookies.
 *
 * When a logged-in user hits `/auth/*` with a safe `returnUrl`, Edge may send
 * them there without role checks — client guards still enforce UX boundaries.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasClientSession(request);
  const loginPath = RouteService.auth.login();

  if (loggedIn && pathname.startsWith('/auth/')) {
    const rawReturn = request.nextUrl.searchParams.get(RETURN_URL_PARAM);
    const safeReturn = parseSafeReturnUrl(rawReturn);
    const destination = safeReturn ?? DEFAULT_LOGIN_REDIRECT;

    if (pathname === destination) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  if (!loggedIn) {
    if (pathname === loginPath) {
      return NextResponse.next();
    }
    const intended = `${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(loginRedirectUrl(request, intended));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
