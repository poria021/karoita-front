'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { getAdminTableBodyPhase } from '@/components/shared/table/adminTableBodyPhase';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { KvTableBusy } from '@/components/shared/table/KvTableBusy';
import { KvTableEmpty } from '@/components/shared/table/KvTableEmpty';
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { KvTableViewport } from '@/components/shared/table/KvTableViewport';
import { Checkbox } from '@/components/ui/checkbox';
import { cellContent } from '@/features/karvita/reports/components/ReportCells';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { isPerformanceReportSlug } from '@/services/reports/real/performance-report.mappers';
import { cn } from '@/lib/utils';
import type { ReportColumnDef } from '@/types/reports';
import { faIcons } from '@/utils/iconMap';

type ReportTableProps = {
  page: AdminReportPageModel;
};

function isColumnSortable(
  slug: AdminReportPageModel['slug'],
  col: ReportColumnDef
): boolean {
  return (
    isPerformanceReportSlug(slug) &&
    !col.nosort &&
    Boolean(col.sortKey ?? col.id)
  );
}

/** جدول گزارش — همان الگوی `KvTable` / `KvTableViewport` بقیهٔ پنل‌ها. */
export function ReportTable({ page }: ReportTableProps) {
  /** در حالت انتخاب (بعد از زدن دکمهٔ «مقایسه») چک‌باکس جای شمارهٔ ردیف در ستون اول می‌نشیند. */
  const showSelect = page.canCompare && page.compareSelecting;
  const colSpan = page.columns.length + 1;
  const bodyPhase = getAdminTableBodyPhase(page.isLoading, page.rows.length);
  const resetKey = `${page.slug}:${page.period.mode}:${page.period.termId}:${page.period.moduleId}`;

  return (
    <div className="overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft">
      <KvTableViewport
        framed={false}
        resetKey={resetKey}
        hasMore={false}
        isBusy={page.isLoading}
      >
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead />
              {page.columns.map((col) => {
                const sortable = isColumnSortable(page.slug, col);
                const active = page.sort?.id === col.id;
                const dir = active ? page.sort?.dir : undefined;
                const sortLabel = !sortable
                  ? undefined
                  : !active
                    ? `مرتب‌سازی نزولی ${col.title}`
                    : dir === 'desc'
                      ? `مرتب‌سازی صعودی ${col.title}`
                      : `مرتب‌سازی نزولی ${col.title}`;

                return (
                  <KvTableHead
                    key={col.id}
                    aria-sort={
                      !sortable
                        ? undefined
                        : dir === 'asc'
                          ? 'ascending'
                          : dir === 'desc'
                            ? 'descending'
                            : 'none'
                    }
                  >
                    {sortable ? (
                      <button
                        type="button"
                        className={cn(
                          'inline-flex max-w-full items-center gap-1 rounded-kv-control text-start transition-colors',
                          'hover:text-kv-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30',
                          active ? 'text-kv-text' : 'text-kv-text-faint'
                        )}
                        aria-label={sortLabel}
                        onClick={() => page.toggleSort(col.id)}
                      >
                        <span className="truncate">{col.title}</span>
                        <FaIcon
                          icon={
                            dir === 'asc'
                              ? faIcons.chevronUp
                              : dir === 'desc'
                                ? faIcons.chevronDown
                                : faIcons.chevronDown
                          }
                          size="2xs"
                          className={cn(
                            'shrink-0',
                            active ? 'opacity-100' : 'opacity-35'
                          )}
                        />
                      </button>
                    ) : (
                      col.title
                    )}
                  </KvTableHead>
                );
              })}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={colSpan} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={colSpan}>
                <KvEmptyState
                  title="نتیجه‌ای پیدا نشد"
                  description="با این جستجو و فیلترها ردیفی وجود ندارد. فیلترها را کم کنید یا عبارت دیگری جستجو کنید."
                  actions={
                    <KvButton
                      type="button"
                      appearance="secondary"
                      onClick={page.clearFilters}
                    >
                      پاک کردن فیلترها
                    </KvButton>
                  }
                />
              </KvTableEmpty>
            ) : (
              page.rows.map((row, index) => {
                const selected = page.compareSelected.includes(row.id);
                const full =
                  page.compareSelected.length >= page.compareMax && !selected;
                return (
                  <KvTableRow
                    key={row.id}
                    selected={showSelect && selected}
                    className={showSelect ? 'cursor-pointer' : undefined}
                    onClick={
                      showSelect
                        ? (event) => {
                            // کلیک روی خود چک‌باکس/دکمه/لینک داخل ردیف، کار خودش را می‌کند.
                            if (
                              (event.target as HTMLElement).closest(
                                'button, a, input, label, [role="checkbox"]'
                              )
                            ) {
                              return;
                            }
                            if (full) return;
                            page.toggleCompareSelect(row.id);
                          }
                        : undefined
                    }
                  >
                    {showSelect ? (
                      <KvTableCell
                        align="center"
                        className="w-14 min-w-14 max-w-14"
                      >
                        <Checkbox
                          checked={selected}
                          disabled={full}
                          onCheckedChange={() =>
                            page.toggleCompareSelect(row.id)
                          }
                          aria-label={`انتخاب ${row.name ?? row.id} برای مقایسه`}
                        />
                      </KvTableCell>
                    ) : (
                      <KvTableRowIndexCell index={index} />
                    )}
                    {page.columns.map((col) => (
                      <KvTableCell key={col.id}>
                        {cellContent(col, row, page)}
                      </KvTableCell>
                    ))}
                  </KvTableRow>
                );
              })
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
