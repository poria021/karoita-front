import { appendSearchParam } from '@/lib/dashboard-url-state';
import { RouteService } from '@/services/route.service';
import {
  courseKindForAudience,
  evaluationCourseFilterId,
} from '@/services/syllabus-config/course-catalog';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

type CourseCatalogSplit = {
  semester: readonly CourseDefinition[];
  modular: readonly CourseDefinition[];
};

/**
 * شناسهٔ ماژول ارزیابی (`?module=`) برای یک `courseKey` فراگیر —
 * والد کاتالوگ، یا خود درس اگر leaf/ماژول مستقیم باشد.
 */
export function findEvaluationModuleId(
  courseKey: string,
  kind: DailyApprovalCourseKind,
  catalog: CourseCatalogSplit
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

function normalizeLessonTitle(title: string): string {
  return persianToEnglishDigits(title)
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export type PendingReviewEvaluationTarget = {
  kind: DailyApprovalCourseKind;
  moduleId: string;
  courseKey: string;
};

/**
 * عنوان/شناسهٔ کارت «در انتظار بررسی» را به هدف ارزیابی همان درس وصل می‌کند.
 * اول `lessonId`، بعد تطبیق عنوان با کاتالوگ تعریف دروس.
 */
export function resolvePendingReviewEvaluation(
  input: { title: string; lessonId?: string | null },
  catalog: CourseCatalogSplit
): PendingReviewEvaluationTarget | null {
  const all = [...catalog.semester, ...catalog.modular];
  const lessonId = input.lessonId?.trim();
  if (lessonId) {
    for (const course of all) {
      if (course.id === lessonId) {
        return {
          kind: courseKindForAudience(course.audience),
          moduleId: course.id,
          courseKey: evaluationCourseFilterId(course.id),
        };
      }
      for (const sub of course.subModules) {
        if (sub.id === lessonId) {
          return {
            kind: courseKindForAudience(course.audience),
            moduleId: course.id,
            courseKey: evaluationCourseFilterId(sub.id),
          };
        }
      }
    }
  }

  const needle = normalizeLessonTitle(input.title);
  if (!needle) return null;

  for (const course of all) {
    if (normalizeLessonTitle(course.title) === needle) {
      const leaf = course.subModules[0];
      return {
        kind: courseKindForAudience(course.audience),
        moduleId: course.id,
        courseKey: evaluationCourseFilterId(leaf?.id ?? course.id),
      };
    }
    for (const sub of course.subModules) {
      if (normalizeLessonTitle(sub.title) === needle) {
        return {
          kind: courseKindForAudience(course.audience),
          moduleId: course.id,
          courseKey: evaluationCourseFilterId(sub.id),
        };
      }
    }
  }

  return null;
}

/** href ارزیابی برای کارت مانیتورینگ؛ اگر درس پیدا نشود همان صفحهٔ ارزیابی بدون فیلتر. */
export function pendingReviewCardHref(
  input: { title: string; lessonId?: string | null },
  catalog: CourseCatalogSplit
): string {
  const target = resolvePendingReviewEvaluation(input, catalog);
  if (!target) return RouteService.karvita.dailyApprovals();
  return dailyApprovalsCourseHref(target);
}
