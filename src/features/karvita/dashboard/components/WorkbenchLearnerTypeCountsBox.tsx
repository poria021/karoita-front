'use client';

import type { CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardCapacityStatus } from '../hooks/useDashboardCapacityStatus';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchLearnerTypeCountsBoxProps = {
  className?: string;
  style?: CSSProperties;
};

const BARS: readonly { kind: OrganizationalCapacityKind; label: string; className: string }[] = [
  { kind: 'internship', label: 'دانشجو (ترمی)', className: 'bg-kv-brand' },
  { kind: 'apprenticeship', label: 'مهارت‌آموز (پودمانی)', className: 'bg-kv-success' },
];

const UNLIMITED_LABEL = 'نامحدود';

function LearnerTypeBar({
  label,
  count,
  unlimited,
  max,
  barClassName,
}: {
  label: string;
  count: number;
  unlimited: boolean;
  max: number;
  barClassName: string;
}) {
  const percent = unlimited
    ? 100
    : max > 0 && count > 0
      ? Math.max(4, Math.round((count / max) * 100))
      : 0;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-kv-inline">
        <span className="min-w-0 truncate text-xs font-medium text-kv-text-muted">
          {label}
        </span>
        <span className="shrink-0 font-sans text-base font-black tabular-nums leading-none text-kv-text">
          {unlimited ? UNLIMITED_LABEL : toPersianDigits(count)}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-kv-surface-muted">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', barClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * ظرفیتِ ثبت‌شدهٔ استاد در آخرین نیم‌سال فعال، به تفکیک دانشجو (ترمی) و
 * مهارت‌آموز (پودمانی) — باکسِ کوچکِ میله‌ای زیرِ کارت‌های «تعداد فراگیران».
 * عدد، مجموع ظرفیت درس‌های همان ترم است (`summary.total`)، نه پذیرش‌شده‌ها:
 * در حالت real شمار پذیرش‌شده از این endpoint نمی‌آید و همیشه صفر است.
 */
export function WorkbenchLearnerTypeCountsBox({
  className,
  style,
}: WorkbenchLearnerTypeCountsBoxProps) {
  const { isLoading, isError, isForbidden, snapshots } = useDashboardCapacityStatus();

  const counts = BARS.map((bar) => {
    const total = snapshots.find((snapshot) => snapshot.kind === bar.kind)?.summary
      .total;
    return {
      ...bar,
      unlimited: total === 'unlimited',
      count: typeof total === 'number' ? total : 0,
    };
  });
  const max = Math.max(1, ...counts.map((item) => item.count));
  const isEmpty =
    isError ||
    (!isLoading && counts.every((item) => !item.unlimited && item.count === 0));

  return (
    <section
      aria-labelledby="dashboard-learner-type-counts-title"
      style={style}
      className={cn(
        'relative flex h-fit min-h-0 min-w-0 flex-col gap-kv-pair self-start overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <KvTypography
        variant="subtitle"
        as="h3"
        id="dashboard-learner-type-counts-title"
        className="min-w-0 truncate"
      >
        ظرفیت در این نیم‌سال تحصیلی
      </KvTypography>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy
          label="در حال بارگذاری ظرفیت نیم‌سال"
          className="min-h-[2rem]"
        />
      ) : (
        <div className="flex min-w-0 flex-col gap-kv-group">
          {counts.map((item) => (
            <LearnerTypeBar
              key={item.kind}
              label={item.label}
              count={item.count}
              unlimited={item.unlimited}
              max={max}
              barClassName={item.className}
            />
          ))}
        </div>
      )}
    </section>
  );
}
