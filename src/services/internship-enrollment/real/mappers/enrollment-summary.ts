import {
  courseNameForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import { nestEntityId, nestLessonTitle } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestLesson } from '@/types/nest-admin';
import type {
  NestEnrollmentStatus,
  NestScoreSummary,
  NestStudentEnrollment,
  NestStudentWeek,
  NestStudentWeekSubmission,
} from '@/types/nest-student-enrollments';
import type {
  AttendanceDaysUnavailableReason,
  InternshipCourseKind,
  InternshipEnrollmentLevel,
  InternshipEnrollmentSummary,
} from '@/types/internship-enrollment';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';

import { isRecord, namedTitle, personDisplayName } from './primitives';
import { lessonMatchesKind } from './lesson-matching';
import { mapRealProgressiveGrade, mapRealWeeklySessions } from './weekly-sessions';

export type RealWeeklyData = {
  weeks: NestStudentWeek[];
  scoreSummary: NestScoreSummary | null;
  latestSubmissionByWeekId: ReadonlyMap<string, NestStudentWeekSubmission>;
};

function registeredSummary(input: {
  kind: InternshipCourseKind;
  level: InternshipEnrollmentLevel;
  termTitle: string;
  termId?: string;
  userId?: string;
}): InternshipEnrollmentSummary {
  return {
    supervisorName: null,
    attendanceDaysLabel: '',
    attendanceDaysUnavailableReason: null,
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
    weeksAreReal: false,
  };
}

/**
 * `schoolId`/`teacherId` یا رشتهٔ id خام‌اند یا سند populated با `id`/`title`؛
 * این تابع هر دو را به `{id, title}` یکسان می‌کند. ورودی `unknown` است چون هم
 * روی `row.schoolId`/`row.teacherId` (همیشه رشتهٔ خام طبق Swagger) و هم روی
 * `row.school`/`row.teacher` (سند populated) صدا زده می‌شود — ببین
 * `resolveEnrollmentSchool`/`resolveEnrollmentMentor`.
 */
export function extractNestRelation(
  value: unknown
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

/**
 * وقتی `professorId` خودش populate شده باشد (سند استاد به‌جای رشتهٔ id)، اسم
 * مستقیماً همین‌جا در دسترس است. ورودی `unknown` چون هم روی `row.professorId`
 * و هم روی `row.professor` (سند populated لیست) صدا زده می‌شود — ببین
 * `resolveEnrollmentProfessor`.
 */
export function extractNestProfessor(
  value: unknown
): { id: string; name: string | null } | null {
  if (typeof value === 'string') {
    const id = value.trim();
    return id ? { id, name: null } : null;
  }
  if (!isRecord(value)) return null;
  const id = nestEntityId({
    id: typeof value.id === 'string' ? value.id : undefined,
    _id: typeof value._id === 'string' ? value._id : undefined,
  });
  if (!id) return null;
  return { id, name: personDisplayName(value) || null };
}

/**
 * منبع اصلی نام مدرسه: فیلد populated `row.school` که طبق OpenAPI زندهٔ بک‌اند
 * (`StudentEnrollmentListItemDto.school`) روی پاسخ `GET /student-enrollments`
 * همیشه کنار `schoolId` خام می‌آید. اگر این فیلد نبود (مثلاً پاسخ PATCH که این
 * شکل را ندارد)، به `schoolId` خام برمی‌گردد (بدون عنوان).
 */
export function resolveEnrollmentSchool(
  row: NestStudentEnrollment | null | undefined
): { id: string; title: string } | null {
  if (!row) return null;
  return extractNestRelation(row.school) ?? extractNestRelation(row.schoolId);
}

/**
 * مشابه `resolveEnrollmentSchool` برای معلم همکار (`row.teacher`). برخلاف
 * مدرسه، `EnrollmentPersonSummaryDto` (شکل واقعی `row.teacher`) `firstName`/
 * `lastName` دارد نه `title`/`name` — برای همین با `extractNestProfessor`
 * (اسم شخص) می‌خوانیمش، نه `extractNestRelation` (که فقط `title`/`name` را
 * می‌شناسد و روی این شکل همیشه رشتهٔ خالی برمی‌گرداند).
 */
export function resolveEnrollmentMentor(
  row: NestStudentEnrollment | null | undefined
): { id: string; title: string } | null {
  if (!row) return null;
  const populated = extractNestProfessor(row.teacher);
  if (populated) return { id: populated.id, title: populated.name ?? '' };
  return extractNestRelation(row.teacherId);
}

/** مشابه `resolveEnrollmentSchool` برای استاد ناظر (`row.professor`). */
export function resolveEnrollmentProfessor(
  row: NestStudentEnrollment | null | undefined
): { id: string; name: string | null } | null {
  if (!row) return null;
  return extractNestProfessor(row.professor) ?? extractNestProfessor(row.professorId);
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
 * `weeks`/`progressiveGrade` وقتی `realWeeklyData` داده شود (از GET `weeks` +
 * `score-summary`) واقعی‌اند؛ وگرنه خالی می‌مانند.
 * اسم مدرسه/معلم از فیلدهای populated `enrollment.school`/`enrollment.teacher`
 * می‌آید (`resolveEnrollmentSchool`/`resolveEnrollmentMentor`) که طبق OpenAPI
 * زندهٔ بک‌اند همیشه همراه پاسخ لیست‌اند. `resolvedNames` فقط برای مسیرهایی که
 * این رکورد از populated بودن برخوردار نیست (مثلاً پاسخ PATCH) override می‌کند.
 */
export function registeredSummaryFromEnrollment(
  input: {
    kind: InternshipCourseKind;
    level: InternshipEnrollmentLevel;
    termTitle: string;
    termId?: string;
    userId?: string;
  },
  enrollment: NestStudentEnrollment | null,
  resolvedNames: {
    supervisorName: string | null;
    supervisorDay?: string | null;
    supervisorDayUnavailableReason?: AttendanceDaysUnavailableReason | null;
    schoolName?: string | null;
    mentorName?: string | null;
  },
  realWeeklyData?: RealWeeklyData
): InternshipEnrollmentSummary {
  const base = registeredSummary(input);
  if (!enrollment) return base;

  const school = resolveEnrollmentSchool(enrollment);
  const mentor = resolveEnrollmentMentor(enrollment);

  const mappedWeeks = realWeeklyData
    ? mapRealWeeklySessions(realWeeklyData.weeks, realWeeklyData.latestSubmissionByWeekId)
    : base.weeks;

  const attendanceDaysLabel = resolvedNames.supervisorDay ?? base.attendanceDaysLabel;

  return {
    ...base,
    supervisorName: resolvedNames.supervisorName ?? base.supervisorName,
    attendanceDaysLabel,
    // فقط وقتی معنا دارد که روز نداریم — اگر روز موجود بود، دلیل نبودنش بی‌ربط است.
    attendanceDaysUnavailableReason: attendanceDaysLabel
      ? null
      : (resolvedNames.supervisorDayUnavailableReason ?? null),
    schoolId: school?.id ?? null,
    schoolName: resolvedNames.schoolName || school?.title || null,
    mentorId: mentor?.id ?? null,
    mentorName: resolvedNames.mentorName || mentor?.title || null,
    status: mapNestEnrollmentStatus(enrollment.status),
    weeks: mappedWeeks,
    progressiveGrade: realWeeklyData
      ? mapRealProgressiveGrade(realWeeklyData.scoreSummary)
      : base.progressiveGrade,
    weeksAreReal: Boolean(realWeeklyData),
  };
}

function enrollmentLessonId(row: NestStudentEnrollment): string {
  return (row.lessonId ?? '').trim();
}

function enrollmentSemesterId(row: NestStudentEnrollment): string {
  return (row.semesterId ?? '').trim();
}

function isDroppedEnrollment(row: NestStudentEnrollment): boolean {
  return row.status === 'dropped' || row.status === 'cancelled';
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
