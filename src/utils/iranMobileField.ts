import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';

/** همان قرارداد فرم ورود با رمز: ۱۰ رقم ملی، بدون صفر اول. */
export const IRAN_MOBILE_PATTERN = /^9\d{9}$/;

/** ورودی ناقص همان ریجکس: باید با ۹ شروع شود، حداکثر ۱۰ رقم. */
export const IRAN_MOBILE_INPUT_PATTERN = /^9\d{0,9}$/;

export const IRAN_MOBILE_REQUIRED_MESSAGE = 'شماره موبایل الزامی است.';

export const IRAN_MOBILE_FORMAT_MESSAGE =
  'فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).';

export const IRAN_MOBILE_PREFIX_MESSAGE =
  'شماره موبایل باید با رقم ۹ شروع شود (صفر اول نیازی نیست).';

/**
 * رقم‌های ملی برای فیلد «۹۸+»: صفر اول و رقم‌های غیر۹ در ابتدا حذف می‌شوند.
 */
export function sanitizeIranMobileNationalInput(rawValue: string): string {
  const digits = persianToEnglishDigits(rawValue).replace(/\D/g, '');
  const withoutLeadingZeros = digits.replace(/^0+/, '');
  const fromNine = withoutLeadingZeros.replace(/^[^9]+/, '').slice(0, 10);
  if (fromNine === '' || IRAN_MOBILE_INPUT_PATTERN.test(fromNine)) {
    return fromNine;
  }
  return '';
}

/**
 * true وقتی اولین رقم معنادار (بعد از حذف صفرهای ابتدایی) چیزی جز ۹ باشد؛
 * برای نمایش پیام خطای زنده به‌جای حذف بی‌صدای ورودی.
 */
export function hasInvalidIranMobilePrefix(rawValue: string): boolean {
  const digits = persianToEnglishDigits(rawValue).replace(/\D/g, '');
  const withoutLeadingZeros = digits.replace(/^0+/, '');
  return withoutLeadingZeros !== '' && withoutLeadingZeros[0] !== '9';
}

/**
 * نرمال‌سازی و اعتبار شماره مثل `loginSchema.mobile`.
 * رقم فارسی→انگلیسی و trim؛ جداکننده و صفر اول قبول نیست.
 */
export const iranMobileFieldSchema = z
  .string(IRAN_MOBILE_REQUIRED_MESSAGE)
  .transform((value) => persianToEnglishDigits(value).trim())
  .pipe(
    z
      .string()
      .min(1, IRAN_MOBILE_REQUIRED_MESSAGE)
      .regex(IRAN_MOBILE_PATTERN, IRAN_MOBILE_FORMAT_MESSAGE)
  );
