'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardOrgStructureCounts } from '../hooks/useDashboardOrgStructureCounts';
import {
  sumOrgStructureCounts,
  type OrgStructureCountMetric,
} from '../lib/org-structure-counts';
import { StatusDonut, type DonutSegment } from './StatusDonut';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchOrgStructureBreakdownBoxProps = {
  className?: string;
  style?: CSSProperties;
  /**
   * متریک از پیش‌ساخته (مثلاً پیش‌نمایش سازمان مرکزی).
   * اگر نباشد از `GET /users/dashboard/counts` خوانده می‌شود.
   */
  metrics?: OrgStructureCountMetric[];
  isLoading?: boolean;
  isError?: boolean;
  isForbidden?: boolean;
};

type StructureSegment = DonutSegment & {
  softClassName: string;
  textClassName: string;
};

/**
 * «تفکیک ساختار» — میز کار سازمان مرکزی: نمودار حلقه‌ای شمار
 * استان/شهر/منطقه/مدرسه/رشته/دانشکده (همان الگوی دونات «تفکیک مدارس»).
 */
export function WorkbenchOrgStructureBreakdownBox({
  className,
  style,
  metrics: metricsProp,
  isLoading: isLoadingProp,
  isError: isErrorProp,
  isForbidden: isForbiddenProp,
}: WorkbenchOrgStructureBreakdownBoxProps) {
  const usePreview = metricsProp != null;
  const query = useDashboardOrgStructureCounts(!usePreview);
  const metrics = usePreview ? metricsProp : query.metrics;
  const isLoading = usePreview ? Boolean(isLoadingProp) : query.isLoading;
  const isError = usePreview ? Boolean(isErrorProp) : query.isError;
  const isForbidden = usePreview
    ? Boolean(isForbiddenProp)
    : query.isForbidden;
  const total = sumOrgStructureCounts(metrics);
  const [activeId, setActiveId] = useState<string | null>(null);

  const segments = useMemo<StructureSegment[]>(
    () =>
      metrics.map((metric) => ({
        id: metric.id,
        label: metric.label,
        value: metric.count,
        color: metric.color,
        softClassName: metric.softClassName,
        textClassName: metric.textClassName,
      })),
    [metrics]
  );
  const isEmpty = isError || (!isLoading && total === 0);

  return (
    <section
      aria-labelledby="dashboard-org-structure-breakdown-title"
      aria-busy={isLoading}
      style={style}
      className={cn(
        'relative flex min-h-[6rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-org-structure-breakdown-title"
            className="min-w-0 truncate"
          >
            تفکیک ساختار
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            استان، شهر، منطقه، مدرسه، رشته و دانشکده
          </KvTypography>
        </div>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری تفکیک ساختار" />
      ) : (
        <div className="flex min-h-0 flex-row items-center justify-center gap-kv-group">
          <div className="flex min-w-0 shrink-0 items-center justify-center">
            <StatusDonut
              segments={segments}
              total={total}
              centerLabel="واحد"
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>

          <ul
            className="grid w-fit shrink-0 gap-0.5"
            aria-label="راهنمای تفکیک ساختار"
          >
            {segments.map((segment) => {
              const active = activeId === segment.id;
              const muted = activeId != null && !active;
              return (
                <li key={segment.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(active ? null : segment.id)}
                    onMouseEnter={() => setActiveId(segment.id)}
                    onMouseLeave={() => setActiveId(null)}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-center gap-1.5 rounded-kv-control px-1.5 py-1.5 text-start transition-[background-color,opacity] duration-200',
                      'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
                      active
                        ? cn(segment.softClassName, 'shadow-kv-soft')
                        : 'can-hover:hover:bg-kv-surface-muted/70',
                      muted && 'opacity-40'
                    )}
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span
                      className={cn(
                        'min-w-0 flex-1 truncate text-[11px] font-semibold',
                        active ? segment.textClassName : 'text-kv-text-muted'
                      )}
                    >
                      {segment.label}
                    </span>
                    <span
                      className={cn(
                        'ms-6 shrink-0 font-sans text-sm font-black tabular-nums',
                        active ? segment.textClassName : 'text-kv-text'
                      )}
                    >
                      {toPersianDigits(segment.value)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
