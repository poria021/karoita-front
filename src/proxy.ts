import { isPublicPath } from '@/lib/public-paths';
import { AUTH_COOKIE_NAME, DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { MOCK_SESSION_MARKER } from '@/lib/config';
import {
  RETURN_URL_PARAM,
  parseSafeReturnUrl,
} from '@/lib/return-url';
import {
  isAppShellPath,
  isAuthPath,
  RouteService,
} from '@/services/route.service';
import { NextRequest, NextResponse } from 'next/server';

function hasClientSession(request: NextRequest): boolean {
  if (request.cookies.get(AUTH_COOKIE_NAME)?.value) return true;
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
 * Edge session gate (Next.js 16 `proxy.ts` — replaces root `middleware.ts`).
 * Presence only: Better Auth cookie or mock marker — not role/authorization.
 *
 * - مسیرهای public → عبور
 * - `/karvita/*` بدون نشست → لاگین + returnUrl
 * - بقیهٔ URLهای ناشناس (لندینگ غلط و …) → عبور تا `not-found` ریشه/مارکتینگ
 *   نه ریدایرکت اجباری به لاگین
 */
export async function proxy(request: NextRequest) {
    // console.log('✅ Proxy is working on path:', request.nextUrl.pathname);

  const { pathname } = request.nextUrl;
  const loggedIn = hasClientSession(request);
  const loginPath = RouteService.auth.login();

  if (loggedIn && isAuthPath(pathname)) {
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

    // Only the authenticated app shell requires a session at the Edge.
    // Unknown marketing/other URLs must reach App Router not-found UI.
    if (isAppShellPath(pathname)) {
      const intended = `${pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(loginRedirectUrl(request, intended));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
