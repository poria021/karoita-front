import { RETURN_URL_PARAM, parseSafeReturnUrl } from '@/lib/return-url';
import { RouteService } from '@/services/route.service';

export type AuthCardSurface = 'login' | 'register' | 'forgot';

/**
 * Public auth query builder. Copies a safe `returnUrl` only.
 * Login vs register vs forgot are paths; OTP-vs-password stays in memory.
 */
export function buildPublicAuthHref(
  path: string,
  options?: {
    returnUrl?: string | null;
  }
): string {
  const params = new URLSearchParams();
  const safeReturn = parseSafeReturnUrl(options?.returnUrl ?? null);
  if (safeReturn) {
    params.set(RETURN_URL_PARAM, safeReturn);
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function loginHref(options?: { returnUrl?: string | null }): string {
  return buildPublicAuthHref(RouteService.auth.login(), options);
}

export function registerHref(options?: { returnUrl?: string | null }): string {
  return buildPublicAuthHref(RouteService.auth.register(), options);
}

export function forgotHref(options?: { returnUrl?: string | null }): string {
  return buildPublicAuthHref(RouteService.auth.forgot(), options);
}

/** سطح کارت از pathname — پیش‌فرض login تا مسیر ناشناس فرم را خالی نگذارد. */
export function authCardSurfaceFromPathname(
  pathname: string
): AuthCardSurface {
  if (pathname === RouteService.auth.register()) return 'register';
  if (pathname === RouteService.auth.forgot()) return 'forgot';
  return 'login';
}
