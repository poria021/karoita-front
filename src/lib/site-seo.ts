/**
 * URL عمومی سایت و متن SEO برای سطح مارکتینگ.
 * در production ترجیح با `NEXT_PUBLIC_SITE_URL` است؛ وگرنه Vercel / localhost.
 */

export const SITE_NAME = 'کارویتا';

export const SITE_TITLE =
  'کارویتا | سامانه جامع آموزش نظری، مهارتی و مدیریت کارورزی';

export const SITE_DESCRIPTION =
  'سامانه کارویتا؛ زیرساخت هوشمند آموزش نظری و مهارتی برای دانشگاه‌ها، آموزش‌و‌پرورش و مدیریت یکپارچه کارورزی در سراسر کشور.';

export const SITE_OG_IMAGE = '/brand/og-image.png';

export const SITE_FAVICON = '/brand/favicon.png';

export const SITE_FAVICON_SIZES = [
  { url: '/brand/favicon-32.png', sizes: '32x32' },
  { url: '/brand/favicon-48.png', sizes: '48x48' },
  { url: '/brand/favicon.png', sizes: '64x64' },
  { url: '/brand/pwa-icon-192.png', sizes: '192x192' },
] as const;

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
