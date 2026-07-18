/**
 * Central API mode resolution (mock vs real).
 *
 * Contract for juniors:
 * - `mock` = local simulator (localStorage + fixed OTP). NOT Nest.
 * - `real` = Nest / Better-Auth path. Mock secrets must never succeed here.
 * - Production never silently runs mock (fail closed).
 */

export type ApiMode = 'mock' | 'real';

/** Shown in errors/UI so mock is never confused with Nest. */
export const MOCK_MODE_LABEL = 'شبیه‌ساز محلی (mock)';

function readRawMode(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase();
  return raw || undefined;
}

/** NODE_ENV or Vercel production — either means mock is forbidden. */
function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  );
}

/**
 * Resolves mock/real for the current build.
 * - Explicit `mock` | `real` respected in development.
 * - Unset in production → `real`.
 * - Explicit `mock` in production → throws (fail closed).
 * - Unset in development → `mock` for local DX.
 */
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
 * Call at the top of every mock-only code path.
 * Prefer over trusting a module-level `IS_MOCK_MODE` alone when accepting secrets.
 */
export function assertMockApiMode(): void {
  if (!isMockApiMode()) {
    throw new Error(
      `این عملیات فقط در ${MOCK_MODE_LABEL} مجاز است، نه در اتصال به Nest.`
    );
  }
}

/**
 * Defense-in-depth for OTP / credential paths that will later call Nest.
 * Ensures the fixed mock OTP can never be treated as a real credential.
 */
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

/** Persian message for features not yet wired to Nest. */
export const REAL_MODE_NOT_IMPLEMENTED =
  'این قابلیت هنوز به API واقعی متصل نشده است. (حالت real — شبیه‌ساز mock نیست.)';
