'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
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
  type PerformanceRankingEntity,
} from '../lib/performance-ranking';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchWeakRankingBoxProps = {
  className?: string;
  style?: CSSProperties;
};

const TABS: readonly { id: PerformanceRankingEntity; label: string }[] = [
  { id: 'province', label: 'استان' },
  { id: 'faculty', label: 'دانشکده' },
];

const CHART_HEIGHT = 170;

/** رنگ هر میله؛ توکن‌های دستهٔ نمودار در globals.css (همان نمودار مقایسهٔ گزارش‌ها). */
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
 * باکس واحد «ضعیف‌ترین‌ها» برای میز کار ارشد: تب استان‌ها | دانشگاه‌ها و در هر
 * تب نمودار میله‌ای عمودی (`KvBarChart`، همان نمودار گزارش‌ها) با رنگ جدا برای هر مورد.
 * فقط تب فعال درخواست می‌فرستد.
 */
export function WorkbenchWeakRankingBox({
  className,
  style,
}: WorkbenchWeakRankingBoxProps) {
  const [tab, setTab] = useState<PerformanceRankingEntity>('province');
  const province = useDashboardPerformanceRanking(
    'province',
    'weak',
    tab === 'province'
  );
  const faculty = useDashboardPerformanceRanking(
    'faculty',
    'weak',
    tab === 'faculty'
  );
  const active = tab === 'province' ? province : faculty;
  const href = RouteService.karvita.reports(PERFORMANCE_RANKING_META[tab].slug);
  const isEmpty =
    active.isError || (!active.isLoading && active.items.length === 0);
  const tabLabel = TABS.find((item) => item.id === tab)?.label ?? '';
  const chartRows = useMemo(
    () =>
      active.items.map((item, index) => ({
        name: item.name,
        value: Math.max(0, item.score),
        color: itemColor(index),
      })),
    [active.items]
  );

  return (
    <section
      aria-labelledby="dashboard-weak-ranking-title"
      style={style}
      className={cn(
        'relative flex h-full min-h-[12rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-weak-ranking-title"
            className="min-w-0 truncate"
          >
            ضعیف‌ترین‌ها
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

      <AppTabs
        value={tab}
        onValueChange={(value) => setTab(value as PerformanceRankingEntity)}
        className="shrink-0"
      >
        <AppTabsList aria-label="سطح رتبه‌بندی">
          {TABS.map(({ id, label }) => (
            <AppTabsTrigger key={id} value={id}>
              {label}
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>

      {active.isError ? (
        <WorkbenchUnavailableNote forbidden={active.isForbidden} />
      ) : active.isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری رتبه‌بندی" className="min-h-0" />
      ) : active.items.length === 0 ? (
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
          ariaLabel={`نمودار میله‌ای ضعیف‌ترین ${tabLabel}‌ها`}
          className="min-h-0 flex-1"
        />
      )}
    </section>
  );
}
