import { newId, type Store, type StoredAdvertisement } from './store';

/**
 * نمونهٔ تبلیغ و اطلاعیه برای میز کار. placement پیش‌فرض UI = sidebar.
 */
export function seedAdvertisementModule(store: Store): void {
  const now = Date.now();
  const at = (hoursAgo: number) =>
    new Date(now - hoursAgo * 3_600_000).toISOString();

  const adAudience = [
    'organization_center',
    'university_province',
    'university',
    'school_district',
    'school_admin',
    'mentor',
    'teacher',
    'student',
    'trainee',
  ];

  const rows: StoredAdvertisement[] = [
    {
      id: newId(),
      type: 'ads',
      format: 'text',
      title: 'وبینار آشنایی با سامانه',
      body: 'وبینار آموزشی کار با گزارش روزانه و ارزیابی.',
      link: 'https://example.com/webinar',
      placement: 'sidebar',
      imageId: null,
      targetRoles: adAudience,
      targetProvinceIds: [],
      targetUniversityIds: [],
      targetUserIds: [],
      isActive: true,
      clickCount: 0,
      impressionCount: 0,
      startsAt: at(30),
      endsAt: null,
      createdByRole: 'superadmin',
      createdAt: at(30),
      updatedAt: at(30),
    },
    {
      id: newId(),
      type: 'info',
      format: 'text',
      title: 'آغاز ثبت گزارش‌های روزانه',
      body: 'ثبت گزارش روزانه از ابتدای هفتهٔ آینده فعال می‌شود.',
      link: null,
      placement: 'sidebar',
      imageId: null,
      targetRoles: adAudience,
      targetProvinceIds: [],
      targetUniversityIds: [],
      targetUserIds: [],
      isActive: true,
      clickCount: 0,
      impressionCount: 0,
      startsAt: at(6),
      endsAt: null,
      createdByRole: 'organization_center',
      createdAt: at(6),
      updatedAt: at(6),
    },
  ];

  store.advertisements.push(...rows);
}
