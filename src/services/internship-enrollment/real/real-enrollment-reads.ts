import {
  clampLevel,
  kindForRole,
} from '@/services/internship-enrollment/enrollment-mappers';
import { requireNestTransport } from '@/services/require-nest-transport';
import {
  filterSupervisorsClientSide,
  findActiveEnrollmentForLesson,
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
import type { NestMentorCapacity, NestMentorStudentsPage } from '@/types/nest-student-enrollments';

const PROFESSORS_MAX_PAGES = 40;

async function loadMyEnrollments(): Promise<NestStudentEnrollment[]> {
  try {
    return await studentEnrollmentsApi.listMine();
  } catch {
    return [];
  }
}

async function resolveSupervisorInfo(
  semesterId: string,
  lessonId: string,
  professorId: string
): Promise<{ name: string | null; day: string | null }> {
  try {
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
    const found = collected.find((item) => item.id === professorId);
    return {
      name: found?.name ?? null,
      day: found?.day?.trim() || null,
    };
  } catch {
    return { name: null, day: null };
  }
}

/**
 * لیست ثبت‌نام خود دانشجو معیار «اخذ شده» است — نه `lesson.status`.
 * نام استاد در رکورد نیست؛ best-effort از GET `/professors` با `professorId`.
 */
async function loadRegisteredEnrollmentDetails(
  input: GetEnrollmentPageStateInput,
  open: NestSemesterWithLessons | null
): Promise<{
  enrollments: NestStudentEnrollment[];
  supervisorName: string | null;
  supervisorDay: string | null;
}> {
  if (!open) return { enrollments: [], supervisorName: null, supervisorDay: null };

  const enrollments = await loadMyEnrollments();
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const lesson = findLessonForLevel(open.lessons ?? [], kind, level);
  const lessonId = lesson ? nestEntityId(lesson) : '';
  const active = findActiveEnrollmentForLesson(enrollments, open.id, lessonId || null);
  const professorId = active?.professorId?.trim() ?? '';
  const supervisorInfo =
    professorId && lessonId
      ? await resolveSupervisorInfo(open.id, lessonId, professorId)
      : { name: null, day: null };

  return { enrollments, supervisorName: supervisorInfo.name, supervisorDay: supervisorInfo.day };
}

export async function getRealEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): Promise<InternshipEnrollmentPageState> {
  requireNestTransport('InternshipEnrollmentService.getEnrollmentPageState');
  const open = await studentEnrollmentsApi.getOpenCourseSelection();
  const registeredDetails = await loadRegisteredEnrollmentDetails(input, open);
  return toEnrollmentPageState(input, open, registeredDetails);
}

/**
 * GET `/api/v1/student-enrollments/mentor/students`
 * فهرست دانشجویان/کارآموزان متصل به منتور احراز هویت‌شده.
 */
export async function listRealMentorStudents(query: {
  semesterId?: string;
  lessonId?: string;
  page?: number;
  limit?: number;
}): Promise<NestMentorStudentsPage> {
  requireNestTransport('InternshipEnrollmentService.listMentorStudents');
  return studentEnrollmentsApi.listMentorStudents(query);
}

/**
 * GET `/api/v1/student-enrollments/mentor/capacity?semesterId=`
 * ظرفیت کل، انتخاب‌شده و باقی‌مانده منتور در یک ترم.
 */
export async function getRealMentorCapacity(
  semesterId: string
): Promise<NestMentorCapacity> {
  requireNestTransport('InternshipEnrollmentService.getMentorCapacity');
  return studentEnrollmentsApi.getMentorCapacity(semesterId);
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
    province: input.province ?? '',
    college: input.college ?? '',
  });
}
