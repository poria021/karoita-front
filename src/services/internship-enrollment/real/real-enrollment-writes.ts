import { throwRealModeNotImplemented } from '@/lib/api-mode';
import { ApiClientError } from '@/services/api-error';
import {
  courseNameForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  findLessonForLevel,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { requireNestTransport } from '@/services/require-nest-transport';
import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import { normalizeEnrollmentCourseTitle } from '@/utils/enrollment-eligibility';
import type {
  AssignDelayedSchoolMentorInput,
  CancelEnrollmentInput,
  EnrollWithSupervisorInput,
  InternshipEnrollmentRecord,
} from '@/types/internship-enrollment';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';

/**
 * ثبت‌نام هفتگی/گزارش هنوز stub است — endpoint Nest مستند‌شده‌ای ندارد.
 * تخصیص مدرسه/معلم راهنما (`assignRealDelayedSchoolMentor`) استثناست — پایین همین فایل.
 * `enrollRealWithSupervisor` (ثبت‌نام اولیه) هم پیاده‌سازی شده — پایین همین فایل.
 */
export function assertEnrollmentWriteReady(surface: string): never {
  throwRealModeNotImplemented(surface);
}

/**
 * POST `/api/v1/student-enrollments` — ثبت‌نام اولیهٔ دانشجو/کارآموز با استاد راهنما.
 *
 * جریان:
 * 1. ترم باز را از `open-course-selection` می‌گیریم تا `semesterId` و `lessonId` معتبر باشند.
 * 2. درس مناسب سطح/نوع را پیدا می‌کنیم.
 * 3. POST می‌زنیم و رکورد ثبت‌نام را برمی‌گردانیم.
 *
 * توجه: `supervisorName` را Nest در پاسخ POST برنمی‌گرداند — در UI از اطلاعات کش
 * فهرست اساتید پر می‌شود.
 */
export async function enrollRealWithSupervisor(
  input: EnrollWithSupervisorInput
): Promise<InternshipEnrollmentRecord> {
  requireNestTransport('InternshipEnrollmentService.enrollWithSupervisor');

  const open = await studentEnrollmentsApi.getOpenCourseSelection();
  if (!open) {
    throw new ApiClientError('ترم انتخاب واحد فعالی وجود ندارد.', 404);
  }

  const lesson = findLessonForLevel(open.lessons ?? [], input.kind, input.level);
  const lessonId = lesson ? nestEntityId(lesson) : '';
  if (!lessonId) {
    throw new ApiClientError(
      'درس مناسب برای این سطح در ترم باز یافت نشد.',
      404
    );
  }

  const created = await studentEnrollmentsApi.create({
    semesterId: open.id,
    lessonId,
    professorId: input.supervisorId,
  });

  const enrollmentId = created?.id ?? created?._id ?? '';

  return {
    id: enrollmentId,
    userId: input.actor.id,
    role: input.actor.role,
    kind: input.kind,
    level: input.level,
    termId: open.id,
    termTitle: '',
    title: normalizeEnrollmentCourseTitle(courseNameForKind(input.kind), input.level),
    supervisorId: created?.professorId ?? input.supervisorId,
    supervisorName: null,
    schoolId: null,
    schoolName: null,
    mentorId: null,
    mentorName: null,
    status: 'active',
  };
}

/**
 * PATCH `/api/v1/student-enrollments/{id}/cancel` — لغو ثبت‌نام دانشجو.
 * ابتدا لیست ثبت‌نام‌ها را می‌گیرد تا id را پیدا کند، سپس cancel می‌زند.
 */
export async function cancelRealEnrollment(
  input: CancelEnrollmentInput
): Promise<void> {
  requireNestTransport('InternshipEnrollmentService.cancelEnrollment');

  const [open, rows] = await Promise.all([
    studentEnrollmentsApi.getOpenCourseSelection(),
    studentEnrollmentsApi.listMine(),
  ]);

  const lesson = open
    ? findLessonForLevel(open.lessons ?? [], input.kind, input.level)
    : null;
  const lessonId = lesson ? nestEntityId(lesson) : '';

  const current =
    rows.find((row) =>
      lessonId
        ? (row.lessonId ?? '').trim() === lessonId
        : row.semesterId === input.termId
    ) ?? null;

  const enrollmentId = current?.id ?? current?._id ?? '';
  if (!current || !enrollmentId) {
    throw new ApiClientError('ثبت‌نام فعالی برای لغو یافت نشد.', 404);
  }

  await studentEnrollmentsApi.cancel(enrollmentId);
}

function relationId(value: NestStudentEnrollment['schoolId']): string | null {
  if (typeof value === 'string') {
    const id = value.trim();
    return id || null;
  }
  if (value && typeof value === 'object') {
    const record = value as { id?: string; _id?: string };
    const id = record.id ?? record._id;
    return typeof id === 'string' && id ? id : null;
  }
  return null;
}

function mapEnrollmentStatus(
  status: NestStudentEnrollment['status']
): InternshipEnrollmentRecord['status'] {
  if (status === 'completed') return 'completed';
  if (status === 'dropped' || status === 'cancelled') return 'dropped';
  return 'active';
}

/**
 * PATCH `/api/v1/student-enrollments/{id}` — فقط مدرسه/معلم راهنما قابل تغییرند.
 * Nest شناسهٔ ثبت‌نام را از ورودی نمی‌گیرد؛ باید اول از GET `/student-enrollments`
 * (لیست کاربر جاری) ردیفِ همین درس/ترم را پیدا کرد، بعد PATCH زد.
 *
 * توجه: `listDelayedSchools` / `listDelayedMentors` (فهرست مدرسه/معلم قابل انتخاب)
 * هنوز endpoint مستند‌شده‌ای ندارند و همچنان stub هستند — یعنی این تابع آماده است
 * ولی فلوی UI کامل (`useDelayedSchoolMentorAssignment`) تا وصل‌شدن آن دو هنوز در
 * حالت real کار نمی‌کند.
 */
export async function assignRealDelayedSchoolMentor(
  input: AssignDelayedSchoolMentorInput
): Promise<InternshipEnrollmentRecord> {
  requireNestTransport('InternshipEnrollmentService.assignDelayedSchoolMentor');

  const [open, rows] = await Promise.all([
    studentEnrollmentsApi.getOpenCourseSelection(),
    studentEnrollmentsApi.listMine(),
  ]);

  const lesson = open
    ? findLessonForLevel(open.lessons ?? [], input.kind, input.level)
    : null;
  const lessonId = lesson ? nestEntityId(lesson) : '';

  const current =
    rows.find((row) =>
      lessonId
        ? (row.lessonId ?? '').trim() === lessonId
        : row.semesterId === input.termId
    ) ?? null;

  const enrollmentId = current?.id ?? current?._id ?? '';
  if (!current || !enrollmentId) {
    throw new ApiClientError('ثبت‌نام فعالی برای این کارورز یافت نشد.', 404);
  }

  const updated = await studentEnrollmentsApi.updateSchoolTeacher(
    enrollmentId,
    { schoolId: input.schoolId, teacherId: input.mentorId }
  );
  // پاسخ PATCH ممکن است فقط school/teacher برگرداند؛ professor از ردیف قبلی می‌ماند.
  const row = updated ?? current;

  return {
    id: enrollmentId,
    userId: input.actor.id,
    role: input.actor.role,
    kind: input.kind,
    level: input.level,
    termId: input.termId,
    termTitle: '',
    title: normalizeEnrollmentCourseTitle(
      courseNameForKind(input.kind),
      input.level
    ),
    supervisorId: row.professorId ?? current.professorId ?? null,
    supervisorName: null,
    schoolId: relationId(row.schoolId) ?? input.schoolId,
    schoolName: null,
    mentorId: relationId(row.teacherId) ?? input.mentorId,
    mentorName: null,
    status: mapEnrollmentStatus(row.status ?? current.status),
  };
}
