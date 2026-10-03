import type {
  AcademicTermType,
  CourseCatalogItem,
  CourseDefinition,
  CourseOfferingKind,
  SyllabusConfigSnapshot,
  UpsertCourseDefinitionInput,
} from '@/types/syllabus-config';

/**
 * کاتالوگ داینامیک دروس — منطق خالص، بدون storage.
 * شناسهٔ زیرمجموعه‌های seed همان `course_{kind}_{n}` قبلی است؛ عوضش نکنید،
 * چون ثبت‌نام کارورزی/کارآموزی mock با `catalogIdForKind(kind, level)` به آن‌ها وصل است.
 */

export function courseKindForAudience(
  audience: AcademicTermType
): CourseOfferingKind {
  return audience === 'modular' ? 'apprenticeship' : 'internship';
}

function seedSubModules(kind: CourseOfferingKind, label: string, count: number) {
  return Array.from({ length: count }, (_, idx) => ({
    id: `course_${kind}_${idx + 1}`,
    title: `${label} ${'۱۲۳۴۵۶۷۸۹'[idx] ?? idx + 1}`,
  }));
}

export const DEFAULT_COURSE_DEFINITIONS: readonly CourseDefinition[] = [
  {
    id: 'course_internship',
    title: 'کارورزی',
    audience: 'semester',
    isActive: true,
    subModules: seedSubModules('internship', 'کارورزی', 4),
  },
  {
    id: 'course_apprenticeship',
    title: 'کارآموزی',
    audience: 'modular',
    isActive: true,
    subModules: seedSubModules('apprenticeship', 'کارآموزی', 2),
  },
];

export function cloneDefaultCourseDefinitions(): CourseDefinition[] {
  return structuredClone([...DEFAULT_COURSE_DEFINITIONS]);
}

export function courseDefinitionsOf(
  snapshot: Pick<SyllabusConfigSnapshot, 'courseCatalog'>
): readonly CourseDefinition[] {
  return snapshot.courseCatalog ?? DEFAULT_COURSE_DEFINITIONS;
}

/** شناسهٔ ماژول‌های قابل ارائهٔ یک درس: زیرمجموعه‌ها، یا خود درس اگر زیرمجموعه ندارد. */
export function leafIdsOfCourse(course: CourseDefinition): string[] {
  return course.subModules.length > 0
    ? course.subModules.map((sub) => sub.id)
    : [course.id];
}

/** درس‌های فعال یک مخاطب را به ماژول‌های تخت قابل ارائه تبدیل می‌کند. */
export function flattenCourseCatalog(
  definitions: readonly CourseDefinition[],
  audience: AcademicTermType
): CourseCatalogItem[] {
  const type = courseKindForAudience(audience);
  const items: CourseCatalogItem[] = [];
  for (const course of definitions) {
    if (!course.isActive || course.audience !== audience) continue;
    if (course.subModules.length === 0) {
      items.push({ id: course.id, title: course.title, type });
      continue;
    }
    for (const sub of course.subModules) {
      items.push({
        id: sub.id,
        title: sub.title,
        type,
        groupId: course.id,
        groupTitle: course.title,
      });
    }
  }
  return items;
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

export function newCourseDefinitionId(): string {
  return `crs_${Date.now().toString(36)}_${randomSuffix()}`;
}

function newSubModuleId(courseId: string): string {
  return `${courseId}_m_${Date.now().toString(36)}${randomSuffix()}`;
}

/** پیام فارسی برای فرم؛ `null` یعنی ورودی معتبر است. */
export function validateCourseDefinitionInput(
  input: UpsertCourseDefinitionInput,
  others: readonly CourseDefinition[]
): string | null {
  const title = input.title.trim();
  if (!title) return 'عنوان درس الزامی است.';
  if (
    others.some(
      (course) =>
        course.audience === input.audience &&
        course.title.trim() === title
    )
  ) {
    return 'درسی با همین عنوان برای این مخاطب قبلاً تعریف شده است.';
  }
  const subTitles = input.subModules.map((sub) => sub.title.trim());
  if (subTitles.some((sub) => !sub)) {
    return 'عنوان همهٔ زیرمجموعه‌ها را وارد کنید یا ردیف خالی را حذف کنید.';
  }
  if (new Set(subTitles).size !== subTitles.length) {
    return 'عنوان زیرمجموعه‌ها نباید تکراری باشد.';
  }
  return null;
}

/** شناسهٔ زیرمجموعهٔ موجود حفظ می‌شود تا ارائه و سرفصل هفتگی‌اش گم نشود. */
export function buildCourseDefinition(
  input: UpsertCourseDefinitionInput,
  existing?: CourseDefinition
): CourseDefinition {
  const id = existing?.id ?? newCourseDefinitionId();
  const knownSubIds = new Set(existing?.subModules.map((sub) => sub.id) ?? []);
  return {
    id,
    title: input.title.trim(),
    audience: input.audience,
    isActive: input.isActive,
    subModules: input.subModules.map((sub) => ({
      id: sub.id && knownSubIds.has(sub.id) ? sub.id : newSubModuleId(id),
      title: sub.title.trim(),
    })),
  };
}
