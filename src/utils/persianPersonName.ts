/**
 * متن محصول فارسی: حروف لاتین در ورودی‌های متنی مجاز نیست
 * (به‌جز سرچ، رمز، لینک/URL و فیلدهای عددی).
 */

/** کل رشته پس از trim باید فقط نویسه‌های مجاز نام باشد. */
export const PERSIAN_PERSON_NAME_PATTERN =
  /^[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200c ]+$/;

const NON_PERSIAN_PERSON_NAME_CHARS =
  /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u200c ]/g;

const LATIN_LETTER_CHAR = /[A-Za-z]/;
const LATIN_LETTER_GLOBAL = /[A-Za-z]/g;

export const PERSIAN_PERSON_NAME_INVALID_MESSAGE =
  'فقط حروف فارسی مجاز است.';

/** هلپر زنده وقتی کاربر حروف لاتین تایپ می‌کند (هم‌تراز با KvPasswordField). */
export const LATIN_LETTERS_NOT_ALLOWED_MESSAGE =
  'استفاده از حروف انگلیسی مجاز نیست.';

export type PersianTextScriptGuard = 'none' | 'no-latin' | 'persian-name';

export function containsLatinLetters(value: string): boolean {
  return LATIN_LETTER_CHAR.test(value);
}

export function stripLatinLetters(value: string): string {
  return value.replace(LATIN_LETTER_GLOBAL, '');
}

export function isPersianPersonName(value: string): boolean {
  return value.length > 0 && PERSIAN_PERSON_NAME_PATTERN.test(value);
}

/** برای فیلد نام — لاتین/رقم/علائم را حذف می‌کند. */
export function stripNonPersianPersonNameChars(value: string): string {
  return value.replace(NON_PERSIAN_PERSON_NAME_CHARS, '');
}

/**
 * نگهبان ورودی متنی: حروف لاتین را برمی‌دارد و در صورت تلاش، پرچم خطا می‌دهد.
 * `persian-name` علاوه بر لاتین، رقم و علائم را هم حذف می‌کند.
 */
export function applyPersianTextScriptGuard(
  raw: string,
  guard: Exclude<PersianTextScriptGuard, 'none'>
): { value: string; blockedLatin: boolean } {
  const blockedLatin = containsLatinLetters(raw);
  if (guard === 'persian-name') {
    return {
      value: stripNonPersianPersonNameChars(raw),
      blockedLatin,
    };
  }
  return {
    value: stripLatinLetters(raw),
    blockedLatin,
  };
}
