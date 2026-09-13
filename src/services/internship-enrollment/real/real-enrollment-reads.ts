import {
  clampLevel,
  kindForRole,
} from '@/services/internship-enrollment/enrollment-mappers';
import { requireNestTransport } from '@/services/require-nest-transport';
import {
  filterSupervisorsClientSide,
  findActiveEnrollmentForLesson,
  findLessonForLevel,
  studentWeekId,
  toEnrollmentPageState,
  type RealWeeklyData,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { firstOf } from '@/services/internship-enrollment/real/mappers/primitives';
import {
  cacheSupervisorName,
  getCachedSupervisorName,
} from '@/services/internship-enrollment/real/supervisor-name-cache';
import {
  filterSchoolsClientSide,
  mapNestSchool,
} from '@/services/internship-enrollment/real/mappers/school-mapping';
import {
  filterTeachersClientSide,
  mapEnrollmentTeacher,
} from '@/services/internship-enrollment/real/mappers/teacher-mapping';
import {
  ENROLLMENT_PROFESSORS_PAGE_SIZE,
  studentEnrollmentsApi,
} from '@/services/internship-enrollment/real/student-enrollments.api';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';
import { educationSchoolApi } from '@/services/admin-catalog/resources/education-school.api';
import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestSemesterWithLessons } from '@/types/nest-admin';
import type {
  NestStudentEnrollment,
  NestStudentWeekSubmission,
} from '@/types/nest-student-enrollments';
import type {
  GetEnrollmentPageStateInput,
  InternshipEnrollmentPageState,
  InternshipMentorCapacity,
  InternshipSchoolCapacity,
  InternshipSupervisor,
  ListDelayedMentorsInput,
  ListDelayedSchoolsInput,
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

/**
 * GET `/professors` فقط استادانی با ظرفیت خالی را می‌دهد — بعد از ثبت‌نام ممکن
 * است استاد از این لیست خارج شده باشد. اول کش محلی (`supervisor-name-cache`) را
 * چک می‌کنیم؛ فقط اگر آنجا نبود سراغ این query سنگین (تا ۴۰ صفحه) می‌رویم.
 */
async function resolveSupervisorInfo(
  semesterId: string,
  lessonId: string,
  professorId: string
): Promise<{ name: string | null; day: string | null }> {
  const cachedName = getCachedSupervisorName(professorId);

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
    if (found?.name) cacheSupervisorName(professorId, found.name);
    return {
      name: found?.name ?? cachedName,
      day: found?.day?.trim() || null,
    };
  } catch {
    return { name: cachedName, day: null };
  }
}

/**
 * برای هر هفته آخرین submission رو best-effort می‌گیرد — یه هفته که هنوز
 * ارسالی نداشته باعث شکست کل صفحه نمی‌شود.
 */
async function loadLatestSubmissionByWeekId(
  weeks: RealWeeklyData['weeks']
): Promise<Map<string, NestStudentWeekSubmission>> {
  const result = new Map<string, NestStudentWeekSubmission>();
  await Promise.all(
    weeks.map(async (week) => {
      const id = studentWeekId(week);
      if (!id) return;
      try {
        const submissions = await studentWeeksApi.listSubmissions(id);
        const latest = submissions[submissions.length - 1];
        if (latest) result.set(id, latest);
      } catch {
        // best-effort — یه هفته بدون تاریخچه نباید بقیه رو بترکونه.
      }
    })
  );
  return result;
}

/** GET `weeks` + `score-summary` این ثبت‌نام؛ شکست کامل → `undefined` (فراخوان به fallback برمی‌گردد). */
async function loadRealWeeklyData(enrollmentId: string): Promise<RealWeeklyData | undefined> {
  try {
    const [weeks, scoreSummary] = await Promise.all([
      studentEnrollmentsApi.listWeeks(enrollmentId),
      studentEnrollmentsApi.getScoreSummary(enrollmentId),
    ]);
    const latestSubmissionByWeekId = await loadLatestSubmissionByWeekId(weeks);
    return { weeks, scoreSummary, latestSubmissionByWeekId };
  } catch {
    return undefined;
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
  realWeeklyData?: RealWeeklyData;
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

  const enrollmentId = active?.id ?? active?._id ?? '';
  const realWeeklyData = enrollmentId ? await loadRealWeeklyData(enrollmentId) : undefined;

  return {
    enrollments,
    supervisorName: supervisorInfo.name,
    supervisorDay: supervisorInfo.day,
    realWeeklyData,
  };
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

/**
 * GET `/admin/schools` — فقط برای پر کردن دراپ‌باکس مدرسه در تخصیص دیرهنگام.
 * فیلتر استان روی `provinceId` نیست (Nest نامش را برنمی‌گرداند)؛ مثل استادها
 * (`filterSupervisorsClientSide`) سمت کلاینت روی عنوان استان فیلتر می‌شود.
 * ظرفیت (`capacities`) هنوز از بکند در دسترس نیست — همیشه خالی برمی‌گردد.
 */
export async function listRealDelayedSchools(
  input: ListDelayedSchoolsInput
): Promise<InternshipSchoolCapacity[]> {
  requireNestTransport('InternshipEnrollmentService.listDelayedSchools');

  const province = firstOf(input.actor.province, '');
  const query = input.query.trim();
  const raw = await educationSchoolApi.listSchoolsCatalog(
    query ? { title: query } : {}
  );

  const schools = raw.data
    .map(mapNestSchool)
    .filter((item): item is InternshipSchoolCapacity => item !== null);

  return filterSchoolsClientSide(schools, { query: '', province });
}

/**
 * GET `/api/v1/student-enrollments/teachers?schoolId=` — معلمان ناظر یک مدرسه
 * برای دراپ‌باکس تخصیص دیرهنگام؛ فیلتر جست‌وجو سمت کلاینت است.
 */
export async function listRealDelayedMentors(
  input: ListDelayedMentorsInput
): Promise<InternshipMentorCapacity[]> {
  requireNestTransport('InternshipEnrollmentService.listDelayedMentors');

  const schoolId = input.schoolId.trim();
  if (!schoolId) return [];

  const raw = await studentEnrollmentsApi.listTeachers(schoolId);
  const teachers = raw
    .map((row) => mapEnrollmentTeacher(row, schoolId))
    .filter((item): item is InternshipMentorCapacity => item !== null);

  return filterTeachersClientSide(teachers, input.query);
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
