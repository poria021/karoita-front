/**
 * تشخیص ناوبری ماژول برای نوار پیشرفت بالای شل.
 * query-only (`?tab=` / `?kind=`) عمداً نادیده گرفته می‌شود تا با قرارداد SPA قاطی نشود.
 */

const SHOW_DELAY_MS = 120;
const SAFETY_HIDE_MS = 12_000;

export const NAVIGATION_PROGRESS_SHOW_DELAY_MS = SHOW_DELAY_MS;
export const NAVIGATION_PROGRESS_SAFETY_HIDE_MS = SAFETY_HIDE_MS;

export function isSameOriginPathNavigation(
  href: string,
  currentOrigin: string,
  currentPathname: string
): boolean {
  let url: URL;
  try {
    url = new URL(href, currentOrigin);
  } catch {
    return false;
  }
  if (url.origin !== currentOrigin) return false;
  if (url.pathname === currentPathname) return false;
  return true;
}

/** از event کلیک، لینک داخلی همان‌origin با تغییر pathname را پیدا کن. */
export function resolveInternalPathNavAnchor(
  target: EventTarget | null,
  currentOrigin: string,
  currentPathname: string
): HTMLAnchorElement | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.hasAttribute('download')) return null;
  if (anchor.target && anchor.target !== '_self') return null;
  if (anchor.getAttribute('href')?.startsWith('#')) return null;
  if (!isSameOriginPathNavigation(anchor.href, currentOrigin, currentPathname)) {
    return null;
  }
  return anchor;
}
