import type { Bulletin, BulletinAuthor } from '@/types/bulletins';

const FULL_AUDIENCE: Bulletin['audienceRoles'] = [
  'provincial_university',
  'faculty_role',
  'regional_edu_admin',
  'school_principal',
  'supervisor_professor',
  'mentor_teacher',
  'student',
  'skill_learner',
];

/** نویسنده‌ی ثابت برای ایجاد/ویرایش در حالت mock (بدون نشست). */
export const MOCK_BULLETIN_AUTHOR: BulletinAuthor = {
  role: 'central_organization',
  name: 'سازمان مرکزی',
};

/** داده‌ی ثابت حالت mock — هیچ state یا ذخیره‌سازی‌ای ندارد. */
export function mockBulletins(): Bulletin[] {
  const now = Date.now();
  const at = (hoursAgo: number) =>
    new Date(now - hoursAgo * 3_600_000).toISOString();
  return [
    {
      id: 'bul_seed_ad_1',
      kind: 'advertisement',
      title: 'وبینار آشنایی با سامانهٔ کارویتا',
      body: 'وبینار آموزشی کار با ماژول‌های گزارش روزانه و ارزیابی، ویژهٔ همهٔ کاربران سامانه.',
      authorRole: 'super_admin',
      authorName: 'مدیر ارشد',
      audienceRoles: ['central_organization', ...FULL_AUDIENCE],
      createdAt: at(30),
      updatedAt: at(30),
    },
    {
      id: 'bul_seed_ann_1',
      kind: 'announcement',
      title: 'آغاز ثبت گزارش‌های روزانهٔ ترم جدید',
      body: 'ثبت گزارش روزانهٔ کارورزی و کارآموزی از ابتدای هفتهٔ آینده فعال می‌شود. لطفاً پروفایل خود را تکمیل کنید.',
      authorRole: 'central_organization',
      authorName: 'سازمان مرکزی',
      audienceRoles: [...FULL_AUDIENCE],
      createdAt: at(6),
      updatedAt: at(6),
    },
  ];
}
