import { z } from 'zod';

const optionalLink = z.string().trim();

const requiredLink = z
  .string('وارد کردن لینک الزامی است.')
  .trim()
  .min(1, 'وارد کردن لینک الزامی است.');

function requiredImageFile(message: string) {
  return z
    .custom<File | null>((value) => value == null || value instanceof File)
    .refine((value): value is File => value instanceof File, { message });
}

const optionalImageFile = z
  .custom<File | null>((value) => value == null || value instanceof File)
  .nullable()
  .optional();

export const bannerFormSchema = z.object({
  title: z
    .string('وارد کردن عنوان بنر الزامی است.')
    .trim()
    .min(1, 'وارد کردن عنوان بنر الزامی است.')
    .min(2, 'عنوان بنر باید حداقل ۲ کاراکتر باشد.'),
  link: optionalLink,
  image: requiredImageFile('آپلود تصویر بنر الزامی است.'),
});

export const socialFormSchema = z.object({
  name: z
    .string('وارد کردن نام شبکه اجتماعی الزامی است.')
    .trim()
    .min(1, 'وارد کردن نام شبکه اجتماعی الزامی است.'),
  link: requiredLink,
  iconImage: optionalImageFile,
});

export const productFormSchema = z.object({
  title: z
    .string('وارد کردن عنوان محصول الزامی است.')
    .trim()
    .min(1, 'وارد کردن عنوان محصول الزامی است.')
    .min(2, 'عنوان محصول باید حداقل ۲ کاراکتر باشد.'),
  link: requiredLink,
  logoImage: requiredImageFile('آپلود لوگوی محصول الزامی است.'),
});

export type BannerFormInput = z.input<typeof bannerFormSchema>;
export type BannerFormValues = z.output<typeof bannerFormSchema>;
export type SocialFormInput = z.input<typeof socialFormSchema>;
export type SocialFormValues = z.output<typeof socialFormSchema>;
export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;
