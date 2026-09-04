import { NEST_BROWSER_PROXY_PATH } from '@/lib/nest-proxy';
import {
  FILE_MEDIA_PATH,
  isAllowedSignedUploadTarget,
} from '@/lib/signed-upload-target';

const ABSOLUTE_MEDIA = /^(https?:|data:|blob:)/i;

export function isBrowsableMediaUrl(url: string): boolean {
  const trimmed = url.trim();
  if (ABSOLUTE_MEDIA.test(trimmed)) return true;
  return trimmed.startsWith(`${FILE_MEDIA_PATH}?`) || trimmed === FILE_MEDIA_PATH;
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

/** `bucket.s3.amazonaws.com` یا `bucket.s3.eu-west-1.amazonaws.com`. */
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
 * Nest `FileType` GET را روی endpoint پیش‌فرض AWS (`*.amazonaws.com`) امضا می‌کند حتی اگر باکت S3-compatible باشد.
 * باز کردن آن URL کلید غیرآمازون را به Amazon می‌فرستد → `InvalidAccessKeyId`. مبدأ را به `NEXT_PUBLIC_S3_URL` برگردان.
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

  // امضای GET روی همان مبدأ باکت را نگه دار؛ بدون query روی باکت خصوصی تصویر خالی است.
  if (parsed.origin === publicOrigin && hasAwsSignatureQuery(parsed)) {
    return parsed.toString();
  }

  return raw;
}

/**
 * `<img>` نمی‌تواند Bearer بفرستد؛ GET باکت را از `/api/files/media` هم‌مبدأ می‌خوانیم.
 */
export function toSameOriginMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith(FILE_MEDIA_PATH)) return trimmed;
  if (!isAllowedSignedUploadTarget(trimmed)) return trimmed;
  return `${FILE_MEDIA_PATH}?src=${encodeURIComponent(trimmed)}`;
}

/**
 * `FileType.path` معمولاً فقط کلید S3 است نه URL؛ اگر مستقیم در `<img src>` برود نسبت به صفحه resolve می‌شود.
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
  if (raw.startsWith(FILE_MEDIA_PATH)) return raw;

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
