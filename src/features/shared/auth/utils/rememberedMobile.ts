import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Login "مرا به خاطر بسپار" persists only the mobile number (English digits).
 * Never store passwords — browsers must not be asked to save credentials either
 * (login form uses autocomplete=off; see LoginPasswordStep).
 */
const REMEMBERED_MOBILE_KEY = 'karvita_remembered_mobile';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** Normalize to 10 English digits starting with 9, or empty if invalid shape. */
export function normalizeRememberedMobile(raw: string): string {
  const digits = persianToEnglishDigits(raw).replace(/\D/g, '').slice(0, 10);
  if (digits.length === 10 && digits.startsWith('9')) return digits;
  if (digits.length === 11 && digits.startsWith('09')) return digits.slice(1);
  return digits.length > 0 ? digits.slice(0, 10) : '';
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
  } catch {
    // ignore quota / private mode
  }
}

export function clearRememberedMobile(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(REMEMBERED_MOBILE_KEY);
  } catch {
    // ignore
  }
}
