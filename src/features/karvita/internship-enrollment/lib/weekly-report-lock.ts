import type {
  InternshipEnrollmentRecordStatus,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';

const LOCKED_STATES = new Set<InternshipWeeklySessionState>([
  'locked_future',
  'locked_dropped',
  'overdue',
  'pending',
  'approved',
  'graded',
  'archived',
]);

export const EDITABLE_WEEKLY_STATES = new Set<InternshipWeeklySessionState>([
  'draft',
  'needs_edit',
  'extended',
]);

export function effectiveWeeklySessionState(
  week: InternshipWeeklySession,
  enrollmentStatus: InternshipEnrollmentRecordStatus
): InternshipWeeklySessionState {
  if (enrollmentStatus === 'completed') return 'graded';
  if (enrollmentStatus === 'dropped') return 'locked_dropped';
  return week.status;
}

export type WeeklyReportLockContext = {
  week: InternshipWeeklySession;
  weeks: InternshipWeeklySession[];
  enrollmentStatus: InternshipEnrollmentRecordStatus;
  removalPending: boolean;
  isTermArchived: boolean;
};

export type WeeklyReportLockNotice = {
  title: string;
  description: string;
  variant: 'info' | 'warning' | 'error';
};

export function resolveWeeklyReportState(
  context: Pick<WeeklyReportLockContext, 'week' | 'enrollmentStatus'>
): InternshipWeeklySessionState {
  return effectiveWeeklySessionState(context.week, context.enrollmentStatus);
}

export function isWeeklyReportLocked(context: WeeklyReportLockContext): boolean {
  if (context.isTermArchived) return true;
  if (
    context.enrollmentStatus === 'completed' ||
    context.enrollmentStatus === 'dropped'
  ) {
    return true;
  }
  if (context.removalPending) return true;
  return LOCKED_STATES.has(resolveWeeklyReportState(context));
}

export function isWeeklyReportEditable(
  context: WeeklyReportLockContext
): boolean {
  if (isWeeklyReportLocked(context)) return false;
  return EDITABLE_WEEKLY_STATES.has(resolveWeeklyReportState(context));
}

function currentSystemWeekNumber(weeks: InternshipWeeklySession[]): number {
  const firstFuture = weeks.findIndex(
    (week) => week.status === 'locked_future'
  );
  if (firstFuture <= 0) return Math.max(1, weeks.length);
  return firstFuture;
}

export function getWeeklyReportLockNotice(
  context: WeeklyReportLockContext
): WeeklyReportLockNotice {
  const state = resolveWeeklyReportState(context);

  if (state === 'locked_future') {
    const currentWeek = currentSystemWeekNumber(context.weeks);
    return {
      title: `این هفته هنوز باز نشده است (هفتهٔ جاری: هفته ${toPersianDigits(currentWeek)})`,
      description:
        'برای باز شدن این هفته، ابتدا باید گزارش هفتهٔ قبل را ارسال کرده باشید.',
      variant: 'info',
    };
  }

  if (state === 'overdue') {
    return {
      title: 'مهلت ارسال گزارش این هفته به پایان رسیده است',
      description:
        'به دلیل عدم ثبت گزارش در فرجه قانونی تعیین شده، قفل این هفته بسته شده است. جهت تمدید مهلت با استاد راهنمای خود تماس بگیرید.',
      variant: 'error',
    };
  }

  if (state === 'pending') {
    return {
      title: 'گزارش ارسال شده و منتظر بررسی ناظران است',
      description:
        'گزارش شما با موفقیت تحویل داده شده است. تا زمان بررسی استاد یا تایید معلم راهنما، امکان ویرایش متن وجود ندارد.',
      variant: 'warning',
    };
  }

  return {
    title: 'حالت صرفاً نمایشی (گزارش قفل شده یا تایید شده)',
    description:
      'امکان ثبت یا تغییر گزارش برای این هفته وجود ندارد. شما در حال حاضر فقط مجاز به مشاهده اطلاعات و گزارش‌های ثبت شده هستید.',
    variant: 'info',
  };
}
