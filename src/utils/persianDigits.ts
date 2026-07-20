/**
 * تبدیل ارقام فارسی/عربی ↔ انگلیسی.
 * نمایش می‌تواند فارسی باشد؛ state فرم، Zustand و payload API همیشه English (`0-9`) است.
 */

const ENGLISH_TO_PERSIAN_DIGIT_MAP: Record<string, string> = {
  '0': '۰',
  '1': '۱',
  '2': '۲',
  '3': '۳',
  '4': '۴',
  '5': '۵',
  '6': '۶',
  '7': '۷',
  '8': '۸',
  '9': '۹',
};

const PERSIAN_AND_ARABIC_TO_ENGLISH_DIGIT_MAP: Record<string, string> = {
  '۰': '0',
  '۱': '1',
  '۲': '2',
  '۳': '3',
  '۴': '4',
  '۵': '5',
  '۶': '6',
  '۷': '7',
  '۸': '8',
  '۹': '9',
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

export function toPersianDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = typeof value === 'number' ? String(value) : value;

  return stringValue.replace(/[0-9]/g, (digit) => ENGLISH_TO_PERSIAN_DIGIT_MAP[digit] ?? digit);
}

export function persianToEnglishDigits(value: string | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  return value.replace(
    /[۰-۹٠-٩]/g,
    (digit) => PERSIAN_AND_ARABIC_TO_ENGLISH_DIGIT_MAP[digit] ?? digit
  );
}
