import type {
  AcademicTerm,
  CourseCatalogItem,
  CourseOfferingListItem,
  SyllabusWeek,
} from '@/types/syllabus-config';

export function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * دلیل ممنوع بودن حذف ترم، یا `null` اگر می‌شود حذف کرد.
 * فرانت شمار ثبت‌نام‌ها را ندارد؛ پس محافظهکارانه از نشانه‌هایی که می‌بیند
 * استفاده می‌کند: ارائهٔ فعال یا گیت باز یعنی ترم زنده است و سابقه دارد یا خواهد داشت.
 * خودِ بکند هم باید حذف ترمِ دارای ثبت‌نام را رد کند — این فقط لایهٔ اول است.
 */
export function termDeleteBlockReason(
  term: Pick<AcademicTerm, 'title' | 'isEnrollOpen' | 'isTermOpen'>,
  offerings: CourseOfferingListItem[]
): string | null {
  const offeredCount = offerings.filter((item) => item.isOffered).length;
  if (offeredCount > 0) {
    return `«${term.title}» ${offeredCount} ارائهٔ فعال دارد و ممکن است دانشجو ثبت‌نام کرده باشد. ابتدا ارائهٔ درس‌ها را غیرفعال کنید.`;
  }
  if (term.isEnrollOpen || term.isTermOpen) {
    return `«${term.title}» هنوز باز است. ابتدا انتخاب واحد و برگزاری کلاس را ببندید.`;
  }
  return null;
}

export function offeredCatalogIdsFromList(
  offerings: CourseOfferingListItem[]
): Set<string> {
  const next = new Set<string>();
  for (const item of offerings) {
    if (item.isOffered) next.add(item.courseCatalogId);
  }
  return next;
}

/** آخرین ترم انتخاب‌شده برای تب مخاطب — تعویض SPA در حافظه بماند. */
export function resolveAudienceTermId(
  pool: AcademicTerm[],
  rememberedTermId: string | undefined
): string {
  if (rememberedTermId && pool.some((term) => term.id === rememberedTermId)) {
    return rememberedTermId;
  }
  return pool[0]?.id ?? '';
}

export type SyllabusTermPane = {
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  courses: CourseCatalogItem[];
  weeks: SyllabusWeek[];
  isWeeksPublished: boolean;
  offeredCatalogIds: string[];
  hasUnsavedChanges: boolean;
};
