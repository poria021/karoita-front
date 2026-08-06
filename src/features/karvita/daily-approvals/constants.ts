import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalWeekState,
} from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';

export const DAILY_APPROVAL_READ_FILTER_OPTIONS: readonly {
  value: DailyApprovalReadFilter;
  label: string;
  mobileLabel: string;
}[] = [
  { value: 'all', label: 'همه', mobileLabel: 'همه وضعیت‌ها' },
  { value: 'read', label: 'خوانده شده', mobileLabel: 'خوانده شده' },
  { value: 'unread', label: 'خوانده نشده', mobileLabel: 'خوانده نشده' },
  { value: 'dropped', label: 'حذف', mobileLabel: 'حذف' },
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

export type WeekVisual = {
  label: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  chipClass: string;
};

export function getWeekVisual(status: DailyApprovalWeekState): WeekVisual {
  switch (status) {
    case 'pending':
      return {
        label: 'منتظر بازخورد',
        icon: faIcons.clock,
        chipClass:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
      };
    case 'needs_edit':
      return {
        label: 'نیازمند ویرایش',
        icon: faIcons.triangleExclamation,
        chipClass:
          'border-kv-warning-border bg-kv-warning-soft text-kv-warning',
      };
    case 'approved':
      return {
        label: 'تایید معلم',
        icon: faIcons.check,
        chipClass:
          'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
      };
    case 'graded':
      return {
        label: 'نمره نهایی',
        icon: faIcons.award,
        chipClass: 'border-kv-success bg-kv-success text-kv-success-fg',
      };
    case 'overdue':
      return {
        label: 'منقضی شده',
        icon: faIcons.clockRotateLeft,
        chipClass:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
      };
    case 'extended':
      return {
        label: 'فرصت مجدد',
        icon: faIcons.unlockKeyhole,
        chipClass: 'border-kv-brand/30 bg-kv-brand-soft text-kv-brand-soft-fg',
      };
    case 'locked_future':
      return {
        label: 'آینده / ارسال‌نشده',
        icon: faIcons.lock,
        chipClass:
          'border-kv-border bg-kv-surface-muted text-kv-text-faint',
      };
    case 'locked_dropped':
      return {
        label: 'حذف',
        icon: faIcons.userMinus,
        chipClass:
          'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
      };
    case 'draft':
    default:
      return {
        label: 'پیش‌نویس / ثبت نشده',
        icon: faIcons.file,
        chipClass:
          'border-kv-border bg-kv-surface-muted text-kv-text-muted',
      };
  }
}

export const WEEK_LEGEND_ITEMS: readonly {
  label: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
  wellClass: string;
}[] = [
  {
    label: 'آینده / ارسال‌نشده',
    icon: faIcons.file,
    wellClass: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
  },
  {
    label: 'منقضی شده (فرصت سوخته)',
    icon: faIcons.clockRotateLeft,
    wellClass: 'border-kv-danger-border bg-kv-danger-soft text-kv-danger',
  },
  {
    label: 'منتظر بازخورد مدرسه',
    icon: faIcons.clock,
    wellClass: 'border-kv-warning-border bg-kv-warning-soft text-kv-warning',
  },
  {
    label: 'نیازمند ویرایش',
    icon: faIcons.triangleExclamation,
    wellClass: 'border-kv-warning-border bg-kv-warning-soft text-kv-warning',
  },
  {
    label: 'تایید معلم',
    icon: faIcons.check,
    wellClass: 'border-kv-success-border bg-kv-success-soft text-kv-success',
  },
  {
    label: 'نمره نهایی',
    icon: faIcons.award,
    wellClass: 'border-kv-success bg-kv-success text-kv-success-fg',
  },
];
