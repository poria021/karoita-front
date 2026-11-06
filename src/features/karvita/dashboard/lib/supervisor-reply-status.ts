import { appendSearchParam } from '@/lib/dashboard-url-state';
import { RouteService } from '@/services/route.service';
import { evaluationCourseFilterId } from '@/services/syllabus-config/course-catalog';
import type {
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import type { CourseDefinition } from '@/types/syllabus-config';
import type { UserRole } from '@/types/auth';
import { EVALUATION_MODULE_PARAM } from '@/utils/role-strategy/evaluation-menu';

export type ReplyFillTone = 'clear' | 'calm' | 'watch' | 'critical';

/** نقش‌هایی که مانیتورینگ ارزیابی روی میز کار می‌بینند. */
export type EvaluationMonitorRole =
  | 'supervisor_professor'
  | 'mentor_teacher'
  | 'school_principal';

export function isEvaluationMonitorRole(
  role: UserRole
): role is EvaluationMonitorRole {
  return (
    role === 'supervisor_professor' ||
    role === 'mentor_teacher' ||
    role === 'school_principal'
  );
}

export type CourseReplyStatusView = {
  courseKey: string;
  courseTitle: string;
  kind: DailyApprovalCourseKind;
  /** گزارش‌های منتظر اقدام نقش جاری. */
  pending: number;
  /** گزارش‌هایی که این نقش پاسخ داده / قفل شده. */
  answered: number;
  total: number;
  fillPercent: number | null;
  tone: ReplyFillTone;
};

export type SupervisorReplyStatusSummary = {
  termId: string;
  termTitle: string;
  pendingTotal: number;
  answeredTotal: number;
  total: number;
  fillPercent: number | null;
  tone: ReplyFillTone;
  courses: CourseReplyStatusView[];
};

function isReportInCycle(status: DailyApprovalWeek['status']): boolean {
  return (
    status === 'pending' ||
    status === 'approved' ||
    status === 'graded' ||
    status === 'needs_edit'
  );
}

/** در صف استاد: ارسال‌شده یا تأیید معلم بدون نمره نهایی. */
export function isAwaitingSupervisorReply(
  status: DailyApprovalWeek['status']
): boolean {
  return status === 'pending' || status === 'approved';
}

/** استاد بازخورد/نمره داده. */
export function isSupervisorAnswered(
  status: DailyApprovalWeek['status']
): boolean {
  return status === 'graded' || status === 'needs_edit';
}

/**
 * سطل منتظر/پاسخ‌شده برای نقش ناظر روی گزارش‌های یک فراگیر.
 * معلم/مدیر: یک‌بارمصرف تا `send` یا قفل `graded`.
 */
export function countWeekReplyBuckets(
  weeks: readonly DailyApprovalWeek[],
  role: EvaluationMonitorRole = 'supervisor_professor'
): {
  pending: number;
  answered: number;
} {
  let pending = 0;
  let answered = 0;

  for (const week of weeks) {
    if (role === 'supervisor_professor') {
      if (isAwaitingSupervisorReply(week.status)) pending += 1;
      else if (isSupervisorAnswered(week.status)) answered += 1;
      continue;
    }

    if (!isReportInCycle(week.status)) continue;

    if (role === 'mentor_teacher') {
      const done =
        week.status === 'graded' || week.teacherStatus === 'send';
      if (done) answered += 1;
      else pending += 1;
      continue;
    }

    const done =
      week.status === 'graded' || week.schoolAdminStatus === 'send';
    if (done) answered += 1;
    else pending += 1;
  }

  return { pending, answered };
}

export function fillPercentFor(answered: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((answered / total) * 100);
}

export function toneForReplyStatus(
  pending: number,
  fillPercent: number | null
): ReplyFillTone {
  if (pending <= 0 && (fillPercent == null || fillPercent === 100)) {
    return 'clear';
  }
  if (fillPercent == null) return pending > 0 ? 'watch' : 'clear';
  if (pending >= 8 || fillPercent < 50) return 'critical';
  if (pending >= 4 || fillPercent < 75) return 'watch';
  return 'calm';
}

function courseLabel(trainee: DailyApprovalTrainee): string {
  const title = trainee.courseTitle.trim();
  if (title) return title;
  return trainee.courseKey;
}

/**
 * تجمیع وضعیت پاسخ‌گویی به تفکیک درس از لیست فراگیران ترم
 * (همان `weeks` که `DailyApprovalsService.listPage` برمی‌گرداند).
 */
export function buildSupervisorReplyStatusSummary(input: {
  termId: string;
  termTitle: string;
  trainees: readonly DailyApprovalTrainee[];
  role?: EvaluationMonitorRole;
}): SupervisorReplyStatusSummary {
  const role = input.role ?? 'supervisor_professor';
  const byCourse = new Map<
    string,
    {
      courseKey: string;
      courseTitle: string;
      kind: DailyApprovalCourseKind;
      pending: number;
      answered: number;
    }
  >();

  for (const trainee of input.trainees) {
    if (trainee.status === 'dropped') continue;
    const buckets = countWeekReplyBuckets(trainee.weeks, role);
    if (buckets.pending === 0 && buckets.answered === 0) continue;

    const key = `${trainee.kind}::${trainee.courseKey}`;
    const current = byCourse.get(key) ?? {
      courseKey: trainee.courseKey,
      courseTitle: courseLabel(trainee),
      kind: trainee.kind,
      pending: 0,
      answered: 0,
    };
    if (!current.courseTitle.trim() && trainee.courseTitle.trim()) {
      current.courseTitle = trainee.courseTitle.trim();
    }
    current.pending += buckets.pending;
    current.answered += buckets.answered;
    byCourse.set(key, current);
  }

  const courses: CourseReplyStatusView[] = [...byCourse.values()]
    .map((row) => {
      const total = row.pending + row.answered;
      const fillPercent = fillPercentFor(row.answered, total);
      return {
        ...row,
        total,
        fillPercent,
        tone: toneForReplyStatus(row.pending, fillPercent),
      };
    })
    .sort(
      (a, b) =>
        b.pending - a.pending || a.courseTitle.localeCompare(b.courseTitle, 'fa')
    );

  const pendingTotal = courses.reduce((sum, row) => sum + row.pending, 0);
  const answeredTotal = courses.reduce((sum, row) => sum + row.answered, 0);
  const total = pendingTotal + answeredTotal;
  const fillPercent = fillPercentFor(answeredTotal, total);

  return {
    termId: input.termId,
    termTitle: input.termTitle,
    pendingTotal,
    answeredTotal,
    total,
    fillPercent,
    tone: toneForReplyStatus(pendingTotal, fillPercent),
    courses,
  };
}

/** ادغام چند خلاصهٔ ترم/پنل در یک نمای مانیتورینگ. */
export function mergeSupervisorReplyStatusSummaries(
  parts: readonly (SupervisorReplyStatusSummary | null | undefined)[]
): SupervisorReplyStatusSummary | null {
  const valid = parts.filter(
    (part): part is SupervisorReplyStatusSummary => part != null
  );
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0]!;

  const byCourse = new Map<string, CourseReplyStatusView>();
  for (const part of valid) {
    for (const course of part.courses) {
      const key = `${course.kind}::${course.courseKey}`;
      const current = byCourse.get(key);
      if (!current) {
        byCourse.set(key, { ...course });
        continue;
      }
      current.pending += course.pending;
      current.answered += course.answered;
      current.total += course.total;
      if (!current.courseTitle.trim() && course.courseTitle.trim()) {
        current.courseTitle = course.courseTitle;
      }
    }
  }

  const courses = [...byCourse.values()]
    .map((row) => {
      const fillPercent = fillPercentFor(row.answered, row.total);
      return {
        ...row,
        fillPercent,
        tone: toneForReplyStatus(row.pending, fillPercent),
      };
    })
    .sort(
      (a, b) =>
        b.pending - a.pending || a.courseTitle.localeCompare(b.courseTitle, 'fa')
    );

  const pendingTotal = courses.reduce((sum, row) => sum + row.pending, 0);
  const answeredTotal = courses.reduce((sum, row) => sum + row.answered, 0);
  const total = pendingTotal + answeredTotal;
  const fillPercent = fillPercentFor(answeredTotal, total);
  const primary = valid[0]!;

  return {
    termId: primary.termId,
    termTitle: primary.termTitle,
    pendingTotal,
    answeredTotal,
    total,
    fillPercent,
    tone: toneForReplyStatus(pendingTotal, fillPercent),
    courses,
  };
}

/**
 * سقف کارت‌های حرارت در قفسهٔ اولویت میز کار.
 * بیشتر از این → بقیه در لیست فشردهٔ «بیشتر» می‌آیند.
 */
export const MONITOR_HEAT_CARD_CAP = 6;

export type MonitorCourseShelf = {
  /** درس‌هایی که حداقل یک گزارش منتظر دارند (مرتب از بیشترین صف). */
  queued: CourseReplyStatusView[];
  /** کارت‌های اصلی روی میز — فقط همین‌ها بزرگ می‌مانند. */
  spotlight: CourseReplyStatusView[];
  /** صف‌دارهای خارج از سقف کارت. */
  overflowQueued: CourseReplyStatusView[];
  /** تعداد درس‌های بدون صف منتظر (در کارت‌ها نشان داده نمی‌شوند). */
  clearCount: number;
};

/**
 * قفسهٔ اولویت: فقط صف‌دارها کارت حرارت می‌گیرند؛
 * سقف کارت برای جلوگیری از انفجار UI با ده‌ها/صدها درس.
 */
export function buildMonitorCourseShelf(
  courses: readonly CourseReplyStatusView[],
  cardCap: number = MONITOR_HEAT_CARD_CAP
): MonitorCourseShelf {
  const queued = courses.filter((course) => course.pending > 0);
  const clearCount = courses.length - queued.length;
  const cap = Math.max(1, cardCap);
  return {
    queued,
    spotlight: queued.slice(0, cap),
    overflowQueued: queued.slice(cap),
    clearCount,
  };
}


/**
 * شدت حرارت صف پاسخ‌نداده‌ها بین دروس: `0` = کمترین (زرد)، `1` = بیشترین (قرمز).
 * اگر همه برابر باشند → `0` (زرد).
 */
export function pendingHeatFactor(
  pending: number,
  minPending: number,
  maxPending: number
): number {
  if (maxPending <= minPending) return 0;
  return Math.min(1, Math.max(0, (pending - minPending) / (maxPending - minPending)));
}

/** رنگ کارت درس روی طیف زرد ← قرمز بر اساس `pendingHeatFactor`. */
export function pendingHeatCardStyle(factor: number): {
  backgroundColor: string;
  borderColor: string;
  color: string;
  /** جوهر متن: هم‌فام کارت، سیر مایل به سیاه — توکن `--kv-monitor-ink`. */
  ['--kv-monitor-ink']: string;
} {
  // زرد هشدار → نارنجی → قرمز خطر — pastel آرام
  const hue = 48 - factor * 48; // 48 زرد → 0 قرمز
  const sat = 58 + factor * 10;
  const light = 96 - factor * 6;
  // جوهر: همان hue، sat/l از توکن‌های --kv-monitor-ink-s / -l
  // eslint-disable-next-line no-restricted-syntax -- طیف دینامیک pending؛ sat/l از توکن
  const ink = `hsl(${hue} var(--kv-monitor-ink-s) var(--kv-monitor-ink-l))`;
  return {
    // eslint-disable-next-line no-restricted-syntax -- طیف دینامیک pending
    backgroundColor: `hsl(${hue} ${sat}% ${light}%)`,
    // eslint-disable-next-line no-restricted-syntax -- طیف دینامیک pending
    borderColor: `hsl(${hue} ${sat}% ${light - 14}%)`,
    color: ink,
    '--kv-monitor-ink': ink,
  };
}

export function buildReplyStatusInsight(
  summary: SupervisorReplyStatusSummary
): { tone: ReplyFillTone; headline: string } {
  if (summary.total === 0) {
    return {
      tone: 'clear',
      headline: 'هنوز گزارشی در چرخهٔ ارزیابی این ترم نیست',
    };
  }
  if (summary.pendingTotal === 0) {
    return {
      tone: 'clear',
      headline: 'همهٔ گزارش‌های ارسال‌شده پاسخ داده شده‌اند',
    };
  }
  const worst = summary.courses.find((course) => course.pending > 0);
  if (worst && summary.courses.length > 1) {
    return {
      tone: summary.tone,
      headline: `${worst.courseTitle} بیشترین صف را دارد`,
    };
  }
  return {
    tone: summary.tone,
    headline: `${summary.pendingTotal} گزارش منتظر پاسخ شماست`,
  };
}

/**
 * شناسهٔ ماژول ارزیابی (`?module=`) برای یک `courseKey` فراگیر —
 * والد کاتالوگ، یا خود درس اگر leaf/ماژول مستقیم باشد.
 */
export function findEvaluationModuleId(
  courseKey: string,
  kind: DailyApprovalCourseKind,
  catalog: {
    semester: readonly CourseDefinition[];
    modular: readonly CourseDefinition[];
  }
): string | null {
  const courses = kind === 'internship' ? catalog.semester : catalog.modular;
  for (const course of courses) {
    if (course.id === courseKey) return course.id;
    if (evaluationCourseFilterId(course.id) === courseKey) return course.id;
    for (const sub of course.subModules) {
      if (sub.id === courseKey) return course.id;
      if (evaluationCourseFilterId(sub.id) === courseKey) return course.id;
    }
  }
  return courses.find((course) => course.isActive)?.id ?? courses[0]?.id ?? null;
}

/** لینک صفحهٔ ارزیابی همان درس (و در صورت امکان فیلتر زیرمجموعه). */
export function dailyApprovalsCourseHref(input: {
  kind: DailyApprovalCourseKind;
  moduleId?: string | null;
  courseKey?: string | null;
}): string {
  let href = RouteService.karvita.dailyApprovals(input.kind);
  if (input.moduleId) {
    href = appendSearchParam(href, EVALUATION_MODULE_PARAM, input.moduleId);
  }
  if (input.courseKey) {
    href = appendSearchParam(href, 'course', input.courseKey);
  }
  return href;
}
