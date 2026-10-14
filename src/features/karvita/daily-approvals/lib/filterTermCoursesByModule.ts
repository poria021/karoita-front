import type { DailyApprovalCatalogCourse } from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/** ارقام فارسی/انگلیسی، نیم‌فاصله و فاصلهٔ اضافه یکسان شوند. */
function normalizeTitle(title: string): string {
  return persianToEnglishDigits(title)
    .replace(/[‌‏‎]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * درس‌های ترمِ (lessonهای Nest) مربوط به درس انتخاب‌شده از سایدبار.
 * Nest هنوز روی lesson ترم شناسهٔ «تعریف دروس» نمی‌گذارد، پس فعلاً تطبیق با
 * عنوان است: زیرمجموعه‌ها (یا خود عنوان درسِ بدون زیرمجموعه).
 * هیچ تطابقی نبود → همهٔ درس‌های ترم، تا صفحه هرگز بی‌دلیل خالی نشود.
 * وقتی Nest `originalLessonId` داد، فقط همین تابع باید عوض شود.
 */
export function filterTermCoursesByModule(
  termCourses: readonly DailyApprovalCatalogCourse[],
  courseModule: CourseDefinition | null
): readonly DailyApprovalCatalogCourse[] {
  if (!courseModule) return termCourses;
  const titles = new Set(
    (courseModule.subModules.length > 0
      ? courseModule.subModules.map((sub) => sub.title)
      : [courseModule.title]
    ).map(normalizeTitle)
  );
  const matched = termCourses.filter((course) =>
    titles.has(normalizeTitle(course.title))
  );
  return matched.length > 0 ? matched : termCourses;
}
