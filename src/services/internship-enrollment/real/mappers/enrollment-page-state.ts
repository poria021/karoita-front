import {
  clampLevel,
  courseNameForKind,
  kindForRole,
  resolveEnrollmentScenario,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  nestEntityId,
  nestLessonTitle,
  toAcademicTerm,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import { lessonLevelFromTitle } from '@/utils/lessonLevelFromTitle';
import type { NestSemesterWithLessons } from '@/types/nest-admin';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipSelectionScope,
} from '@/types/internship-enrollment';

import { firstOf } from './primitives';
import { findLessonForLevel } from './lesson-matching';
import {
  findActiveEnrollmentForLesson,
  findConflictEnrollment,
  registeredSummaryFromEnrollment,
} from './enrollment-summary';

export function realSelectionScope(
  actor: InternshipEnrollmentActor
): InternshipSelectionScope {
  const province = firstOf(actor.province, '');
  const college = firstOf(actor.college, '');
  const canChangeScope = Boolean(actor.specialPermissions?.crossFaculty);
  return {
    province,
    college,
    provinces: province ? [province] : [],
    colleges: college ? [college] : [],
    collegesByProvince: province
      ? { [province]: college ? [college] : [] }
      : {},
    canChangeScope,
  };
}

/**
 * سناریو از ترم باز + لیست ثبت‌نام خود دانشجو.
 * وجود ردیف درس یعنی سرفصل برای آن سطح آمده؛ `lesson.status` اخذ نیست.
 */
export function toEnrollmentPageState(
  input: GetEnrollmentPageStateInput,
  open: NestSemesterWithLessons | null,
  registeredDetails?: {
    enrollments?: NestStudentEnrollment[];
    supervisorName?: string | null;
    supervisorDay?: string | null;
  }
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const courseName = courseNameForKind(kind);

  if (!open) {
    return {
      scenario: 'S1_syllabus_blocked',
      kind,
      level,
      courseName,
      termTitle: 'نیم‌سال جاری',
      termId: '',
      lessonId: null,
      enrollment: null,
      selection: null,
      conflictEnrollment: null,
    };
  }

  const term = toAcademicTerm(open, { lessons: open.lessons ?? [] });
  const lessons = open.lessons ?? [];
  const current = findLessonForLevel(lessons, kind, level);
  const lessonId = current ? nestEntityId(current) || null : null;
  const mine = registeredDetails?.enrollments ?? [];
  const active = findActiveEnrollmentForLesson(mine, open.id, lessonId);
  const registered = Boolean(active);
  const conflictLesson = registered
    ? null
    : findConflictEnrollment(mine, lessons, kind, open.id, lessonId);

  // انتخاب واحد فقط وقتی درسِ همین دانشجو باز باشد — lesson.status از open-course-selection.
  const lessonEnrollOpen =
    open.courseSelection === true ||
    Boolean(current?.courseSelection) ||
    Boolean(current?.status);

  const scenario = conflictLesson
    ? 'S6_already_enrolled_elsewhere'
    : resolveEnrollmentScenario({
        syllabusConfigured: Boolean(current),
        enrollOpen: lessonEnrollOpen,
        termOpen: term.isTermOpen,
        registered,
      });

  return {
    scenario,
    kind,
    level,
    courseName,
    termTitle: term.title,
    termId: open.id,
    lessonId,
    enrollment:
      scenario === 'S4_registered_waiting' || scenario === 'S5_term_active'
        ? registeredSummaryFromEnrollment(
            { kind, level, termTitle: term.title },
            active,
            registeredDetails?.supervisorName ?? null,
            registeredDetails?.supervisorDay ?? null
          )
        : null,
    selection:
      scenario === 'S3_enroll_open'
        ? {
            scope: realSelectionScope(input.actor),
            wasDropped: false,
            droppedSupervisorName: null,
          }
        : null,
    conflictEnrollment: conflictLesson
      ? {
          level: lessonLevelFromTitle(nestLessonTitle(conflictLesson)),
          courseTitle: nestLessonTitle(conflictLesson),
        }
      : null,
  };
}
