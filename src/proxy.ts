import { isPublicPath } from '@/lib/public-paths';
import { DEFAULT_LOGIN_REDIRECT } from '@/lib/config';
import { hasEdgeClientSession } from '@/lib/edge-session';
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

/**
 * هدرهای امنیتی غیر-CSP روی هر درخواست.
 *
 * CSP در `next.config.ts` → `headers()` در runtime نود ساخته می‌شود که `NODE_ENV`
 * آنجا درست است. گذاشتن CSP اینجا (Edge) باعث می‌شد `unsafe-eval` در dev حذف شود
 * چون `NODE_ENV` و `NEXT_PUBLIC_*` در باندل Edge قابل اعتماد نیستند.
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
 * گیت نشست Edge — قرارداد Next ۱۶ (`src/proxy.ts`، نام `proxy`).
 * `middleware.ts` نسازید: وجود هر دو فایل بیلد را fail می‌کند. `config.matcher`
 * از همین فایل استخراج ایستا می‌شود؛ اگر به import منتقل شود گیت نشست اجرا نمی‌شود.
 *
 * فقط حضور: cookie نشست واقعی، یا marker شبیه‌ساز وقتی mock/dev واقعاً روشن است —
 * نه نقش/مجوز. production/real یک cookie جعلی mock را نادیده می‌گیرد تا Edge
 * شِل لاگین‌شده نشان ندهد.
 *
 * - مسیرهای public → عبور
 * - `/karvita/*` بدون نشست → لاگین + `returnUrl`
 * - بقیهٔ URLهای ناشناس (لندینگ غلط و …) → عبور تا `not-found` ریشه/مارکتینگ
 *   نه ریدایرکت اجباری به لاگین
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = hasEdgeClientSession(request.cookies);
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

    // فقط شِل احراز‌شده در Edge به نشست نیاز دارد.
    // URL ناشناس مارکتینگ باید به UI not-found اپ‌روتر برسد.
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
