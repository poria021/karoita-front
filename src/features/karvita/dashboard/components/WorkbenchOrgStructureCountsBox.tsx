'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardOrgStructureCounts } from '../hooks/useDashboardOrgStructureCounts';
import type { OrgStructureCountMetric } from '../lib/org-structure-counts';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

export type WorkbenchOrgStructureCountsBoxProps = {
  className?: string;
  style?: CSSProperties;
};

/** هر کارت تکیه‌گاه خودش را دارد (بردر+سایه مستقل)؛ فاصله واقعی بین کارت‌ها. */
const GRID_CLASS = 'grid w-full min-w-0 grid-cols-3 gap-2';

function OrgMetricCard({ metric }: { metric: OrgStructureCountMetric }) {
  return (
    <Link
      href={RouteService.karvita.organizationalStructure(metric.id)}
      prefetch
      className={cn(
        'flex h-full min-h-[4rem] min-w-0 flex-col items-center justify-center gap-1 rounded-kv-control border border-kv-border/60 bg-kv-surface px-2 py-1.5 text-center shadow-kv-soft',
        'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-kv-ring'
      )}
      aria-label={`${metric.label}: ${toPersianDigits(metric.count)}`}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-kv-control bg-kv-brand-soft text-kv-brand-soft-fg">
        <FaIcon icon={metric.icon} size="sm" aria-hidden />
      </span>
      <span
        title={metric.label}
        className="w-full truncate text-[11px] font-medium leading-snug text-kv-text-muted"
      >
        {metric.label}
      </span>
      <span className="font-sans text-lg font-black tabular-nums leading-none tracking-tight text-kv-text">
        {toPersianDigits(metric.count)}
      </span>
    </Link>
  );
}

/**
 * شاخص‌های ساختار سازمانی — کارت‌های مستقل سه‌ستونه (آیکون → برچسب → عدد)،
 * هم‌فرم با «تعداد نقش‌ها». هر کارت لینک به تب همان بخش است.
 * میز کار مدیر ارشد / دستیار.
 */
export function WorkbenchOrgStructureCountsBox({
  className,
  style,
}: WorkbenchOrgStructureCountsBoxProps) {
  const { isLoading, isError, isForbidden, metrics } =
    useDashboardOrgStructureCounts();

  if (isError) {
    return (
      <p
        style={style}
        className={cn(
          'flex items-center justify-center rounded-kv-shell border p-kv-group text-center text-xs text-kv-text-muted',
          workbenchBoxToneClass(true),
          className
        )}
      >
        {workbenchErrorText(isForbidden, 'ساختار سازمانی فعلاً در دسترس نیست.')}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div style={style} className={cn('flex min-h-[8.5rem]', className)}>
        <WorkbenchBoxBusy label="در حال بارگذاری ساختار سازمانی" />
      </div>
    );
  }

  return (
    <div
      style={style}
      role="list"
      aria-label="ساختار سازمانی"
      className={cn(GRID_CLASS, className)}
    >
      {metrics.map((metric) => (
        <div key={metric.id} role="listitem" className="min-w-0">
          <OrgMetricCard metric={metric} />
        </div>
      ))}
    </div>
  );
}
