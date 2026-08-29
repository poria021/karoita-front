import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';

/** همان قرارداد فرم ورود با رمز: ۱۰ رقم ملی، بدون صفر اول. */
export const IRAN_MOBILE_PATTERN = /^9\d{9}$/;

export const IRAN_MOBILE_REQUIRED_MESSAGE = 'شماره موبایل الزامی است.';

export const IRAN_MOBILE_FORMAT_MESSAGE =
  'فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).';

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
