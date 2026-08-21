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

/**
 * Attach non-CSP security headers per-request.
 *
 * CSP is now set in next.config.ts → headers() which runs in Node.js runtime
 * where process.env.NODE_ENV is guaranteed to be correct. Setting CSP here
 * (Edge Runtime) caused unsafe-eval to be dropped in dev because NODE_ENV
 * and NEXT_PUBLIC_* env vars are not reliably available in the Edge bundle.
 */
function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  return response;
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
 * Edge session gate — Next.js 16 convention (`src/proxy.ts`, named `proxy`).
 * Do NOT add `middleware.ts`: Next treats that as deprecated and fails the
 * build if both files exist. `config.matcher` is statically extracted from
 * THIS file; moving it to an import would skip the session gate.
 *
 * Presence only: Better Auth cookie or mock marker — not role/authorization.
 *
 * - مسیرهای public → عبور
 * - `/karvita/*` بدون نشست → لاگین + returnUrl
 * - بقیهٔ URLهای ناشناس (لندینگ غلط و …) → عبور تا `not-found` ریشه/مارکتینگ
 *   نه ریدایرکت اجباری به لاگین
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasClientSession(request);
  const loginPath = RouteService.auth.login();

  if (loggedIn && isAuthPath(pathname)) {
    const rawReturn = request.nextUrl.searchParams.get(RETURN_URL_PARAM);
    const safeReturn = parseSafeReturnUrl(rawReturn);
    const destination = safeReturn ?? DEFAULT_LOGIN_REDIRECT;

    if (pathname === destination) {
      return withSecurityHeaders(NextResponse.next());
    }
    return withSecurityHeaders(
      NextResponse.redirect(new URL(destination, request.url))
    );
  }

  if (isPublicPath(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (!loggedIn) {
    if (pathname === loginPath) {
      return withSecurityHeaders(NextResponse.next());
    }

    // Only the authenticated app shell requires a session at the Edge.
    // Unknown marketing/other URLs must reach App Router not-found UI.
    if (isAppShellPath(pathname)) {
      const intended = `${pathname}${request.nextUrl.search}`;
      return withSecurityHeaders(
        NextResponse.redirect(loginRedirectUrl(request, intended))
      );
    }

    return withSecurityHeaders(NextResponse.next());
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ['/((?!.*\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
