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
import { toPersianDigits } from '@/utils/persianDigits';

import type { ReportColumnDef, ReportRow } from '../catalog/types';

type ReportsTableProps = {
  columns: ReportColumnDef[];
  rows: ReportRow[];
  isLoading: boolean;
  resetKey: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function ReportsTable({
  columns,
  rows,
  isLoading,
  resetKey,
  hasActiveFilters,
  onClearFilters,
}: ReportsTableProps) {
  const bodyPhase = getAdminTableBodyPhase(isLoading, rows.length);
  const colSpan = columns.length + 1;

  return (
    <div className="hidden space-y-kv-group lg:block">
      <div className="flex items-center justify-between gap-kv-pair text-xs font-bold text-kv-text-muted">
        <span>{toPersianDigits(rows.length)} ردیف</span>
      </div>
      <KvTableViewport resetKey={resetKey} isBusy={isLoading}>
        <KvTable scrollable={false}>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead />
              {columns.map((col) => (
                <KvTableHead key={col.key}>{col.label}</KvTableHead>
              ))}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {bodyPhase === 'busy' ? (
              <KvTableBusy colSpan={colSpan} />
            ) : bodyPhase === 'empty' ? (
              <KvTableEmpty colSpan={colSpan}>
                <KvEmptyState
                  title={
                    hasActiveFilters
                      ? 'با فیلترهای فعلی نتیجه‌ای نیست'
                      : 'داده‌ای برای این گزارش نیست'
                  }
                  description={
                    hasActiveFilters
                      ? 'فیلترها را پاک کنید یا بازه را تغییر دهید.'
                      : undefined
                  }
                  actions={
                    hasActiveFilters ? (
                      <KvButton
                        type="button"
                        appearance="secondary"
                        size="sm"
                        onClick={onClearFilters}
                      >
                        پاک‌سازی فیلترها
                      </KvButton>
                    ) : undefined
                  }
                />
              </KvTableEmpty>
            ) : (
              rows.map((row, index) => (
                <KvTableRow key={`${resetKey}-${index}`}>
                  <KvTableRowIndexCell index={index} />
                  {columns.map((col) => (
                    <KvTableCell key={col.key}>
                      <span
                        className="text-sm font-bold text-kv-text"
                        dangerouslySetInnerHTML={{
                          __html: row[col.key] ?? '—',
                        }}
                      />
                    </KvTableCell>
                  ))}
                </KvTableRow>
              ))
            )}
          </KvTableBody>
        </KvTable>
      </KvTableViewport>
    </div>
  );
}
