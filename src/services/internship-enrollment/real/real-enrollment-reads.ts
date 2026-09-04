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
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
  InternshipSupervisor,
  ListEligibleSupervisorsInput,
} from '@/types/internship-enrollment';

const PROFESSORS_MAX_PAGES = 40;

export async function getRealEnrollmentPageState(
  input: GetEnrollmentPageStateInput
): Promise<InternshipEnrollmentPageState> {
  requireNestTransport('InternshipEnrollmentService.getEnrollmentPageState');
  const open = await studentEnrollmentsApi.getOpenCourseSelection();
  return toEnrollmentPageState(input, open);
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
