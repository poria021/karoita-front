import { z } from 'zod';

import { persianToEnglishDigits } from '@/utils/persianDigits';

const englishDigits = (value: string) => persianToEnglishDigits(value).trim();

export const termFormSchema = z.object({
  type: z.enum(['semester', 'modular'], {
    error: 'انتخاب نوع ساختار دوره الزامی است.',
  }),
  titlePrefix: z.string().trim().min(1, 'عنوان بازه الزامی است.'),
  academicYear: z
    .string()
    .trim()
    .transform(englishDigits)
    .refine(
      (v) => /^\d{4}-\d{4}$/.test(v),
      'سال تحصیلی باید به صورت ۱۴۰۵-۱۴۰۶ باشد.'
    ),
});

export const professorCapacitySchema = z.object({
  capacity: z
    .string()
    .trim()
    .transform(englishDigits)
    .refine((v) => /^\d+$/.test(v), 'ظرفیت باید عدد باشد.')
    .transform((v) => Number.parseInt(v, 10))
    .refine((n) => n >= 0, 'ظرفیت نمی‌تواند منفی باشد.'),
});

export const passingThresholdSchema = z.object({
  threshold: z
    .string()
    .trim()
    .transform(englishDigits)
    .refine((v) => /^\d+$/.test(v), 'حدنصاب باید عدد باشد.')
    .transform((v) => Number.parseInt(v, 10))
    .refine((n) => n >= 0 && n <= 100, 'حدنصاب باید بین ۰ تا ۱۰۰ باشد.'),
});

export const weekTitleSchema = z.object({
  title: z.string().trim().min(1, 'عنوان سرفصل الزامی است.'),
});

export const weekWeightSchema = z
  .number()
  .int()
  .min(1)
  .max(5);

export type TermFormValues = z.infer<typeof termFormSchema>;
export type ProfessorCapacityValues = z.infer<typeof professorCapacitySchema>;
export type PassingThresholdValues = z.infer<typeof passingThresholdSchema>;
export type WeekTitleValues = z.infer<typeof weekTitleSchema>;
