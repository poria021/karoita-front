import type { UserRole } from '@/types/auth';

/** اطلاعیه از هر پنلی که زیرمجموعه دارد؛ تبلیغ فقط از مدیر ارشد و دستیار. */
export type BulletinKind = 'announcement' | 'advertisement';

/** هم‌ارز Nest `format`؛ در mock از وجود تصویر مشتق می‌شود. */
export type BulletinFormat = 'text' | 'image';

export interface Bulletin {
  id: string;
  kind: BulletinKind;
  title: string;
  /** متن اطلاعیه؛ در تبلیغ «توضیحات» است و اگر تصویر باشد اختیاری. */
  body: string;
  /** لینک اختیاری «اطلاعات بیشتر» — فقط برای تبلیغ. */
  linkUrl?: string;
  /** تصویر تبلیغ (data URL در mock؛ URL رسانه در real) — فقط برای تبلیغ. */
  imageUrl?: string;
  /** از Nest؛ در ویرایش real برای قفل بودن format لازم است. */
  format?: BulletinFormat;
  /** پنل منتشرکننده — بج روی کارت داشبورد از لیبل همین نقش است. */
  authorRole: UserRole;
  authorName: string;
  audienceRoles: UserRole[];
  /** عنوان استان‌های مخاطب؛ خالی (دادهٔ قدیمی) = همهٔ استان‌ها. */
  provinces: string[];
  /** غیرفعال = از میز کار مخاطبان پنهان است ولی حذف نشده. */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type UpsertBulletinInput = {
  kind: BulletinKind;
  title: string;
  body: string;
  linkUrl?: string;
  /** تصویر قبلی (ویرایش بدون فایل جدید). */
  imageUrl?: string;
  /** فایل تازه؛ در real با FilesService آپلود می‌شود، در mock به data URL. */
  imageFile?: File;
  audienceRoles: UserRole[];
  provinces: string[];
};

export type BulletinAuthor = {
  role: UserRole;
  name: string;
};
