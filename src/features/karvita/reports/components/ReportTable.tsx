'use client';

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

type ReportTableProps = {
  page: AdminReportPageModel;
};

/** جدول گزارش — همان الگوی `KvTable` / `KvTableViewport` بقیهٔ پنل‌ها. */
export function ReportTable({ page }: ReportTableProps) {
  const colSpan =
    page.columns.length + 1 + (page.canCompare ? 1 : 0);
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
              {page.canCompare ? (
                <KvTableHead className="w-12">
                  <span className="sr-only">انتخاب مقایسه</span>
                </KvTableHead>
              ) : null}
              {page.columns.map((col) => (
                <KvTableHead key={col.id}>{col.title}</KvTableHead>
              ))}
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
                  <KvTableRow key={row.id}>
                    <KvTableRowIndexCell index={index} />
                    {page.canCompare ? (
                      <KvTableCell>
                        <Checkbox
                          checked={selected}
                          disabled={full}
                          onCheckedChange={() =>
                            page.toggleCompareSelect(row.id)
                          }
                          aria-label={`انتخاب ${row.name ?? row.id} برای مقایسه`}
                        />
                      </KvTableCell>
                    ) : null}
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
