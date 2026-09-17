import {
  toDailyApprovalCatalogCourses,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { withDerivedDailyApprovalTrainee } from '@/services/daily-approvals/daily-approval-derived';
import { loadWeekConversationMessages } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import { resolveWeekFeedback } from '@/services/internship-enrollment/real/mappers/week-feedback';
import { listRealCapacityCourses } from '@/services/organizational-capacities/real/real-organizational-capacities';
import { getRealAcademicSettings } from '@/services/syllabus-config/real/real-syllabus-reads';
import {
  mapWeekStatus,
  studentWeekId,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { mapSubmissionFiles } from '@/services/internship-enrollment/real/mappers/weekly-sessions';
import { resolveEnrollmentMentor } from '@/services/internship-enrollment/real/mappers/enrollment-summary';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
import { studentWeeksApi } from '@/services/internship-enrollment/real/student-weeks.api';
import { requireNestTransport } from '@/services/require-nest-transport';
import type { UserRole } from '@/types/auth';
import type {
  DailyApprovalAttachment,
  DailyApprovalCourseFilter,
  DailyApprovalProgressiveGrade,
  DailyApprovalTrainee,
  DailyApprovalTraineeStatus,
  DailyApprovalWeek,
  DailyApprovalWeekDetail,
  ListDailyApprovalsInput,
  ListDailyApprovalsPage,
} from '@/types/daily-approvals';
import type { InternshipEnrollmentLevel } from '@/types/internship-enrollment';
import type {
  NestMentorStudent,
  NestMentorCapacity,
  NestStudentWeek,
} from '@/types/nest-student-enrollments';
import type { NestStudentEnrollment } from '@/types/nest-student-enrollments';

function extractSchoolName(
  schoolId: NestStudentEnrollment['schoolId']
): string | null {
  if (!schoolId || typeof schoolId === 'string') return null;
  const record = schoolId as { title?: string; name?: string };
  return record.title ?? record.name ?? null;
}

const LEVEL_MAP: Record<
  Exclude<DailyApprovalCourseFilter, 'all'>,
  InternshipEnrollmentLevel
> = {
  intern1: 1,
  intern2: 2,
  intern3: 3,
  intern4: 4,
  appr1: 1,
  appr2: 2,
};

const EMPTY_GRADE: DailyApprovalProgressiveGrade = {
  gradedCount: 0,
  final20: null,
  statusLabel: 'در جریان',
};

type LessonLookup = Map<
  string,
  { courseKey: Exclude<DailyApprovalCourseFilter, 'all'>; courseTitle: string }
>;

function mapRow(
  row: NestMentorStudent,
  fallbackCourseKey: Exclude<DailyApprovalCourseFilter, 'all'>,
  input: ListDailyApprovalsInput,
  lessonLookup: LessonLookup
): DailyApprovalTrainee {
  const id = row.id ?? row._id ?? row.studentId ?? '';
  const firstName = row.student?.firstName ?? '';
  const lastName = row.student?.lastName ?? '';
  const traineeName =
    [firstName, lastName].filter(Boolean).join(' ') || 'نامشخص';
  const status: DailyApprovalTraineeStatus =
    row.status === 'dropped' || row.status === 'cancelled' ? 'dropped' : 'active';

  const lessonId = typeof row.lessonId === 'string' ? row.lessonId : undefined;
  const resolved = lessonId ? lessonLookup.get(lessonId) : undefined;
  const courseKey = resolved?.courseKey ?? fallbackCourseKey;
  const courseTitle = resolved?.courseTitle ?? '';

  return {
    id,
    traineeName,
    identifier: row.student?.phone ?? id,
    major: '',
    schoolName: extractSchoolName(row.schoolId),
    // برای تشخیص پیام معلم در گفتگوی هفته وقتی استاد راهنما مودال را باز
    // می‌کند — ببین loadRealDailyApprovalWeekDetail پایین همین فایل.
    teacherId: resolveEnrollmentMentor(row)?.id ?? null,
    kind: input.kind,
    level: LEVEL_MAP[courseKey] ?? 1,
    courseKey,
    courseTitle,
    termId: input.termId,
    termTitle: '',
    status,
    unreadCount: 0,
    hasSubmitted: false,
    progressiveGrade: EMPTY_GRADE,
    // زیر پر می‌شود — ببین loadRealDailyApprovalWeeks در listRealDailyApprovals.
    weeks: [],
  };
}

/**
 * GET `/student-enrollments/{id}/weeks` → کارت‌های هفتهٔ همین فراگیر برای گرید نمره‌دهی.
 * متن/فایل هر هفته اینجا خوانده نمی‌شود (یعنی N نامزد × M هفته درخواستِ
 * submissions اضافه می‌شد که برای یک لیست صفحه‌بندی‌شده سنگین است) — مودال
 * نمره‌دهی برای همین یک هفته، جدا و به‌درخواست، متن/فایل را می‌خواند.
 * best-effort: شکست خواندن هفته‌های یک فراگیر نباید کل صفحه را بترکاند.
 */
function mapDailyApprovalWeek(week: NestStudentWeek, index: number): DailyApprovalWeek {
  return {
    id: studentWeekId(week),
    weekNumber: index + 1,
    status: mapWeekStatus(week),
    score: typeof week.score === 'number' ? week.score : null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
  };
}

async function loadRealDailyApprovalWeeks(
  enrollmentId: string
): Promise<DailyApprovalWeek[]> {
  if (!enrollmentId) return [];
  try {
    const weeks = await studentEnrollmentsApi.listWeeks(enrollmentId);
    return weeks.map(mapDailyApprovalWeek);
  } catch {
    return [];
  }
}

/**
 * جمع `unreadCount` همهٔ گفتگوهای این ثبت‌نام برای بازبین جاری — چون
 * `DailyApprovalWeek.readBySupervisor` روی داده واقعی همیشه `false` می‌ماند
 * (هیچ فیلد «خوانده‌شده» در پاسخ `weeks` نیست)، محاسبهٔ unreadCount مشترک
 * mock (`withDerivedDailyApprovalTrainee`) از روی همان فیلد همیشه همه‌چیز را
 * «نخوانده» نشان می‌داد؛ این تابع مقدار واقعی را جایگزین می‌کند.
 */
async function loadRealUnreadCount(enrollmentId: string): Promise<number> {
  if (!enrollmentId) return 0;
  try {
    const conversations = await conversationsApi.listByEnrollment(enrollmentId);
    return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
  } catch {
    return 0;
  }
}

/**
 * GET `/api/v1/student-enrollments/mentor/students`
 * لیست فراگیران منتور برای ماژول ارزیابی گزارش‌ها.
 */
export async function listRealDailyApprovals(
  input: ListDailyApprovalsInput
): Promise<ListDailyApprovalsPage> {
  requireNestTransport('DailyApprovalsService.listPage');

  const fallbackCourseKey: Exclude<DailyApprovalCourseFilter, 'all'> =
    input.course === 'all'
      ? input.kind === 'internship'
        ? 'intern1'
        : 'appr1'
      : input.course;

  // کاتالوگ رو همیشه میگیریم — هم برای فیلتر lessonId، هم برای پر کردن courseTitle هر ردیف
  const lessonLookup: LessonLookup = new Map();
  let lessonId: string | undefined;

  const [, passingScoreThreshold] = await Promise.all([
    (async () => {
      try {
        const courses = await listRealCapacityCourses(input.kind, input.termId);
        const catalog = toDailyApprovalCatalogCourses(input.kind, courses);
        for (const c of catalog) {
          lessonLookup.set(c.id, { courseKey: c.courseFilter, courseTitle: c.title });
        }
        if (input.course !== 'all') {
          lessonId = catalog.find((c) => c.courseFilter === input.course)?.id;
        }
      } catch {
        // بدون کاتالوگ ادامه می‌دهیم؛ courseTitle خالی می‌ماند
      }
    })(),
    getRealAcademicSettings().then(
      (settings) => settings.passingScoreThreshold || DAILY_APPROVAL_PASSING_SCORE
    ),
  ]);

  const page =
    input.limit > 0 ? Math.floor(input.offset / input.limit) + 1 : 1;

  const result = await studentEnrollmentsApi.listMentorStudents({
    semesterId: input.termId,
    lessonId,
    page,
    limit: input.limit,
  });

  let trainees = result.data.map((row) =>
    mapRow(row, fallbackCourseKey, input, lessonLookup)
  );

  // فیلتر متنی — API جستجوی نام ندارد، سمت کلاینت اعمال می‌شود
  const q = input.query.trim().toLowerCase();
  if (q) {
    trainees = trainees.filter(
      (t) =>
        t.traineeName.toLowerCase().includes(q) ||
        t.identifier.toLowerCase().includes(q)
    );
  }

  // فیلتر وضعیت
  if (input.readFilter === 'dropped') {
    trainees = trainees.filter((t) => t.status === 'dropped');
  } else if (input.readFilter !== 'all') {
    trainees = trainees.filter((t) => t.status === 'active');
  }

  // بعد از فیلترها — هفته‌ها و unreadCount را فقط برای ردیف‌هایی که واقعاً
  // نمایش داده می‌شوند می‌خوانیم.
  const [weeksByTrainee, unreadByTrainee] = await Promise.all([
    Promise.all(trainees.map((t) => loadRealDailyApprovalWeeks(t.id))),
    Promise.all(trainees.map((t) => loadRealUnreadCount(t.id))),
  ]);
  // نمرهٔ پیش‌رونده/برچسب وضعیت از همان هفته‌های واقعی محاسبه می‌شود — همان
  // تابع خالصی که store mock استفاده می‌کند (ببین کامنت بالای خودش)؛
  // unreadCount را بعداً با مقدار واقعی گفتگو (بالا) جایگزین می‌کنیم چون
  // آن تابع فقط از `readBySupervisor` (همیشه false در داده واقعی) می‌خواند.
  trainees = trainees.map((t, index) => ({
    ...withDerivedDailyApprovalTrainee(
      { ...t, weeks: weeksByTrainee[index] },
      passingScoreThreshold
    ),
    unreadCount: unreadByTrainee[index],
  }));

  const base = input.offset + trainees.length;
  return {
    items: trainees,
    total: result.hasNextPage ? base + 1 : base,
    hasMore: result.hasNextPage,
    terms: [],
  };
}

/**
 * GET `/api/v1/student-enrollments/mentor/capacity`
 * ظرفیت کل / انتخاب‌شده / باقی‌مانده منتور برای یک ترم.
 */
export async function getRealDailyApprovalsMentorCapacity(
  semesterId: string
): Promise<NestMentorCapacity> {
  requireNestTransport('DailyApprovalsService.getMentorCapacity');
  return studentEnrollmentsApi.getMentorCapacity(semesterId);
}

export type LoadDailyApprovalWeekDetailInput = {
  /** enrollment id — همان `trainee.id` در این ماژول. */
  enrollmentId: string;
  weekId: string;
  role: UserRole | null | undefined;
  /** `trainee.teacherId` — برای تشخیص پیام معلم وقتی استاد راهنما مودال را باز می‌کند. */
  teacherId?: string | null;
};

/**
 * فقط به‌درخواست (موقع باز شدن مودال نمره‌دهی یک هفتهٔ خاص) صدا زده می‌شود —
 * نه در لیست (ببین کامنت `mapDailyApprovalWeek` بالا). دو چیز جدا می‌خواند:
 * ۱) آخرین submission همین student-week برای متن/فایل/زمان گزارش دانشجو.
 * ۲) پیام‌های گفتگوی همین هفته برای بازخورد/امتیاز/زمانِ استاد/معلم/مدیر —
 * با همان `resolveWeekFeedback` که سمت خواندنِ دانشجو استفاده می‌شود، تا هر سه
 * نقش (نه فقط نقشی که مودال را باز کرده) و زمانِ هرکدام را ببینند؛ نقش فرستنده
 * از `senderId.role` می‌آید (لایو تأیید شد)، نه مقایسهٔ id با کاربر جاری.
 */
export async function loadRealDailyApprovalWeekDetail(
  input: LoadDailyApprovalWeekDetailInput
): Promise<DailyApprovalWeekDetail> {
  requireNestTransport('DailyApprovalsService.loadWeekDetail');

  const [submissions, messages] = await Promise.all([
    studentWeeksApi.listSubmissions(input.weekId).catch(() => []),
    loadWeekConversationMessages(input.enrollmentId, input.weekId),
  ]);
  const latestSubmission = submissions[submissions.length - 1];

  return {
    text: latestSubmission?.text ?? '',
    files: mapSubmissionFiles(latestSubmission) as DailyApprovalAttachment[],
    submittedAt: latestSubmission?.createdAt ?? null,
    feedback: resolveWeekFeedback(messages, { mentorId: input.teacherId }) ?? {},
  };
}
