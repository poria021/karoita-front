import { RouteService } from '@/services/route.service';
import {
  enrollmentLevelOfLeaf,
  legacyLeafId,
} from '@/services/syllabus-config/course-catalog';
import type { CourseDefinition } from '@/types/syllabus-config';

import {
  isSidebarMenuGroup,
  type SidebarMenuEntry,
  type SidebarMenuGroup,
  type SidebarMenuItem,
} from './types';

/**
 * گروه ایستای «انتخاب واحد کارورزی/کارآموزی» دانشجو و مهارت‌آموز را در رندر
 * سایدبار با درس‌های فعال مدیر ارشد جایگزین می‌کند: هر درس یک عنوان است و
 * زیرمجموعه‌هایش ساب‌ماژول‌های آن؛ درس بدون زیرمجموعه خودش یک آیتم مستقل.
 * بدون درس:
 * - `whenEmpty: 'keep'` (پیش‌فرض؛ mock یا خطای API) → منوی ایستا دست‌نخورده.
 * - `whenEmpty: 'remove'` (real، هیچ درسی برای انتخاب نیست) → گروه انتخاب واحد حذف.
 */
const INTERNSHIP_BASE = RouteService.karvita.internshipSelection();

/**
 * آیکن‌های مرتبط با درس / انتخاب واحد — فقط کلیدهایی که در `faIcons` ثبت شده‌اند.
 * برای درس‌های بدون کلیدواژهٔ شناخته‌شده، از همین استخر به‌صورت پایدار (هش id) انتخاب می‌شود.
 */
const ENROLLMENT_COURSE_ICONS = [
  'fa-graduation-cap',
  'fa-book-open',
  'fa-briefcase',
  'fa-chalkboard-user',
  'fa-clipboard-list',
  'fa-school',
  'fa-list-check',
  'fa-pen-to-square',
  'fa-folder-open',
  'fa-award',
  'fa-user-gear',
  'fa-screwdriver-wrench',
  'fa-file-contract',
  'fa-building-columns',
  'fa-university',
  'fa-id-card',
] as const;

const TITLE_ICON_RULES: ReadonlyArray<{ match: RegExp; icon: string }> = [
  { match: /کارورزی|internship/i, icon: 'fa-graduation-cap' },
  { match: /کارآموزی|apprentice/i, icon: 'fa-briefcase' },
  { match: /کاربست/, icon: 'fa-screwdriver-wrench' },
  { match: /پروژه|project/i, icon: 'fa-folder-open' },
  { match: /کارگاه|workshop/i, icon: 'fa-chalkboard-user' },
  { match: /نظری|نظریه|theory/i, icon: 'fa-book-open' },
  { match: /ارزیابی|evaluation/i, icon: 'fa-clipboard-list' },
];

function hashIconSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/**
 * آیکن گروه/آیتم انتخاب واحد برای یک درس: اول از روی عنوان، وگرنه انتخاب پایدار
 * از استخر؛ در یک رندر سعی می‌کند با درس‌های قبلی تکراری نشود.
 */
export function iconForEnrollmentCourse(
  course: Pick<CourseDefinition, 'id' | 'title'>,
  usedIcons?: Set<string>
): string {
  for (const rule of TITLE_ICON_RULES) {
    if (rule.match.test(course.title)) {
      usedIcons?.add(rule.icon);
      return rule.icon;
    }
  }

  const seed = course.id || course.title;
  const start = hashIconSeed(seed) % ENROLLMENT_COURSE_ICONS.length;
  for (let offset = 0; offset < ENROLLMENT_COURSE_ICONS.length; offset += 1) {
    const icon =
      ENROLLMENT_COURSE_ICONS[(start + offset) % ENROLLMENT_COURSE_ICONS.length]!;
    if (!usedIcons?.has(icon)) {
      usedIcons?.add(icon);
      return icon;
    }
  }
  return ENROLLMENT_COURSE_ICONS[start]!;
}

function isEnrollmentGroup(entry: SidebarMenuEntry): entry is SidebarMenuGroup {
  return (
    isSidebarMenuGroup(entry) &&
    entry.children.length > 0 &&
    entry.children.every((child) => child.path.startsWith(INTERNSHIP_BASE))
  );
}

/**
 * leaf seed قدیمی همان سطح ۱..۴ است؛ leaf تازه سطح مجازیِ ذخیره‌شده‌اش را دارد
 * (`/internships/:level`). leaf بدون سطح هنوز قابل ثبت‌نام نیست و در منو نمی‌آید.
 */
type EnrollmentLeaf = {
  id: string;
  title: string;
  level?: number;
  /** وضعیت خودِ leaf؛ نبودن یعنی از وضعیت درس ارث می‌برد. */
  isActive?: boolean;
};

function itemFor(
  leaf: EnrollmentLeaf,
  icon: string,
  isDisabled: (leaf: EnrollmentLeaf, level: number) => boolean
): SidebarMenuItem | null {
  const level = enrollmentLevelOfLeaf(leaf.id, leaf.level);
  if (level === null) return null;
  return {
    title: leaf.title,
    path: RouteService.karvita.internshipSelection(level),
    icon,
    disabled: isDisabled(leaf, level),
    ...(legacyLeafId(leaf.id) ? { iconBadge: level } : {}),
  };
}

export type EnrollmentMenuOptions = {
  whenEmpty?: 'keep' | 'remove';
  /**
   * سطح‌هایی که همین الان در ترم جاری ارائه (سرفصل) شده‌اند. `null` یا نبودن یعنی
   * هنوز نامعلوم است و فقط فعال‌بودن درس/زیرماژول در «تعریف دروس» بررسی می‌شود.
   */
  offeredLevels?: ReadonlySet<number> | null;
  /**
   * سطح‌هایی که کاربر قبلاً (هر ترم، هر نتیجه‌ای — قبول، رد، حتی لغوشده) در آن‌ها
   * ثبت‌نام داشته. این آیتم‌ها هیچ‌وقت غیرفعال نمی‌شوند تا گزارش و تاریخچه‌شان در
   * دسترس بماند.
   */
  enrolledLevels?: ReadonlySet<number>;
};

export function withEnrollmentSubModules(
  menu: SidebarMenuEntry[],
  courses: readonly CourseDefinition[],
  options: EnrollmentMenuOptions = {}
): SidebarMenuEntry[] {
  if (courses.length === 0) {
    return options.whenEmpty === 'remove'
      ? menu.filter((entry) => !isEnrollmentGroup(entry))
      : menu;
  }

  const { offeredLevels = null, enrolledLevels } = options;
  // غیرفعال: درس یا زیرماژول در «تعریف دروس» خاموش است یا در ترم جاری ارائه نشده —
  // مگر اینکه کاربر قبلاً همان سطح را برداشته باشد.
  const isLeafDisabled = (
    course: CourseDefinition,
    leaf: EnrollmentLeaf,
    level: number
  ): boolean => {
    if (enrolledLevels?.has(level)) return false;
    const moduleActive = leaf.isActive ?? course.isActive;
    return (
      !moduleActive ||
      (offeredLevels !== null && !offeredLevels.has(level))
    );
  };

  const next: SidebarMenuEntry[] = [];
  let replaced = false;

  for (const entry of menu) {
    if (replaced || !isEnrollmentGroup(entry)) {
      next.push(entry);
      continue;
    }
    replaced = true;
    const usedIcons = new Set<string>();
    for (const course of courses) {
      const title = `انتخاب واحد ${course.title}`;
      const icon = iconForEnrollmentCourse(course, usedIcons);
      const isDisabled = (leaf: EnrollmentLeaf, level: number) =>
        isLeafDisabled(course, leaf, level);
      if (course.subModules.length === 0) {
        const item = itemFor(course, icon, isDisabled);
        if (item) next.push({ ...item, title });
        continue;
      }
      const children = course.subModules
        .map((sub) => itemFor(sub, icon, isDisabled))
        .filter((item): item is SidebarMenuItem => item !== null);
      if (children.length === 0) continue;
      next.push({
        kind: 'group',
        title,
        icon,
        children,
      });
    }
  }
  return next;
}
