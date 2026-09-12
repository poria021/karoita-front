import {
  nestEntityId,
  nestLessonTitle,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import { lessonLevelFromTitle } from '@/utils/lessonLevelFromTitle';
import type { NestLesson, NestSemesterWithLessons } from '@/types/nest-admin';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
} from '@/types/internship-enrollment';
import { persianToEnglishDigits } from '@/utils/persianDigits';

import { isRecord } from './primitives';

export function lessonMatchesKind(
  title: string,
  kind: InternshipCourseKind
): boolean {
  const normalized = persianToEnglishDigits(title);
  if (kind === 'apprenticeship') {
    return /کارآموزی|مهارت/.test(title) || /apprentice|skill/i.test(normalized);
  }
  return /کارورزی/.test(title) || /intern/i.test(normalized);
}

export function findLessonForLevel(
  lessons: NestLesson[],
  kind: InternshipCourseKind,
  level: InternshipEnrollmentLevel
): NestLesson | null {
  return (
    lessons.find((lesson) => {
      const title = nestLessonTitle(lesson);
      return (
        lessonMatchesKind(title, kind) && lessonLevelFromTitle(title) === level
      );
    }) ?? null
  );
}

export function parseOpenCourseSelection(
  raw: unknown
): NestSemesterWithLessons | null {
  if (!isRecord(raw)) return null;
  const doc = isRecord(raw._doc) ? raw._doc : raw;
  const id = nestEntityId({
    id: typeof doc.id === 'string' ? doc.id : undefined,
    _id: typeof doc._id === 'string' ? doc._id : undefined,
  });
  if (!id) return null;
  const lessons = Array.isArray(doc.lessons) ? (doc.lessons as NestLesson[]) : [];
  return {
    id,
    academicYear:
      typeof doc.academicYear === 'string' ? doc.academicYear : undefined,
    academicYears:
      typeof doc.academicYears === 'string' ? doc.academicYears : undefined,
    season:
      doc.season === 'two' || doc.season === 'summer' ? doc.season : 'one',
    structure:
      typeof doc.structure === 'string' && doc.structure
        ? (doc.structure as NestSemesterWithLessons['structure'])
        : 'semester',
    courseSelection:
      typeof doc.courseSelection === 'boolean' ? doc.courseSelection : undefined,
    startClasses:
      typeof doc.startClasses === 'boolean' ? doc.startClasses : undefined,
    lessons,
  };
}
