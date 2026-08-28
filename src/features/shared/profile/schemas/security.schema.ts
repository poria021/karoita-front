import { z } from 'zod';

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

export const securityChangePasswordSchema = z
  .object({
    oldPassword: z
      .string('رمز عبور فعلی الزامی است.')
      .min(1, 'رمز عبور فعلی الزامی است.'),
    newPassword: securityPasswordField,
    confirmPassword: securityPasswordField,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمزها همخوانی ندارند.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: 'رمز جدید باید با رمز فعلی متفاوت باشد.',
    path: ['newPassword'],
  });

export type SecurityChangePasswordSchema = z.infer<
  typeof securityChangePasswordSchema
>;
