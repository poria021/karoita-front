import { RouteService } from '@/services/route.service';

import type { MarketingPanelId } from './marketingPanelContext';

/** Legacy CMS leaf paths → in-page SPA panels (no separate routes). */
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

/** Resolve CMS link strings for public marketing chrome (dock / banners / socials). */
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

  // Public CMS pages between landing and auth (`/p/...`).
  if (
    trimmed.startsWith('/') &&
    RouteService.marketing.isMarketingCmsPath(trimmed)
  ) {
    return { kind: 'internal', href: trimmed };
  }

  // Other relative CMS targets stay navigable (auth / future app paths).
  if (trimmed.startsWith('/')) {
    return { kind: 'internal', href: trimmed };
  }

  return { kind: 'none' };
}

/**
 * Header «ورود» CTA:
 * - 2+ CMS products → login-select portal
 * - fewer than 2 → straight to auth login
 */
export function resolveMarketingLoginHref(productCount: number): string {
  return productCount >= 2
    ? RouteService.marketing.loginSelect()
    : RouteService.auth.login();
}
