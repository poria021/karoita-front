/**
 * تعیین حالت API (`mock` | `real`) از روی env.
 * در production حالت mock صریحاً ممنوع است (fail-closed).
 *
 * `real` همیشه fail-closed است — چه در dev چه در production — هر endpoint
 * پیاده‌نشده throw می‌کند. هیچ داده‌ی نمایشی/mock fallback در real mode وجود ندارد.
 */

export type ApiMode = 'mock' | 'real';

export const MOCK_MODE_LABEL = 'شبیه‌ساز محلی (mock)';

function readRawMode(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase();
  return raw || undefined;
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function resolveApiMode(): ApiMode {
  const raw = readRawMode();
  const isProd = isProductionRuntime();

  if (raw === 'mock') {
    if (isProd) {
      throw new Error(
        `حالت ${MOCK_MODE_LABEL} در production مجاز نیست. NEXT_PUBLIC_API_MODE=real و NEXT_PUBLIC_API_URL را تنظیم کنید.`
      );
    }
    return 'mock';
  }

  if (raw === 'real') {
    return 'real';
  }

  if (raw && raw !== 'mock' && raw !== 'real') {
    throw new Error(
      `NEXT_PUBLIC_API_MODE نامعتبر است («${raw}»). فقط mock یا real مجاز است.`
    );
  }

  return isProd ? 'real' : 'mock';
}

export function isMockApiMode(): boolean {
  return resolveApiMode() === 'mock';
}

export function isRealApiMode(): boolean {
  return resolveApiMode() === 'real';
}

/**
 * Snapshot برای Facadeهایی که نباید env را در هر متد دوباره parse کنند.
 * تست‌هایی که mid-suite بین mock/real سوئیچ می‌کنند باید `isMockApiMode()` صدا بزنند.
 */
export const IS_MOCK_MODE = isMockApiMode();

export function assertMockApiMode(): void {
  if (!isMockApiMode()) {
    throw new Error(
      `این عملیات فقط در ${MOCK_MODE_LABEL} مجاز است، نه در اتصال به Nest.`
    );
  }
}

export function assertRealModeRejectsMockSecret(
  value: string,
  mockSecret: string,
  secretKind = 'OTP'
): void {
  if (!isRealApiMode()) return;
  if (value === mockSecret) {
    throw new Error(
      `${secretKind} مربوط به ${MOCK_MODE_LABEL} در حالت real پذیرفته نمی‌شود.`
    );
  }
}

export const REAL_MODE_NOT_IMPLEMENTED =
  'این قابلیت هنوز به API واقعی متصل نشده است. (حالت real — شبیه‌ساز mock نیست.)';

export function throwRealModeNotImplemented(surface?: string): never {
  if (surface && process.env.NODE_ENV !== 'production') {
    console.warn(`[real-mode stub] ${surface}`);
  }
  throw new Error(REAL_MODE_NOT_IMPLEMENTED);
}
