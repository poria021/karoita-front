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
  InternshipEnrollmentRecord,
} from '@/types/internship-enrollment';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';

/**
 * نوشتن ثبت‌نام کارورزی / گزارش هفتگی — endpoint Nest در فرانت نیست.
 * خواندن open-course-selection و professors در `real-enrollment-reads` است.
 * تخصیص مدرسه/معلم راهنما (`assignRealDelayedSchoolMentor`) استثناست — پایین همین فایل.
 */
export function assertEnrollmentWriteReady(surface: string): never {
  throwRealModeNotImplemented(surface);
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
  return status === 'dropped' || status === 'completed' ? status : 'active';
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
    supervisorId: row.professorId ?? null,
    supervisorName: null,
    schoolId: relationId(row.schoolId) ?? input.schoolId,
    schoolName: null,
    mentorId: relationId(row.teacherId) ?? input.mentorId,
    mentorName: null,
    status: mapEnrollmentStatus(row.status),
  };
}
