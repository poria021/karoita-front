/**
 * English <-> Persian/Arabic digit conversion utilities.
 *
 * Per rule 10 (TypeScript & Schema Standards), any numeric/identifier string
 * fed into a Zod schema must first be normalized via `persianToEnglishDigits`.
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

/**
 * Safely converts English digits inside `value` to their Persian equivalents.
 * Returns an empty string for `null`/`undefined` input rather than throwing.
 */
export function toPersianDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = typeof value === 'number' ? String(value) : value;

  return stringValue.replace(/[0-9]/g, (digit) => ENGLISH_TO_PERSIAN_DIGIT_MAP[digit] ?? digit);
}

/**
 * Converts Persian and Arabic digits inside `value` to English digits.
 * Intended to run as a Zod `z.preprocess` step before numeric/identifier
 * parsing so user-typed Persian numerals never fail validation.
 */
export function persianToEnglishDigits(value: string | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  return value.replace(
    /[۰-۹٠-٩]/g,
    (digit) => PERSIAN_AND_ARABIC_TO_ENGLISH_DIGIT_MAP[digit] ?? digit
  );
}
