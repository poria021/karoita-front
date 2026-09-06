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
    url.searchParams.has('X-Amz-Signature') ||
    url.searchParams.has('AWSAccessKeyId') ||
    url.searchParams.has('AccessKeyId') ||
    url.searchParams.has('Signature')
  );
}

/**
 * Nest `FileType` GET را روی endpoint پیش‌فرض AWS (`*.amazonaws.com`) امضا می‌کند حتی اگر باکت S3-compatible باشد.
 * امضا برای Host آمازون است؛ روی `NEXT_PUBLIC_S3_URL` باید بدون query و با کلید آبجکت GET شود.
 */
function rebaseAwsUrlToPublicS3(raw: string, s3Base: string): string {
  const candidates = storageFetchUrlCandidates(raw, { s3Base });
  return candidates[0] ?? raw;
}

/**
 * URLهایی که سرور باید برای GET بایت امتحان کند.
 * `bucket.s3.amazonaws.com/key` معمولاً کلید را روی مبدأ عمومی باکت می‌گذارد، نه روی خود آمازون.
 */
export function storageFetchUrlCandidates(
  raw: string,
  bases?: { s3Base?: string }
): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  const s3Base = trimSlash(bases?.s3Base ?? envS3Base());
  const seen = new Set<string>();
  const out: string[] = [];

  const add = (value: string) => {
    const url = value.trim();
    if (!url || seen.has(url)) return;
    seen.add(url);
    out.push(url);
  };

  let parsed: URL | null = null;
  try {
    parsed = new URL(trimmed);
  } catch {
    add(trimmed);
    return out;
  }

  if (isAwsS3Host(parsed.hostname) && s3Base) {
    const key = parsed.pathname.replace(/^\/+/, '');
    if (key) add(`${s3Base}/${key}`);
    const bucket = virtualHostedS3Bucket(parsed.hostname);
    if (bucket && key && !key.startsWith(`${bucket}/`)) {
      add(`${s3Base}/${bucket}/${key}`);
    }
    // Keep the original signed URL as fallback so the media proxy can access
    // private-bucket objects when the unsigned rebased URL returns 403.
    if (hasAwsSignatureQuery(parsed)) add(trimmed);
    return out;
  }

  const publicOrigin = s3Base
    ? new URL(s3Base.endsWith('/') ? s3Base : `${s3Base}/`).origin
    : '';
  if (parsed.origin === publicOrigin && hasAwsSignatureQuery(parsed)) {
    add(parsed.toString());
    parsed.search = '';
    add(parsed.toString());
    return out;
  }

  add(trimmed);
  return out;
}

/**
 * `<img>` نمی‌تواند Bearer بفرستد؛ GET باکت را از `/api/files/media` هم‌مبدأ می‌خوانیم.
 */
export function toSameOriginMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  if (trimmed.startsWith(FILE_MEDIA_PATH)) return trimmed;
  const resolved = resolveNestFileUrl(trimmed) ?? trimmed;
  // Prefer the original URL when it qualifies (preserves AWS signatures so the
  // media proxy can fall back to private-bucket signed access).  Only use the
  // rebased/resolved URL when the original doesn't pass the allowlist check.
  const wrapTarget = isAllowedSignedUploadTarget(trimmed)
    ? trimmed
    : isAllowedSignedUploadTarget(resolved)
      ? resolved
      : null;
  if (!wrapTarget) return resolved;
  return `${FILE_MEDIA_PATH}?src=${encodeURIComponent(wrapTarget)}`;
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
