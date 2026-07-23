import { RouteService } from '@/services/route.service';

export type ModuleEmptyKind =
  | 'org_structure'
  | 'onboarding_list'
  | 'onboarding_detail'
  | 'syllabus_courses'
  | 'syllabus_weeks';

export type ModuleEmptyCopy = {
  title: string;
  /** One sentence: why it is empty. */
  description: string;
  /** Default primary CTA label when the caller supplies an action. */
  actionLabel: string;
};

const EMPTY_COPY: Record<ModuleEmptyKind, ModuleEmptyCopy> = {
  org_structure: {
    title: 'موردی یافت نشد',
    description:
      'برای این بخش هنوز موردی ثبت نشده یا جستجو نتیجه‌ای نداشته است.',
    actionLabel: 'افزودن مورد جدید',
  },
  onboarding_list: {
    title: 'پرونده‌ای یافت نشد',
    description:
      'در این تب یا با فیلتر فعلی پرونده‌ای برای بررسی وجود ندارد.',
    actionLabel: 'پاک کردن فیلترها',
  },
  onboarding_detail: {
    title: 'کاربری انتخاب نشده',
    description:
      'از فهرست یک پرونده را انتخاب کنید تا جزئیات و اقدام‌ها نمایش داده شود.',
    actionLabel: '',
  },
  syllabus_courses: {
    title: 'درسی برای این ترم تعریف نشده',
    description:
      'تا وقتی نوع ترم و دوره در تنظیمات عمومی مشخص نشود، فهرست دروس خالی می‌ماند.',
    actionLabel: 'رفتن به تنظیمات ترم',
  },
  syllabus_weeks: {
    title: 'سرفصلی تعریف نشده',
    description:
      'پس از ارائهٔ درس، هفته‌های پیش‌فرض سرفصل ساخته می‌شوند.',
    actionLabel: 'ارائهٔ درس را فعال کنید',
  },
};

export function getModuleEmptyCopy(kind: ModuleEmptyKind): ModuleEmptyCopy {
  return EMPTY_COPY[kind];
}

export function getSyllabusTermSettingsHref(): string {
  return RouteService.karvita.syllabusTermSettings();
}
