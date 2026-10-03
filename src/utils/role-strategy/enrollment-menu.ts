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
 * بدون درس داینامیک (real) منوی ایستا دست‌نخورده می‌ماند.
 */
const INTERNSHIP_BASE = RouteService.karvita.internshipSelection();

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
function itemFor(
  leaf: { id: string; title: string; level?: number },
  icon: string
): SidebarMenuItem | null {
  const level = enrollmentLevelOfLeaf(leaf.id, leaf.level);
  if (level === null) return null;
  return {
    title: leaf.title,
    path: RouteService.karvita.internshipSelection(level),
    icon,
    ...(legacyLeafId(leaf.id) ? { iconBadge: level } : {}),
  };
}

export function withEnrollmentSubModules(
  menu: SidebarMenuEntry[],
  courses: readonly CourseDefinition[]
): SidebarMenuEntry[] {
  if (courses.length === 0) return menu;

  const next: SidebarMenuEntry[] = [];
  let replaced = false;

  for (const entry of menu) {
    if (replaced || !isEnrollmentGroup(entry)) {
      next.push(entry);
      continue;
    }
    replaced = true;
    for (const course of courses) {
      const title = `انتخاب واحد ${course.title}`;
      if (course.subModules.length === 0) {
        const item = itemFor(course, entry.icon);
        if (item) next.push({ ...item, title });
        continue;
      }
      const children = course.subModules
        .map((sub) => itemFor(sub, entry.icon))
        .filter((item): item is SidebarMenuItem => item !== null);
      if (children.length === 0) continue;
      next.push({
        kind: 'group',
        title,
        icon: entry.icon,
        defaultOpen: true,
        children,
      });
    }
  }
  return next;
}
