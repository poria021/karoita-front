import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  PASSWORD_LATIN_ONLY_HINT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  containsPersianOrArabicScript,
} from '@/utils/passwordInput';

const securityPasswordField = z
  .string('رمز عبور الزامی است.')
  .min(1, 'رمز عبور الزامی است.')
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
  .refine((value) => !containsPersianOrArabicScript(value), {
    message: PASSWORD_LATIN_ONLY_HINT,
  });

export const securityPasswordSchema = z
  .object({
    newPassword: securityPasswordField,
    confirmPassword: securityPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمزها همخوانی ندارند.',
    path: ['confirmPassword'],
  });

export type SecurityPasswordSchema = z.infer<typeof securityPasswordSchema>;

export const securityOtpSchema = z.object({
  otp: z
    .string('کد تایید الزامی است.')
    .transform((value) => persianToEnglishDigits(value).trim())
    .pipe(
      z
        .string()
        .min(1, 'کد تایید الزامی است.')
        .length(5, 'کد تایید باید ۵ رقم باشد.')
    ),
});

export type SecurityOtpSchema = z.infer<typeof securityOtpSchema>;
