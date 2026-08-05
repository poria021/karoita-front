import { RouteService } from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** Exact public routes (marketing home + leaf pages). */
const MARKETING_PUBLIC_EXACT = [
  RouteService.marketing.home(),
  RouteService.marketing.benefits(),
  RouteService.marketing.about(),
  RouteService.marketing.internship(),
  RouteService.marketing.advantages(),
  RouteService.marketing.loginSelect(),
] as const;

export const publicPathsConfig = {
  exactPaths: [...MARKETING_PUBLIC_EXACT],
  prefixes: ['/docs/', '/auth/'] as const,
};

export function isPublicPath(pathname: string): boolean {
  const path = normalizePath(pathname);

  if (publicPathsConfig.exactPaths.includes(path)) {
    return true;
  }

  for (const prefix of publicPathsConfig.prefixes) {
    if (path.startsWith(prefix) || path === prefix.replace(/\/$/, '')) {
      return true;
    }
  }

  return false;
}
