'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardFacultyCounts } from '../hooks/useDashboardFacultyCounts';
import { StatusDonut, type DonutSegment } from './StatusDonut';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchFacultyGenderBoxProps = {
  className?: string;
  style?: CSSProperties;
};

type GenderSegment = DonutSegment & {
  softClassName: string;
  textClassName: string;
};

/**
 * «تفکیک مدارس» — میز کار مدیر دانشکده: نمودار حلقهٔ دخترانه / پسرانه،
 * با همان `StatusDonut` منطقه. داده از کوئری آمار دانشکده (`school-performance`).
 */
export function WorkbenchFacultyGenderBox({
  className,
  style,
}: WorkbenchFacultyGenderBoxProps) {
  const { isLoading, isError, isForbidden, counts } = useDashboardFacultyCounts();
  const [activeId, setActiveId] = useState<string | null>(null);

  const segments = useMemo<GenderSegment[]>(
    () => [
      {
        id: 'boys',
        label: 'پسرانه',
        value: counts?.boysSchools ?? 0,
        color: 'var(--kv-info)',
        softClassName: 'bg-kv-info-soft',
        textClassName: 'text-kv-info-soft-fg',
      },
      {
        id: 'girls',
        label: 'دخترانه',
        value: counts?.girlsSchools ?? 0,
        color: 'var(--kv-violet)',
        softClassName: 'bg-kv-violet-soft',
        textClassName: 'text-kv-violet-soft-fg',
      },
    ],
    [counts]
  );
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const isEmpty = isError || (!isLoading && total === 0);

  return (
    <section
      aria-labelledby="dashboard-faculty-gender-title"
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
            id="dashboard-faculty-gender-title"
            className="min-w-0 truncate"
          >
            تفکیک مدارس
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            مدارس دخترانه و پسرانهٔ دانشکده
          </KvTypography>
        </div>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری تفکیک مدارس"
          className="min-h-[6rem] animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : (
        <div className="flex min-h-0 flex-row items-center justify-center gap-kv-group">
          <div className="flex min-w-0 shrink-0 items-center justify-center">
            <StatusDonut
              segments={segments}
              total={total}
              centerLabel="مدرسه"
              activeId={activeId}
              onHover={setActiveId}
            />
          </div>

          <ul
            className="grid w-fit shrink-0 gap-0.5"
            aria-label="راهنمای تفکیک مدارس"
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
                      {counts?.truncated ? '+' : ''}
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
