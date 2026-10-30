/**
 * تصمیم‌های keep-alive نشست پس از idle تب — بدون React/DOM سنگین.
 * هدف: قبل از کلیک ماژول، access را گرم کنیم تا اولین درخواست ۴۰۱ نخورد.
 */

import type { RuntimeAuthBoot } from '@/store/sessionBoot';

export type SessionKeepAliveInput = {
  boot: RuntimeAuthBoot | null;
  /** خروجی `msUntilAccessRefreshNeeded` — null یعنی حافظه خالی است. */
  msUntilRefresh: number | null;
  visibilityState: DocumentVisibilityState;
};

/** وقتی تب مرئی و boot احراز شده و توکن منقضی/غایب است، refresh بزن. */
export function shouldWarmAccessToken(input: SessionKeepAliveInput): boolean {
  if (input.visibilityState !== 'visible') return false;
  if (input.boot !== 'authenticated') return false;
  if (input.msUntilRefresh === null) return true;
  return input.msUntilRefresh <= 0;
}

/**
 * تایمر بعدی برای refresh پیش از انقضا؛ null یعنی الان warm کن یا چیزی برای زمان‌بندی نیست.
 */
export function nextAccessRefreshDelayMs(msUntilRefresh: number | null): number | null {
  if (msUntilRefresh === null || msUntilRefresh <= 0) return null;
  return msUntilRefresh;
}
