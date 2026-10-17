import type { UserRole } from '@/types/auth';

/** اطلاعیه از هر پنلی که زیرمجموعه دارد؛ تبلیغ فقط از مدیر ارشد و دستیار. */
export type BulletinKind = 'announcement' | 'advertisement';

export interface Bulletin {
  id: string;
  kind: BulletinKind;
  title: string;
  /** متن اطلاعیه؛ در تبلیغ «توضیحات» است و اگر تصویر باشد اختیاری. */
  body: string;
  /** لینک اختیاری «اطلاعات بیشتر» — فقط برای تبلیغ. */
  linkUrl?: string;
  /** تصویر تبلیغ (data URL در mock) — فقط برای تبلیغ. */
  imageUrl?: string;
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
  imageUrl?: string;
  audienceRoles: UserRole[];
  provinces: string[];
};

export type BulletinAuthor = {
  role: UserRole;
  name: string;
};
