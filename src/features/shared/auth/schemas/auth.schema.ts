import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';


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

export const otpSchema = z.object({
  otp: z
    .string('کد تایید الزامی است.')
    .transform((value) => persianToEnglishDigits(value).trim())
    .pipe(z.string().min(1, 'کد تایید الزامی است.').length(5, 'کد تایید باید ۵ رقم باشد.')),
});

export type OtpSchema = z.infer<typeof otpSchema>;

export const mobileSchema = z.object({
  mobile: mobileFieldSchema,
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
