/** seed اطلاعیه/تبلیغ و استان‌ها (جدا تا import حلقه‌ای نشود). */
import { newId, type Store } from './store';

const SEED_PROVINCES = ['تهران', 'قم', 'اصفهان', 'فارس', 'خراسان رضوی'];

const ALL_STUDENT_SIDE = ['mentor', 'student', 'teacher', 'trainee', 'school_admin'];

export function seedBulletinModule(store: Store): void {
  for (const title of SEED_PROVINCES) {
    const id = newId();
    store.provinces.set(id, { id, title });
  }

  const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3_600_000).toISOString();

  store.bulletins.push(
    {
      id: newId(),
      kind: 'advertisement',
      title: 'وبینار آشنایی با سامانهٔ کارویتا',
      body: 'وبینار آموزشی کار با ماژول‌های گزارش روزانه و ارزیابی، ویژهٔ همهٔ کاربران سامانه.',
      authorRole: 'superadmin',
      authorName: 'مدیر ارشد',
      audienceRoles: ALL_STUDENT_SIDE,
      provinces: [],
      isActive: true,
      createdAt: hoursAgo(30),
      updatedAt: hoursAgo(30),
    },
    {
      id: newId(),
      kind: 'announcement',
      title: 'آغاز ثبت گزارش‌های روزانهٔ ترم جدید',
      body: 'ثبت گزارش روزانهٔ کارورزی و کارآموزی از ابتدای هفتهٔ آینده فعال می‌شود. لطفاً پروفایل خود را تکمیل کنید.',
      authorRole: 'superadmin',
      authorName: 'مدیر ارشد',
      audienceRoles: ALL_STUDENT_SIDE,
      provinces: ['تهران', 'قم'],
      isActive: true,
      createdAt: hoursAgo(6),
      updatedAt: hoursAgo(6),
    },
    {
      id: newId(),
      kind: 'advertisement',
      title: 'تبلیغ غیرفعال (فقط در صفحهٔ مدیریت دیده می‌شود)',
      body: 'این مورد برای دیدن حالت «غیرفعال» seed شده است.',
      authorRole: 'superadmin',
      authorName: 'مدیر ارشد',
      audienceRoles: ['student', 'mentor'],
      provinces: ['اصفهان'],
      isActive: false,
      createdAt: hoursAgo(48),
      updatedAt: hoursAgo(48),
    }
  );
}
