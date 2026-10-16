import type {
  AcademicTermType,
  CourseCatalogItem,
  CourseDefinition,
  CourseOfferingKind,
  CourseOfferingListItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import {
  courseDefinitionsOf,
  DEFAULT_COURSE_DEFINITIONS,
  flattenCourseCatalog,
} from './course-catalog';

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

/** بدون `definitions` همان seed پیش‌فرض است؛ mock کاتالوگ snapshot را پاس می‌دهد. */
export function getCatalogForTermType(
  type: AcademicTermType,
  definitions: readonly CourseDefinition[] = DEFAULT_COURSE_DEFINITIONS
): CourseCatalogItem[] {
  return flattenCourseCatalog(definitions, type);
}

export function findCatalogById(
  type: AcademicTermType,
  courseCatalogId: string,
  definitions?: readonly CourseDefinition[]
): CourseCatalogItem | null {
  return (
    getCatalogForTermType(type, definitions).find(
      (c) => c.id === courseCatalogId
    ) ?? null
  );
}

export function findCatalogByTitle(
  type: AcademicTermType,
  title: string,
  definitions?: readonly CourseDefinition[]
): CourseCatalogItem | null {
  const normalized = normalizeCourseTitle(title);
  return (
    getCatalogForTermType(type, definitions).find(
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

  const catalog = getCatalogForTermType(
    term.type,
    courseDefinitionsOf(snapshot)
  );
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
