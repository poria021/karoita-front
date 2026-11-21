'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
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
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardProfessorAttendanceRanking } from '../hooks/useDashboardProfessorAttendanceRanking';
import { facultyBoxSourceFor } from '../lib/faculty-box-source';
import type { ProfessorAttendanceRankingItem } from '../lib/professor-attendance-ranking';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchProfessorAttendanceRankingBoxProps = {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

type Tab = 'weakest' | 'strongest';

const TAB_BACKGROUND: Record<Tab, string> = {
  weakest: 'color-mix(in srgb, var(--kv-danger) 2.5%, var(--kv-surface))',
  strongest: 'color-mix(in srgb, var(--kv-success) 2.5%, var(--kv-surface))',
};

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'weakest', label: 'ضعیف‌ترین‌ها' },
  { id: 'strongest', label: 'قوی‌ترین‌ها' },
];

function ProfessorRow({
  item,
  tone,
}: {
  item: ProfessorAttendanceRankingItem;
  tone: 'low' | 'high';
}) {
  return (
    <li className="flex items-center gap-kv-pair py-1.5">
      <span
        aria-hidden
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-kv-brand-soft text-kv-brand-soft-fg"
      >
        <FaIcon icon={faIcons.chalkboardUser} size="sm" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="truncate text-sm font-bold leading-tight text-kv-text">
          {item.name}
        </span>
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            'font-sans text-base font-black leading-none tabular-nums',
            tone === 'low' ? 'text-kv-danger' : 'text-kv-success'
          )}
        >
          {toPersianDigits(Math.round(item.attendance))}٪
        </span>
        <span className="text-[11px] leading-none text-kv-text-faint">
          حضور
        </span>
      </span>
    </li>
  );
}

/**
 * ۶ استادِ ضعیف‌ترین / ۶ استادِ قوی‌ترین بر اساس درصد حضور —
 * میز کار مدیر دانشکده.
 */
export function WorkbenchProfessorAttendanceRankingBox({
  role,
  className,
  style,
}: WorkbenchProfessorAttendanceRankingBoxProps) {
  const [tab, setTab] = useState<Tab>('weakest');
  const source = facultyBoxSourceFor(role);
  const desk = useDashboardProfessorAttendanceRanking(role);
  const summary = desk.summary;
  const isLoading = desk.isLoading;
  const isError = desk.isError;
  const isForbidden = desk.isForbidden;
  const isEmpty =
    isError ||
    (!isLoading &&
      summary.weakest.length === 0 &&
      summary.strongest.length === 0);
  const rows = summary[tab];

  return (
    <section
      aria-labelledby="dashboard-professor-attendance-ranking-title"
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
            id="dashboard-professor-attendance-ranking-title"
            className="min-w-0 truncate"
          >
            {source.rankingTitle}
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس حضور و غیاب
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
          <WorkbenchBoxBusy
            label={`در حال بارگذاری فهرست ${source.noun}`}
            className="min-h-0"
          />
        ) : isEmpty ? (
          <KvEmptyState
            title={source.attendanceEmpty}
            className="min-h-0 py-1"
          />
        ) : (
          <ol
            aria-label={TABS.find((item) => item.id === tab)?.label ?? ''}
            className="grid list-none content-start divide-y divide-kv-border-muted"
          >
            {rows.map((item) => (
              <ProfessorRow
                key={item.id}
                item={item}
                tone={tab === 'weakest' ? 'low' : 'high'}
              />
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
