'use client';

import { toast } from 'sonner';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvTypography } from '@/components/shared/KvTypography';
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
  icon: (typeof faIcons)[keyof typeof faIcons];
};

const SESSION_VISUALS: Record<InternshipWeeklySessionState, SessionVisual> = {
  locked_future: {
    label: 'هفته آینده',
    legendLabel: 'هفته‌های آینده',
    className: 'border-kv-info-border bg-kv-info-soft text-kv-info-soft-fg',
    icon: faIcons.lock,
  },
  overdue: {
    label: 'منقضی شده',
    legendLabel: 'منقضی شده',
    className: 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
    icon: faIcons.clockRotateLeft,
  },
  extended: {
    label: 'فرصت مجدد',
    legendLabel: 'فرصت مجدد',
    className: 'border-kv-info-border bg-kv-info-soft text-kv-info-soft-fg',
    icon: faIcons.clockRotateLeft,
  },
  draft: {
    label: 'ثبت نشده',
    className: 'border-kv-border bg-kv-surface-muted text-kv-text-secondary',
    icon: faIcons.clipboardList,
  },
  pending: {
    label: 'منتظر بازخورد',
    legendLabel: 'ارسال‌شده',
    className:
      'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
    icon: faIcons.clock,
  },
  needs_edit: {
    label: 'نیازمند ویرایش',
    legendLabel: 'نیازمند ویرایش',
    className: 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
    icon: faIcons.triangleExclamation,
  },
  approved: {
    label: 'تایید معلم',
    legendLabel: 'تاییدشده',
    className:
      'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
    icon: faIcons.check,
  },
  graded: {
    label: 'نمره‌دهی شده',
    legendLabel: 'نمره نهایی',
    className:
      'border-kv-success-border bg-kv-success text-kv-success-fg',
    icon: faIcons.circleCheck,
  },
  archived: {
    label: 'بایگانی شده',
    className: 'border-kv-border bg-kv-surface-muted text-kv-text-faint',
    icon: faIcons.folderOpen,
  },
  locked_dropped: {
    label: 'حذف',
    className: 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
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
    <div className="space-y-kv-group">
      <div className="grid grid-cols-2 gap-kv-pair sm:grid-cols-4">
        {weeks.map((week, index) => {
          const status = effectiveWeeklySessionState(week, enrollmentStatus);
          const visual = SESSION_VISUALS[status];
          const score =
            status === 'graded' ? week.score ?? 92 : null;

          return (
            <KvButton
              key={week.id}
              type="button"
              color="neutral"
              appearance="secondary"
              size="md"
              className={`h-auto min-h-28 flex-col items-stretch justify-between gap-kv-pair rounded-kv-panel p-kv-field text-start ${visual.className}`}
              aria-label={`نمایش گزارش هفته ${toPersianDigits(index + 1)}`}
              onClick={() =>
                toast.message('ویرایش گزارش هفتگی در نسخهٔ فعلی در دسترس نیست.')
              }
            >
              <span className="flex w-full items-center justify-between gap-kv-inline">
                <KvTypography variant="label" as="span" weight="black">
                  هفته {toPersianDigits(index + 1)}
                </KvTypography>
                <FaIcon icon={visual.icon} size="sm" />
              </span>
              <span className="space-y-1 text-start">
                <KvTypography variant="caption" as="span" weight="bold">
                  {visual.label}
                </KvTypography>
                {score !== null ? (
                  <KvTypography variant="caption" as="span" weight="black">
                    {toPersianDigits(score)}/۱۰۰
                  </KvTypography>
                ) : null}
              </span>
            </KvButton>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-kv-group gap-y-kv-pair border-t border-kv-border pt-kv-field">
        {Object.entries(SESSION_VISUALS)
          .filter(([, visual]) => visual.legendLabel)
          .map(([status, visual]) => (
            <span
              key={status}
              className="flex items-center gap-kv-pair text-xs text-kv-text-secondary"
            >
              <span
                className={`flex size-6 items-center justify-center rounded-kv-control border ${visual.className}`}
              >
                <FaIcon icon={visual.icon} size="xs" />
              </span>
              {visual.legendLabel}
            </span>
          ))}
      </div>
    </div>
  );
}
