/**
 * رمز عبور فقط نویسه‌های لاتین/ASCII؛ حروف فارسی/عربی در ورودی مجاز نیستند.
 */

const PERSIAN_ARABIC_SCRIPT_CHAR =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const PERSIAN_ARABIC_SCRIPT_GLOBAL =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

export const PASSWORD_LATIN_ONLY_HINT =
  'رمز عبور فقط با حروف و اعداد انگلیسی مجاز است.';

export function containsPersianOrArabicScript(value: string): boolean {
  return PERSIAN_ARABIC_SCRIPT_CHAR.test(value);
}

export function stripPersianOrArabicScript(value: string): string {
  return value.replace(PERSIAN_ARABIC_SCRIPT_GLOBAL, '');
}
