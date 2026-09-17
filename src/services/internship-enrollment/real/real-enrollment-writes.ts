import { ApiClientError } from '@/services/api-error';
import {
  courseNameForKind,
} from '@/services/internship-enrollment/enrollment-mappers';
import {
  findLessonForLevel,
  resolveEnrollmentProfessor,
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
 * POST `/api/v1/student-enrollments` — ثبت‌نام اولیهٔ دانشجو/کارآموز با استاد راهنما.
 *
 * جریان:
 * 1. ترم باز را از `open-course-selection` می‌گیریم تا `semesterId` و `lessonId` معتبر باشند.
 * 2. درس مناسب سطح/نوع را پیدا می‌کنیم.
 * 3. POST می‌زنیم و رکورد ثبت‌نام را برمی‌گردانیم.
 *
 * توجه: طبق OpenAPI زندهٔ بک‌اند، پاسخ POST همیشه ۲۰۴ (بی‌بدنه) است؛
 * `studentEnrollmentsApi.create` این را با یک GET لیست جبران می‌کند (ببین
 * `student-enrollments.api.ts`) — یعنی `created` همان ردیف `GET /student-enrollments`
 * است و طبق `StudentEnrollmentListItemDto` فیلد populated `professor` را دارد؛
 * `resolveEnrollmentProfessor` همان را اولویت می‌دهد، بدون درخواست اضافه.
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
  const createdProfessor = resolveEnrollmentProfessor(created);

  return {
    id: enrollmentId,
    userId: input.actor.id,
    role: input.actor.role,
    kind: input.kind,
    level: input.level,
    termId: open.id,
    termTitle: '',
    title: normalizeEnrollmentCourseTitle(courseNameForKind(input.kind), input.level),
    supervisorId: createdProfessor?.id ?? input.supervisorId,
    supervisorName: createdProfessor?.name ?? null,
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
    rows.find(
      (row) =>
        row.status !== 'dropped' &&
        row.status !== 'cancelled' &&
        (lessonId
          ? (row.lessonId ?? '').trim() === lessonId
          : row.semesterId === input.termId)
    ) ?? null;

  const enrollmentId = current?.id ?? current?._id ?? '';
  if (!current || !enrollmentId) {
    throw new ApiClientError('ثبت‌نام فعالی برای لغو یافت نشد.', 404);
  }

  await studentEnrollmentsApi.cancel(enrollmentId);
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
 * `listDelayedSchools` (GET `/admin/schools`) و `listDelayedMentors`
 * (GET `/student-enrollments/teachers`) هر دو وصل شده‌اند.
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
    rows.find(
      (row) =>
        row.status !== 'dropped' &&
        row.status !== 'cancelled' &&
        (lessonId
          ? (row.lessonId ?? '').trim() === lessonId
          : row.semesterId === input.termId)
    ) ?? null;

  const enrollmentId = current?.id ?? current?._id ?? '';
  if (!current || !enrollmentId) {
    throw new ApiClientError('ثبت‌نام فعالی برای این کارورز یافت نشد.', 404);
  }

  const updated = await studentEnrollmentsApi.updateSchoolTeacher(
    enrollmentId,
    { schoolId: input.schoolId, teacherId: input.mentorId }
  );
  // پاسخ PATCH (`StudentEnrollment`) فقط `professorId` خام دارد، نه فیلد
  // populated `professor` — یعنی `resolveEnrollmentProfessor(row)` تقریباً
  // همیشه یک آبجکت غیر-null با `name: null` برمی‌گرداند (نه واقعاً `null`)،
  // پس `??` به‌تنهایی هرگز به `current` (که populated و اسم واقعی دارد) نمی‌رسد.
  // استاد ناظر با این تخصیص عوض نمی‌شود، پس صریحاً اول دنبال یک `name` واقعی
  // می‌گردیم؛ فقط اگر هیچ‌کدام اسم نداشتند، به id-only ردیف تازه‌تر برمی‌گردیم.
  const row = updated ?? current;
  const rowProfessor = resolveEnrollmentProfessor(row);
  const currentProfessor = resolveEnrollmentProfessor(current);
  const professor =
    rowProfessor?.name != null
      ? rowProfessor
      : (currentProfessor ?? rowProfessor);

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
    supervisorId: professor?.id ?? null,
    supervisorName: professor?.name ?? null,
    // مستقیماً از `input` — PATCH دقیقاً همین `schoolId`/`mentorId` را فرستاده و
    // اگر بدون خطا برگشته یعنی همین مقدار اعمال شده. خواندنش از پاسخ PATCH
    // (`row.schoolId`) ریسک نمایش مقدار قدیمی را دارد اگر `updated` یک روز
    // بدون بدنه برگردد (`row` آن‌وقت به `current` — ردیف *قبل از* این PATCH —
    // fallback می‌کند)؛ طبق Swagger فعلی این اتفاق نمی‌افتد، ولی چون `input`
    // همیشه دقیق و در دسترس است، دلیلی برای ریسک اضافه (حتی نظری) نیست.
    schoolId: input.schoolId,
    schoolName: null,
    mentorId: input.mentorId,
    mentorName: null,
    status: mapEnrollmentStatus(row.status ?? current.status),
  };
}
