/**
 * پروکسی هم‌مبدا مرورگر تا CORS نست را نبندد.
 * با `_` شروع نشود — در App Router پوشهٔ `_` route نیست و روی سرور ۴۰۴ می‌شود.
 */
export const NEST_BROWSER_PROXY_PATH = '/api/nest';

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
