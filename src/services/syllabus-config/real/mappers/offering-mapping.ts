import type {
  NestLesson,
  NestLessonWeek,
  NestPutLessonWeeksDto,
  NestSemesterWithLessons,
} from '@/types/nest-admin';
import type {
  AcademicTerm,
  AcademicTermType,
  CourseCatalogItem,
  CourseOfferingListItem,
  CourseOfferingRecord,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { catalogKindForTermType, toAcademicTerm, toAcademicTermType } from './term-mapping';
import { nestEntityId, nestLessonTitle } from './nest-raw-parsers';
import { nestPriorityFromWeight } from './week-priority';

function weekLabel(weekNumber: number, title?: string): string {
  const trimmed = title?.trim();
  return trimmed || `هفته ${weekNumber}`;
}

export function toCourseCatalogItem(
  lesson: NestLesson,
  termType: AcademicTermType
): CourseCatalogItem | null {
  const id = nestEntityId(lesson);
  if (!id) return null;
  return {
    id,
    title: nestLessonTitle(lesson),
    type: catalogKindForTermType(termType),
  };
}

export function toCourseOfferingListItem(
  lesson: NestLesson,
  termType: AcademicTermType
): CourseOfferingListItem | null {
  const catalog = toCourseCatalogItem(lesson, termType);
  if (!catalog) return null;
  return {
    courseOfferingId: catalog.id,
    courseCatalogId: catalog.id,
    title: catalog.title,
    type: catalog.type,
    isOffered: lesson.status === true,
  };
}

export function toSyllabusWeek(
  week: NestLessonWeek,
  index: number,
  defaultWeight: number
): SyllabusWeek {
  const weekNumber = index + 1;
  const label = weekLabel(weekNumber, week.title);
  return {
    id: nestEntityId(week) || `week_index_${weekNumber}`,
    suffix: label,
    title: label,
    weight: nestPriorityFromWeight(week.priority ?? Number.NaN, defaultWeight),
    status: week.status === false ? 'archived' : 'active',
  };
}

export function toCourseOfferingRecord(
  termId: string,
  lesson: NestLesson,
  defaultWeight: number,
  termType: AcademicTermType
): CourseOfferingRecord | null {
  const lessonId = nestEntityId(lesson);
  if (!lessonId) return null;
  return {
    id: lessonId,
    termId,
    courseCatalogId: lessonId,
    title: nestLessonTitle(lesson),
    type: catalogKindForTermType(termType),
    isOffered: lesson.status === true,
    weeks: (lesson.weeks ?? []).map((week, index) =>
      toSyllabusWeek(week, index, defaultWeight)
    ),
  };
}

export function toNestLessonWeeksBody(weeks: SyllabusWeek[]): NestPutLessonWeeksDto {
  return {
    weeks: weeks.map((week) => ({
      priority: nestPriorityFromWeight(week.weight),
      status: week.status === 'active',
    })),
  };
}

export function mergeTermsWithLessonBundles(
  listed: AcademicTerm[],
  bundles: NestSemesterWithLessons[],
  todayJalali: string,
  defaultWeight: number
): {
  terms: AcademicTerm[];
  offerings: Record<string, CourseOfferingRecord>;
} {
  const byId = new Map<string, AcademicTerm>();
  for (const term of listed) {
    byId.set(term.id, term);
  }

  const offerings: Record<string, CourseOfferingRecord> = {};
  for (const bundle of bundles) {
    const listedTerm = byId.get(bundle.id);
    const mapped = toAcademicTerm(bundle, {
      lessons: bundle.lessons,
      todayJalali,
    });
    // GET /admin/semester منبع گیت است؛ semesters_all معمولاً courseSelection/startClasses ندارد.
    byId.set(
      bundle.id,
      listedTerm
        ? {
            ...mapped,
            isEnrollOpen: listedTerm.isEnrollOpen || mapped.isEnrollOpen,
            isTermOpen: listedTerm.isTermOpen || mapped.isTermOpen,
            enrollStart:
              listedTerm.isEnrollOpen || mapped.isEnrollOpen
                ? listedTerm.enrollStart || mapped.enrollStart
                : '',
            termStart:
              listedTerm.isTermOpen || mapped.isTermOpen
                ? listedTerm.termStart || mapped.termStart
                : '',
          }
        : mapped
    );
    for (const lesson of bundle.lessons ?? []) {
      const record = toCourseOfferingRecord(
        bundle.id,
        lesson,
        defaultWeight,
        toAcademicTermType(bundle.structure)
      );
      if (record) offerings[record.id] = record;
    }
  }

  return { terms: [...byId.values()], offerings };
}

export function lessonsOfTerm(
  bundles: NestSemesterWithLessons[],
  termId: string
): { termType: AcademicTermType; lessons: NestLesson[] } | null {
  const bundle = bundles.find((row) => row.id === termId);
  if (!bundle) return null;
  return {
    termType: toAcademicTermType(bundle.structure),
    lessons: bundle.lessons ?? [],
  };
}
