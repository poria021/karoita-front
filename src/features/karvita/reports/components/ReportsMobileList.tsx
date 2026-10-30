'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { toPersianDigits } from '@/utils/persianDigits';

import type { ReportColumnDef, ReportRow } from '../catalog/types';

type ReportsMobileListProps = {
  columns: ReportColumnDef[];
  rows: ReportRow[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function ReportsMobileList({
  columns,
  rows,
  isLoading,
  hasActiveFilters,
  onClearFilters,
}: ReportsMobileListProps) {
  if (isLoading) {
    return (
      <div className="space-y-kv-pair lg:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-kv-panel border border-kv-border bg-kv-surface-muted"
          />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="lg:hidden">
        <KvEmptyState
          title={
            hasActiveFilters
              ? 'با فیلترهای فعلی نتیجه‌ای نیست'
              : 'داده‌ای برای این گزارش نیست'
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
      </div>
    );
  }

  const primary = columns[0];
  const rest = columns.slice(1, 5);

  return (
    <div className="space-y-kv-pair lg:hidden">
      <KvTypography variant="caption" tone="muted" as="p">
        {toPersianDigits(rows.length)} ردیف
      </KvTypography>
      {rows.map((row, index) => (
        <article
          key={index}
          className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised"
        >
          {primary ? (
            <div
              className="text-sm font-black text-kv-text"
              dangerouslySetInnerHTML={{ __html: row[primary.key] ?? '—' }}
            />
          ) : null}
          <dl className="mt-kv-pair grid gap-kv-micro">
            {rest.map((col) => (
              <div
                key={col.key}
                className="flex items-start justify-between gap-kv-pair text-xs"
              >
                <dt className="font-bold text-kv-text-muted">{col.label}</dt>
                <dd
                  className="text-end font-black text-kv-text"
                  dangerouslySetInnerHTML={{ __html: row[col.key] ?? '—' }}
                />
              </div>
            ))}
          </dl>
        </article>
      ))}
    </div>
  );
}
