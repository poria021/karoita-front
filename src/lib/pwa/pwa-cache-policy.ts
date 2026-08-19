/**
 * Service-worker cache law for Karvita.
 * Shell static assets may be cached. Documents, RSC payloads, Nest proxy,
 * and credentialed API traffic are always NetworkOnly (never offline replay).
 */

export const PWA_OFFLINE_PATH = '/offline';
export const PWA_SW_PATH = '/sw.js';

/** Same-origin static shell that is safe to CacheFirst. */
export const PWA_STATIC_CACHE_PATH =
  /^(?:\/_next\/static\/|\/brand\/|\/fonts\/|\/marketing\/)/;

const NEST_PROXY = '/__nest-api';

export type PwaRequestSnapshot = {
  method: string;
  pathname: string;
  search?: string;
  mode?: string;
  destination?: string;
  /** Lowercase header names. */
  headers?: Record<string, string | null | undefined>;
};

function header(
  headers: PwaRequestSnapshot['headers'],
  name: string
): string {
  if (!headers) return '';
  const direct = headers[name];
  if (typeof direct === 'string' && direct) return direct;
  const lower = headers[name.toLowerCase()];
  return typeof lower === 'string' ? lower : '';
}

export function shouldUseNetworkOnly(request: PwaRequestSnapshot): boolean {
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return true;

  const pathname = request.pathname || '/';
  const search = request.search ?? '';

  if (pathname === PWA_SW_PATH || pathname.startsWith('/workbox-')) return true;
  if (pathname.startsWith('/swe-worker')) return true;
  if (pathname.startsWith(NEST_PROXY)) return true;
  if (pathname === '/api' || pathname.startsWith('/api/')) return true;
  if (pathname.includes('/_next/data/')) return true;
  if (/(?:^|[?&])_rsc=/.test(search)) return true;

  if (request.mode === 'navigate' || request.destination === 'document') {
    return true;
  }

  if (header(request.headers, 'authorization')) return true;
  if (header(request.headers, 'rsc')) return true;
  if (header(request.headers, 'next-router-state-tree')) return true;
  if (header(request.headers, 'next-url')) return true;

  return false;
}

export function shouldCacheStaticShell(request: PwaRequestSnapshot): boolean {
  if (shouldUseNetworkOnly(request)) return false;
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return false;
  return PWA_STATIC_CACHE_PATH.test(request.pathname);
}
