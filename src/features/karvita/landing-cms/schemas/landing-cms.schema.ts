import { z } from 'zod';

import { isPngOrSvgFile } from '@/services/landing-cms/landing-cms-media-limits';

import {
  LANDING_BANNER_MAX_SIZE_MB,
  LANDING_ICON_MAX_SIZE_MB,
} from '../constants';

const optionalLink = z.string().trim();

const requiredLink = z
  .string('وارد کردن لینک الزامی است.')
  .trim()
  .min(1, 'وارد کردن لینک الزامی است.');

function maxBytesFromMb(maxSizeMb: number) {
  return maxSizeMb * 1024 * 1024;
}

function imageFileSizeMessage(maxSizeMb: number) {
  if (maxSizeMb < 1) {
    const kb = Math.round(maxSizeMb * 1024);
    return `حجم فایل نباید بیشتر از ${kb} کیلوبایت باشد.`;
  }
  return `حجم فایل نباید بیشتر از ${maxSizeMb} مگابایت باشد.`;
}

function requiredImageFile(message: string, maxSizeMb: number) {
  const maxBytes = maxBytesFromMb(maxSizeMb);
  return z
    .custom<File | null>((value) => value == null || value instanceof File)
    .refine((value): value is File => value instanceof File, { message })
    .refine((value) => value.size <= maxBytes, {
      message: imageFileSizeMessage(maxSizeMb),
    });
}

function requiredProductLogoFile(message: string, maxSizeMb: number) {
  const maxBytes = maxBytesFromMb(maxSizeMb);
  return z
    .custom<File | null>((value) => value == null || value instanceof File)
    .refine((value): value is File => value instanceof File, { message })
    .refine((value) => isPngOrSvgFile(value), {
      message: 'فقط فایل‌های SVG یا PNG مجاز هستند.',
    })
    .refine((value) => value.size <= maxBytes, {
      message: imageFileSizeMessage(maxSizeMb),
    });
}

function optionalImageFile(maxSizeMb: number) {
  const maxBytes = maxBytesFromMb(maxSizeMb);
  return z
    .custom<File | null>((value) => value == null || value instanceof File)
    .nullable()
    .optional()
    .refine(
      (value) => value == null || value.size <= maxBytes,
      { message: imageFileSizeMessage(maxSizeMb) }
    );
}

export const bannerFormSchema = z.object({
  title: z
    .string('وارد کردن عنوان بنر الزامی است.')
    .trim()
    .min(1, 'وارد کردن عنوان بنر الزامی است.')
    .min(2, 'عنوان بنر باید حداقل ۲ کاراکتر باشد.'),
  link: optionalLink,
  image: requiredImageFile(
    'آپلود تصویر بنر الزامی است.',
    LANDING_BANNER_MAX_SIZE_MB
  ),
});

export const socialFormSchema = z.object({
  name: z
    .string('وارد کردن نام شبکه اجتماعی الزامی است.')
    .trim()
    .min(1, 'وارد کردن نام شبکه اجتماعی الزامی است.'),
  link: requiredLink,
  iconImage: optionalImageFile(LANDING_ICON_MAX_SIZE_MB),
});

export const productFormSchema = z.object({
  title: z
    .string('وارد کردن عنوان محصول الزامی است.')
    .trim()
    .min(1, 'وارد کردن عنوان محصول الزامی است.')
    .min(2, 'عنوان محصول باید حداقل ۲ کاراکتر باشد.'),
  link: requiredLink,
  logoImage: requiredProductLogoFile(
    'آپلود لوگوی محصول الزامی است.',
    LANDING_ICON_MAX_SIZE_MB
  ),
});

export type BannerFormInput = z.input<typeof bannerFormSchema>;
export type BannerFormValues = z.output<typeof bannerFormSchema>;
export type SocialFormInput = z.input<typeof socialFormSchema>;
export type SocialFormValues = z.output<typeof socialFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
