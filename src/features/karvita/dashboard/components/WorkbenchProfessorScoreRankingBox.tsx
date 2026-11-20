'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

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
import {
  WORKBENCH_RANKING_BODY_CLASS,
  WORKBENCH_RANKING_BOX_CLASS,
  WORKBENCH_RANKING_BOX_STYLE,
  workbenchBoxToneClass,
} from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardProfessorScoreRanking } from '../hooks/useDashboardProfessorScoreRanking';
import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchProfessorScoreRankingBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type Tab = 'weakest' | 'strongest';

/** زمینهٔ بسیار کم‌رنگ هر تب: قرمز برای ضعیف‌ترین‌ها، سبز برای قوی‌ترین‌ها. */
const TAB_BACKGROUND: Record<Tab, string> = {
  weakest: 'color-mix(in srgb, var(--kv-danger) 2.5%, var(--kv-surface))',
  strongest: 'color-mix(in srgb, var(--kv-success) 2.5%, var(--kv-surface))',
};

/** رنگ میله‌ها هم‌رنگ تب: قرمز برای ضعیف‌ترین‌ها، سبز برای قوی‌ترین‌ها. */
const TAB_BAR_COLOR: Record<Tab, string> = {
  weakest: 'var(--kv-danger)',
  strongest: 'var(--kv-success)',
};

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'weakest', label: 'ضعیف‌ترین‌ها' },
  { id: 'strongest', label: 'قوی‌ترین‌ها' },
];

const CHART_HEIGHT = 260;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function formatScore(value: number): string {
  return toPersianDigits(Math.round(value * 100) / 100);
}

/**
 * ۶ استاد ضعیف‌ترین / ۶ استاد قوی‌ترین دانشکده بر اساس میانگین نمرهٔ فراگیران —
 * میز کار مدیر دانشکده؛ همان نمودار میله‌ای باکس مدارس منطقه.
 */
export function WorkbenchProfessorScoreRankingBox({
  role,
  className,
  style,
}: WorkbenchProfessorScoreRankingBoxProps) {
  const [tab, setTab] = useState<Tab>('weakest');
  const source = facultyBoxSourceFor(role);
  const desk = useDashboardProfessorScoreRanking(role);
  const summary = desk.summary;
  const isLoading = desk.isLoading;
  const isError = desk.isError;
  const isForbidden = desk.isForbidden;
  const items = summary[tab];
  const isEmpty =
    isError ||
    (!isLoading &&
      summary.weakest.length === 0 &&
      summary.strongest.length === 0);
  const tabLabel = TABS.find((item) => item.id === tab)?.label ?? '';

  const chartRows = items.map((item) => ({
    name: item.name,
    value: item.score,
    hint: item.subtitle ?? '',
  }));

  return (
    <section
      aria-labelledby="dashboard-professor-score-ranking-title"
      style={
        isEmpty
          ? { ...WORKBENCH_RANKING_BOX_STYLE, ...style }
          : {
              ...WORKBENCH_RANKING_BOX_STYLE,
              ...style,
              backgroundColor: TAB_BACKGROUND[tab],
              transition: 'background-color 250ms ease',
            }
      }
      className={cn(
        'relative flex min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        WORKBENCH_RANKING_BOX_CLASS,
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-kv-pair">
        <header className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-professor-score-ranking-title"
            className="min-w-0 truncate"
          >
            {source.rankingTitle}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس میانگین نمرهٔ فراگیران
          </KvTypography>
        </header>

        <div className="flex shrink-0 items-center gap-kv-pair">
          <KvButton
            asChild
            color="cta"
            appearance="text"
            size="xs"
            className="shrink-0 text-[11px] font-bold"
          >
            <Link
              href={RouteService.karvita.orgReports(source.slug)}
              prefetch
            >
              گزارش کامل
            </Link>
          </KvButton>
          <AppTabs
            value={tab}
            onValueChange={(value) => setTab(value as Tab)}
            className="w-auto shrink-0"
          >
            <AppTabsList aria-label="نوع فهرست">
              {TABS.map(({ id, label }) => (
                <AppTabsTrigger key={id} value={id}>
                  {label}
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>
        </div>
      </div>

      <div className={WORKBENCH_RANKING_BODY_CLASS}>
        {isError ? (
          <WorkbenchUnavailableNote forbidden={isForbidden} />
        ) : isLoading ? (
          <div
            role="status"
            aria-label={`در حال بارگذاری نمودار ${source.noun}`}
            className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
          />
        ) : isEmpty ? (
          <KvEmptyState
            title={source.scoreEmpty}
            className="min-h-0 py-1"
          />
        ) : (
          <KvBarChart
            key={tab}
            rows={chartRows}
            xKey="name"
            valueKey="value"
            valueLabel="میانگین نمره"
            hintKey="hint"
            color={TAB_BAR_COLOR[tab]}
            height={CHART_HEIGHT}
            barSize={28}
            xTickFormatter={(value) => truncate(String(value), 22)}
            formatValue={formatScore}
            ariaLabel={`نمودار میله‌ای ${tabLabel} ${source.chartNoun}`}
            className="min-h-0 flex-1"
          />
        )}
      </div>
    </section>
  );
}
