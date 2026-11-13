'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardOrgStructureCounts } from '../hooks/useDashboardOrgStructureCounts';
import type { OrgStructureCountMetric } from '../lib/org-structure-counts';

export type WorkbenchOrgStructureCountsBoxProps = {
  className?: string;
  style?: CSSProperties;
};

function OrgMetricCard({ metric }: { metric: OrgStructureCountMetric }) {
  return (
    <Link
      href={RouteService.karvita.organizationalStructure(metric.id)}
      prefetch
      className={cn(
        'flex h-full min-h-0 min-w-0 flex-col items-center justify-center gap-1 rounded-kv-shell border border-kv-border/70 bg-kv-surface px-1.5 py-1.5 text-center shadow-kv-soft sm:gap-1.5 sm:px-2 sm:py-2',
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/40',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20'
      )}
      aria-label={`${metric.label}: ${toPersianDigits(metric.count)}`}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-kv-control bg-kv-surface-muted text-kv-text-muted sm:size-8">
        <FaIcon icon={metric.icon} size="sm" aria-hidden />
      </span>
      <p className="line-clamp-2 w-full text-[10px] font-medium leading-snug text-kv-text-muted sm:text-[11px]">
        {metric.label}
      </p>
      <p className="font-sans text-base font-normal tabular-nums leading-none tracking-tight text-kv-text sm:text-lg">
        {toPersianDigits(metric.count)}
      </p>
    </Link>
  );
}

/**
 * شبکهٔ ۳×۲ کارت‌های جدا ساختار سازمانی.
 */
export function WorkbenchOrgStructureCountsBox({
  className,
  style,
}: WorkbenchOrgStructureCountsBoxProps) {
  const { isLoading, isError, metrics } = useDashboardOrgStructureCounts();

  if (isError) {
    return (
      <p
        style={style}
        className={cn(
          'flex items-center justify-center rounded-kv-shell border border-kv-border/70 bg-kv-surface p-kv-group text-xs text-kv-text-muted shadow-kv-soft',
          className
        )}
      >
        ساختار سازمانی فعلاً در دسترس نیست.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="در حال بارگذاری ساختار سازمانی"
        style={style}
        className={cn(
          'grid size-full min-h-0 min-w-0 grid-cols-2 grid-rows-3 gap-1.5 sm:grid-cols-3 sm:grid-rows-2 sm:gap-2',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="min-h-0 min-w-0 animate-pulse rounded-kv-shell bg-kv-surface-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={style}
      role="list"
      aria-label="ساختار سازمانی"
      className={cn(
        'grid size-full min-h-0 min-w-0 grid-cols-2 grid-rows-3 gap-1.5 sm:grid-cols-3 sm:grid-rows-2 sm:gap-2',
        className
      )}
    >
      {metrics.map((metric) => (
        <div key={metric.id} role="listitem" className="min-h-0 min-w-0">
          <OrgMetricCard metric={metric} />
        </div>
      ))}
    </div>
  );
}
