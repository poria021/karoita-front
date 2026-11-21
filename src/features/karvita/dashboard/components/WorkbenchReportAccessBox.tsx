'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';

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
import type { ReportAccessRoleId } from '@/types/report-access';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { useDashboardReportAccess } from '../hooks/useDashboardReportAccess';
import type {
  ReportAccessMatrixColumn,
  ReportAccessMatrixRow,
  ReportAccessThemeId,
} from '../lib/report-access-matrix';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchReportAccessBoxProps = {
  className?: string;
  style?: CSSProperties;
};

type TabId = 'all' | ReportAccessThemeId;

type RoleProgress = {
  roleId: ReportAccessRoleId;
  label: string;
  /** پیش‌فرض (همیشه فعال). */
  defaults: number;
  /** اختیاریِ فعال‌شده. */
  granted: number;
  /** فعال = پیش‌فرض + فعال‌شده. */
  active: number;
  /** همهٔ گزارش‌های تعریف‌شده برای نقش در این تب. */
  total: number;
};

/** شمارش دسترسی‌های یک نقش، محدود به ستون‌های همین تب. */
function progressOf(
  row: ReportAccessMatrixRow,
  columns: readonly ReportAccessMatrixColumn[]
): RoleProgress {
  let defaults = 0;
  let granted = 0;
  let total = 0;
  for (const column of columns) {
    const state = row.cells[column.slug];
    if (state === 'none') continue;
    total += 1;
    if (state === 'default') defaults += 1;
    else if (state === 'granted') granted += 1;
  }
  return {
    roleId: row.roleId,
    label: getRoleStrategy(row.roleId).label,
    defaults,
    granted,
    active: defaults + granted,
    total,
  };
}

const RING_RADIUS = 15;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

/** حلقهٔ پیشرفتِ «فعال / کل» با عدد وسطش (الهام از کارت درس‌ها). */
function ProgressRing({ active, total }: { active: number; total: number }) {
  const ratio = total > 0 ? Math.min(1, active / total) : 0;
  return (
    <span
      role="img"
      aria-label={`${toPersianDigits(active)} از ${toPersianDigits(total)} گزارش فعال`}
      className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-kv-brand/5"
    >
      <svg
        aria-hidden
        viewBox="0 0 40 40"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="20"
          cy="20"
          r={RING_RADIUS}
          fill="none"
          strokeWidth="4"
          className="stroke-kv-brand/10"
        />
        {ratio > 0 ? (
          <circle
            cx="20"
            cy="20"
            r={RING_RADIUS}
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_LENGTH}
            strokeDashoffset={RING_LENGTH * (1 - ratio)}
            className="stroke-kv-brand transition-[stroke-dashoffset] duration-500"
          />
        ) : null}
      </svg>
      <span
        dir="ltr"
        className="relative font-sans text-[11px] font-bold tabular-nums text-kv-text-secondary"
      >
        {toPersianDigits(active)}/{toPersianDigits(total)}
      </span>
    </span>
  );
}

function KebabLink({ label }: { label: string }) {
  return (
    <Link
      href={RouteService.karvita.reportAccess()}
      prefetch
      aria-label={`مدیریت دسترسی گزارش‌های ${label}`}
      title="مدیریت دسترسی"
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-kv-text-muted transition-colors duration-150 can-hover:hover:bg-kv-surface-muted can-hover:hover:text-kv-text"
    >
      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">
        <circle cx="8" cy="3" r="1.4" />
        <circle cx="8" cy="8" r="1.4" />
        <circle cx="8" cy="13" r="1.4" />
      </svg>
    </Link>
  );
}

function RoleRow({ item }: { item: RoleProgress }) {
  return (
    <li className="flex items-center gap-kv-group py-3">
      <span className="flex min-w-0 flex-1 flex-col gap-1 text-start">
        <span className="truncate text-[15px] font-medium leading-tight text-kv-text">
          {item.label}
        </span>
        <span className="truncate text-xs leading-tight text-kv-text-muted">
          پیش‌فرض:{' '}
          <span className="font-bold text-kv-brand">
            {toPersianDigits(item.defaults)}
          </span>
          {' · '}
          اختیاریِ فعال:{' '}
          <span className="font-bold text-kv-brand">
            {toPersianDigits(item.granted)}
          </span>
        </span>
      </span>
      <ProgressRing active={item.active} total={item.total} />
      <KebabLink label={item.label} />
    </li>
  );
}

/**
 * «دسترسی گزارش‌ها» — میز کار مدیر ارشد (`GET /reports/access`).
 * الهام از کارت «درس‌های من»: تب برای گروه گزارش (همه / فهرست‌ها / حضور / عملکرد)،
 * هر نقش یک ردیف با زیرعنوان و حلقهٔ پیشرفتِ «فعال / کل»؛ منوی ⋮ به صفحهٔ مدیریت می‌رود.
 */
export function WorkbenchReportAccessBox({
  className,
  style,
}: WorkbenchReportAccessBoxProps) {
  const { isLoading, isError, isForbidden, matrix } = useDashboardReportAccess();
  const [tab, setTab] = useState<TabId>('all');
  const isEmpty = isError || (!isLoading && matrix.rows.length === 0);

  const tabs = useMemo(
    () => [
      { id: 'all' as const, label: 'همه' },
      ...matrix.themes.map((theme) => ({
        id: theme.id as TabId,
        label: theme.title,
      })),
    ],
    [matrix.themes]
  );

  const items = useMemo(() => {
    const columns =
      tab === 'all'
        ? matrix.columns
        : matrix.columns.filter((column) => column.themeId === tab);
    return matrix.rows
      .map((row) => progressOf(row, columns))
      .filter((item) => item.total > 0);
  }, [matrix.columns, matrix.rows, tab]);

  return (
    <section
      aria-labelledby="dashboard-report-access-title"
      style={style}
      className={cn(
        'relative flex h-full max-h-[22rem] w-full max-w-md min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-6 py-5',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="title"
            as="h3"
            id="dashboard-report-access-title"
            className="min-w-0 truncate"
          >
            دسترسی گزارش‌ها
          </KvTypography>
          {matrix.rows.length > 0 ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {toPersianDigits(matrix.totals.active)} از{' '}
              {toPersianDigits(matrix.totals.total)} دسترسی فعال است
            </KvTypography>
          ) : null}
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 gap-1 text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.reportAccess()} prefetch>
            مدیریت
            <FaIcon icon={faIcons.chevronLeft} size="xs" />
          </Link>
        </KvButton>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <WorkbenchBoxBusy label="در حال بارگذاری دسترسی گزارش‌ها" />
      ) : matrix.rows.length === 0 ? (
        <KvEmptyState
          title="هنوز دسترسی گزارشی ثبت نشده است."
          className="min-h-0 py-1"
        />
      ) : (
        <>
          <AppTabs
            value={tab}
            onValueChange={(value) => setTab(value as TabId)}
            className="shrink-0"
          >
            <AppTabsList aria-label="گروه گزارش">
              {tabs.map(({ id, label }) => (
                <AppTabsTrigger key={id} value={id}>
                  {label}
                </AppTabsTrigger>
              ))}
            </AppTabsList>
          </AppTabs>

          {items.length === 0 ? (
            <KvTypography variant="caption" tone="muted" as="p" className="py-2">
              برای این گروه گزارشی تعریف نشده است.
            </KvTypography>
          ) : (
            <ul
              aria-label="دسترسی گزارش‌ها به تفکیک نقش"
              className="grid min-h-0 flex-1 list-none content-start divide-y divide-kv-border-muted overflow-y-auto [scrollbar-width:thin]"
            >
              {items.map((item) => (
                <RoleRow key={item.roleId} item={item} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
