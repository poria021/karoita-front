import { appendSearchParam } from '@/lib/dashboard-url-state';
import { RouteService } from '@/services/route.service';
import type { CourseDefinition } from '@/types/syllabus-config';

import {
  isSidebarMenuGroup,
  type SidebarMenuEntry,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from './types';

/**
 * ماژول «ارزیابی گزارش‌های فراگیران» در منوی ایستای نقش یک آیتم تخت است
 * (عنوان صفحه/بردکرامب/میان‌بر از همان می‌آید). فقط سایدبار آن را در رندر به
 * گروهی تبدیل می‌کند که ساب‌تایتل‌هایش خودِ درس‌های مدیر ارشد است؛
 * زیرمجموعه‌های هر درس داخل صفحه، در فیلتر بالای جدول می‌آیند.
 */
const EVALUATION_PATH = RouteService.karvita.dailyApprovals();

export const EVALUATION_MODULE_PARAM = 'module';

const DEFAULT_CHILDREN: readonly SidebarMenuItem[] = [
  {
    title: 'کارورزی',
    path: RouteService.karvita.dailyApprovals('internship'),
    icon: 'fa-graduation-cap',
  },
  {
    title: 'کارآموزی',
    path: RouteService.karvita.dailyApprovals('apprenticeship'),
    icon: 'fa-user-gear',
  },
];

const KIND_LABEL = {
  internship: 'ترمی',
  apprenticeship: 'پودمانی',
} as const;

function childForCourse(
  course: CourseDefinition,
  kind: 'internship' | 'apprenticeship',
  ambiguous: boolean,
  keptCourseIds: ReadonlySet<string> | undefined
): SidebarMenuItem {
  // غیرفعال در «تعریف دروس» → disabled؛ مگر قبلاً با این درس کار شده باشد.
  const disabled =
    !course.isActive && !(keptCourseIds?.has(course.id) ?? false);
  return {
    // پنل فقط وقتی کنار نام می‌آید که دو درس هم‌نام در دو پنل باشد.
    title: ambiguous ? `${course.title} (${KIND_LABEL[kind]})` : course.title,
    path: appendSearchParam(
      RouteService.karvita.dailyApprovals(kind),
      EVALUATION_MODULE_PARAM,
      course.id
    ),
    icon: kind === 'internship' ? 'fa-graduation-cap' : 'fa-user-gear',
    disabled,
  };
}

/**
 * `semester` / `modular` = درس‌های هر پنل (فعال و غیرفعال؛ غیرفعال disabled).
 * هر دو خالی:
 * - `whenEmpty: 'defaults'` (پیش‌فرض؛ mock یا خطای API) → دو لینک کارورزی/کارآموزی.
 * - `whenEmpty: 'flat'` (real، «تعریف دروس» واقعاً خالی) → همان لینک تخت ماژول،
 *   بدون ساب‌تایتل ساختگی.
 * - `whenEmpty: 'omit'` → آیتم ارزیابی حذف (بوت شل معمولاً قبل از paint صبر می‌کند).
 * - `keptCourseIds`: درس‌هایی که با وجود غیرفعال بودن باید قابل‌کلیک بمانند
 *   (سابقهٔ ارزیابی/دسترسی قبلی).
 */
export function withEvaluationSubModules(
  menu: SidebarMenuEntry[],
  courses: {
    semester: readonly CourseDefinition[];
    modular: readonly CourseDefinition[];
  },
  options: {
    whenEmpty?: 'defaults' | 'flat' | 'omit';
    keptCourseIds?: ReadonlySet<string>;
  } = {}
): SidebarMenuEntry[] {
  const semesterTitles = new Set(courses.semester.map((c) => c.title.trim()));
  const sharedTitles = new Set(
    courses.modular
      .map((c) => c.title.trim())
      .filter((title) => semesterTitles.has(title))
  );
  const keptCourseIds = options.keptCourseIds;
  const dynamicChildren: SidebarMenuItem[] = [
    ...courses.semester.map((course) =>
      childForCourse(
        course,
        'internship',
        sharedTitles.has(course.title.trim()),
        keptCourseIds
      )
    ),
    ...courses.modular.map((course) =>
      childForCourse(
        course,
        'apprenticeship',
        sharedTitles.has(course.title.trim()),
        keptCourseIds
      )
    ),
  ];
  if (dynamicChildren.length === 0) {
    if (options.whenEmpty === 'flat') return menu;
    if (options.whenEmpty === 'omit') {
      return menu.filter(
        (entry) => isSidebarMenuGroup(entry) || entry.path !== EVALUATION_PATH
      );
    }
  }
  const children =
    dynamicChildren.length > 0 ? dynamicChildren : [...DEFAULT_CHILDREN];

  return menu.map((entry): SidebarMenuEntry => {
    if (isSidebarMenuGroup(entry) || entry.path !== EVALUATION_PATH) {
      return entry;
    }
    const group: SidebarMenuGroup = {
      kind: 'group',
      title: entry.title,
      icon: entry.icon,
      children,
      defaultOpen: true,
    };
    return group;
  });
}
