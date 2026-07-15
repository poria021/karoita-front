import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';

/**
 * Zod schemas for the shared authentication feature (rule 10).
 *
 * Digit fields are normalized through `persianToEnglishDigits` via a
 * `.transform().pipe()` step (instead of `z.preprocess`, whose static input
 * type is always `unknown` and breaks `zodResolver` <-> `useForm` typing) so
 * a user typing Persian/Arabic numerals never fails validation. Every error
 * message is written in fluent, natural Persian.
 */

/** Iranian mobile number without the leading zero/country code (e.g. `9123456789`). */
const mobileFieldSchema = z
  .string('شماره موبایل الزامی است.')
  .transform((value) => persianToEnglishDigits(value).trim())
  .pipe(
    z
      .string()
      .min(1, 'شماره موبایل الزامی است.')
      .regex(/^9\d{9}$/, 'فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).')
  );

const passwordFieldSchema = z
  .string('رمز عبور الزامی است.')
  .min(1, 'رمز عبور الزامی است.')
  .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.');

/** 5-digit SMS verification code, shared by the login-OTP and registration-OTP steps. */
export const otpSchema = z.object({
  otp: z
    .string('کد تایید الزامی است.')
    .transform((value) => persianToEnglishDigits(value).trim())
    .pipe(z.string().min(1, 'کد تایید الزامی است.').length(5, 'کد تایید باید ۵ رقم باشد.')),
});

export type OtpSchema = z.infer<typeof otpSchema>;

/** Mobile-only step, reused by the OTP-login request step. */
export const mobileSchema = z.object({
  mobile: mobileFieldSchema,
});

export type MobileSchema = z.infer<typeof mobileSchema>;

/** Credential (mobile + password) login form. */
export const loginSchema = mobileSchema.extend({
  password: passwordFieldSchema,
  remember: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

/** Step 3 of password recovery: new password + matching confirmation. */
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

/** Public, self-service roles offered on the registration wizard (see `original-karvita.html`). */
export const SELF_REGISTERABLE_ROLES = [
  'student',
  'skill_learner',
  'supervisor_professor',
  'mentor_teacher',
  'school_principal',
] as const;

export type SelfRegisterableRole = (typeof SELF_REGISTERABLE_ROLES)[number];

/** Farsi labels for the registration role selector. */
export const REGISTER_ROLE_LABELS: Record<SelfRegisterableRole, string> = {
  student: 'دانشجو',
  skill_learner: 'مهارت‌آموز',
  supervisor_professor: 'استاد راهنما',
  mentor_teacher: 'معلم راهنما',
  school_principal: 'مدیر مدرسه',
};

/** Step 1 of registration: mobile number + user role. */
export const registerSchema = mobileSchema.extend({
  role: z.enum(SELF_REGISTERABLE_ROLES, { error: 'انتخاب نقش کاربری الزامی است.' }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
