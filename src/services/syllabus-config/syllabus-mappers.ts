import type {
  AcademicTermType,
  CourseCatalogItem,
  CourseOfferingKind,
  CourseOfferingListItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/** کلید قدیمی mock: `C::${termTitle}::${normalizedCourseTitle}` */
export function legacyOfferingStorageKey(
  termTitle: string,
  courseTitle: string
): string {
  return `C::${termTitle}::${normalizeCourseTitle(courseTitle)}`;
}

export function normalizeCourseTitle(title: string): string {
  return persianToEnglishDigits(title).trim();
}

export function buildCourseOfferingId(
  termId: string,
  courseCatalogId: string
): string {
  return `off_${termId}_${courseCatalogId}`;
}

export function catalogIdForKind(kind: CourseOfferingKind, index: number): string {
  return `course_${kind}_${index}`;
}

export function getCatalogForTermType(
  type: AcademicTermType
): CourseCatalogItem[] {
  if (type === 'semester') {
    return [
      { id: catalogIdForKind('internship', 1), title: 'کارورزی ۱', type: 'internship' },
      { id: catalogIdForKind('internship', 2), title: 'کارورزی ۲', type: 'internship' },
      { id: catalogIdForKind('internship', 3), title: 'کارورزی ۳', type: 'internship' },
      { id: catalogIdForKind('internship', 4), title: 'کارورزی ۴', type: 'internship' },
    ];
  }
  return [
    {
      id: catalogIdForKind('apprenticeship', 1),
      title: 'کارآموزی ۱',
      type: 'apprenticeship',
    },
    {
      id: catalogIdForKind('apprenticeship', 2),
      title: 'کارآموزی ۲',
      type: 'apprenticeship',
    },
  ];
}

export function findCatalogById(
  type: AcademicTermType,
  courseCatalogId: string
): CourseCatalogItem | null {
  return (
    getCatalogForTermType(type).find((c) => c.id === courseCatalogId) ?? null
  );
}

export function findCatalogByTitle(
  type: AcademicTermType,
  title: string
): CourseCatalogItem | null {
  const normalized = normalizeCourseTitle(title);
  return (
    getCatalogForTermType(type).find(
      (c) => normalizeCourseTitle(c.title) === normalized
    ) ?? null
  );
}

export function isOfferingActive(weeks: SyllabusWeek[]): boolean {
  return weeks.some((week) => week.status === 'active');
}

export function listOfferingsForTerm(
  snapshot: SyllabusConfigSnapshot,
  termId: string
): CourseOfferingListItem[] {
  const term = snapshot.terms.find((t) => t.id === termId);
  if (!term) return [];

  const catalog = getCatalogForTermType(term.type);
  return catalog.map((course) => {
    const offeringId = buildCourseOfferingId(termId, course.id);
    const record = snapshot.offerings[offeringId];
    return {
      courseOfferingId: record?.id ?? null,
      courseCatalogId: course.id,
      title: course.title,
      type: course.type,
      isOffered: Boolean(record?.isOffered),
    };
  });
}
