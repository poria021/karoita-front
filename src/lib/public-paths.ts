import { isMarketingCmsPath, RouteService } from '@/services/route.service';

function normalizePath(pathname: string): string {
  if (!pathname) return '/';
  const withoutQuery = pathname.split('?')[0] ?? pathname;
  const trimmed = withoutQuery.replace(/\/+$/, '');
  return trimmed.length > 0 ? trimmed : '/';
}

/** مسیرهای عمومی دقیق (خانهٔ مارکتینگ + پورتال انتخاب ورود). */
const MARKETING_PUBLIC_EXACT = [
  RouteService.marketing.home(),
  RouteService.marketing.loginSelect(),
  RouteService.marketing.offline(),
] as const;

export const publicPathsConfig = {
  exactPaths: [...MARKETING_PUBLIC_EXACT],
  /**
   * پیشوندهای عمومی:
   * - `/auth/` درخت احراز هویت
   * - `/docs/` مستندات
   * - `/p/` صفحات CMS عمومی بین لندینگ و ورود (نوشتهٔ ادمین)
   * - `/api/auth/` مسیرهای cookie رفرش httpOnly (set/clear/refresh) —
   *   باید قبل از لاگین و وسط rotation در دسترس بمانند؛ `real-auth.tokens.ts`
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

  // هاب CMS دقیق `/p` (بررسی پیشوند به‌تنهایی فرم اسلش انتهایی می‌خواهد).
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
