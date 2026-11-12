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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import type { ReportColumnDef, ReportRow } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

type ReportTableProps = {
  page: AdminReportPageModel;
};

function PercentCell({ value }: { value: number }) {
  return (
    <div
      className="flex h-2 min-w-20 items-center gap-2"
      role="img"
      aria-label={`${toPersianDigits(value)} درصد`}
    >
      <span className="text-xs font-black tabular-nums text-kv-text">
        {toPersianDigits(value)}٪
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pass') return <Badge variant="success">قبول</Badge>;
  if (status === 'fail') return <Badge variant="danger">مردود</Badge>;
  return <Badge variant="default">ثبت‌نشده</Badge>;
}

function cellContent(
  col: ReportColumnDef,
  row: ReportRow,
  page: AdminReportPageModel
) {
  switch (col.kind) {
    case 'phone':
      return <bdi className="whitespace-nowrap">{String(row.phone ?? '')}</bdi>;
    case 'two-line': {
      const primary = String(row[col.sortKey ?? col.id] ?? row.name ?? '');
      let secondary = col.secondaryKey
        ? String(row[col.secondaryKey] ?? '')
        : '';
      if (
        col.secondaryKey === 'regionName' &&
        row.cityName &&
        row.regionName
      ) {
        secondary = `${row.cityName}، ${row.regionName}`;
      }
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-kv-text">{primary}</span>
          {secondary ? (
            <span className="text-xs text-kv-text-faint">{secondary}</span>
          ) : null}
        </div>
      );
    }
    case 'percent': {
      const v = row[col.sortKey ?? col.id];
      return typeof v === 'number' ? <PercentCell value={v} /> : '—';
    }
    case 'count': {
      const v = row[col.sortKey ?? col.id];
      return (
        <span className="whitespace-nowrap tabular-nums">
          {toPersianDigits(typeof v === 'number' ? v : 0)}
        </span>
      );
    }
    case 'status':
      return <StatusBadge status={String(row.status ?? 'none')} />;
    case 'courses': {
      const ids = row.courses ?? [];
      const firstName = ids[0] ? page.courseLabels[ids[0]] : undefined;
      if (!firstName) return '—';
      if (ids.length < 2) return firstName;
      return (
        <div className="flex items-center gap-2">
          <span>{firstName}</span>
          <KvButton
            type="button"
            size="xs"
            appearance="secondary"
            color="cta"
            dir="ltr"
            aria-label={`نمایش همه‌ی درس‌های ${row.name ?? ''}`}
            onClick={() => page.openCourses(row.id)}
          >
            +{toPersianDigits(ids.length - 1)}
          </KvButton>
        </div>
      );
    }
    case 'scores-action':
      return (
        <KvButton
          type="button"
          size="sm"
          appearance="secondary"
          color="neutral"
          icon={<FaIcon icon={faIcons.eye} size="sm" />}
          onClick={() => page.openScores(row.id)}
        >
          مشاهده ریز نمرات
        </KvButton>
      );
    default: {
      const key = col.sortKey ?? col.id;
      if (key === 'school' && row.schoolName) {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">{row.schoolName}</span>
            <span className="text-xs text-kv-text-faint">
              {row.cityName}، {row.regionName}
            </span>
          </div>
        );
      }
      return String(row[key] ?? row.name ?? '—');
    }
  }
}

export function ReportTable({ page }: ReportTableProps) {
  const colSpan = page.columns.length + (page.canCompare ? 1 : 0);
  const bodyPhase = getAdminTableBodyPhase(page.isLoading, page.rows.length);

  return (
    <div className="overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft">
      <KvTable>
        <KvTableHeader>
          <KvTableRow>
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
            page.rows.map((row) => {
              const selected = page.compareSelected.includes(row.id);
              const full =
                page.compareSelected.length >= page.compareMax && !selected;
              return (
                <KvTableRow key={row.id}>
                  {page.canCompare ? (
                    <KvTableCell>
                      <Checkbox
                        checked={selected}
                        disabled={full}
                        onCheckedChange={() => page.toggleCompareSelect(row.id)}
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
    </div>
  );
}
