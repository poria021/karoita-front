import { sanitizeIranMobileNationalInput } from '@/utils/iranMobileField';

const REMEMBERED_MOBILE_KEY = 'karvita_remembered_mobile';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function normalizeRememberedMobile(raw: string): string {
  return sanitizeIranMobileNationalInput(raw);
}

export function readRememberedMobile(): string {
  if (!isBrowser()) return '';
  try {
    const stored = window.localStorage.getItem(REMEMBERED_MOBILE_KEY);
    return stored ? normalizeRememberedMobile(stored) : '';
  } catch {
    return '';
  }
}

export function writeRememberedMobile(mobile: string): void {
  if (!isBrowser()) return;
  const normalized = normalizeRememberedMobile(mobile);
  if (!normalized) {
    clearRememberedMobile();
    return;
  }
  try {
    window.localStorage.setItem(REMEMBERED_MOBILE_KEY, normalized);
  } catch {}
}

export function clearRememberedMobile(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(REMEMBERED_MOBILE_KEY);
  } catch {}
}
