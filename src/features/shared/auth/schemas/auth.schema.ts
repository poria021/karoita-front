import { z } from 'zod';

import { iranMobileFieldSchema } from '@/utils/iranMobileField';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  PASSWORD_LATIN_ONLY_HINT,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_MESSAGE,
  containsPersianOrArabicScript,
} from '@/utils/passwordInput';

const passwordFieldSchema = z
  .string('رمز عبور الزامی است.')
  .min(1, 'رمز عبور الزامی است.')
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
  .refine((value) => !containsPersianOrArabicScript(value), {
    message: PASSWORD_LATIN_ONLY_HINT,
  });

/**
 * طول OTP طبق Nest (backenddev.darkube.ir/docs).
 * همهٔ جریان‌ها (ورود، ثبت‌نام، فراموشی) همین طول را دارند — فقط همین ثابت را عوض کنید.
 */
export const BACKEND_OTP_LENGTH = 5;

export const otpSchema = z.object({
  otp: z
    .string('کد تایید الزامی است.')
    .transform((value) => persianToEnglishDigits(value).trim())
    .pipe(
      z
        .string()
        .min(1, 'کد تایید الزامی است.')
        .length(BACKEND_OTP_LENGTH, `کد تایید باید ۵ رقم باشد.`)
    ),
});

export type OtpSchema = z.infer<typeof otpSchema>;

export const mobileSchema = z.object({
  mobile: iranMobileFieldSchema,
});

export type MobileSchema = z.infer<typeof mobileSchema>;

export const loginSchema = mobileSchema.extend({
  password: passwordFieldSchema,
  remember: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const forgotResetSchema = z
  .object({
    newPassword: passwordFieldSchema,
    confirmPassword: passwordFieldSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمزها همخوانی ندارند.',
    path: ['confirmPassword'],
  });

export type ForgotResetSchema = z.infer<typeof forgotResetSchema>;

/** Nest فقط در `reset/password` OTP را می‌سنجد — کد و رمز جدید یک‌جا جمع می‌شوند. */
export const forgotOtpResetSchema = otpSchema
  .extend({
    newPassword: passwordFieldSchema,
    confirmPassword: passwordFieldSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'رمزها همخوانی ندارند.',
    path: ['confirmPassword'],
  });

export type ForgotOtpResetSchema = z.infer<typeof forgotOtpResetSchema>;

export const SELF_REGISTERABLE_ROLES = [
  'student',
  'skill_learner',
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
] as const;

export type SelfRegisterableRole = (typeof SELF_REGISTERABLE_ROLES)[number];

export const REGISTER_ROLE_LABELS: Record<SelfRegisterableRole, string> = {
  student: 'دانشجو',
  skill_learner: 'مهارت‌آموز',
  supervisor_professor: 'استاد راهنما',
  mentor_teacher: 'معلم راهنما',
  school_principal: 'مدیر مدرسه',
};

export const registerSchema = mobileSchema.extend({
  role: z.enum(SELF_REGISTERABLE_ROLES, { error: 'انتخاب نقش کاربری الزامی است.' }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
