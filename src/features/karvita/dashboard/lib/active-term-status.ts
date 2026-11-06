import type {
  AcademicTerm,
  AcademicTermType,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

export type ActiveTermCourseView = {
  id: string;
  title: string;
  weekCount: number;
};

export type ActiveTermStatusView = {
  term: AcademicTerm | null;
  courses: ActiveTermCourseView[];
};

/**
 * آخرین ترم فعال برای مخاطب: اول ترم باز، بعد انتخاب‌واحد باز، وگرنه آخرین ترم همان نوع.
 */
export function pickLatestActiveTerm(
  terms: readonly AcademicTerm[],
  type: AcademicTermType
): AcademicTerm | null {
  const ofType = terms.filter((term) => term.type === type);
  if (ofType.length === 0) return null;

  const termOpen = ofType.filter((term) => term.isTermOpen);
  if (termOpen.length > 0) return termOpen[termOpen.length - 1] ?? null;

  const enrollOpen = ofType.filter((term) => term.isEnrollOpen);
  if (enrollOpen.length > 0) return enrollOpen[enrollOpen.length - 1] ?? null;

  return ofType[ofType.length - 1] ?? null;
}

/** درس‌های ارائه‌شدهٔ همان ترم با تعداد هفته. */
export function buildActiveTermCourses(
  snapshot: SyllabusConfigSnapshot,
  term: AcademicTerm
): ActiveTermCourseView[] {
  const courses: ActiveTermCourseView[] = [];

  for (const record of Object.values(snapshot.offerings)) {
    if (record.termId !== term.id || !record.isOffered) continue;

    courses.push({
      id: record.id,
      title: record.title?.trim() || 'درس بدون عنوان',
      weekCount: record.weeks.length,
    });
  }

  courses.sort((a, b) => a.title.localeCompare(b.title, 'fa'));
  return courses;
}

export function buildActiveTermStatusView(
  snapshot: SyllabusConfigSnapshot | null | undefined,
  type: AcademicTermType
): ActiveTermStatusView {
  if (!snapshot) return { term: null, courses: [] };
  const term = pickLatestActiveTerm(snapshot.terms, type);
  if (!term) return { term: null, courses: [] };
  return {
    term,
    courses: buildActiveTermCourses(snapshot, term),
  };
}
