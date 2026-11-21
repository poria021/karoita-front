'use client';

import { cn } from '@/lib/utils';
import type { ReportCompareItem } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareItemCardsProps = {
  items: ReportCompareItem[];
  metrics: string[];
  metricTitles: Record<string, string>;
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
  className,
}: ReportCompareItemCardsProps) {
  /** بهترین مقدار هر شاخص؛ صفر = ثبت‌نشده و در رقابت نیست. */
  const best = new Map<string, { value: number; unique: boolean }>();
  metrics.forEach((key) => {
    const values = items
      .map((item) => item.metrics[key])
      .filter(
        (v): v is number =>
          typeof v === 'number' && Number.isFinite(v) && v !== 0
      );
    if (values.length === 0) return;
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
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <article className="flex h-full flex-col gap-kv-inline rounded-kv-panel border border-kv-border bg-kv-surface p-kv-compact sm:p-kv-group">
            <header className="min-w-0">
              <h3 className="text-sm leading-6 font-extrabold text-kv-text">
                {item.name}
              </h3>
              {item.subtitle ? (
                <p className="text-xs text-kv-text-faint">{item.subtitle}</p>
              ) : null}
            </header>

            {metrics.length > 0 ? (
              <div className="grid gap-kv-inline border-t border-kv-border-muted pt-kv-inline">
                {metrics.map((key) => {
                  const raw = item.metrics[key];
                  const v =
                    typeof raw === 'number' &&
                    Number.isFinite(raw) &&
                    raw !== 0
                      ? raw
                      : null;
                  const top = best.get(key);
                  const isBest = Boolean(
                    v !== null && top?.unique && v === top.value
                  );
                  const title = metricTitles[key] ?? key;
                  if (v === null) {
                    return (
                      <div key={key} className="flex flex-col gap-kv-field">
                        <div className="flex items-baseline justify-between gap-kv-pair">
                          <span className="min-w-0 text-[0.6875rem] font-bold text-kv-text-faint">
                            {title}
                          </span>
                          <span className="shrink-0 text-xs font-black text-kv-text-faint">
                            —
                          </span>
                        </div>
                      </div>
                    );
                  }
                  const pct = Math.min(100, Math.max(0, v));
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
                          className="h-full rounded-full bg-kv-brand"
                          style={{ width: `${pct}%` }}
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
      ))}
    </ul>
  );
}
