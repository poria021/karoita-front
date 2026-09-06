/**
 * نگاشت خالص Nest → قرارداد فرانت انتخاب واحد. بدون HTTP — فقط parse/format.
 * سطح (level) از عنوان درس با همان `lessonLevelFromTitle` ظرفیت اساتید استخراج می‌شود
 * تا با تنها منبع «عنوان → سطح» موجود در پروژه یکی بماند.
 */
import {
  nestRelationId,
  nestRelationTitle,
} from '@/services/org-structure/real/real-org-mappers';
import { lessonLevelFromTitle } from '@/services/organizational-capacities/real/real-organizational-capacities-mappers';
import {
  nestEntityId,
  nestLessonTitle,
  parseNestSemesterBundle,
  toAcademicTerm,
} from '@/services/syllabus-config/real/real-syllabus-mappers';
import { getTermGateFlags } from '@/services/syllabus-config/syllabus-enrollment-reads';
import type { NestLesson, NestSemesterWithLessons } from '@/types/nest-admin';
import { parseNestPagedList } from '@/types/nest-admin';
import type {
  NestEligibleProfessor,
  NestStudentEnrollmentStatus,
} from '@/types/nest-student-enrollment';
import type {
  InternshipEnrollmentLevel,
  InternshipSupervisor,
} from '@/types/internship-enrollment';

/** برچسب فیلدی که real هنوز نمی‌دهد — همان قرارداد mock (`PLACEHOLDER_UNSET`)، داده جعل نشود. */
export const ENROLLMENT_UNSET_LABEL = 'مشخص نشده';

const WEEKDAY_FULL_NAMES = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapDoc(value: Record<string, unknown>): Record<string, unknown> {
  return isRecord(value._doc) ? (value._doc as Record<string, unknown>) : value;
}

function asFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function isEnrollmentStatus(value: unknown): value is NestStudentEnrollmentStatus {
  return value === 'active' || value === 'dropped' || value === 'completed';
}

/** `days`: ۰=شنبه … ۵=پنجشنبه (هم‌قرارداد با ظرفیت اساتید). */
export function formatAttendanceDays(days: number[] | undefined): string | null {
  if (!Array.isArray(days) || days.length === 0) return null;
  const labels = Array.from(new Set(days))
    .filter((day) => Number.isInteger(day) && day >= 0 && day < WEEKDAY_FULL_NAMES.length)
    .sort((a, b) => a - b)
    .map((day) => WEEKDAY_FULL_NAMES[day]);
  return labels.length > 0 ? labels.join('، ') : null;
}

/** سطح یک درس از روی عنوانش (`کارورزی ۲` → ۲) — همان قرارداد ظرفیت اساتید. */
export function levelForLesson(lesson: NestLesson): InternshipEnrollmentLevel {
  return lessonLevelFromTitle(nestLessonTitle(lesson));
}

export function findLessonForLevel(
  lessons: NestLesson[],
  level: InternshipEnrollmentLevel
): NestLesson | null {
  return lessons.find((lesson) => levelForLesson(lesson) === level) ?? null;
}

export type RealEnrollmentContext = {
  termId: string;
  termTitle: string;
  syllabusConfigured: boolean;
  enrollOpen: boolean;
  termOpen: boolean;
  lessonId: string | null;
};

/**
 * `GET /student-enrollments/open-course-selection` همان شکل `NestSemesterWithLessons` را می‌دهد؛
 * mapper سرفصل ادمین را دوباره استفاده می‌کنیم (`toAcademicTerm` + `getTermGateFlags`).
 */
export function parseOpenCourseSelectionBundle(
  raw: unknown
): NestSemesterWithLessons | null {
  return parseNestSemesterBundle(raw);
}

export function buildRealEnrollmentContext(
  bundle: NestSemesterWithLessons | null,
  level: InternshipEnrollmentLevel,
  todayJalali: string
): RealEnrollmentContext {
  if (!bundle) {
    return {
      termId: '',
      termTitle: 'نیم‌سال جاری',
      syllabusConfigured: false,
      enrollOpen: false,
      termOpen: false,
      lessonId: null,
    };
  }
  const term = toAcademicTerm(bundle, { lessons: bundle.lessons, todayJalali });
  const gates = getTermGateFlags(term);
  const lesson = findLessonForLevel(bundle.lessons ?? [], level);
  return {
    termId: term.id,
    termTitle: term.title,
    syllabusConfigured: Boolean(lesson),
    enrollOpen: gates.enrollOpen,
    termOpen: gates.termOpen,
    lessonId: lesson ? nestEntityId(lesson) : null,
  };
}

export function professorDisplayName(professor: {
  firstName?: string;
  lastName?: string;
}): string {
  return `${professor.firstName ?? ''} ${professor.lastName ?? ''}`.trim();
}

/**
 * `InternshipSupervisor` فرانت `province` و `day` تکی دارد؛ real دانشگاه (آرایه) و
 * روزهای چندگانه می‌دهد. `province` را جعل نمی‌کنیم — سرور خودش استاد را به
 * دانشگاه دانشجو محدود کرده، ستون فقط برای هم‌شکلی UI با mock نگه داشته شده.
 */
export function toInternshipSupervisor(
  professor: NestEligibleProfessor
): InternshipSupervisor {
  const name = professorDisplayName(professor) || ENROLLMENT_UNSET_LABEL;
  const college =
    (professor.university ?? [])
      .map((item) => item.title?.trim())
      .filter((title): title is string => Boolean(title))
      .join('، ') || ENROLLMENT_UNSET_LABEL;

  return {
    id: professor.id,
    name,
    college,
    province: ENROLLMENT_UNSET_LABEL,
    day: formatAttendanceDays(professor.days) ?? ENROLLMENT_UNSET_LABEL,
    capacity: Number.isFinite(professor.capacity) ? professor.capacity : null,
  };
}

export function parseNestEligibleProfessor(
  raw: unknown
): NestEligibleProfessor | null {
  if (!isRecord(raw)) return null;
  const doc = unwrapDoc(raw);
  const id = nestRelationId(doc.id) || nestRelationId(doc._id);
  if (!id) return null;

  const university = Array.isArray(doc.university)
    ? (doc.university as unknown[])
        .map((item) => {
          if (!isRecord(item)) return null;
          const universityId = nestRelationId(item.id) || nestRelationId(item._id);
          const title = typeof item.title === 'string' ? item.title.trim() : '';
          return universityId && title ? { id: universityId, title } : null;
        })
        .filter((item): item is { id: string; title: string } => item !== null)
    : [];

  const days = Array.isArray(doc.days)
    ? (doc.days as unknown[]).filter((day): day is number => typeof day === 'number')
    : undefined;

  const photo =
    isRecord(doc.photo) &&
    typeof doc.photo.id === 'string' &&
    typeof doc.photo.path === 'string'
      ? { id: doc.photo.id, path: doc.photo.path }
      : null;

  return {
    id,
    firstName: typeof doc.firstName === 'string' ? doc.firstName : '',
    lastName: typeof doc.lastName === 'string' ? doc.lastName : '',
    photo,
    university,
    capacity: asFiniteNumber(doc.capacity, 0),
    days,
  };
}

export function parseNestEligibleProfessorsResponse(raw: unknown): {
  data: NestEligibleProfessor[];
  hasNextPage: boolean;
} {
  if (Array.isArray(raw)) {
    return {
      data: raw
        .map(parseNestEligibleProfessor)
        .filter((row): row is NestEligibleProfessor => row !== null),
      hasNextPage: false,
    };
  }
  if (isRecord(raw) && Array.isArray(raw.data)) {
    return {
      data: raw.data
        .map(parseNestEligibleProfessor)
        .filter((row): row is NestEligibleProfessor => row !== null),
      hasNextPage: Boolean(raw.hasNextPage),
    };
  }
  return { data: [], hasNextPage: false };
}

export type RealStudentEnrollment = {
  id: string;
  studentId: string;
  semesterId: string;
  lessonId: string;
  professorId: string;
  status: NestStudentEnrollmentStatus;
  schoolId: string | null;
  schoolTitle: string | null;
  teacherId: string | null;
  teacherTitle: string | null;
};

export function parseRealStudentEnrollment(
  raw: unknown
): RealStudentEnrollment | null {
  if (!isRecord(raw)) return null;
  const doc = unwrapDoc(raw);
  const id = nestRelationId(doc.id) || nestRelationId(doc._id);
  const semesterId = nestRelationId(doc.semesterId);
  const lessonId = nestRelationId(doc.lessonId);
  const professorId = nestRelationId(doc.professorId);
  const studentId = nestRelationId(doc.studentId);
  if (!id || !semesterId || !lessonId || !professorId) return null;

  return {
    id,
    studentId,
    semesterId,
    lessonId,
    professorId,
    status: isEnrollmentStatus(doc.status) ? doc.status : 'active',
    schoolId: nestRelationId(doc.schoolId) || null,
    schoolTitle: nestRelationTitle(doc.schoolId) ?? null,
    teacherId: nestRelationId(doc.teacherId) || null,
    teacherTitle: nestRelationTitle(doc.teacherId) ?? null,
  };
}

/** `GET /student-enrollments` — Swagger آرایهٔ خام است؛ `parseNestPagedList` هر دو شکل را می‌پذیرد. */
export function parseRealStudentEnrollmentPage(raw: unknown): {
  data: RealStudentEnrollment[];
  hasNextPage: boolean;
} {
  const page = parseNestPagedList<unknown>(raw);
  return {
    data: page.data
      .map(parseRealStudentEnrollment)
      .filter((row): row is RealStudentEnrollment => row !== null),
    hasNextPage: page.hasNextPage,
  };
}
