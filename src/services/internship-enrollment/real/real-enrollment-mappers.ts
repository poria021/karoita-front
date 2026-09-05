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
import type { NestLesson, NestSemesterWithLessons } from '@/types/nest-admin';
import type {
  NestEnrollmentProfessor,
  NestEnrollmentStatus,
  NestStudentEnrollment,
} from '@/types/nest-student-enrollments';
import type {
  GetEnrollmentPageStateInput,
  InternshipCourseKind,
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentSummary,
  InternshipSelectionScope,
  InternshipSupervisor,
} from '@/types/internship-enrollment';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';
import { persianToEnglishDigits } from '@/utils/persianDigits';

/** ۰=شنبه … ۵=پنجشنبه — همان قرارداد ظرفیت استاد. */
const NEST_DAY_FA: readonly string[] = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(persianToEnglishDigits(value.trim()));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function namedTitle(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (!isRecord(value)) return '';
  return (
    asTrimmedString(value.title) ||
    asTrimmedString(value.name) ||
    asTrimmedString(value.title_fa)
  );
}

function firstOf(
  value: string | string[] | undefined,
  fallback: string
): string {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

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
      doc.season === 'two' || doc.season === 'three' ? doc.season : 'one',
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
  if (raw === 'dropped' || raw === 'completed') return raw;
  return 'active';
}

/**
 * خلاصهٔ ثبت‌نام واقعی از GET `/student-enrollments` — مدرسه/معلم/وضعیت واقعی است.
 * `weeks`/`progressiveGrade` هنوز خالی می‌مانند چون `student-weeks` به فرانت وصل نشده.
 * `supervisorName` هم فعلاً پاس‌داده می‌شود ولی هیچ‌کجا resolve نشده — DTO فقط
 * `professorId` (شناسه) می‌دهد، نه نام؛ نگاشتِ آن به نام باید بعداً (مثلاً با
 * `usersApi.getById`، اگر نقش دانشجو به آن دسترسی داشته باشد) اضافه شود.
 */
function registeredSummaryFromEnrollment(
  input: { kind: InternshipCourseKind; level: InternshipEnrollmentLevel; termTitle: string },
  enrollment: NestStudentEnrollment | null,
  supervisorName: string | null
): InternshipEnrollmentSummary {
  const base = registeredSummary(input);
  if (!enrollment) return base;

  const school = extractNestRelation(enrollment.schoolId);
  const mentor = extractNestRelation(enrollment.teacherId);

  return {
    ...base,
    supervisorName: supervisorName ?? base.supervisorName,
    schoolId: school?.id ?? null,
    schoolName: school?.title || null,
    mentorId: mentor?.id ?? null,
    mentorName: mentor?.title || null,
    status: mapNestEnrollmentStatus(enrollment.status),
  };
}

/**
 * `lesson.status === true` یعنی همین کاربر آن درس را اخذ کرده.
 * وجود ردیف درس در لیست یعنی سرفصل برای آن سطح ارائه شده (حتی اگر status خاموش باشد).
 */
export function toEnrollmentPageState(
  input: GetEnrollmentPageStateInput,
  open: NestSemesterWithLessons | null,
  registeredDetails?: {
    enrollment: NestStudentEnrollment | null;
    supervisorName: string | null;
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
  const registered = current?.status === true;
  const conflictLesson = !registered
    ? lessons.find((lesson) => {
        if (lesson.status !== true) return false;
        const title = nestLessonTitle(lesson);
        return (
          lessonMatchesKind(title, kind) &&
          lessonLevelFromTitle(title) !== level
        );
      })
    : null;

  const scenario = conflictLesson
    ? 'S6_already_enrolled_elsewhere'
    : resolveEnrollmentScenario({
        syllabusConfigured: Boolean(current),
        enrollOpen: term.isEnrollOpen,
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
            registeredDetails?.enrollment ?? null,
            registeredDetails?.supervisorName ?? null
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

function unwrapProfessor(raw: NestEnrollmentProfessor): Record<string, unknown> {
  const nested = isRecord(raw.professor) ? raw.professor : null;
  return { ...(nested ?? {}), ...raw };
}

function professorDisplayName(row: Record<string, unknown>): string {
  const first =
    asTrimmedString(row.firstName) || asTrimmedString(row.fname);
  const last = asTrimmedString(row.lastName) || asTrimmedString(row.lname);
  const full = [first, last].filter(Boolean).join(' ').trim();
  return full || asTrimmedString(row.name);
}

function professorDayLabel(row: Record<string, unknown>): string {
  const labeled = asTrimmedString(row.day);
  if (labeled) return labeled;
  const days = Array.isArray(row.days) ? row.days : [];
  const first = days.find(
    (item): item is number => typeof item === 'number' && item >= 0 && item <= 5
  );
  return first === undefined ? '' : (NEST_DAY_FA[first] ?? '');
}

function professorRemaining(row: Record<string, unknown>): number | null {
  const remaining =
    asFiniteNumber(row.remainingCapacity) ?? asFiniteNumber(row.remaining);
  if (remaining !== null) return remaining;
  return asFiniteNumber(row.capacity);
}

export function mapEnrollmentProfessor(
  raw: unknown
): InternshipSupervisor | null {
  if (!isRecord(raw)) return null;
  const row = unwrapProfessor(raw as NestEnrollmentProfessor);
  const id =
    nestEntityId({
      id: asTrimmedString(row.id) || undefined,
      _id: asTrimmedString(row._id) || undefined,
    }) || asTrimmedString(row.professorId);
  const name = professorDisplayName(row);
  if (!id || !name) return null;
  return {
    id,
    name,
    college:
      namedTitle(row.university) ||
      namedTitle(row.college) ||
      namedTitle(row.campus),
    province: namedTitle(row.province),
    day: professorDayLabel(row),
    capacity: professorRemaining(row),
  };
}

export function filterSupervisorsClientSide(
  supervisors: InternshipSupervisor[],
  input: { query: string; province: string; college: string }
): InternshipSupervisor[] {
  const query = input.query.trim().toLocaleLowerCase('fa-IR');
  return supervisors.filter((item) => {
    if (
      input.province &&
      item.province &&
      item.province !== input.province
    ) {
      return false;
    }
    if (input.college && item.college && item.college !== input.college) {
      return false;
    }
    if (!query) return true;
    return item.name.toLocaleLowerCase('fa-IR').includes(query);
  });
}
