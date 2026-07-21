/**
 * اعتبارسنجی `returnUrl` برای جلوگیری از open-redirect.
 * فقط مسیر نسبی هم‌مبدأ (`/...`) پذیرفته می‌شود؛ `/auth/*` رد می‌شود.
 */

import { isAuthPath } from '@/services/route.service';

export const RETURN_URL_PARAM = 'returnUrl';

const MAX_RETURN_URL_LENGTH = 512;

export function parseSafeReturnUrl(
  raw: string | null | undefined
): string | null {
  if (raw == null) return null;

  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > MAX_RETURN_URL_LENGTH) return null;

  let decoded: string;
  try {
    decoded = decodeURIComponent(trimmed);
  } catch {
    return null;
  }

  if (!decoded.startsWith('/')) return null;
  if (decoded.startsWith('//')) return null;
  if (decoded.includes('\\')) return null;
  if (/[\u0000-\u001F\u007F]/.test(decoded)) return null;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) return null;

  let url: URL;
  try {
    url = new URL(decoded, 'http://karvita.local');
  } catch {
    return null;
  }

  if (url.origin !== 'http://karvita.local') return null;

  const pathWithSearch = `${url.pathname}${url.search}`;
  if (isAuthPath(pathWithSearch)) return null;

  return pathWithSearch;
}

export function buildLoginHref(
  loginPath: string,
  intendedPath?: string | null
): string {
  const safe = parseSafeReturnUrl(intendedPath);
  if (!safe) return loginPath;
  const params = new URLSearchParams();
  params.set(RETURN_URL_PARAM, safe);
  return `${loginPath}?${params.toString()}`;
}

export function readReturnUrlParam(
  searchParams: URLSearchParams | { get(name: string): string | null }
): string | null {
  return parseSafeReturnUrl(searchParams.get(RETURN_URL_PARAM));
}
