import {
  clampLevel,
  kindForRole,
} from '@/services/internship-enrollment/enrollment-mappers';
import { requireNestTransport } from '@/services/require-nest-transport';
import {
  filterSupervisorsClientSide,
  findLessonForLevel,
  toEnrollmentPageState,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import {
  ENROLLMENT_PROFESSORS_PAGE_SIZE,
  studentEnrollmentsApi,
} from '@/services/internship-enrollment/real/student-enrollments.api';
import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestSemesterWithLessons } from '@/types/nest-admin';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
  InternshipSupervisor,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';

const PROFESSORS_MAX_PAGES = 40;

/**
 * جزئیات ثبت‌نام واقعی (مدرسه/معلم/وضعیت) از GET `/student-enrollments`.
 * فقط وقتی لازم است که `open-course-selection` همین درس را «اخذ‌شده» علامت زده باشد.
 * نام استاد راهنما اینجا resolve نمی‌شود — `professorId` فقط شناسه‌ست و
 * Swagger فعلی endpoint جداگانه‌ای برای نگاشت آن به نام نداده.
 */
async function loadRegisteredEnrollmentDetails(
  input: GetEnrollmentPageStateInput,
  open: NestSemesterWithLessons | null
): Promise<
  { enrollment: NestStudentEnrollment | null; supervisorName: string | null } | undefined
> {
  if (!open) return undefined;
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const lesson = findLessonForLevel(open.lessons ?? [], kind, level);
  if (lesson?.status !== true) return undefined;

  const lessonId = nestEntityId(lesson);
  if (!lessonId) return { enrollment: null, supervisorName: null };

  try {
    const rows = await studentEnrollmentsApi.listMine();
    const enrollment =
      rows.find((row) => (row.lessonId ?? '').trim() === lessonId) ?? null;
    return { enrollment, supervisorName: null };
  } catch {
    // بهترین تلاش — نبود جزئیات نباید کل صفحه را بشکند؛ خلاصهٔ حداقلی جایگزین می‌شود.
    return { enrollment: null, supervisorName: null };
  }
}

export async function getRealEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): Promise<InternshipEnrollmentPageState> {
  requireNestTransport('InternshipEnrollmentService.getEnrollmentPageState');
  const open = await studentEnrollmentsApi.getOpenCourseSelection();
  const registeredDetails = await loadRegisteredEnrollmentDetails(input, open);
  return toEnrollmentPageState(input, open, registeredDetails);
}

export async function listRealEligibleSupervisors(
  input: ListEligibleSupervisorsInput
): Promise<InternshipSupervisor[]> {
  requireNestTransport('InternshipEnrollmentService.listEligibleSupervisors');

  let semesterId = input.semesterId?.trim() ?? '';
  let lessonId = input.lessonId?.trim() ?? '';

  if (!semesterId || !lessonId) {
    const open = await studentEnrollmentsApi.getOpenCourseSelection();
    if (!open) return [];
    semesterId = semesterId || open.id;
    const lesson =
      findLessonForLevel(open.lessons ?? [], input.kind, input.level);
    lessonId = lessonId || nestEntityId(lesson ?? {});
  }

  if (!semesterId || !lessonId) return [];

  const collected: InternshipSupervisor[] = [];
  for (let page = 1; page <= PROFESSORS_MAX_PAGES; page += 1) {
    const result = await studentEnrollmentsApi.listProfessors({
      semesterId,
      lessonId,
      page,
      limit: ENROLLMENT_PROFESSORS_PAGE_SIZE,
    });
    collected.push(...result.data);
    if (!result.hasNextPage) break;
  }

  return filterSupervisorsClientSide(collected, {
    query: input.query,
    province: input.province,
    college: input.college,
  });
}
