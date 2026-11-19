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
      // کل پروژه ارقام فارسی نمایش می‌دهد؛ شماره تلفن هم مستثنی نیست.
      return (
        <bdi className="whitespace-nowrap">
          {toPersianDigits(String(row.phone ?? ''))}
        </bdi>
      );
    case 'two-line': {
      // فیلد ناموجود باید «—» نشان دهد، نه اسم خودِ ردیف (باگ: فالبک اشتباه به row.name).
      const rawPrimary = row[col.sortKey ?? col.id];
      const primary =
        rawPrimary != null && rawPrimary !== ''
          ? toPersianDigits(String(rawPrimary))
          : '—';
      let secondary = col.secondaryKey
        ? toPersianDigits(String(row[col.secondaryKey] ?? ''))
        : '';
      if (
        col.secondaryKey === 'regionName' &&
        row.cityName &&
        row.regionName
      ) {
        secondary = toPersianDigits(`${row.cityName}، ${row.regionName}`);
      }
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-kv-text">{primary}</span>
          {secondary ? (
            <span className="text-xs text-kv-text-faint">
              {col.secondaryKey === 'phone' ? (
                <bdi className="whitespace-nowrap tabular-nums">{secondary}</bdi>
              ) : (
                secondary
              )}
            </span>
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
    case 'score': {
      // averageScore ممکن است null باشد؛ آن‌وقت «—».
      const v = row[col.sortKey ?? col.id];
      return typeof v === 'number' ? (
        <span className="whitespace-nowrap tabular-nums">
          {toPersianDigits(Math.round(v * 100) / 100)}
        </span>
      ) : (
        '—'
      );
    }
    case 'status':
      return <StatusBadge status={String(row.status ?? 'none')} />;
    case 'courses': {
      const ids = row.courses ?? [];
      const firstName = ids[0];
      if (!firstName) return '—';
      // API حضور و غیاب فقط عنوان اولین درس و تعداد بقیه را می‌دهد.
      if (typeof row.courseExtraCount === 'number') {
        return (
          <div className="flex items-center gap-2">
            <span>{toPersianDigits(firstName)}</span>
            {row.courseExtraCount > 0 ? (
              <KvButton
                type="button"
                size="xs"
                appearance="secondary"
                color="cta"
                dir="ltr"
                aria-label={`نمایش همه‌ی درس‌های ${row.name ?? ''}`}
                onClick={() => page.openCourses(row.id)}
              >
                +{toPersianDigits(row.courseExtraCount)}
              </KvButton>
            ) : null}
          </div>
        );
      }
      if (ids.length < 2) return toPersianDigits(firstName);
      return (
        <div className="flex items-center gap-2">
          <span>{toPersianDigits(firstName)}</span>
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
          مشاهده نمرات
        </KvButton>
      );
    default: {
      const key = col.sortKey ?? col.id;
      if (key === 'school' && row.schoolName) {
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-bold">{toPersianDigits(row.schoolName)}</span>
            <span className="text-xs text-kv-text-faint">
              {toPersianDigits(`${row.cityName ?? ''}، ${row.regionName ?? ''}`)}
            </span>
          </div>
        );
      }
      // فیلد ناموجود باید «—» نشان دهد، نه اسم خودِ ردیف (باگ: فالبک اشتباه به row.name).
      const value = row[key];
      return value != null && value !== '' ? toPersianDigits(String(value)) : '—';
    }
  }
}
