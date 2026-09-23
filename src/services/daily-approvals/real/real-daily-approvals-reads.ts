import {
  toDailyApprovalCatalogCourses,
} from '@/services/daily-approvals/daily-approval-catalog-mappers';
import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import {
  buildDailyApprovalProgressiveGradeFromSummary,
  computeHasSubmitted,
} from '@/services/daily-approvals/daily-approval-derived';
import { loadWeekConversationMessages } from '@/services/daily-approvals/real/real-daily-approvals-conversations';
import { conversationsApi } from '@/services/conversations/real/conversations.api';
import {
  resolveLatestStudentSubmission,
  resolveWeekFeedback,
} from '@/services/internship-enrollment/real/mappers/week-feedback';
import { listRealCapacityCourses } from '@/services/organizational-capacities/real/real-organizational-capacities';
import { getRealAcademicSettings } from '@/services/syllabus-config/real/real-syllabus-reads';
import {
  mapWeekStatus,
  studentWeekId,
} from '@/services/internship-enrollment/real/real-enrollment-mappers';
import { resolveEnrollmentMentor } from '@/services/internship-enrollment/real/mappers/enrollment-summary';
import { studentEnrollmentsApi } from '@/services/internship-enrollment/real/student-enrollments.api';
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
import type { NestConversation } from '@/types/nest-conversations';
import type {
  NestMentorStudent,
  NestMentorCapacity,
  NestScoreSummary,
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
 *
 * رنگ/وضعیت کارت و نمره از چهار فیلد صریح `mentorStatus`/`teacherStatus`/
 * `studentStatus` و `status` کلی هفته مشتق می‌شوند (ببین `mapWeekStatus`)، نه
 * از حدس‌زدن روی گفتگو. `teacherStatus`/`schoolAdminStatus` خام هم روی
 * `DailyApprovalWeek` می‌مانند تا مودال ارزیابی معلم راهنما/مدیر مدرسه بتواند
 * قفل‌بودن فرم خودش را تشخیص دهد (ببین `useDailyApprovalWeekGradingModal`).
 */
function mapDailyApprovalWeek(week: NestStudentWeek, index: number): DailyApprovalWeek {
  const completed = week.status === 'completed';
  return {
    id: studentWeekId(week),
    weekNumber: index + 1,
    status: mapWeekStatus(week),
    score: completed && typeof week.score === 'number' ? week.score : null,
    weightedScore: typeof week.weightedScore === 'number' ? week.weightedScore : null,
    text: '',
    files: [],
    feedback: {},
    readBySupervisor: false,
    teacherStatus: week.teacherStatus ?? null,
    schoolAdminStatus: week.schoolAdminStatus ?? null,
  };
}

/**
 * همهٔ گفتگوهای این ثبت‌نام را یک‌بار می‌خواند — هم برای جمع `unreadCount`
 * (ببین کامنت پایین) هم برای وضعیت «ارسال شده» هر هفته در `mapDailyApprovalWeek`،
 * تا به‌جای N درخواست (یکی به‌ازای هر هفته) فقط یک درخواست به‌ازای هر فراگیر بزنیم.
 */
async function loadRealEnrollmentConversations(
  enrollmentId: string
): Promise<NestConversation[]> {
  if (!enrollmentId) return [];
  try {
    return await conversationsApi.listByEnrollment(enrollmentId);
  } catch {
    return [];
  }
}

async function loadRealDailyApprovalWeeks(
  enrollmentId: string
): Promise<DailyApprovalWeek[]> {
  if (!enrollmentId) return [];
  try {
    const weeks = await studentEnrollmentsApi.listWeeks(enrollmentId);
    return weeks.map((week, index) => mapDailyApprovalWeek(week, index));
  } catch {
    return [];
  }
}

/**
 * GET `/student-enrollments/{id}/score-summary` — همان endpointای که داشبورد
 * دانشجو نمرهٔ کارنامهٔ جاری‌اش را از آن می‌گیرد؛ اینجا هم برای همان فراگیر
 * صدا زده می‌شود تا نمرهٔ استاد و دانشجو از یک منبع (بک‌اند) محاسبه شوند، نه
 * میانگین‌گیری جداگانهٔ سمت کلاینت.
 */
async function loadRealDailyApprovalScoreSummary(
  enrollmentId: string
): Promise<NestScoreSummary | null> {
  if (!enrollmentId) return null;
  try {
    return await studentEnrollmentsApi.getScoreSummary(enrollmentId);
  } catch {
    return null;
  }
}

/**
 * جمع `unreadCount` همهٔ گفتگوهای این ثبت‌نام برای بازبین جاری — چون
 * `DailyApprovalWeek.readBySupervisor` روی داده واقعی همیشه `false` می‌ماند
 * (هیچ فیلد «خوانده‌شده» در پاسخ `weeks` نیست)، محاسبهٔ unreadCount مشترک
 * mock (`withDerivedDailyApprovalTrainee`) از روی همان فیلد همیشه همه‌چیز را
 * «نخوانده» نشان می‌داد؛ این تابع مقدار واقعی را جایگزین می‌کند.
 */
function sumUnreadCount(conversations: readonly NestConversation[]): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

export type DailyApprovalTraineeDerived = Pick<
  DailyApprovalTrainee,
  'weeks' | 'hasSubmitted' | 'unreadCount' | 'progressiveGrade'
>;

/**
 * هفته‌ها/unreadCount/نمرهٔ پیش‌رونده یک فراگیر را می‌خواند — منطق مشترکِ
 * `listRealDailyApprovals` (برای همهٔ ردیف‌های یک صفحه) و
 * `refreshRealDailyApprovalTraineeDerived` (برای پچ محلیِ فقط یک ردیف بعد از
 * یک mutation، بدون رفرشِ کل صفحه).
 */
async function deriveDailyApprovalTraineeFields(
  enrollmentId: string,
  status: DailyApprovalTraineeStatus,
  passingScoreThreshold: number
): Promise<DailyApprovalTraineeDerived> {
  const [conversations, weeks, scoreSummary] = await Promise.all([
    loadRealEnrollmentConversations(enrollmentId),
    loadRealDailyApprovalWeeks(enrollmentId),
    loadRealDailyApprovalScoreSummary(enrollmentId),
  ]);

  const hasSubmitted = computeHasSubmitted(weeks);
  let progressiveGrade = buildDailyApprovalProgressiveGradeFromSummary(
    scoreSummary,
    status,
    passingScoreThreshold
  );
  if (status !== 'dropped' && hasSubmitted && progressiveGrade.gradedCount === 0) {
    progressiveGrade = { ...progressiveGrade, statusLabel: 'در جریان' };
  }

  return {
    weeks,
    hasSubmitted,
    unreadCount: sumUnreadCount(conversations),
    progressiveGrade,
  };
}

async function resolvePassingScoreThreshold(): Promise<number> {
  const settings = await getRealAcademicSettings();
  return settings.passingScoreThreshold || DAILY_APPROVAL_PASSING_SCORE;
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
    resolvePassingScoreThreshold(),
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

  // بعد از فیلترها — گفتگوها/هفته‌ها و نمره را فقط برای ردیف‌هایی که واقعاً
  // نمایش داده می‌شوند می‌خوانیم؛ منطق مشترک با `refreshRealDailyApprovalTraineeDerived`
  // (پچ محلی فقط یک ردیف بعد از mutation، بدون این رفت‌وبرگشتِ کامل صفحه).
  const derivedByTrainee = await Promise.all(
    trainees.map((t) =>
      deriveDailyApprovalTraineeFields(t.id, t.status, passingScoreThreshold)
    )
  );
  trainees = trainees.map((t, index) => ({
    ...t,
    ...derivedByTrainee[index],
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
 * هفته‌ها/unreadCount/نمرهٔ پیش‌رونده *فقط یک* فراگیر را دوباره می‌خواند (۳
 * درخواست) — برای پچ محلیِ همان یک ردیف در `list.items` بعد از یک mutation
 * (باز کردن هفته، ثبت نمره/بازخورد)، به‌جای `listRealDailyApprovals` کامل که
 * برای *همهٔ* فراگیرانِ صفحهٔ جاری ۳ درخواست به‌ازای هر نفر می‌زند.
 */
export async function refreshRealDailyApprovalTraineeDerived(
  enrollmentId: string,
  status: DailyApprovalTraineeStatus
): Promise<DailyApprovalTraineeDerived> {
  requireNestTransport('DailyApprovalsService.refreshTraineeDerived');
  const passingScoreThreshold = await resolvePassingScoreThreshold();
  return deriveDailyApprovalTraineeFields(
    enrollmentId,
    status,
    passingScoreThreshold
  );
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
 * نه در لیست (ببین کامنت `mapDailyApprovalWeek` بالا). یک `GET messages` روی
 * گفتگوی هفته می‌خواند و از همان‌جا دو چیز استخراج می‌کند:
 * ۱) آخرین پیامِ خودِ دانشجو برای متن/فایل/زمان گزارش (`resolveLatestStudentSubmission`)
 *    — جایگزین `GET /student-weeks/{id}/submissions` که دیگر روی بک‌اند وجود
 *    ندارد (۴۰۴ «Cannot GET ...»، تأیید‌شده روی `karoita.darkube.ir`).
 * ۲) بازخورد/امتیاز/زمانِ استاد/معلم/مدیر با همان `resolveWeekFeedback` که سمت
 * خواندنِ دانشجو استفاده می‌شود، تا هر سه نقش و زمانِ هرکدام را ببینند؛ نقش
 * فرستنده از `senderId.role` می‌آید (لایو تأیید شد)، نه مقایسهٔ id با کاربر جاری.
 */
export async function loadRealDailyApprovalWeekDetail(
  input: LoadDailyApprovalWeekDetailInput
): Promise<DailyApprovalWeekDetail> {
  requireNestTransport('DailyApprovalsService.loadWeekDetail');

  const messages = await loadWeekConversationMessages(input.enrollmentId, input.weekId);
  const knownRoles = { mentorId: input.teacherId };
  const latestSubmission = resolveLatestStudentSubmission(messages, knownRoles);

  return {
    text: latestSubmission?.text ?? '',
    files: (latestSubmission?.files ?? []) as DailyApprovalAttachment[],
    submittedAt: latestSubmission?.createdAt ?? null,
    feedback: resolveWeekFeedback(messages, knownRoles) ?? {},
  };
}
