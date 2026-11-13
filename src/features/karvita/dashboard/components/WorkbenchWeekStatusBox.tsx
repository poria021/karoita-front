'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { InternshipWeeklySessionState } from '@/types/internship-enrollment';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import type { LearnerCourseWeekHighlight } from '../lib/learner-workbench';

type StatusVisual = {
  label: string;
  badgeClassName: string;
  icon: (typeof faIcons)[keyof typeof faIcons];
};

const STATUS_VISUALS: Partial<
  Record<InternshipWeeklySessionState, StatusVisual>
> = {
  draft: {
    label: 'ثبت نشده',
    badgeClassName: 'bg-kv-neutral-soft text-kv-neutral-soft-fg',
    icon: faIcons.clipboardList,
  },
  pending: {
    label: 'در انتظار بررسی',
    badgeClassName: 'bg-kv-info-soft text-kv-info-soft-fg',
    icon: faIcons.clock,
  },
  needs_edit: {
    label: 'نیازمند ویرایش',
    badgeClassName: 'bg-kv-warning-soft text-kv-warning-soft-fg',
    icon: faIcons.triangleExclamation,
  },
  approved: {
    label: 'تأیید شده',
    badgeClassName: 'bg-kv-success-soft text-kv-success-soft-fg',
    icon: faIcons.check,
  },
  graded: {
    label: 'نمره نهایی',
    badgeClassName: 'bg-kv-success-soft text-kv-success-soft-fg',
    icon: faIcons.circleCheck,
  },
  overdue: {
    label: 'معوق',
    badgeClassName: 'bg-kv-danger-soft text-kv-danger-soft-fg',
    icon: faIcons.triangleExclamation,
  },
  extended: {
    label: 'تمدید شده',
    badgeClassName: 'bg-kv-violet-soft text-kv-violet-soft-fg',
    icon: faIcons.unlockKeyhole,
  },
  locked_future: {
    label: 'هنوز باز نشده',
    badgeClassName: 'bg-kv-surface-muted text-kv-text-faint',
    icon: faIcons.lock,
  },
};

export type WorkbenchWeekStatusBoxProps = {
  /** پیش‌نمایش وضعیت آخرین هفتهٔ هر درس فعال. */
  highlights: LearnerCourseWeekHighlight[];
  className?: string;
  style?: CSSProperties;
};

function statusVisual(status: InternshipWeeklySessionState): StatusVisual {
  return (
    STATUS_VISUALS[status] ?? {
      label: 'در جریان',
      badgeClassName: 'bg-kv-surface-muted text-kv-text-muted',
      icon: faIcons.circleInfo,
    }
  );
}

/**
 * باکس «وضعیت هفته‌ها»ی مشترک میز کار دانشجو و مهارت‌آموز.
 * کلیک روی هر ردیف به صفحهٔ همان درس می‌رود.
 */
export function WorkbenchWeekStatusBox({
  highlights,
  className,
  style,
}: WorkbenchWeekStatusBoxProps) {
  return (
    <aside
      aria-label="وضعیت هفتهٔ درس‌های فعال"
      style={style}
      className={cn(
        'flex min-h-0 min-w-0 flex-col rounded-kv-panel border p-kv-section sm:p-kv-page',
        workbenchBoxToneClass(highlights.length === 0, 'default'),
        className
      )}
    >
      <header className="mb-3 shrink-0">
        <h2 className="font-sans text-base font-bold tracking-tight text-kv-text sm:text-lg">
          وضعیت هفته‌ها
        </h2>
      </header>

      {highlights.length === 0 ? (
        <KvEmptyState
          title="هنوز درسی در نیم‌سال باز انتخاب نکرده‌اید."
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <ul className="flex max-h-[22rem] min-h-0 flex-1 flex-col gap-2 overflow-y-auto pe-1 [scrollbar-width:thin]">
          {highlights.map((item) => {
            const visual = statusVisual(item.status);
            const weekLabel =
              item.weekTitle || `هفته ${toPersianDigits(item.weekNumber)}`;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between gap-2.5 rounded-kv-control border border-kv-border bg-kv-surface px-2.5 py-1.5',
                    'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-sans text-sm font-bold leading-tight text-kv-text">
                      {item.courseTitle}
                    </span>
                    <span className="mt-px block truncate font-sans text-xs leading-tight text-kv-text-muted">
                      {weekLabel}
                    </span>
                  </span>

                  <span
                    className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-kv-control px-2 py-0.5 font-sans text-xs font-bold leading-none',
                      visual.badgeClassName
                    )}
                  >
                    <FaIcon icon={visual.icon} size="xs" />
                    {visual.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
