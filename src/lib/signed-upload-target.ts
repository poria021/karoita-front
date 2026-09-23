/**
 * هدف PUT امضاشده — جلوگیری از SSRF روی `/api/files/signed-put`.
 */

export const SIGNED_PUT_PATH = '/api/files/signed-put';
export const SIGNED_PUT_URL_HEADER = 'x-karvita-signed-url';
/** GET تصویر/فایل از باکت خصوصی از طریق همین مبدأ (نشست لازم است). */
export const FILE_MEDIA_PATH = '/api/files/media';

function isRecordHostnameIpv4(hostname: string): number[] | null {
  const parts = hostname.split('.');
  if (parts.length !== 4) return null;
  const bytes = parts.map((part) => Number(part));
  if (bytes.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)) {
    return null;
  }
  return bytes;
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host === '::1' || host === '0.0.0.0') return true;
  if (host.endsWith('.local') || host.endsWith('.internal')) return true;
  const ipv4 = isRecordHostnameIpv4(host);
  if (!ipv4) return false;
  const [a, b] = ipv4;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
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

function envOrigin(name: string): string | null {
  const raw = process.env[name]?.trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function isDevRuntime(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * URL امضاشدهٔ Nest برای PUT بایت فایل.
 * https + امضای S3؛ IP خصوصی در production بسته است.
 */
export function isAllowedSignedUploadTarget(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  const isLocalHttp =
    isDevRuntime() &&
    url.protocol === 'http:' &&
    isPrivateOrLocalHostname(url.hostname);
  if (url.protocol !== 'https:' && !isLocalHttp) return false;

  if (!isDevRuntime() && isPrivateOrLocalHostname(url.hostname)) {
    return false;
  }

  const s3Origin = envOrigin('NEXT_PUBLIC_S3_URL');
  if (s3Origin && url.origin === s3Origin) return true;

  return hasAwsSignatureQuery(url);
}
