'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  useDashboardRoleUserCounts,
  type DashboardRoleUserCountsState,
} from '../hooks/useDashboardRoleUserCounts';
import type { RoleUserCountMetric } from '../lib/role-user-counts';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchRoleUserCountsBoxProps = {
  className?: string;
  style?: CSSProperties;
  /** false: خانه‌ها لینک نیستند (نقش‌هایی که به صفحهٔ ساخت کاربر دسترسی ندارند). */
  interactive?: boolean;
};

/** جداکنندهٔ نازک برای گرید ۳×۳ (۹ نقش) — یک سطح پیوسته، نه کارت‌های جدا. */
function cellDividerClass(index: number): string {
  return cn(
    index % 3 !== 0 && 'border-s border-kv-border/50',
    index >= 3 && 'border-t border-kv-border/50'
  );
}

function RoleMetricCell({
  metric,
  className,
  interactive,
}: {
  metric: RoleUserCountMetric;
  className?: string;
  interactive: boolean;
}) {
  const baseClassName = cn(
    'flex h-full min-h-0 min-w-0 flex-col items-center justify-center gap-1.5 bg-kv-surface px-1.5 py-3 text-center',
    className
  );
  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface-muted text-kv-text-muted sm:size-8">
        <FaIcon icon={metric.icon} size="sm" aria-hidden />
      </span>
      <p className="line-clamp-2 w-full text-[11px] font-medium leading-snug text-kv-text-muted">
        {metric.label}
      </p>
      <p className="font-sans text-xl font-black tabular-nums leading-none tracking-tight text-kv-text">
        {toPersianDigits(metric.count)}
      </p>
    </>
  );
  const label = `${metric.label}: ${toPersianDigits(metric.count)}`;

  if (!interactive) {
    return (
      <div className={baseClassName} aria-label={label}>
        {content}
      </div>
    );
  }
  return (
    <Link
      href={RouteService.karvita.adminUserCreation()}
      prefetch
      className={cn(
        baseClassName,
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kv-ring'
      )}
      aria-label={label}
    >
      {content}
    </Link>
  );
}

/**
 * شمار نقش‌ها — یک سطح پیوسته با بردر بیرونی و خط‌های جداکنندهٔ نازک
 * بین خانه‌ها (نه کارت‌های جدا با فاصله). ترتیب هر خانه: آیکون → برچسب → عدد.
 * فقط نمایش؛ داده را از بیرون می‌گیرد (برای پیش‌نمایش با داده‌ی نمایشی).
 */
export function RoleUserCountsGrid({
  className,
  style,
  interactive = true,
  isLoading,
  isError,
  isForbidden,
  metrics,
}: WorkbenchRoleUserCountsBoxProps &
  Pick<
    DashboardRoleUserCountsState,
    'isLoading' | 'isError' | 'isForbidden' | 'metrics'
  >) {
  return (
    <div
      style={style}
      role="list"
      aria-label="تعداد کاربران هر نقش"
      aria-busy={isLoading}
      className={cn(
        'grid size-full min-h-0 min-w-0 grid-cols-3 grid-rows-3 overflow-hidden rounded-kv-shell border border-kv-border/50 bg-kv-surface shadow-kv-soft',
        className
      )}
    >
      {isLoading ? (
        <WorkbenchBoxBusy
          label="در حال بارگذاری تعداد کاربران هر نقش"
          className="col-span-3 row-span-3 min-h-0"
        />
      ) : isError || metrics.length === 0 ? (
        <div className="col-span-3 row-span-3 flex items-center justify-center px-3 text-center">
          <KvTypography variant="caption" tone="muted" as="p">
            {workbenchErrorText(
              isForbidden,
              'تعداد کاربران هر نقش فعلاً در دسترس نیست.'
            )}
          </KvTypography>
        </div>
      ) : (
        metrics.map((metric, index) => (
          <div key={metric.id} role="listitem" className="min-h-0 min-w-0">
            <RoleMetricCell
              metric={metric}
              className={cellDividerClass(index)}
              interactive={interactive}
            />
          </div>
        ))
      )}
    </div>
  );
}

/** شمار کاربران هر نقش از `GET /users/dashboard/counts`. */
export function WorkbenchRoleUserCountsBox(
  props: WorkbenchRoleUserCountsBoxProps
) {
  const { isLoading, isError, isForbidden, metrics } =
    useDashboardRoleUserCounts();
  return (
    <RoleUserCountsGrid
      {...props}
      isLoading={isLoading}
      isError={isError}
      isForbidden={isForbidden}
      metrics={metrics}
    />
  );
}
