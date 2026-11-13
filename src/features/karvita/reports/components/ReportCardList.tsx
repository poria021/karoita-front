'use client';

import { useId, useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvMobileListShell } from '@/components/shared/table/KvMobileListShell';
import { Checkbox } from '@/components/ui/checkbox';
import {
  cellContent,
  StatusBadge,
} from '@/features/karvita/reports/components/ReportCells';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import type { ReportColumnDef, ReportRow } from '@/types/reports';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCardListProps = {
  page: AdminReportPageModel;
};

type CardLayout = {
  titleCol: ReportColumnDef | undefined;
  statusCol: ReportColumnDef | undefined;
  /** فیلدهای مهم که همیشه روی کارت دیده می‌شوند. */
  primaryCols: ReportColumnDef[];
  /** بقیهٔ فیلدها که پشت «جزئیات بیشتر» جمع می‌شوند. */
  secondaryCols: ReportColumnDef[];
  metricCols: ReportColumnDef[];
  hasScoresAction: boolean;
};

/** تعداد فیلدهای اطلاعاتی که بدون باز کردن کارت دیده می‌شوند. */
const PRIMARY_FIELD_COUNT = 2;

/**
 * ستون اول همیشه «نام» است و عنوان کارت می‌شود. بقیه بر اساس نوع به این
 * گروه‌ها تقسیم می‌شوند: وضعیت (کنار عنوان)، شاخص‌های درصدی (همیشه دیده
 * می‌شوند)، فیلدهای اطلاعاتی (دو تای اول همیشه دیده می‌شوند، بقیه تاشو) و
 * دکمهٔ ریز نمرات.
 */
function splitColumns(columns: ReportColumnDef[]): CardLayout {
  const [titleCol, ...rest] = columns;
  const fieldCols = rest.filter(
    (c) =>
      c.kind !== 'status' && c.kind !== 'percent' && c.kind !== 'scores-action'
  );
  return {
    titleCol,
    statusCol: rest.find((c) => c.kind === 'status'),
    metricCols: rest.filter((c) => c.kind === 'percent'),
    primaryCols: fieldCols.slice(0, PRIMARY_FIELD_COUNT),
    secondaryCols: fieldCols.slice(PRIMARY_FIELD_COUNT),
    hasScoresAction: rest.some((c) => c.kind === 'scores-action'),
  };
}

/** فیلدهای بلند (دروس، مدرسه، متن طولانی) کل عرض کارت را می‌گیرند. */
function isWideField(col: ReportColumnDef, row: ReportRow): boolean {
  if (col.kind === 'courses' || col.kind === 'two-line') return true;
  if (col.kind !== 'text') return false;
  const v = row[col.sortKey ?? col.id];
  return typeof v === 'string' && v.length > 22;
}

function MetricRow({ title, value }: { title: string; value: number | null }) {
  const pct = value === null ? 0 : Math.min(100, Math.max(0, value));
  return (
    <div className="flex flex-col gap-kv-field">
      <div className="flex items-baseline justify-between gap-kv-pair">
        <span className="min-w-0 text-[0.6875rem] font-bold text-kv-text-faint">
          {title}
        </span>
        <span className="shrink-0 text-xs font-black tabular-nums text-kv-text">
          {value === null ? '—' : `${toPersianDigits(value)}٪`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={title}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value === null ? undefined : pct}
        className="h-1.5 overflow-hidden rounded-full bg-kv-surface-muted"
      >
        <div
          className="h-full rounded-full bg-kv-brand transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

type FieldGridProps = {
  page: AdminReportPageModel;
  row: ReportRow;
  cols: ReportColumnDef[];
  id?: string;
};

/** شبکهٔ برچسب/مقدار (dt/dd) مشترک بین بخش اصلی و بخش تاشو. */
function FieldGrid({ page, row, cols, id }: FieldGridProps) {
  return (
    <dl
      id={id}
      className="grid grid-cols-2 gap-x-kv-group gap-y-kv-inline border-t border-kv-border-muted pt-kv-inline"
    >
      {cols.map((col) => (
        <div
          key={col.id}
          className={
            isWideField(col, row)
              ? 'col-span-2 flex min-w-0 flex-col gap-kv-micro'
              : 'flex min-w-0 flex-col gap-kv-micro'
          }
        >
          <dt className="text-[0.6875rem] font-bold text-kv-text-faint">
            {col.title}
          </dt>
          <dd className="min-w-0 text-xs font-semibold break-words text-kv-text-secondary">
            {cellContent(col, row, page)}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type ReportCardProps = {
  page: AdminReportPageModel;
  layout: CardLayout;
  row: ReportRow;
  index: number;
};

function ReportCard({ page, layout, row, index }: ReportCardProps) {
  const {
    titleCol,
    statusCol,
    primaryCols,
    secondaryCols,
    metricCols,
    hasScoresAction,
  } = layout;
  const [expanded, setExpanded] = useState(false);
  const detailsId = useId();
  if (!titleCol) return null;

  const selected = page.compareSelected.includes(row.id);
  const full = page.compareSelected.length >= page.compareMax && !selected;

  return (
    <article
      data-selected={selected || undefined}
      className="flex h-full flex-col gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface p-kv-compact transition-colors duration-150 data-[selected]:border-kv-brand-border data-[selected]:bg-kv-brand-soft sm:p-kv-group"
    >
      <header className="flex items-start gap-kv-inline">
        {page.canCompare ? (
          <label className="-m-2 flex shrink-0 cursor-pointer items-center p-2 has-[button:disabled]:cursor-not-allowed">
            <Checkbox
              checked={selected}
              disabled={full}
              onCheckedChange={() => page.toggleCompareSelect(row.id)}
              aria-label={`انتخاب ${row.name ?? row.id} برای مقایسه`}
            />
          </label>
        ) : null}

        <div className="min-w-0 flex-1 text-sm leading-6 font-extrabold text-kv-text">
          {cellContent(titleCol, row, page)}
        </div>

        <div className="flex shrink-0 items-center gap-kv-pair">
          {statusCol ? (
            <StatusBadge status={String(row.status ?? 'none')} />
          ) : null}
          <span
            className="inline-flex size-6 items-center justify-center rounded-full bg-kv-surface-subtle text-[0.6875rem] font-bold tabular-nums text-kv-text-faint"
            aria-hidden
          >
            {toPersianDigits(index + 1)}
          </span>
        </div>
      </header>

      {primaryCols.length > 0 ? (
        <FieldGrid page={page} row={row} cols={primaryCols} />
      ) : null}

      {metricCols.length > 0 ? (
        <div className="grid gap-kv-inline border-t border-kv-border-muted pt-kv-inline">
          {metricCols.map((col) => {
            const v = row[col.sortKey ?? col.id];
            return (
              <MetricRow
                key={col.id}
                title={col.title}
                value={typeof v === 'number' ? v : null}
              />
            );
          })}
        </div>
      ) : null}

      {secondaryCols.length > 0 ? (
        <>
          {expanded ? (
            <FieldGrid
              id={detailsId}
              page={page}
              row={row}
              cols={secondaryCols}
            />
          ) : null}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={expanded ? detailsId : undefined}
            onClick={() => setExpanded((v) => !v)}
            className="-mx-1 flex min-h-11 items-center justify-center gap-kv-pair rounded-kv-control border-t border-kv-border-muted px-kv-inline pt-kv-inline text-xs font-bold text-kv-brand outline-none transition-colors hover:text-kv-brand-hover focus-visible:ring-2 focus-visible:ring-kv-brand/40"
          >
            <span>
              {expanded
                ? 'جزئیات کمتر'
                : `جزئیات بیشتر (${toPersianDigits(secondaryCols.length)})`}
            </span>
            <FaIcon
              icon={expanded ? faIcons.chevronUp : faIcons.chevronDown}
              size="sm"
            />
          </button>
        </>
      ) : null}

      {hasScoresAction ? (
        <KvButton
          type="button"
          size="sm"
          appearance="secondary"
          color="neutral"
          fullWidth
          className="max-sm:min-h-11"
          icon={<FaIcon icon={faIcons.eye} size="sm" />}
          onClick={() => page.openScores(row.id)}
        >
          مشاهده ریز نمرات
        </KvButton>
      ) : null}
    </article>
  );
}

/**
 * نمای کارتی گزارش فقط برای موبایل (زیر `md`).
 * تبلت و دسکتاپ همان `ReportTable` می‌مانند؛ داده و رندر سلول‌ها مشترک است.
 * هر کارت: عنوان + وضعیت، دو فیلد مهم، شاخص‌های درصدی، و بقیهٔ فیلدها پشت
 * «جزئیات بیشتر» تا کارت‌ها کوتاه بمانند و اسکن عمودی لیست راحت باشد.
 */
export function ReportCardList({ page }: ReportCardListProps) {
  const layout = useMemo(() => splitColumns(page.columns), [page.columns]);
  const hasRows = page.rows.length > 0;

  return (
    <KvMobileListShell
      isLoading={page.isLoading}
      isEmpty={!hasRows}
      hasItems={hasRows}
      emptyTitle="نتیجه‌ای پیدا نشد"
      emptyDescription="با این جستجو و فیلترها ردیفی وجود ندارد. فیلترها را کم کنید یا عبارت دیگری جستجو کنید."
      emptyActions={
        <KvButton
          type="button"
          appearance="secondary"
          onClick={page.clearFilters}
        >
          پاک کردن فیلترها
        </KvButton>
      }
    >
      {hasRows ? (
        <p className="px-kv-micro text-xs font-bold text-kv-text-faint">
          {toPersianDigits(page.total)} مورد
        </p>
      ) : null}
      <ul
        role="list"
        className="grid gap-kv-inline sm:grid-cols-2"
        aria-busy={page.isLoading || undefined}
      >
        {page.rows.map((row, index) => (
          <li
            key={row.id}
            className="min-w-0 [contain-intrinsic-size:auto_14rem] [content-visibility:auto]"
          >
            <ReportCard page={page} layout={layout} row={row} index={index} />
          </li>
        ))}
      </ul>
    </KvMobileListShell>
  );
}
