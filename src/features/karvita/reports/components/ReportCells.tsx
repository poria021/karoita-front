'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { Badge } from '@/components/ui/badge';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import type { ReportColumnDef, ReportRow } from '@/types/reports';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

/** رندر مشترک سلول‌های گزارش — هم جدول دسکتاپ هم کارت‌های موبایل/تبلت. */

export function PercentCell({ value }: { value: number }) {
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

export function StatusBadge({ status }: { status: string }) {
  if (status === 'pass') return <Badge variant="success">قبول</Badge>;
  if (status === 'fail') return <Badge variant="danger">مردود</Badge>;
  return <Badge variant="default">ثبت‌نشده</Badge>;
}

export function cellContent(
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
