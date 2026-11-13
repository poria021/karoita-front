'use client';

import { cn } from '@/lib/utils';
import type { ReportCompareItem } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareItemCardsProps = {
  items: ReportCompareItem[];
  metrics: string[];
  metricTitles: Record<string, string>;
  /** رنگ هر مورد — همان سری‌های جدول و نمودار. */
  series: string[];
  className?: string;
};

/**
 * نمای کارتی مقایسه برای تبلت و موبایل: یک کارت برای هر مورد
 * (به‌جای جدول افقیِ شاخص × مورد که روی عرض کم اسکرول می‌خورد).
 */
export function ReportCompareItemCards({
  items,
  metrics,
  metricTitles,
  series,
  className,
}: ReportCompareItemCardsProps) {
  /** بهترین مقدار هر شاخص؛ فقط اگر یکتا باشد سبز می‌شود (مثل جدول). */
  const best = new Map<string, { value: number; unique: boolean }>();
  metrics.forEach((key) => {
    const values = items.map((item) => item.metrics[key] ?? 0);
    const top = Math.max(...values);
    best.set(key, {
      value: top,
      unique: values.filter((v) => v === top).length === 1,
    });
  });

  return (
    <ul
      role="list"
      aria-label="جزئیات موارد مقایسه‌شده"
      className={cn('grid gap-kv-inline sm:grid-cols-2', className)}
    >
      {items.map((item, i) => {
        const color = series[i % series.length];
        return (
          <li key={item.id} className="min-w-0">
            <article className="flex h-full flex-col gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface p-kv-compact sm:p-kv-group">
              <header className="flex items-start gap-kv-pair">
                <i
                  className="mt-1.5 inline-block size-2.5 shrink-0 rounded-sm"
                  style={{ background: color }}
                  aria-hidden
                />
                <div className="min-w-0">
                  <h3 className="text-sm leading-6 font-extrabold text-kv-text">
                    {item.name}
                  </h3>
                  {item.subtitle ? (
                    <p className="text-xs text-kv-text-faint">
                      {item.subtitle}
                    </p>
                  ) : null}
                </div>
              </header>

              {metrics.length > 0 ? (
                <div className="grid gap-kv-inline border-t border-kv-border-muted pt-kv-inline">
                  {metrics.map((key) => {
                    const v = item.metrics[key] ?? 0;
                    const top = best.get(key);
                    const isBest = Boolean(top?.unique && v === top.value);
                    const pct = Math.min(100, Math.max(0, v));
                    const title = metricTitles[key] ?? key;
                    return (
                      <div key={key} className="flex flex-col gap-kv-field">
                        <div className="flex items-baseline justify-between gap-kv-pair">
                          <span className="min-w-0 text-[0.6875rem] font-bold text-kv-text-faint">
                            {title}
                          </span>
                          <span
                            className={cn(
                              'shrink-0 text-xs font-black tabular-nums',
                              isBest
                                ? 'text-kv-success-soft-fg'
                                : 'text-kv-text'
                            )}
                          >
                            {toPersianDigits(v)}٪
                          </span>
                        </div>
                        <div
                          role="progressbar"
                          aria-label={`${title} — ${item.name}`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={pct}
                          className="h-1.5 overflow-hidden rounded-full bg-kv-surface-muted"
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {item.info.length > 0 ? (
                <dl className="grid grid-cols-2 gap-x-kv-group gap-y-kv-inline border-t border-kv-border-muted pt-kv-inline">
                  {item.info.map((entry) => (
                    <div
                      key={entry.label}
                      className="flex min-w-0 flex-col gap-kv-micro"
                    >
                      <dt className="text-[0.6875rem] font-bold text-kv-text-faint">
                        {entry.label}
                      </dt>
                      <dd className="min-w-0 text-xs font-semibold break-words text-kv-text-secondary">
                        {entry.value || '—'}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </article>
          </li>
        );
      })}
    </ul>
  );
}
