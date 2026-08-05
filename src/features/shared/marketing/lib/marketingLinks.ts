import { RouteService } from '@/services/route.service';

const MARKETING_PATHS = new Set<string>([
  RouteService.marketing.home(),
  RouteService.marketing.benefits(),
  RouteService.marketing.about(),
  RouteService.marketing.internship(),
  RouteService.marketing.advantages(),
  RouteService.marketing.loginSelect(),
]);

export type MarketingNavTarget =
  | { kind: 'external'; href: string }
  | { kind: 'internal'; href: string }
  | { kind: 'none' };

/** Resolve CMS link strings for public marketing chrome (dock / socials). */
export function resolveMarketingNavTarget(link: string): MarketingNavTarget {
  const trimmed = link.trim();
  if (!trimmed) return { kind: 'none' };

  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://')
  ) {
    return { kind: 'external', href: trimmed };
  }

  if (trimmed.startsWith('/')) {
    if (MARKETING_PATHS.has(trimmed) || trimmed === RouteService.auth.login()) {
      return { kind: 'internal', href: trimmed };
    }
    // Known relative CMS targets stay navigable for future marketing pages.
    return { kind: 'internal', href: trimmed };
  }

  return { kind: 'none' };
}

/**
 * Header «ورود» CTA: when CMS has more than one floating product,
 * route to the product picker; otherwise go straight to auth login.
 */
export function resolveMarketingLoginHref(productCount: number): string {
  return productCount > 1
    ? RouteService.marketing.loginSelect()
    : RouteService.auth.login();
}
