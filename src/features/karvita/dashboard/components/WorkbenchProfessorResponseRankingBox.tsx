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
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import type { UserRole } from '@/types/auth';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardProfessorResponseRanking } from '../hooks/useDashboardProfessorResponseRanking';
import type { TeacherResponseRankingItem } from '../lib/teacher-response-ranking';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchProfessorResponseRankingBoxProps = {
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

const TABS: readonly { id: Tab; label: string }[] = [
  { id: 'weakest', label: 'ضعیف‌ترین‌ها' },
  { id: 'strongest', label: 'قوی‌ترین‌ها' },
];

function ProfessorRow({
  item,
  tone,
}: {
  item: TeacherResponseRankingItem;
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
        {item.learnerCount !== undefined ? (
          <span className="truncate text-xs leading-tight text-kv-text-muted">
            {toPersianDigits(item.learnerCount)} فراگیر
          </span>
        ) : null}
      </span>
      <span className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            'font-sans text-base font-black leading-none tabular-nums',
            tone === 'low' ? 'text-kv-danger' : 'text-kv-success'
          )}
        >
          {toPersianDigits(Math.round(item.response))}٪
        </span>
        <span className="text-[11px] leading-none text-kv-text-faint">
          نرخ پاسخ‌دهی
        </span>
      </span>
    </li>
  );
}

/**
 * ۵ استادِ ضعیف‌ترین / ۵ استادِ قوی‌ترین بر اساس نرخ پاسخ‌دهی به گزارش‌ها —
 * میز کار مدیر دانشکده (جای «معلمان منطقه»).
 */
export function WorkbenchProfessorResponseRankingBox({
  role,
  className,
  style,
}: WorkbenchProfessorResponseRankingBoxProps) {
  const [tab, setTab] = useState<Tab>('weakest');
  const desk = useDashboardProfessorResponseRanking(role);
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
      aria-labelledby="dashboard-professor-response-ranking-title"
      style={
        isEmpty
          ? style
          : {
              ...style,
              backgroundColor: TAB_BACKGROUND[tab],
              transition: 'background-color 250ms ease',
            }
      }
      className={cn(
        'relative flex h-full min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <div className="flex shrink-0 flex-wrap items-start justify-between gap-kv-pair">
        <header className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-professor-response-ranking-title"
            className="min-w-0 truncate"
          >
            ضعیف‌ترین و قوی‌ترین اساتید دانشکده
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            بر اساس نرخ پاسخ‌دهی
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
              href={RouteService.karvita.orgReports('professor-performance')}
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

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری فهرست اساتید"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : isEmpty ? (
        <KvEmptyState
          title="هنوز استادی برای دانشکدهٔ شما ثبت نشده است."
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
    </section>
  );
}
