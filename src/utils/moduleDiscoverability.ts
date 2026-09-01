import { RouteService } from '@/services/route.service';

export type ModuleEmptyKind =
  | 'org_structure'
  | 'onboarding_list'
  | 'onboarding_detail'
  | 'syllabus_courses'
  | 'syllabus_weeks';

export type ModuleEmptyCopy = {
  title: string;
  /** یک جمله: چرا خالی است. */
  description: string;
  /** برچسب CTA پیش‌فرض وقتی فراخواننده action می‌دهد. */
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
    description: 'هنوز هفته‌ای برای این درس ثبت نشده است.',
    actionLabel: 'افزودن هفته',
  },
};

export function getModuleEmptyCopy(kind: ModuleEmptyKind): ModuleEmptyCopy {
  return EMPTY_COPY[kind];
}

export function getSyllabusTermSettingsHref(): string {
  return RouteService.karvita.syllabusTermSettings();
}
