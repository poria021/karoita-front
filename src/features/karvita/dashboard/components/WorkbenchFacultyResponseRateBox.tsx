'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types/auth';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardFacultyResponseRate } from '../hooks/useDashboardFacultyResponseRate';
import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import {
  FACULTY_RESPONSE_HIGH,
  FACULTY_RESPONSE_MID,
} from '../lib/faculty-response-rate';
import { StatusDonut, type DonutSegment } from './StatusDonut';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchFacultyResponseRateBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type RateSegment = DonutSegment & {
  softClassName: string;
  textClassName: string;
};

/**
 * «نرخ پاسخ‌دهی» — میز کار مدیر دانشکده: دونات توزیع اساتید
 * (خوب / متوسط / ضعیف) + میانگین در مرکز؛ داده از `professor-performance`.
 */
export function WorkbenchFacultyResponseRateBox({
  role,
  className,
  style,
}: WorkbenchFacultyResponseRateBoxProps) {
  const { isLoading, isError, isForbidden, summary } =
    useDashboardFacultyResponseRate(role);
  const source = facultyBoxSourceFor(role);
  const [activeId, setActiveId] = useState<string | null>(null);

  const segments = useMemo<RateSegment[]>(
    () => [
      {
        id: 'high',
        label: `خوب (≥${toPersianDigits(FACULTY_RESPONSE_HIGH)}٪)`,
        value: summary.high,
        color: 'var(--kv-success)',
        softClassName: 'bg-kv-success-soft',
        textClassName: 'text-kv-success-soft-fg',
      },
      {
        id: 'mid',
        label: `متوسط (≥${toPersianDigits(FACULTY_RESPONSE_MID)}٪)`,
        value: summary.mid,
        color: 'var(--kv-warning)',
        softClassName: 'bg-kv-warning-soft',
        textClassName: 'text-kv-warning-soft-fg',
      },
      {
        id: 'low',
        label: `ضعیف (<${toPersianDigits(FACULTY_RESPONSE_MID)}٪)`,
        value: summary.low,
        color: 'var(--kv-danger)',
        softClassName: 'bg-kv-danger-soft',
        textClassName: 'text-kv-danger-soft-fg',
      },
    ],
    [summary.high, summary.mid, summary.low]
  );
  const isEmpty = isError || (!isLoading && summary.total === 0);
  const averageLabel = `${toPersianDigits(Math.round(summary.average))}٪`;

  return (
    <section
      aria-labelledby="dashboard-faculty-response-rate-title"
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
            id="dashboard-faculty-response-rate-title"
            className="min-w-0 truncate"
          >
            {source.responseTitle}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            {source.responseCaption}
          </KvTypography>
        </div>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری نرخ پاسخ‌دهی" />
      ) : (
        <div className="flex min-h-0 flex-row items-center justify-center gap-kv-group">
          <div className="flex min-w-0 shrink-0 items-center justify-center">
            <StatusDonut
              segments={segments}
              total={summary.total}
              centerValue={averageLabel}
              centerLabel="میانگین"
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>

          <ul
            className="grid w-fit shrink-0 gap-0.5"
            aria-label="راهنمای نرخ پاسخ‌دهی"
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
                        'ms-10 shrink-0 font-sans text-sm font-black tabular-nums',
                        active ? segment.textClassName : 'text-kv-text'
                      )}
                    >
                      {toPersianDigits(segment.value)}
                      {summary.truncated ? '+' : ''}
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
