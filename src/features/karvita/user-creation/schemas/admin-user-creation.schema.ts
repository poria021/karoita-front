import { z } from 'zod';

import { ORG_ACCOUNT_ROLES } from '@/types/admin-user-creation';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import {
  orgAccountRequiresCity,
  orgAccountRequiresCollege,
  orgAccountRequiresDistrict,
  orgAccountRequiresProvince,
} from '@/utils/roleFieldStrategy';

const mobileField = z
  .string('شماره موبایل الزامی است.')
  .transform((value) => persianToEnglishDigits(value).replace(/\D/g, ''))
  .pipe(
    z
      .string()
      .min(1, 'شماره موبایل الزامی است.')
      .regex(/^9\d{9}$/, 'فرمت شماره موبایل معتبر نیست (۱۰ رقم بدون صفر اول).')
  );

export const adminUserCreationSchema = z
  .object({
    firstName: z
      .string('نام الزامی است.')
      .trim()
      .min(1, 'نام کارشناس الزامی است.'),
    lastName: z
      .string('نام خانوادگی الزامی است.')
      .trim()
      .min(1, 'نام خانوادگی کارشناس الزامی است.'),
    mobile: mobileField,
    password: z
      .string('رمز عبور الزامی است.')
      .trim()
      .min(4, 'رمز عبور الزامی است (حداقل ۴ کاراکتر).'),
    role: z.enum(ORG_ACCOUNT_ROLES, {
      error: 'انتخاب نقش سازمانی الزامی است.',
    }),
    province: z.string(),
    city: z.string(),
    college: z.string(),
    district: z.string(),
  })
  .superRefine((data, ctx) => {
    if (orgAccountRequiresProvince(data.role) && !data.province.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['province'],
        message: 'انتخاب استان الزامی است.',
      });
    }

    if (orgAccountRequiresCollege(data.role) && !data.college.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['college'],
        message: 'انتخاب دانشکده / پردیس الزامی است.',
      });
    }

    if (orgAccountRequiresCity(data.role) && !data.city.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['city'],
        message: 'انتخاب شهر تابعه الزامی است.',
      });
    }

    if (orgAccountRequiresDistrict(data.role) && !data.district.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['district'],
        message: 'انتخاب منطقه آموزشی الزامی است.',
      });
    }
  });

export type AdminUserCreationFormValues = z.infer<
  typeof adminUserCreationSchema
>;

/** مقادیر کنترل‌شدهٔ فرم قبل از parse نهایی (role ممکن است خالی باشد). */
export type AdminUserCreationFormInput = {
  firstName: string;
  lastName: string;
  mobile: string;
  password: string;
  role: '' | AdminUserCreationFormValues['role'];
  province: string;
  city: string;
  college: string;
  district: string;
};
