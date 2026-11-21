import { appendSearchParam } from '@/lib/dashboard-url-state';
import { RouteService } from '@/services/route.service';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

/**
 * شناسهٔ ماژول ارزیابی (`?module=`) برای یک `courseKey` فراگیر —
 * والد کاتالوگ، یا خود درس اگر leaf/ماژول مستقیم باشد.
 */
export function findEvaluationModuleId(
  courseKey: string,
  kind: DailyApprovalCourseKind,
  catalog: {
    semester: readonly CourseDefinition[];
    modular: readonly CourseDefinition[];
  }
): string | null {
  const courses = kind === 'internship' ? catalog.semester : catalog.modular;
  for (const course of courses) {
    if (course.id === courseKey) return course.id;
    if (evaluationCourseFilterId(course.id) === courseKey) return course.id;
    for (const sub of course.subModules) {
      if (sub.id === courseKey) return course.id;
      if (evaluationCourseFilterId(sub.id) === courseKey) return course.id;
    }
  }
  return courses.find((course) => course.isActive)?.id ?? courses[0]?.id ?? null;
}

/** لینک صفحهٔ ارزیابی همان درس (و در صورت امکان فیلتر زیرمجموعه). */
export function dailyApprovalsCourseHref(input: {
  kind: DailyApprovalCourseKind;
  moduleId?: string | null;
  courseKey?: string | null;
  /** نام فراگیر — جست‌وجوی لیست را از قبل پر می‌کند (`?q=`). */
  query?: string | null;
}): string {
  let href = RouteService.karvita.dailyApprovals(input.kind);
  if (input.moduleId) {
    href = appendSearchParam(href, EVALUATION_MODULE_PARAM, input.moduleId);
  }
  if (input.courseKey) {
    href = appendSearchParam(href, 'course', input.courseKey);
  }
  if (input.query) {
    href = appendSearchParam(href, 'q', input.query);
  }
  return href;
}
