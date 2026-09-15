import {
  clampLevel,
  kindForRole,
} from '@/services/internship-enrollment/enrollment-mappers';
import { requireNestTransport } from '@/services/require-nest-transport';
import {
  filterSupervisorsClientSide,
  findActiveEnrollmentForLesson,
  findLessonForLevel,
  resolveEnrollmentMentor,
  resolveEnrollmentProfessor,
  resolveEnrollmentSchool,
  studentWeekId,
  toEnrollmentPageState,
  type RealWeeklyData,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { firstOf, personDisplayName } from '@/services/internship-enrollment/real/mappers/primitives';
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
import { usersApi } from '@/services/users/users.api';
import { nestEntityId } from '@/services/syllabus-config/real/real-syllabus-mappers';
import type { NestSemesterWithLessons } from '@/types/nest-admin';
import type {
  NestStudentEnrollment,
  NestStudentWeekSubmission,
} from '@/types/nest-student-enrollments';
import type {
  AttendanceDaysUnavailableReason,
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

/** نتیجهٔ تلاش برای خواندن روز حضور استاد — ببین `resolveSupervisorDay`. */
type SupervisorDayResult = {
  day: string | null;
  /** فقط وقتی `day` واقعاً `null` است تنظیم می‌شود؛ UI برایش پیام مناسب نشان می‌دهد. */
  unavailableReason: AttendanceDaysUnavailableReason | null;
};

/**
 * GET `/professors` فقط استادانی با ظرفیت خالی را می‌دهد — بعد از ثبت‌نام ممکن
 * است استاد از این لیست خارج شده باشد. برای اسم دیگر به این تکیه نمی‌کنیم
 * (ببین `resolveUserDisplayName`)؛ فقط `day` (روز حضور) از همین‌جا می‌آید، چون
 * جای دیگری این اطلاعات نیست — پس این تنها موردی است که واقعاً محدودیت
 * بک‌اند است، نه چیزی که فرانت بتواند دور بزند. کاری که این تابع اضافه‌تر از
 * قبل می‌کند این است که علتِ نبودن `day` را (ظرفیت تکمیل‌شده در برابر خطای
 * شبکه) به فراخوان می‌گوید تا UI به‌جای سکوت، پیام روشن نشان دهد.
 */
async function resolveSupervisorDay(
  semesterId: string,
  lessonId: string,
  professorId: string
): Promise<SupervisorDayResult> {
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
    const day = found?.days.length ? found.days.join('، ') : null;
    // استاد در لیست پیدا نشد یعنی به‌خاطر پر شدن ظرفیتش حذف شده — همان استادی
    // که قبلاً به عنوان ناظر انتخاب شده، نه این‌که وجود نداشته باشد.
    return { day, unavailableReason: day ? null : found ? null : 'capacity-exhausted' };
  } catch {
    return { day: null, unavailableReason: 'error' };
  }
}

/**
 * Fallback فقط — طبق OpenAPI زندهٔ بک‌اند، `GET /student-enrollments` همیشه
 * `professor`/`teacher` را populated برمی‌گرداند (ببین `resolveEnrollmentProfessor`
 * در `enrollment-summary.ts`)، پس این تابع در مسیر معمول صدا زده نمی‌شود. فقط
 * اگر آن فیلد به هر دلیلی خالی بود (مثلاً شکل پاسخ تغییر کند)، همین‌جا از
 * GET `/api/v1/users/{id}` جبران می‌کنیم — لایو تأیید شد با توکن دانشجو هم ۲۰۰
 * می‌دهد، مستقل از ظرفیت باقی‌ماندهٔ استاد/معلم در `/professors` یا `/teachers`.
 */
async function resolveUserDisplayName(userId: string): Promise<string | null> {
  try {
    const user = await usersApi.getById(userId);
    return personDisplayName(user) || null;
  } catch {
    return null;
  }
}

/**
 * Fallback فقط — طبق OpenAPI زندهٔ بک‌اند `GET /student-enrollments` همیشه
 * `school` را populated (با `title`) برمی‌گرداند (ببین `resolveEnrollmentSchool`)،
 * پس این تابع در مسیر معمول صدا زده نمی‌شود. فقط اگر آن فیلد خالی بود، از
 * `GET /admin/schools` (کل فهرست، یک ساعت cache در پروکسی) جبران می‌کنیم.
 */
async function resolveSchoolName(schoolId: string): Promise<string | null> {
  try {
    const raw = await educationSchoolApi.listSchoolsCatalog();
    const schools = raw.data
      .map(mapNestSchool)
      .filter((item): item is InternshipSchoolCapacity => item !== null);
    return schools.find((item) => item.id === schoolId)?.name ?? null;
  } catch {
    return null;
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
 * `GET /student-enrollments` (لیست) طبق OpenAPI زندهٔ بک‌اند همیشه اسم مدرسه/
 * معلم/استاد را در فیلدهای populated `school`/`teacher`/`professor` هم برمی‌گرداند
 * (`resolveEnrollmentSchool`/`resolveEnrollmentMentor`/`resolveEnrollmentProfessor`)
 * — این مسیر معمول است، بدون هیچ درخواست اضافه. فقط اگر آن فیلد خالی بود (fallback
 * دفاعی برای تغییر احتمالی شکل پاسخ)، از `GET /users/{id}` یا `GET /admin/schools`
 * جبران می‌شود. «روز حضور» استثناست: هیچ‌جای دیگری جز `GET /professors` موجود
 * نیست (و آن هم به ظرفیت باقی‌ماندهٔ استاد وابسته است).
 */
async function loadRegisteredEnrollmentDetails(
  input: GetEnrollmentPageStateInput,
  open: NestSemesterWithLessons | null
): Promise<{
  enrollments: NestStudentEnrollment[];
  supervisorName: string | null;
  supervisorDay: string | null;
  supervisorDayUnavailableReason: AttendanceDaysUnavailableReason | null;
  schoolName: string | null;
  mentorName: string | null;
  realWeeklyData?: RealWeeklyData;
}> {
  if (!open) {
    return {
      enrollments: [],
      supervisorName: null,
      supervisorDay: null,
      supervisorDayUnavailableReason: null,
      schoolName: null,
      mentorName: null,
    };
  }

  const enrollments = await loadMyEnrollments();
  const kind = kindForRole(input.actor.role);
  const level = clampLevel(kind, input.level);
  const lesson = findLessonForLevel(open.lessons ?? [], kind, level);
  const lessonId = lesson ? nestEntityId(lesson) : '';
  const active = findActiveEnrollmentForLesson(enrollments, open.id, lessonId || null);
  const enrollmentId = active?.id ?? active?._id ?? '';

  const professor = resolveEnrollmentProfessor(active);
  const school = resolveEnrollmentSchool(active);
  const mentor = resolveEnrollmentMentor(active);

  const [supervisorName, supervisorDayResult, schoolNameResolved, mentorNameResolved, realWeeklyData] =
    await Promise.all([
      professor?.name
        ? Promise.resolve(professor.name)
        : professor?.id
          ? resolveUserDisplayName(professor.id)
          : Promise.resolve(null),
      professor?.id && lessonId
        ? resolveSupervisorDay(open.id, lessonId, professor.id)
        : Promise.resolve<SupervisorDayResult>({ day: null, unavailableReason: null }),
      school?.title || !school?.id
        ? Promise.resolve(school?.title || null)
        : resolveSchoolName(school.id),
      mentor?.title || !mentor?.id
        ? Promise.resolve(mentor?.title || null)
        : resolveUserDisplayName(mentor.id),
      enrollmentId ? loadRealWeeklyData(enrollmentId) : Promise.resolve(undefined),
    ]);

  return {
    enrollments,
    supervisorName,
    supervisorDay: supervisorDayResult.day,
    supervisorDayUnavailableReason: supervisorDayResult.unavailableReason,
    schoolName: schoolNameResolved,
    mentorName: mentorNameResolved,
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
