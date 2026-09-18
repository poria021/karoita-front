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
import type {
  NestOpenCourseSelection,
  NestSemesterEnrolmentsByTerm,
} from '@/types/nest-student-enrollments';
import type {
  AttendanceDaysUnavailableReason,
  GetEnrollmentPageStateInput,
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipEnrollmentTermHistoryEntry,
  InternshipSelectionScope,
} from '@/types/internship-enrollment';

import { firstOf } from './primitives';
import {
  findConflictLessonInSemester,
  findEnrolmentHistoryForLevel,
  findLessonForLevel,
  type EnrolmentHistoryEntry,
} from './lesson-matching';
import {
  mapNestEnrollmentStatus,
  registeredSummaryFromEnrollment,
  type RealWeeklyData,
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
 * سناریو از ترم باز (`open-course-selection`، فقط برای `canSelect`/گیت انتخاب) +
 * تاریخچهٔ ثبت‌نام این level در همهٔ نیم‌سال‌ها (`by-semester`، نه فقط باز).
 * وجود ردیف درس در ترم باز یعنی سرفصل برای این سطح آمده؛ `lesson.status` اخذ نیست.
 * «ثبت‌نام‌شده» بودن دیگر به بازبودن ترم فعلی گره نخورده — اگر دانشجو در هر
 * نیم‌سالی (حتی بسته‌شده) ثبت‌نام `active` غیرکنسل‌شده برای همین level داشته
 * باشد، صفحهٔ گزارش همان را نشان می‌دهد، نه صفحهٔ انتخاب واحد.
 */
/** عنوان نیم‌سال یک ردیف تاریخچه — نیم‌سال باز از `open`، بقیه از `semesters`. */
export function termTitleForHistoryEntry(
  entry: EnrolmentHistoryEntry,
  open: NestOpenCourseSelection | null,
  openTerm: { title: string } | null,
  semesters: readonly NestSemesterEnrolmentsByTerm[]
): string {
  if (open && entry.semesterId === open.id) return openTerm?.title ?? '';
  const semesterEntry = semesters.find((s) => s.id === entry.semesterId);
  return semesterEntry ? toAcademicTerm(semesterEntry).title : '';
}

export function toEnrollmentPageState(
  input: GetEnrollmentPageStateInput,
  open: NestOpenCourseSelection | null,
  semesters: readonly NestSemesterEnrolmentsByTerm[],
  registeredDetails?: {
    supervisorName?: string | null;
    supervisorDay?: string | null;
    supervisorDayUnavailableReason?: AttendanceDaysUnavailableReason | null;
    schoolName?: string | null;
    mentorName?: string | null;
    realWeeklyData?: RealWeeklyData;
  }
): InternshipEnrollmentPageState {
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const courseName = courseNameForKind(kind);

  const openLessons = open?.lessons ?? [];
  const current = findLessonForLevel(openLessons, kind, level);
  const currentLessonId = current ? nestEntityId(current) || null : null;

  const history = findEnrolmentHistoryForLevel(semesters, kind, level);
  const activeEntry =
    history.find((entry) => entry.enrolment.status === 'active') ?? null;
  const registered = Boolean(activeEntry);

  const openSemesterEntry = open
    ? semesters.find((semester) => semester.id === open.id)
    : undefined;
  const conflictLesson = registered
    ? null
    : findConflictLessonInSemester(openSemesterEntry, kind, currentLessonId);

  // انتخاب واحد فقط وقتی بک‌اند صریحاً اجازه بدهد — `canSelect` نتیجهٔ
  // محاسبهٔ بک‌اند است (شامل قبولی/رد در ترم‌های قبلی)، پس اگر صراحتاً false
  // بود، status/courseSelection دیگر معنایی ندارند.
  const lessonEnrollOpen =
    current?.canSelect !== false &&
    (open?.courseSelection === true ||
      Boolean(current?.courseSelection) ||
      Boolean(current?.status));

  const isActiveInOpenTerm = Boolean(open) && activeEntry?.semesterId === open?.id;
  const openTerm = open ? toAcademicTerm(open, { lessons: openLessons }) : null;
  // نیم‌سال بسته‌شده یعنی کلاس‌هایش قطعاً شروع شده — برخلاف نیم‌سال باز که
  // ممکن است `startClasses` هنوز false باشد (باید منتظر S4 ماند).
  const activeTermOpen = activeEntry
    ? isActiveInOpenTerm
      ? Boolean(openTerm?.isTermOpen)
      : true
    : false;

  const scenario = conflictLesson
    ? 'S6_already_enrolled_elsewhere'
    : resolveEnrollmentScenario({
        syllabusConfigured: registered || Boolean(current),
        enrollOpen: lessonEnrollOpen,
        termOpen: activeTermOpen,
        registered,
      });

  const activeSemesterEntry =
    activeEntry && !isActiveInOpenTerm
      ? semesters.find((semester) => semester.id === activeEntry.semesterId)
      : undefined;
  const activeTermTitle = activeEntry
    ? isActiveInOpenTerm
      ? (openTerm?.title ?? '')
      : (activeSemesterEntry ? toAcademicTerm(activeSemesterEntry).title : '')
    : (openTerm?.title ?? 'نیم‌سال جاری');
  const activeTermId = activeEntry ? activeEntry.semesterId : (open?.id ?? '');

  const termHistory: InternshipEnrollmentTermHistoryEntry[] = history.map(
    (entry) => ({
      termId: entry.semesterId,
      termTitle: termTitleForHistoryEntry(entry, open, openTerm, semesters),
      status: mapNestEnrollmentStatus(entry.enrolment.status),
    })
  );

  return {
    scenario,
    kind,
    level,
    courseName,
    termTitle: activeTermTitle,
    termId: activeTermId,
    lessonId: activeEntry ? (activeEntry.lesson.id ?? null) : currentLessonId,
    enrollment:
      scenario === 'S4_registered_waiting' || scenario === 'S5_term_active'
        ? registeredSummaryFromEnrollment(
            {
              kind,
              level,
              termTitle: activeTermTitle,
              termId: activeTermId,
              userId: input.actor.id,
            },
            activeEntry?.enrolment ?? null,
            {
              supervisorName: registeredDetails?.supervisorName ?? null,
              supervisorDay: registeredDetails?.supervisorDay ?? null,
              supervisorDayUnavailableReason:
                registeredDetails?.supervisorDayUnavailableReason ?? null,
              schoolName: registeredDetails?.schoolName ?? null,
              mentorName: registeredDetails?.mentorName ?? null,
            },
            registeredDetails?.realWeeklyData
          )
        : null,
    termHistory,
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
