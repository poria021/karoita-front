import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';

export const DAILY_APPROVAL_READ_FILTER_OPTIONS: readonly {
  value: Exclude<DailyApprovalReadFilter, 'dropped'>;
  label: string;
  mobileLabel: string;
}[] = [
  { value: 'all', label: 'همه گزارش‌ها', mobileLabel: 'همه گزارش‌ها' },
  { value: 'read', label: 'خوانده شده', mobileLabel: 'خوانده شده' },
  { value: 'unread', label: 'خوانده نشده', mobileLabel: 'خوانده نشده' },
];

const INTERNSHIP_COURSES: readonly {
  value: DailyApprovalCourseFilter;
  label: string;
}[] = [
  { value: 'all', label: 'همه دروس' },
  { value: 'intern1', label: 'کارورزی ۱' },
  { value: 'intern2', label: 'کارورزی ۲' },
  { value: 'intern3', label: 'کارورزی ۳' },
  { value: 'intern4', label: 'کارورزی ۴' },
];

const APPRENTICESHIP_COURSES: readonly {
  value: DailyApprovalCourseFilter;
  label: string;
}[] = [
  { value: 'all', label: 'همه دروس' },
  { value: 'appr1', label: 'کارآموزی ۱' },
  { value: 'appr2', label: 'کارآموزی ۲' },
];

export function getDailyApprovalCourseOptions(kind: DailyApprovalCourseKind) {
  return kind === 'internship' ? INTERNSHIP_COURSES : APPRENTICESHIP_COURSES;
}

/** Aligned with internship-enrollment `SESSION_VISUALS` (report-writing panel). */
export type WeekVisual = {
  label: string;
  legendLabel?: string;
  className: string;
  hoverClassName: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
};

export function getWeekVisual(status: DailyApprovalWeekState): WeekVisual {
  switch (status) {
    case 'locked_future':
      return {
        label: 'آینده / ارسال‌نشده',
        legendLabel: 'آینده / ارسال‌نشده',
        className:
          'border-kv-border bg-kv-surface-muted text-kv-text-faint shadow-none opacity-70',
        hoverClassName:
          'cursor-not-allowed enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.lock,
      };
    case 'overdue':
      return {
        label: 'منقضی شده',
        legendLabel: 'منقضی شده (فرصت سوخته)',
        className:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-danger-soft-hover enabled:hover:text-kv-danger-soft-fg',
        icon: faIcons.clockRotateLeft,
      };
    case 'extended':
      return {
        label: 'فرصت مجدد',
        legendLabel: 'فرصت مجدد',
        className:
          'border-kv-violet-border bg-kv-violet-soft text-kv-violet-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-violet-soft-hover enabled:hover:text-kv-violet-soft-fg',
        icon: faIcons.unlockKeyhole,
      };
    case 'draft':
      return {
        label: 'پیش‌نویس',
        legendLabel: 'پیش‌نویس',
        className:
          'border-kv-border bg-kv-surface-muted text-kv-text-secondary',
        hoverClassName:
          'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-text-secondary',
        icon: faIcons.clipboardList,
      };
    case 'pending':
      return {
        label: 'منتظر بازخورد مدرسه',
        legendLabel: 'ارسال‌شده',
        className:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-warning-soft-hover enabled:hover:text-kv-warning-soft-fg',
        icon: faIcons.clock,
      };
    case 'needs_edit':
      return {
        label: 'نیازمند ویرایش',
        legendLabel: 'نیازمند ویرایش',
        className:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-warning-soft-hover enabled:hover:text-kv-warning-soft-fg',
        icon: faIcons.triangleExclamation,
      };
    case 'approved':
      return {
        label: 'تایید معلم',
        legendLabel: 'تاییدشده',
        className:
          'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
        hoverClassName:
          'enabled:hover:bg-kv-success-soft-hover enabled:hover:text-kv-success-soft-fg',
        icon: faIcons.check,
      };
    case 'graded':
      return {
        label: 'نمره نهایی',
        legendLabel: 'نمره نهایی',
        className: 'border-kv-success-border bg-kv-success text-kv-success-fg',
        hoverClassName:
          'enabled:hover:bg-kv-success-hover enabled:hover:text-kv-success-fg',
        icon: faIcons.circleCheck,
      };
    case 'archived':
      return {
        label: 'بایگانی شده',
        className: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
        hoverClassName: 'enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.folderOpen,
      };
    case 'locked_dropped':
      return {
        label: 'حذف',
        className:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
        hoverClassName: 'enabled:hover:bg-inherit enabled:hover:text-inherit',
        icon: faIcons.lock,
      };
    default:
      return {
        label: 'پیش‌نویس',
        legendLabel: 'پیش‌نویس',
        className:
          'border-kv-border bg-kv-surface-muted text-kv-text-secondary',
        hoverClassName:
          'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-text-secondary',
        icon: faIcons.clipboardList,
      };
  }
}

export const WEEK_LEGEND_ITEMS: readonly {
  label: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  wellClass: string;
}[] = (
  [
    'locked_future',
    'overdue',
    'pending',
    'needs_edit',
    'approved',
    'graded',
  ] as const
).map((status) => {
  const visual = getWeekVisual(status);
  return {
    label: visual.legendLabel ?? visual.label,
    icon: visual.icon,
    wellClass: visual.className,
  };
});
