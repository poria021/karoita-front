'use client';

import { useMemo, useState } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import {
  KvTableRowIndexCell,
  KvTableRowIndexHead,
} from '@/components/shared/table/KvTableRowIndex';
import { ReportCompareItemCards } from '@/features/karvita/reports/components/ReportCompareItemCards';
import { cn } from '@/lib/utils';
import type { ReportCompareItem } from '@/types/reports';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareMatrixProps = {
  items: ReportCompareItem[];
  /** شاخص‌های قابل‌نمایش (بعد از انتخاب تب شاخص) به ترتیب گزارش. */
  metrics: string[];
  /** عنوان کامل هر شاخص. */
  metricTitles: Record<string, string>;
  /** عنوان ستون اول: نوع موضوع گزارش (مثلاً «دانشکده» یا «استان»). */
  entityLabel: string;
};

type SortState = { key: string; dir: 'asc' | 'desc' };

/** رنگ هر مورد (به ترتیب انتخاب)؛ برای هر مورد ثابت می‌ماند. */
function itemColor(index: number): string {
  return `var(--kv-chart-cat-${(index % 10) + 1})`;
}

function formatPct(value: number): string {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
  return `${toPersianDigits(rounded)}٪`;
}

function metricValue(item: ReportCompareItem, key: string): number | null {
  const value = item.metrics[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function clampPct(value: number): number {
  return Math.min(100, Math.max(0, value));
}

/** مقدار + نوار کوچک متناسب با مقدار (۰ تا ۱۰۰). */
function ValueBar({
  value,
  color,
  best,
}: {
  value: number | null;
  color: string;
  best: boolean;
}) {
  if (value === null) {
    return <span className="text-kv-text-faint">—</span>;
  }
  return (
    <div className="flex min-w-24 flex-col gap-1">
      <span
        className={cn(
          'font-black tabular-nums',
          best ? 'text-kv-success-soft-fg' : 'text-kv-text'
        )}
      >
        {formatPct(value)}
      </span>
      <span
        aria-hidden
        className="block h-1.5 w-full overflow-hidden rounded-full bg-kv-border-muted"
      >
        <span
          className="block h-full rounded-full"
          style={{
            width: `${clampPct(value)}%`,
            backgroundColor: color,
            opacity: best ? 1 : 0.7,
          }}
        />
      </span>
    </div>
  );
}

/**
 * مقایسهٔ حداکثر ۱۰ مورد: جدول رتبه‌بندی (مورد × شاخص) با نوار داده‌ای در هر سلول
 * و مرتب‌سازی با کلیک روی ستون. تب شاخص و نمودار بیرون از این کامپوننت‌اند.
 */
export function ReportCompareMatrix({
  items,
  metrics,
  metricTitles,
  entityLabel,
}: ReportCompareMatrixProps) {
  const [sort, setSort] = useState<SortState | null>(null);

  const sortKey = sort && metrics.includes(sort.key) ? sort.key : (metrics[0] ?? '');
  const sortDir = sort && sort.key === sortKey ? sort.dir : 'desc';

  /** ردیف‌ها بر اساس ستون انتخابی؛ پیش‌فرض بیشترین → کمترین روی اولین شاخص. */
  const ranked = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return items
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const x = metricValue(a.item, sortKey);
        const y = metricValue(b.item, sortKey);
        if (x === null && y === null) return a.index - b.index;
        if (x === null) return 1;
        if (y === null) return -1;
        return (x - y) * dir || a.index - b.index;
      });
  }, [items, sortDir, sortKey]);

  /** بهترین مقدار هر شاخص؛ فقط وقتی یکتا باشد هایلایت می‌شود. */
  const bestByMetric = useMemo(() => {
    const result = new Map<string, number | null>();
    for (const key of metrics) {
      const values = items
        .map((item) => metricValue(item, key))
        .filter((v): v is number => v !== null);
      if (values.length === 0) {
        result.set(key, null);
        continue;
      }
      const best = Math.max(...values);
      result.set(
        key,
        values.filter((v) => v === best).length === 1 ? best : null
      );
    }
    return result;
  }, [items, metrics]);

  if (items.length === 0 || metrics.length === 0) return null;

  const toggleSort = (key: string) => {
    setSort((prev) =>
      !prev || prev.key !== key
        ? { key, dir: 'desc' }
        : { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
    );
  };

  const infoColumns = items[0]?.info ?? [];

  return (
    <section
      aria-label="مقایسه موارد"
      className="flex min-w-0 flex-col gap-kv-group"
    >
      {/* تبلت و موبایل: کارت برای هر مورد؛ دسکتاپ: جدول رتبه‌بندی */}
      <ReportCompareItemCards
        className="lg:hidden"
        items={items}
        metrics={metrics}
        metricTitles={metricTitles}
      />

      <div className="hidden overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft lg:block">
        <KvTable>
          <KvTableHeader>
            <KvTableRow>
              <KvTableRowIndexHead className="border-b-kv-border" />
              <KvTableHead className="border-b-kv-border">
                {entityLabel}
              </KvTableHead>
              {infoColumns.map((col) => (
                <KvTableHead key={col.label} className="border-b-kv-border">
                  {col.label}
                </KvTableHead>
              ))}
              {metrics.map((key) => {
                const active = sortKey === key;
                return (
                  <KvTableHead
                    key={key}
                    className="border-b-kv-border"
                    aria-sort={
                      active
                        ? sortDir === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      aria-label={`مرتب‌سازی ${
                        active && sortDir === 'desc' ? 'صعودی' : 'نزولی'
                      } ${metricTitles[key] ?? key}`}
                      className={cn(
                        'inline-flex max-w-full items-center gap-1 rounded-kv-control text-start transition-colors',
                        'hover:text-kv-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring/30',
                        active ? 'text-kv-text' : 'text-kv-text-faint'
                      )}
                    >
                      <span>{metricTitles[key] ?? key}</span>
                      <FaIcon
                        icon={
                          active && sortDir === 'asc'
                            ? faIcons.chevronUp
                            : faIcons.chevronDown
                        }
                        size="2xs"
                        className={cn(
                          'shrink-0',
                          active ? 'opacity-100' : 'opacity-35'
                        )}
                      />
                    </button>
                  </KvTableHead>
                );
              })}
            </KvTableRow>
          </KvTableHeader>
          <KvTableBody>
            {ranked.map(({ item, index }, rowIndex) => (
              <KvTableRow key={item.id}>
                <KvTableRowIndexCell index={rowIndex} />
                <KvTableCell className="whitespace-nowrap font-bold">
                  {item.name}
                </KvTableCell>
                {infoColumns.map((col, infoIdx) => (
                  <KvTableCell key={col.label} className="text-kv-text-muted">
                    {item.info[infoIdx]?.value ?? '—'}
                  </KvTableCell>
                ))}
                {metrics.map((key) => {
                  const value = metricValue(item, key);
                  return (
                    <KvTableCell key={key}>
                      <ValueBar
                        value={value}
                        color={itemColor(index)}
                        best={value !== null && value === bestByMetric.get(key)}
                      />
                    </KvTableCell>
                  );
                })}
              </KvTableRow>
            ))}
          </KvTableBody>
        </KvTable>
      </div>
    </section>
  );
}
