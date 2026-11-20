'use client';

import Link from 'next/link';
import { useMemo, useState, type CSSProperties } from 'react';

import {
  AppTabs,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import type { OrganizationalCapacityKind } from '@/types/organizational-capacities';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardCapacityStatus } from '../hooks/useDashboardCapacityStatus';
import type { CapacityFillTone } from '../lib/capacity-status';
import {
  buildCourseCapacityRows,
  type CourseCapacityRow,
} from '../lib/course-capacity-rows';
import { StatusDonut, type DonutSegment } from './StatusDonut';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchCourseCapacitiesBoxProps = {
  className?: string;
  style?: CSSProperties;
};

const TABS: readonly { id: OrganizationalCapacityKind; label: string }[] = [
  { id: 'internship', label: 'ترمی' },
  { id: 'apprenticeship', label: 'پودمانی' },
];

const TONE_COLOR: Record<CapacityFillTone, string> = {
  calm: 'var(--kv-brand)',
  watch: 'var(--kv-warning)',
  critical: 'var(--kv-danger)',
  open: 'var(--kv-brand)',
};

function segmentsFor(row: CourseCapacityRow): DonutSegment[] {
  const filled = row.total === null ? row.confirmed : Math.min(row.confirmed, row.total);
  const rest = row.total === null ? 0 : Math.max(0, row.total - filled);
  return [
    {
      id: 'filled',
      label: 'پر شده',
      value: filled,
      color: TONE_COLOR[row.tone],
    },
    {
      id: 'rest',
      label: 'خالی',
      value: rest,
      color: 'var(--kv-border-muted)',
    },
  ];
}

function capacityLabel(row: CourseCapacityRow): string {
  if (row.total === null) return 'ظرفیت انتخابی: نامحدود';
  const left = Math.max(0, row.total - row.confirmed);
  const free = left === 0 ? 'بدون ظرفیت خالی' : `${toPersianDigits(left)} ظرفیت خالی`;
  return `${free} · ظرفیت انتخابی ${toPersianDigits(row.total)}`;
}

function CourseRow({ row }: { row: CourseCapacityRow }) {
  const unlimited = row.total === null;
  const ratio = `${toPersianDigits(row.confirmed)}/${toPersianDigits(row.total ?? 0)}`;

  return (
    <li
      dir="rtl"
      className="flex min-w-0 items-center gap-kv-group py-2.5"
      aria-label={`${row.title}: ${unlimited ? 'نامحدود' : ratio}`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-start">
        <span
          title={row.title}
          className="truncate text-sm font-bold leading-tight text-kv-text"
        >
          {row.title}
        </span>
        <span className="truncate text-[11px] leading-tight text-kv-text-muted">
          {capacityLabel(row)}
        </span>
      </span>
      <StatusDonut
        compact
        segments={segmentsFor(row)}
        centerValue={toPersianDigits(row.confirmed)}
        centerLabel=""
      />
    </li>
  );
}

/**
 * باکس «ظرفیت دروس» میز کار استاد راهنما: برای هر درسِ ترم جاری، نمودار حلقه‌ای
 * (همان نمودار «وضعیت پرونده‌ها») نشان می‌دهد چند نفر از سقف ظرفیت پذیرش شده‌اند.
 */
export function WorkbenchCourseCapacitiesBox({
  className,
  style,
}: WorkbenchCourseCapacitiesBoxProps) {
  const desk = useDashboardCapacityStatus();
  const snapshots = desk.snapshots;
  const isLoading = desk.isLoading;
  const isError = desk.isError;
  const isForbidden = desk.isForbidden;
  const [tab, setTab] = useState<OrganizationalCapacityKind>('internship');
  const allRows = useMemo(
    () => buildCourseCapacityRows(snapshots),
    [snapshots]
  );
  const rows = useMemo(
    () => allRows.filter((row) => row.kind === tab),
    [allRows, tab]
  );
  const tabLabel = TABS.find((item) => item.id === tab)?.label ?? '';
  const isEmpty = !isLoading && (isError || allRows.length === 0);

  return (
    <section
      aria-labelledby="dashboard-course-capacities-title"
      style={style}
      className={cn(
        'relative flex h-full max-h-[24rem] min-h-[14rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-course-capacities-title"
            className="min-w-0 truncate"
          >
            ظرفیت دروس
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            پذیرش قطعی از سقف ظرفیت هر درس
          </KvTypography>
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.organizationalCapacities()} prefetch>
            تعیین ظرفیت
          </Link>
        </KvButton>
      </header>

      <AppTabs
        value={tab}
        onValueChange={(value) => setTab(value as OrganizationalCapacityKind)}
        className="shrink-0"
      >
        <AppTabsList aria-label="نوع درس">
          {TABS.map(({ id, label }) => (
            <AppTabsTrigger key={id} value={id}>
              {label}
            </AppTabsTrigger>
          ))}
        </AppTabsList>
      </AppTabs>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری ظرفیت دروس"
          className="min-h-[8rem] flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : rows.length === 0 ? (
        <KvEmptyState
          title={`هنوز ظرفیتی برای دروس ${tabLabel} اعلام نشده است.`}
          className="min-h-0 py-1"
        />
      ) : (
        <ul
          dir="ltr"
          aria-label="ظرفیت هر درس"
          className="grid min-h-0 flex-1 list-none grid-cols-1 content-start divide-y divide-kv-border-muted overflow-y-auto [scrollbar-width:thin]"
        >
          {rows.map((row) => (
            <CourseRow key={row.id} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}
