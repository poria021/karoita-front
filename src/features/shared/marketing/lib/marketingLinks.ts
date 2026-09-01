import { RouteService } from '@/services/route.service';

import type { MarketingPanelId } from './marketingPanelContext';

/** مسیر قدیمی برگ CMS → پنل SPA داخل صفحه (بدون route جدا). */
const MARKETING_PANEL_PATHS: Readonly<Record<string, MarketingPanelId>> = {
  '/benefits': 'benefits',
  '/about': 'about',
  '/internship': 'internship',
  '/advantages': 'advantages',
  '#benefits': 'benefits',
  '#about': 'about',
  '#internship': 'internship',
  '#advantages': 'advantages',
};

const MARKETING_INTERNAL_PATHS = new Set<string>([
  RouteService.marketing.home(),
  RouteService.marketing.loginSelect(),
  RouteService.auth.login(),
]);

export type MarketingNavTarget =
  | { kind: 'external'; href: string }
  | { kind: 'internal'; href: string }
  | { kind: 'panel'; id: MarketingPanelId }
  | { kind: 'none' };

/** رشتهٔ لینک CMS را برای chrome مارکتینگ عمومی (داک / بنر / شبکه اجتماعی) حل می‌کند. */
export function resolveMarketingNavTarget(link: string): MarketingNavTarget {
  const trimmed = link.trim();
  if (!trimmed) return { kind: 'none' };

  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return { kind: 'external', href: trimmed };
  }

  const panelId = MARKETING_PANEL_PATHS[trimmed];
  if (panelId) {
    return { kind: 'panel', id: panelId };
  }

  if (trimmed.startsWith('/') && MARKETING_INTERNAL_PATHS.has(trimmed)) {
    return { kind: 'internal', href: trimmed };
  }

  // صفحات CMS عمومی بین لندینگ و auth (`/p/...`).
  if (
    trimmed.startsWith('/') &&
    RouteService.marketing.isMarketingCmsPath(trimmed)
  ) {
    return { kind: 'internal', href: trimmed };
  }

  // بقیهٔ هدف‌های نسبی CMS قابل ناوبری می‌مانند (auth / مسیر آیندهٔ اپ).
  if (trimmed.startsWith('/')) {
    return { kind: 'internal', href: trimmed };
  }

  return { kind: 'none' };
}

/**
 * CTA «ورود» هدر:
 * - ۲+ محصول CMS → پورتال انتخاب ورود
 * - کمتر از ۲ → مستقیم ورود auth
 */
export function resolveMarketingLoginHref(productCount: number): string {
  return productCount >= 2
    ? RouteService.marketing.loginSelect()
    : RouteService.auth.login();
}
