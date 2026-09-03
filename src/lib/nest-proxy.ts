/** پروکسی هم‌مبدا مرورگر تا CORS نست localhost را نبندد. */
export const NEST_BROWSER_PROXY_PATH = '/__nest-api';

function trimSlash(value: string): string {
  return value.replace(/\/$/, '');
}

/**
 * آدرس Nest روی سرور. `BACKEND_INTERNAL_URL` اینلاین نمی‌شود پس روی Darkube
 * بعد از بیلد هم کار می‌کند؛ `NEXT_PUBLIC_API_URL` ممکن است موقع بیلد خالی بماند.
 */
export function readNestApiBaseUrl(): string {
  const internal = process.env.BACKEND_INTERNAL_URL?.trim();
  if (internal) return trimSlash(internal);
  return trimSlash(process.env.NEXT_PUBLIC_API_URL?.trim() ?? '');
}
