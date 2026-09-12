import {
  courseNameForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import { nestEntityId, nestLessonTitle } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestLesson } from '@/types/nest-admin';
import type {
  NestEnrollmentStatus,
  NestStudentEnrollment,
} from '@/types/nest-student-enrollments';
import type {
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentSummary,
} from '@/types/internship-enrollment';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';

import { isRecord, namedTitle } from './primitives';
import { lessonMatchesKind } from './lesson-matching';

function registeredSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
}): InternshipEnrollmentSummary {
  return {
    supervisorName: null,
    attendanceDaysLabel: '',
    schoolId: null,
    schoolName: null,
    mentorId: null,
    mentorName: null,
    courseTitle: normalizeEnrollmentCourseTitle(
      courseNameForKind(input.kind),
      input.level
    ),
    termTitle: input.termTitle,
    status: 'active',
    removalPending: false,
    isTermArchived: false,
    weeks: [],
    progressiveGrade: { gradedCount: 0, final20: null },
  };
}

/**
 * `schoolId`/`teacherId` در Swagger `{}` هستند — لایو یا رشتهٔ شناسه می‌دهد یا سند
 * populated با `id`/`title`؛ این تابع هر دو را به `{id, title}` یکسان می‌کند.
 */
function extractNestRelation(
  value: NestStudentEnrollment['schoolId']
): { id: string; title: string } | null {
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, title: '' } : null;
  }
  if (!isRecord(value)) return null;
  const id = nestEntityId({
    id: typeof value.id === 'string' ? value.id : undefined,
    _id: typeof value._id === 'string' ? value._id : undefined,
  });
  if (!id) return null;
  return { id, title: namedTitle(value) };
}

function mapNestEnrollmentStatus(
  raw: NestEnrollmentStatus | string | undefined
): InternshipEnrollmentSummary['status'] {
  if (raw === 'completed') return 'completed';
  if (raw === 'dropped' || raw === 'cancelled') return 'dropped';
  return 'active';
}

/**
 * خلاصهٔ ثبت‌نام واقعی از GET `/student-enrollments` — مدرسه/معلم/وضعیت واقعی است.
 * `weeks`/`progressiveGrade` هنوز خالی می‌مانند چون `student-weeks` به فرانت وصل نشده.
 * `supervisorName` از لایهٔ reads با `professorId` روی GET `/professors` پر می‌شود.
 */
export function registeredSummaryFromEnrollment(
  input: { kind: InternshipCourseKind; level: InternshipEnrollmentLevel; termTitle: string },
  enrollment: NestStudentEnrollment | null,
  supervisorName: string | null,
  supervisorDay: string | null = null
): InternshipEnrollmentSummary {
  const base = registeredSummary(input);
  if (!enrollment) return base;

  const school = extractNestRelation(enrollment.schoolId);
  const mentor = extractNestRelation(enrollment.teacherId);

  return {
    ...base,
    supervisorName: supervisorName ?? base.supervisorName,
    attendanceDaysLabel: supervisorDay ?? base.attendanceDaysLabel,
    schoolId: school?.id ?? null,
    schoolName: school?.title || null,
    mentorId: mentor?.id ?? null,
    mentorName: mentor?.title || null,
    status: mapNestEnrollmentStatus(enrollment.status),
  };
}

function enrollmentLessonId(row: NestStudentEnrollment): string {
  return (row.lessonId ?? '').trim();
}

function enrollmentSemesterId(row: NestStudentEnrollment): string {
  return (row.semesterId ?? '').trim();
}

function isDroppedEnrollment(row: NestStudentEnrollment): boolean {
  return row.status === 'dropped';
}

/**
 * ثبت‌نام فعال همین درس از GET `/student-enrollments` — نه `lesson.status`.
 * `lesson.status` در سرفصل یعنی درس ارائه شده است (`isOffered`)، نه اخذ دانشجو.
 */
export function findActiveEnrollmentForLesson(
  rows: readonly NestStudentEnrollment[],
  semesterId: string,
  lessonId: string | null
): NestStudentEnrollment | null {
  if (!semesterId || !lessonId) return null;
  return (
    rows.find(
      (row) =>
        enrollmentSemesterId(row) === semesterId &&
        enrollmentLessonId(row) === lessonId &&
        !isDroppedEnrollment(row)
    ) ?? null
  );
}

export function findConflictEnrollment(
  rows: readonly NestStudentEnrollment[],
  lessons: NestLesson[],
  kind: InternshipCourseKind,
  semesterId: string,
  currentLessonId: string | null
): NestLesson | null {
  const conflict = rows.find((row) => {
    if (enrollmentSemesterId(row) !== semesterId) return false;
    if (isDroppedEnrollment(row)) return false;
    const otherId = enrollmentLessonId(row);
    if (!otherId || otherId === currentLessonId) return false;
    const otherLesson = lessons.find((lesson) => nestEntityId(lesson) === otherId);
    if (!otherLesson) return false;
    return lessonMatchesKind(nestLessonTitle(otherLesson), kind);
  });
  if (!conflict) return null;
  const lessonId = enrollmentLessonId(conflict);
  return lessons.find((lesson) => nestEntityId(lesson) === lessonId) ?? null;
}
