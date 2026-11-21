import { courseNameForKind } from '@/services/internship-enrollment/enrollment-mappers';
import type {
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

/**
 * هفته‌هایی که منتظر اقدام استاد راهنما هستند:
 * - `pending`  فراگیر گزارش را فرستاده («ارسال شده») و هنوز بررسی نشده؛
 * - `approved` معلم راهنما تأیید کرده («تایید معلم») و نمرهٔ نهایی استاد مانده.
 * `needs_edit` منتظر فراگیر است، `graded`/`archived`/پیش‌نویس منتظر کسی نیست.
 */
export const PENDING_REPORT_STATUSES = [
  'pending',
  'approved',
] as const satisfies readonly DailyApprovalWeekState[];

export type CoursePendingReports = {
  /** شناسهٔ ایمن برای کلید React/نمودار. */
  id: string;
  courseKey: string;
  courseTitle: string;
  kind: DailyApprovalCourseKind;
  level: number;
  /** جمع گزارش‌های در انتظار = ارسال‌شده + تأیید معلم. */
  pending: number;
  /** ارسال‌شده و بررسی‌نشده. */
  submitted: number;
  /** تأیید معلم و منتظر نمرهٔ نهایی. */
  teacherApproved: number;
  /** شمار فراگیران فعال این درس. */
  learners: number;
  /** فراگیرانی که دست‌کم یک گزارش در انتظار دارند. */
  learnersWaiting: number;
};

export type CoursePendingReportsSummary = {
  courses: CoursePendingReports[];
  total: number;
  /** فهرست فراگیران پیش از رسیدن به آخرین صفحه قطع شده؛ اعداد «دست‌کم» هستند. */
  truncated: boolean;
};

type Bucket = Omit<CoursePendingReports, 'id'>;

function courseTitleFor(trainee: DailyApprovalTrainee): string {
  const title = trainee.courseTitle?.trim();
  if (title) return title;
  return `${courseNameForKind(trainee.kind)} ${toPersianDigits(trainee.level)}`;
}

export function isPendingReportStatus(status: DailyApprovalWeekState): boolean {
  return (PENDING_REPORT_STATUSES as readonly string[]).includes(status);
}

/**
 * برای هر درسِ فراگیران فعال، شمار گزارش‌های در انتظار بررسی را می‌شمارد.
 * فقط درس‌هایی که دست‌کم یک گزارش در انتظار دارند در لیست می‌آیند؛
 * فراگیر حذف‌شده نه. ترتیب: بیشترین گزارش در انتظار اول، سپس کارورزی پیش از
 * کارآموزی و سطح.
 */
export function buildCoursePendingReports(
  trainees: readonly DailyApprovalTrainee[],
  truncated = false
): CoursePendingReportsSummary {
  const buckets = new Map<string, Bucket>();

  for (const trainee of trainees) {
    if (trainee.status !== 'active') continue;

    const key = `${trainee.kind}:${trainee.courseKey}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        courseKey: trainee.courseKey,
        courseTitle: courseTitleFor(trainee),
        kind: trainee.kind,
        level: trainee.level,
        pending: 0,
        submitted: 0,
        teacherApproved: 0,
        learners: 0,
        learnersWaiting: 0,
      };
      buckets.set(key, bucket);
    }

    let waiting = 0;
    for (const week of trainee.weeks) {
      if (week.status === 'pending') {
        bucket.submitted += 1;
        waiting += 1;
      } else if (week.status === 'approved') {
        bucket.teacherApproved += 1;
        waiting += 1;
      }
    }
    bucket.pending += waiting;
    bucket.learners += 1;
    if (waiting > 0) bucket.learnersWaiting += 1;
  }

  const kindOrder = (kind: DailyApprovalCourseKind) =>
    kind === 'internship' ? 0 : 1;

  const courses = [...buckets.values()]
    .filter((bucket) => bucket.pending > 0)
    .sort(
      (a, b) =>
        b.pending - a.pending ||
        kindOrder(a.kind) - kindOrder(b.kind) ||
        a.level - b.level ||
        a.courseKey.localeCompare(b.courseKey)
    )
    .map<CoursePendingReports>((bucket, index) => ({
      ...bucket,
      id: `course-${index}`,
    }));

  return {
    courses,
    total: courses.reduce((sum, course) => sum + course.pending, 0),
    truncated,
  };
}
