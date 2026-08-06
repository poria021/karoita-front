/**
 * رمز عبور فقط نویسه‌های لاتین/ASCII؛ حروف فارسی/عربی در ورودی مجاز نیستند.
 * حداقل طول در تمام فرم‌های محصول یکسان است (لاگین، امنیت، ساخت کاربر ادمین).
 */

const PERSIAN_ARABIC_SCRIPT_CHAR =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const PERSIAN_ARABIC_SCRIPT_GLOBAL =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g;

/** Product-wide password floor — keep schemas + mock seeds in sync. */
export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_MIN_LENGTH_MESSAGE =
  'رمز عبور باید حداقل ۸ کاراکتر باشد.';

/** Live + schema error when Persian/Arabic letters are entered. */
export const PASSWORD_LATIN_ONLY_HINT =
  'استفاده از حروف فارسی در رمز عبور مجاز نیست؛ فقط حروف و اعداد انگلیسی وارد کنید.';

export function containsPersianOrArabicScript(value: string): boolean {
  return PERSIAN_ARABIC_SCRIPT_CHAR.test(value);
}

export function stripPersianOrArabicScript(value: string): string {
  return value.replace(PERSIAN_ARABIC_SCRIPT_GLOBAL, '');
}
