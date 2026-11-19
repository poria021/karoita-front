'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvBarChart } from '@/components/shared/KvBarChart';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardPerformanceRanking } from '../hooks/useDashboardPerformanceRanking';
import {
  PERFORMANCE_RANKING_META,
  type PerformanceRankingDirection,
  type PerformanceRankingEntity,
} from '../lib/performance-ranking';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchPerformanceRankingBoxProps = {
  entity: PerformanceRankingEntity;
  direction: PerformanceRankingDirection;
  /** وقتی false است درخواست نمی‌رود. */
  enabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

const TITLES: Record<
  PerformanceRankingEntity,
  Record<PerformanceRankingDirection, string>
> = {
  province: { weak: 'استان‌های ضعیف', strong: 'استان‌های برتر' },
  faculty: { weak: 'دانشکده‌های ضعیف', strong: 'دانشکده‌های برتر' },
  school: { weak: 'مدارس ضعیف', strong: 'مدارس برتر' },
};

const CHART_HEIGHT = 240;

/** رنگ هر میله/ردیف؛ توکن‌ها در globals.css (همان نمودار مقایسهٔ گزارش‌ها). */
function itemColor(index: number): string {
  return `var(--kv-chart-cat-${(index % 10) + 1})`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatScore(value: number): string {
  return toPersianDigits(Math.round(value * 100) / 100);
}

/**
 * باکس عملکرد میز کار ادمین: ۳ استان یا ۳ دانشکدهٔ ضعیف/قوی بر اساس میانگین
 * نمرهٔ فراگیران (گزارش عملکرد Nest). فقط نمودار میله‌ای تمام‌عرض، با رنگ جدا
 * برای هر مورد؛ مقدار روی میله و در تولتیپ دیده می‌شود. بدون داده → میلهٔ ۰.
 */
export function WorkbenchPerformanceRankingBox({
  entity,
  direction,
  enabled = true,
  className,
  style,
}: WorkbenchPerformanceRankingBoxProps) {
  const { isLoading, isError, isForbidden, items } = useDashboardPerformanceRanking(
    entity,
    direction,
    enabled
  );
  const title = TITLES[entity][direction];
  const titleId = `dashboard-ranking-${entity}-${direction}-title`;
  const href = RouteService.karvita.reports(
    PERFORMANCE_RANKING_META[entity].slug
  );
  const isEmpty = isError || (!isLoading && items.length === 0);

  const chartRows = items.map((item, index) => ({
    name: item.name,
    value: item.score,
    color: itemColor(index),
  }));

  return (
    <section
      aria-labelledby={titleId}
      style={style}
      className={cn(
        'relative flex h-full min-h-[18rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id={titleId}
            className="min-w-0 truncate"
          >
            {title}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس میانگین نمرهٔ فراگیران
          </KvTypography>
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={href} prefetch>
            گزارش کامل
          </Link>
        </KvButton>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label={`در حال بارگذاری ${title}`}
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : items.length === 0 ? (
        <KvEmptyState
          title="هنوز دادهٔ کافی برای رتبه‌بندی نیست."
          className="min-h-0 py-1"
        />
      ) : (
        <KvBarChart
          rows={chartRows}
          xKey="name"
          valueKey="value"
          valueLabel="میانگین نمره"
          colorKey="color"
          height={CHART_HEIGHT}
          barSize={18}
          xTickAngle={-25}
          xTickHeight={56}
          xTickFormatter={(value) => truncate(String(value), 12)}
          formatValue={formatScore}
          ariaLabel={`نمودار میله‌ای ${title}`}
          className="min-h-0 flex-1"
        />
      )}
    </section>
  );
}
