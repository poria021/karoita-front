'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import {
  WEEK_LEGEND_ITEMS,
  getWeekVisual,
} from '@/features/karvita/daily-approvals/constants';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { toPersianDigits } from '@/utils/persianDigits';

import type { LearnerCourseWeekRow } from '../lib/learner-workbench';

export type WorkbenchCourseWeeksBoxProps = {
  rows: LearnerCourseWeekRow[];
  className?: string;
  style?: CSSProperties;
};

function formatGrade(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return toPersianDigits(Number(value.toFixed(2)));
}

/**
 * باکس «وضعیت هفته‌ها»ی میز کار دانشجو و مهارت‌آموز: به ازای هر درسی که
 * برداشته یک ردیف؛ خانه‌ها = هفته‌های درس (هم‌رنگ کارت‌های گزارش‌نویسی)
 * و سمت چپ = نمرهٔ نهایی درس. کلیک روی ردیف به صفحهٔ همان درس می‌رود.
 */
export function WorkbenchCourseWeeksBox({
  rows,
  className,
  style,
}: WorkbenchCourseWeeksBoxProps) {
  const maxWeeks = rows.reduce((max, row) => Math.max(max, row.weeks.length), 0);

  return (
    <aside
      aria-label="وضعیت هفته‌ها و نمرهٔ نهایی دروس"
      style={style}
      className={cn(
        'flex min-h-0 min-w-0 flex-col rounded-kv-panel border p-kv-section sm:p-kv-page',
        workbenchBoxToneClass(rows.length === 0, 'default'),
        className
      )}
    >
      <header className="mb-3 shrink-0">
        <h2 className="font-sans text-base font-bold tracking-tight text-kv-text sm:text-lg">
          وضعیت هفته‌ها
        </h2>
        <p className="mt-0.5 font-sans text-xs text-kv-text-muted">
          هفته‌های هر درس و نمرهٔ نهایی آن
        </p>
      </header>

      {rows.length === 0 ? (
        <KvEmptyState
          title="هنوز درسی انتخاب نکرده‌اید."
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <>
          <ul className="flex max-h-[22rem] min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pe-1 [scrollbar-width:thin]">
            {rows.map((row) => (
              <li key={row.id}>
                <Link
                  href={row.href}
                  className={cn(
                    'grid items-center gap-3 rounded-kv-control px-1.5 py-1',
                    'grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)_2.75rem] sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)_3rem]',
                    'transition-colors duration-200 can-hover:hover:bg-kv-surface-muted/60',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring'
                  )}
                >
                  <span className="truncate font-sans text-sm font-bold text-kv-text">
                    {row.courseTitle}
                  </span>

                  <span
                    className="grid gap-1"
                    style={{
                      gridTemplateColumns: `repeat(${maxWeeks}, minmax(0, 1fr))`,
                    }}
                  >
                    {row.weeks.map((week) => {
                      const visual = getWeekVisual(week.status);
                      const scoreText =
                        week.score != null
                          ? ` — نمره ${toPersianDigits(week.score)}`
                          : '';
                      return (
                        <span
                          key={week.weekNumber}
                          title={`${week.title} — ${visual.label}${scoreText}`}
                          className={cn(
                            'aspect-square w-full rounded-[0.3rem] border',
                            visual.className
                          )}
                        />
                      );
                    })}
                  </span>

                  <span
                    dir="ltr"
                    className="text-center font-sans text-xs font-bold tabular-nums text-kv-text-muted"
                    title="نمرهٔ نهایی درس از ۲۰"
                  >
                    {formatGrade(row.finalGrade)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <footer className="mt-3 flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-kv-border pt-2.5">
            {WEEK_LEGEND_ITEMS.map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1 font-sans text-xs text-kv-text-muted"
              >
                <span
                  aria-hidden
                  className={cn('size-3 rounded-[0.2rem] border', item.wellClass)}
                />
                {item.label}
              </span>
            ))}
          </footer>
        </>
      )}
    </aside>
  );
}
