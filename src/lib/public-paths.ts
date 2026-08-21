import { isMarketingCmsPath, RouteService } from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** Exact public routes (marketing home + login-select portal). */
const MARKETING_PUBLIC_EXACT = [
  RouteService.marketing.home(),
  RouteService.marketing.loginSelect(),
  RouteService.marketing.offline(),
] as const;

export const publicPathsConfig = {
  exactPaths: [...MARKETING_PUBLIC_EXACT],
  /**
   * - `/auth/` auth tree
   * - `/docs/` docs
   * - `/p/` public CMS pages between landing and login (admin-authored)
   * - `/api/auth/` httpOnly refresh-token routes (set/clear/refresh) — must
   *   stay reachable pre-login and mid-rotation; see real-auth.tokens.ts
   */
  prefixes: [
    '/docs/',
    '/auth/',
    `${RouteService.marketing.cmsPagesBase()}/`,
    '/__nest-api/',
    '/api/auth/',
  ] as const,
};

export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname);

  if (publicPathsConfig.exactPaths.includes(path)) {
    return true;
  }

  // Exact CMS hub `/p` (prefix check alone needs trailing slash form).
  if (isMarketingCmsPath(path)) {
    return true;
  }

  for (const prefix of publicPathsConfig.prefixes) {
    if (path.startsWith(prefix) || path === prefix.replace(/\/$/, '')) {
      return true;
    }
  }

  return false;
}
