import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';

const ABSOLUTE_MEDIA = /^(https?:|data:|blob:)/i;

export function isBrowsableMediaUrl(url: string): boolean {
  return ABSOLUTE_MEDIA.test(url.trim());
}

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

function envS3Base(): string {
  return trimSlash(process.env.NEXT_PUBLIC_S3_URL?.trim() ?? '');
}

function envApiBase(): string {
  return trimSlash(process.env.NEXT_PUBLIC_API_URL?.trim() ?? '');
}

function isAwsS3Host(hostname: string): boolean {
  return /\.amazonaws\.com$/i.test(hostname) && /s3/i.test(hostname);
}

/** bucket.s3.amazonaws.com or bucket.s3.eu-west-1.amazonaws.com */
function virtualHostedS3Bucket(hostname: string): string | null {
  const match = hostname.match(
    /^(.+)\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i
  );
  return match?.[1] ?? null;
}

function hasAwsSignatureQuery(url: URL): boolean {
  return (
    url.searchParams.has('X-Amz-Algorithm') ||
    url.searchParams.has('X-Amz-Credential') ||
    url.searchParams.has('AWSAccessKeyId') ||
    url.searchParams.has('Signature')
  );
}

/**
 * Nest FileType @Transform signs GET against the AWS SDK default endpoint
 * (often *.amazonaws.com) even when the real bucket is S3-compatible (HS3).
 * Opening that signed URL sends a non-AWS access key to Amazon → InvalidAccessKeyId.
 * Rebase onto NEXT_PUBLIC_S3_URL and drop the AWS signature query.
 */
function rebaseAwsUrlToPublicS3(raw: string, s3Base: string): string {
  if (!s3Base) return raw;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return raw;
  }

  const publicOrigin = new URL(s3Base.endsWith('/') ? s3Base : `${s3Base}/`).origin;

  if (isAwsS3Host(parsed.hostname)) {
    const bucket = virtualHostedS3Bucket(parsed.hostname);
    let objectPath = parsed.pathname || '/';
    if (
      bucket &&
      objectPath !== `/${bucket}` &&
      !objectPath.startsWith(`/${bucket}/`)
    ) {
      objectPath = `/${bucket}${objectPath.startsWith('/') ? objectPath : `/${objectPath}`}`;
    }
    return `${trimSlash(s3Base)}/${objectPath.replace(/^\/+/, '')}`;
  }

  // Same storage origin as NEXT_PUBLIC_S3_URL but still carrying a PUT/GET
  // signature — drop the query so the browser does a normal GET.
  if (parsed.origin === publicOrigin && hasAwsSignatureQuery(parsed)) {
    parsed.search = '';
    return parsed.toString();
  }

  return raw;
}

/**
 * Nest `FileType.path` از درایور S3 presigned معمولاً فقط کلید آبجکت است
 * (مثلاً `abc.jpg`)، نه URL. همان مقدار اگر مستقیم در `<img src>` برود
 * نسبت به صفحهٔ جاری resolve می‌شود و هم پیش‌نمایش و هم تب جدید ۴۰۴ می‌شود.
 *
 * URL امضاشدهٔ AWS روی amazonaws.com را به مبدأ عمومی باکت برمی‌گردانیم.
 */
export function resolveNestFileUrl(
  path: string | null | undefined,
  bases?: { s3Base?: string; apiBase?: string }
): string | null {
  const raw = path?.trim();
  if (!raw) return null;

  const s3Base = trimSlash(bases?.s3Base ?? envS3Base());
  const apiBase = trimSlash(bases?.apiBase ?? envApiBase());

  if (raw.startsWith('data:') || raw.startsWith('blob:')) return raw;

  if (/^https?:/i.test(raw)) {
    return rebaseAwsUrlToPublicS3(raw, s3Base);
  }

  const key = raw.replace(/^\//, '');

  const isNestFilesPath =
    raw.startsWith('/api/') ||
    key.startsWith('api/') ||
    key.startsWith('v1/files/');

  if (isNestFilesPath) {
    const nestPath = key.replace(/^api\/?/, '');
    if (bases?.apiBase) {
      return `${trimSlash(bases.apiBase)}/${nestPath}`;
    }
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${NEST_BROWSER_PROXY_PATH}/${nestPath}`;
    }
    if (apiBase) return `${apiBase}/${nestPath}`;
  }

  if (s3Base) {
    return `${s3Base}/${key}`;
  }

  return raw;
}
