import { AUTH_COOKIE_NAME, MOCK_SESSION_MARKER } from '@/lib/config';

/**
 * آیا Edge اجازه دارد cookie شبیه‌ساز (`karvita_mock_session`) را به‌عنوان
 * نشست بپذیرد؟
 *
 * این تابع هرگز throw نمی‌کند (برخلاف resolveApiMode) چون گیت Edge نباید
 * با env نامعتبر از کار بیفتد. fail-closed: فقط وقتی mock صریح یا سیگنال
 * شناخته‌شدهٔ dev باشد marker را می‌پذیریم تا در production یک cookie جعلی
 * شِل لاگین‌شده نشان ندهد.
 */
export function shouldHonorMockSessionMarker(): boolean {
  const mode = process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase();
  if (mode === 'real') return false;
  if (mode === 'mock') return true;
  if (process.env.NEXT_PUBLIC_IS_DEV === 'true') return true;
  if (process.env.NODE_ENV === 'development') return true;
  return false;
}

export type EdgeCookieReader = {
  get(name: string): { value: string } | undefined;
};

/** فقط حضور: cookie واقعی نشست، یا (فقط در mock/dev) marker شبیه‌ساز. */
export function hasEdgeClientSession(cookies: EdgeCookieReader): boolean {
  if (cookies.get(AUTH_COOKIE_NAME)?.value) return true;
  if (!shouldHonorMockSessionMarker()) return false;
  return cookies.get(MOCK_SESSION_MARKER)?.value === '1';
}
