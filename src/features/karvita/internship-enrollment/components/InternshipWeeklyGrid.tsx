'use client';

import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import type {
  InternshipEnrollmentRecordStatus,
  InternshipWeeklySession,
  InternshipWeeklySessionState,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

type SessionVisual = {
  label: string;
  legendLabel?: string;
  className: string;
  hoverClassName: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
};

const SESSION_VISUALS: Record<InternshipWeeklySessionState, SessionVisual> = {
  locked_future: {
    label: 'آینده / ارسال‌نشده',
    legendLabel: 'آینده / ارسال‌نشده',
    className:
      'border-kv-border bg-kv-surface-muted text-kv-text-faint shadow-none opacity-70',
    hoverClassName:
      'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-text-faint',
    icon: faIcons.lock,
  },
  overdue: {
    label: 'منقضی شده',
    legendLabel: 'منقضی شده (فرصت سوخته)',
    className:
      'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-danger-soft-hover enabled:hover:text-kv-danger-soft-fg',
    icon: faIcons.clockRotateLeft,
  },
  extended: {
    label: 'فرصت مجدد',
    legendLabel: 'فرصت مجدد',
    className: 'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-brand-soft-hover enabled:hover:text-kv-brand-soft-fg',
    icon: faIcons.clockRotateLeft,
  },
  draft: {
    label: 'آینده / ارسال‌نشده',
    className: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
    hoverClassName:
      'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-text-faint',
    icon: faIcons.clipboardList,
  },
  pending: {
    label: 'منتظر بازخورد مدرسه',
    legendLabel: 'ارسال‌شده',
    className:
      'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-warning-soft-hover enabled:hover:text-kv-warning-soft-fg',
    icon: faIcons.clock,
  },
  needs_edit: {
    label: 'نیازمند ویرایش',
    legendLabel: 'نیازمند ویرایش',
    className:
      'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-warning-soft-hover enabled:hover:text-kv-warning-soft-fg',
    icon: faIcons.triangleExclamation,
  },
  approved: {
    label: 'تایید معلم',
    legendLabel: 'تاییدشده',
    className:
      'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-success-soft-hover enabled:hover:text-kv-success-soft-fg',
    icon: faIcons.check,
  },
  graded: {
    label: 'نمره نهایی',
    legendLabel: 'نمره نهایی',
    className: 'border-kv-success-border bg-kv-success text-kv-success-fg',
    hoverClassName:
      'enabled:hover:bg-kv-success-hover enabled:hover:text-kv-success-fg',
    icon: faIcons.circleCheck,
  },
  archived: {
    label: 'بایگانی شده',
    className: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
    hoverClassName:
      'enabled:hover:bg-kv-neutral-soft-hover enabled:hover:text-kv-text-faint',
    icon: faIcons.folderOpen,
  },
  locked_dropped: {
    label: 'حذف',
    className:
      'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
    hoverClassName:
      'enabled:hover:bg-kv-danger-soft-hover enabled:hover:text-kv-danger-soft-fg',
    icon: faIcons.lock,
  },
};

export function effectiveWeeklySessionState(
  week: InternshipWeeklySession,
  enrollmentStatus: InternshipEnrollmentRecordStatus
): InternshipWeeklySessionState {
  if (enrollmentStatus === 'completed') return 'graded';
  if (enrollmentStatus === 'dropped') return 'locked_dropped';
  return week.status;
}

type InternshipWeeklyGridProps = {
  weeks: InternshipWeeklySession[];
  enrollmentStatus: InternshipEnrollmentRecordStatus;
};

export function InternshipWeeklyGrid({
  weeks,
  enrollmentStatus,
}: InternshipWeeklyGridProps) {
  return (
    <div className="space-y-kv-field">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {weeks.map((week, index) => {
          const status = effectiveWeeklySessionState(week, enrollmentStatus);
          const visual = SESSION_VISUALS[status];
          const score = status === 'graded' ? (week.score ?? 92) : null;

          return (
            <KvButton
              key={week.id}
              type="button"
              color="neutral"
              appearance="secondary"
              size="md"
              className={`h-auto min-h-[95px] flex-col items-stretch justify-between gap-0 rounded-kv-panel border px-kv-group pb-kv-field pt-kv-inline text-start shadow-kv-raised ${visual.className} ${visual.hoverClassName}`}
              aria-label={`نمایش گزارش هفته ${toPersianDigits(index + 1)}`}
              onClick={() =>
                toast.message('ویرایش گزارش هفتگی در نسخهٔ فعلی در دسترس نیست.')
              }
            >
              <span className="flex w-full items-center justify-between gap-kv-inline">
                <span className="text-xs font-black leading-none">
                  هفته {toPersianDigits(index + 1)}
                </span>
                <FaIcon icon={visual.icon} size="xs" />
              </span>
              <span className="flex w-full flex-col items-start justify-end gap-1 pt-kv-pair text-start">
                <span className="block w-full text-xs font-bold leading-snug">
                  {visual.label}
                </span>
                {score !== null ? (
                  <span className="block w-full text-xs font-black leading-snug">
                    {toPersianDigits(score)}/۱۰۰
                  </span>
                ) : null}
              </span>
            </KvButton>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-kv-group gap-y-kv-pair border-t border-kv-border pt-kv-field text-xs font-bold text-kv-text-faint">
        {Object.entries(SESSION_VISUALS)
          .filter(([, visual]) => visual.legendLabel)
          .map(([status, visual]) => (
            <span key={status} className="flex items-center gap-kv-pair">
              <span
                className={`flex size-5 items-center justify-center rounded-kv-control border shadow-kv-raised ${visual.className}`}
              >
                <FaIcon icon={visual.icon} size="2xs" />
              </span>
              {visual.legendLabel}
            </span>
          ))}
      </div>
    </div>
  );
}
