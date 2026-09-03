/**
 * قانون کش service worker.
 * دارایی استاتیک شِل قابل کش است. سند، payload RSC، پروکسی Nest،
 * و ترافیک API با credential همیشه `NetworkOnly` است (بدون replay آفلاین).
 */
import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';

export const PWA_OFFLINE_PATH = '/offline';
export const PWA_SW_PATH = '/sw.js';

/** شِل استاتیک هم‌مبدأ که `CacheFirst` برایش امن است — نه `/_next/static` (هش عوض می‌شود). */
export const PWA_STATIC_CACHE_PATH = /^(?:\/brand\/|\/fonts\/|\/marketing\/)/;

const NEST_PROXY = NEST_BROWSER_PROXY_PATH;

export type PwaRequestSnapshot = {
  method: string;
  pathname: string;
  search?: string;
  mode?: string;
  destination?: string;
  /** نام هدر با حروف کوچک. */
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
