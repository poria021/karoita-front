/**
 * Public site URL + SEO copy for marketing surfaces.
 * Prefer NEXT_PUBLIC_SITE_URL in production; fall back to Vercel / localhost.
 */

export const SITE_NAME = 'کارویتا';

export const SITE_TITLE =
  'کارویتا | سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی';

export const SITE_DESCRIPTION =
  'سامانه کارویتا؛ زیرساخت هوشمند آموزش نظری و مهارتی برای دانشگاه‌ها، آموزش‌و‌پرورش و مدیریت یکپارچه کارورزی در سراسر کشور.';

export const SITE_OG_IMAGE = '/brand/karvita-wordmark.png';

/** Favicon واحد — همان مارک برند (`public/brand/karvita-mark.png`). */
export const SITE_FAVICON = '/brand/karvita-mark.png';

export function getSiteUrl(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return toAbsoluteUrl(fromEnv);
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return toAbsoluteUrl(vercel.startsWith('http') ? vercel : `https://${vercel}`);
  }

  return new URL('http://localhost:3000');
}

function toAbsoluteUrl(raw: string): URL {
  const normalized = raw.replace(/\/+$/, '');
  try {
    return new URL(normalized.includes('://') ? normalized : `https://${normalized}`);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export function absoluteSiteUrl(pathname = '/'): string {
  const base = getSiteUrl();
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return new URL(path, base).toString();
}
