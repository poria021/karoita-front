/**
 * Central API mode resolution (mock vs real).
 * Production never silently runs mock.
 */

export type ApiMode = 'mock' | 'real';

function readRawMode(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_API_MODE?.trim().toLowerCase();
  return raw || undefined;
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
  const isProd = process.env.NODE_ENV === 'production';

  if (raw === 'mock') {
    if (isProd) {
      throw new Error(
        'حالت mock در production مجاز نیست. NEXT_PUBLIC_API_MODE=real و NEXT_PUBLIC_API_URL را تنظیم کنید.'
      );
    }
    return 'mock';
  }

  if (raw === 'real') {
    return 'real';
  }

  return isProd ? 'real' : 'mock';
}

export function isMockApiMode(): boolean {
  return resolveApiMode() === 'mock';
}

export function isRealApiMode(): boolean {
  return resolveApiMode() === 'real';
}

/** Persian message for features not yet wired to Nest. */
export const REAL_MODE_NOT_IMPLEMENTED =
  'این قابلیت هنوز به API واقعی متصل نشده است.';
