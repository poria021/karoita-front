'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  useDashboardTermOfferings,
  type DashboardTermOfferingsRow,
} from '../hooks/useDashboardTermOfferings';
import { currentTermStatus } from '../lib/current-terms';
import { STATUS_CLASS, STATUS_LABEL } from './WorkbenchTermTile';
import { WorkbenchUnavailableNote } from './WorkbenchUnavailableNote';

export type WorkbenchTermOfferingsBoxProps = {
  className?: string;
  style?: CSSProperties;
};

function OfferingsMeter({ offered, total }: { offered: number; total: number }) {
  const width = total > 0 ? Math.min(100, (offered / total) * 100) : 0;
  return (
    <div className="flex items-center gap-kv-pair">
      <span
        aria-hidden
        className="block h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-kv-border-muted"
      >
        <span
          className="block h-full rounded-full"
          style={{ width: `${width}%`, backgroundColor: 'var(--kv-success)' }}
        />
      </span>
      <span className="shrink-0 text-[11px] font-medium text-kv-text-muted">
        {toPersianDigits(offered)} از {toPersianDigits(total)} درس ارائه شده
      </span>
    </div>
  );
}

function TermRow({ row }: { row: DashboardTermOfferingsRow }) {
  const { view } = row;
  const status = currentTermStatus(view);

  return (
    <li className="flex flex-col gap-1.5 py-3">
      <div className="flex items-center justify-between gap-kv-pair">
        <span className="text-[11px] font-medium text-kv-text-muted">
          {view.kindLabel}
        </span>
        {status !== 'unknown' ? (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-px text-[0.625rem] font-bold',
              STATUS_CLASS[status]
            )}
          >
            {STATUS_LABEL[status]}
          </span>
        ) : null}
      </div>
      <p
        title={view.title ?? undefined}
        className={cn(
          'truncate text-sm font-bold leading-tight',
          view.title ? 'text-kv-text' : 'text-kv-text-faint'
        )}
      >
        {view.title ?? 'نیم‌سال فعالی ندارد'}
      </p>
      {row.offered !== null && row.total !== null ? (
        <OfferingsMeter offered={row.offered} total={row.total} />
      ) : null}
    </li>
  );
}

/**
 * باکس «ترم و ارائهٔ دروس» میز کار ادمین: نیم‌سال جاریِ ترمی و پودمان با وضعیت
 * گیت‌ها و تعداد ارائه‌های فعال هر کدام. داده از همان سرویس‌های سرفصل/ترم.
 */
export function WorkbenchTermOfferingsBox({
  className,
  style,
}: WorkbenchTermOfferingsBoxProps) {
  const { isLoading, isError, isForbidden, rows } = useDashboardTermOfferings();
  const isEmpty = isError || (!isLoading && rows.length === 0);

  return (
    <section
      aria-labelledby="dashboard-term-offerings-title"
      style={style}
      className={cn(
        'relative flex h-full min-h-[14rem] min-w-0 flex-col gap-kv-pair overflow-hidden rounded-kv-shell border px-kv-group py-kv-group',
        workbenchBoxToneClass(isEmpty),
        className
      )}
    >
      <header className="flex shrink-0 items-center gap-kv-inline">
        <div className="flex min-w-0 flex-1 flex-col">
          <KvTypography
            variant="subtitle"
            as="h3"
            id="dashboard-term-offerings-title"
            className="min-w-0 truncate"
          >
            ترم و ارائهٔ دروس
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            نیم‌سال جاری و درس‌های ارائه‌شده
          </KvTypography>
        </div>
        <KvButton
          asChild
          color="cta"
          appearance="text"
          size="xs"
          className="shrink-0 text-[11px] font-bold"
        >
          <Link href={RouteService.karvita.syllabusTermSettings()} prefetch>
            تنظیمات ترم
          </Link>
        </KvButton>
      </header>

      {isError ? (
        <WorkbenchUnavailableNote forbidden={isForbidden} />
      ) : isLoading ? (
        <div
          role="status"
          aria-label="در حال بارگذاری ترم و ارائهٔ دروس"
          className="min-h-0 flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : rows.length === 0 ? (
        <KvEmptyState
          title="فعلاً نیم‌سالی ثبت نشده است."
          className="min-h-0 py-1"
        />
      ) : (
        <ul
          aria-label="نیم‌سال‌های جاری"
          className="grid min-h-0 flex-1 list-none grid-cols-1 content-start divide-y divide-kv-border-muted"
        >
          {rows.map((row) => (
            <TermRow key={row.view.kind} row={row} />
          ))}
        </ul>
      )}
    </section>
  );
}
