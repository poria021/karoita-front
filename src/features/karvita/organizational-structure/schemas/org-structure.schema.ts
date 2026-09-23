import { z } from 'zod';

import { IS_MOCK_MODE } from '@/lib/api-mode';

const nameField = z
  .string('نام الزامی است.')
  .trim()
  .min(1, 'نام الزامی است.')
  .min(2, 'نام باید حداقل ۲ کاراکتر باشد.');

export const provinceFormSchema = z.object({
  name: nameField,
});

export const cityFormSchema = z.object({
  name: nameField,
  provinceId: z.string().min(1, 'انتخاب استان الزامی است.'),
});

/** بدون `cityId`، POST/PUT /admin/universites لایو ۴۲۲ می‌دهد؛ برخلاف منطقه/مدرسه اینجا شهر اجباری است. */
export const facultyFormSchema = z.object({
  name: nameField,
  provinceId: z.string().min(1, 'انتخاب استان الزامی است.'),
  cityId: z.string().min(1, 'انتخاب شهر الزامی است.'),
});

/**
 * `cityId` در فرم منطقه / مدرسه اختیاری است — همان قانون و برچسب «(اختیاری)».
 * استان اجباری می‌ماند.
 */
export const districtFormSchema = z.object({
  name: nameField,
  provinceId: z.string().min(1, 'انتخاب استان الزامی است.'),
  cityId: z.string().optional(),
});

export const schoolFormSchema = z.object({
  name: nameField,
  provinceId: z.string().min(1, 'انتخاب استان الزامی است.'),
  cityId: z.string().optional(),
  districtId: z.string().optional(),
  gender: z.enum(['male', 'female'], {
    error: 'انتخاب نوع مدرسه الزامی است.',
  }),
});

/**
 * mock: از enum ثابت `audience` (شبیه‌ساز نقش Nest ندارد).
 * real: DTO رشتهٔ Nest به `roleId` از GET `/admin/roles` نیاز دارد — فیلد `audience` آنجا نیست.
 */
export const majorFormSchema = IS_MOCK_MODE
  ? z.object({
      name: nameField,
      audience: z.enum(
        ['student', 'skill_learner', 'supervisor_professor'],
        {
          error: 'انتخاب مخاطب رشته الزامی است.',
        }
      ),
    })
  : z.object({
      name: nameField,
      roleId: z.string().min(1, 'انتخاب نقش رشته الزامی است.'),
    });

export type ProvinceFormValues = z.infer<typeof provinceFormSchema>;
export type CityFormValues = z.infer<typeof cityFormSchema>;
export type FacultyFormValues = z.infer<typeof facultyFormSchema>;
export type DistrictFormValues = z.infer<typeof districtFormSchema>;
export type SchoolFormValues = z.infer<typeof schoolFormSchema>;
export type MajorFormValues = z.infer<typeof majorFormSchema>;

/**
 * مقادیر فرم مودال موجودیت ساختار — اتحاد همهٔ نوع‌های فرم.
 */
export type OrgEntityFormValues = {
  name: string;
  provinceId?: string;
  cityId?: string;
  districtId?: string;
  gender?: 'male' | 'female';
  audience?: 'student' | 'skill_learner' | 'supervisor_professor';
  roleId?: string;
};
