import { persianToEnglishDigits } from '@/utils/persianDigits';

/** ۰=شنبه … ۵=پنجشنبه — همان قرارداد ظرفیت استاد. */
export const NEST_DAY_FA: readonly string[] = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(persianToEnglishDigits(value.trim()));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function namedTitle(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  // GET /professors university آرایه‌ای از {id, title} است — اولین عنصر را بگیر.
  if (Array.isArray(value)) return namedTitle(value[0]);
  if (!isRecord(value)) return '';
  return (
    asTrimmedString(value.title) ||
    asTrimmedString(value.name) ||
    asTrimmedString(value.title_fa)
  );
}

/** برخلاف `namedTitle` (مدرسه/استان)، سند استاد/کاربر معمولاً firstName/lastName دارد نه title. */
export function personDisplayName(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!isRecord(value)) return '';
  const first = asTrimmedString(value.firstName);
  const last = asTrimmedString(value.lastName);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || asTrimmedString(value.name) || namedTitle(value);
}

export function firstOf(
  value: string | string[] | undefined,
  fallback: string
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}
