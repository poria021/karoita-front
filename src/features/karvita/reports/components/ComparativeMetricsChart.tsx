'use client';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

import type { CompareMetricDef } from '../catalog/compareSpecs';
import type { CompareEntitySeries } from '../lib/compareMetrics';
import { metricMax } from '../lib/compareMetrics';

const BAR_COLORS = [
  'bg-kv-brand',
  'bg-slate-700',
  'bg-emerald-600',
  'bg-amber-600',
] as const;

type ComparativeMetricsChartProps = {
  entityLabel: string;
  metrics: readonly CompareMetricDef[];
  series: CompareEntitySeries[];
  minEntities: number;
};

export function ComparativeMetricsChart({
  entityLabel,
  metrics,
  series,
  minEntities,
}: ComparativeMetricsChartProps) {
  if (series.length < minEntities) {
    return (
      <div className="flex min-h-56 items-center justify-center rounded-kv-panel border border-dashed border-kv-border bg-kv-surface-muted px-kv-group text-center">
        <KvTypography variant="caption" tone="muted" as="p">
          حداقل {toPersianDigits(minEntities)} {entityLabel} انتخاب کنید تا
          مقایسه نمایش داده شود.
        </KvTypography>
      </div>
    );
  }

  const numericMetrics = metrics.filter((m) =>
    series.some((s) => s.values[m.key] != null)
  );
  const showBars = numericMetrics.length > 0;

  return (
    <div className="space-y-kv-group">
      {showBars
        ? numericMetrics.map((metric) => {
            const max = metric.asPercent
              ? 100
              : metricMax(series, metric.key);
            return (
              <section
                key={metric.key}
                className="rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group"
              >
                <KvTypography
                  variant="caption"
                  weight="bold"
                  as="h3"
                  className="mb-kv-group"
                >
                  {metric.label}
                </KvTypography>
                <div className="space-y-kv-pair">
                  {series.map((s, index) => {
                    const value = s.values[metric.key];
                    const pct =
                      value == null ? 0 : Math.min(100, (value / max) * 100);
                    return (
                      <div key={s.id} className="space-y-kv-micro">
                        <div className="flex items-center justify-between gap-kv-pair text-xs font-bold">
                          <span className="text-kv-text">{s.label}</span>
                          <span className="text-kv-text-muted">
                            {s.display[metric.key] ?? '—'}
                            {metric.asPercent &&
                            !String(s.display[metric.key] ?? '').includes('٪')
                              ? '٪'
                              : ''}
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-kv-surface-muted">
                          <div
                            className={cn(
                              'h-full rounded-full transition-[width] duration-300',
                              BAR_COLORS[index % BAR_COLORS.length]
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        : null}

      <section className="overflow-x-auto rounded-kv-panel border border-kv-border bg-kv-surface">
        <table className="w-full min-w-[28rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-kv-border bg-kv-surface-muted text-start">
              <th className="px-kv-group py-kv-pair text-xs font-black text-kv-text-muted">
                {entityLabel}
              </th>
              {metrics.map((m) => (
                <th
                  key={m.key}
                  className="px-kv-group py-kv-pair text-xs font-black text-kv-text-muted"
                >
                  {m.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.id} className="border-b border-kv-border last:border-0">
                <td className="px-kv-group py-kv-pair font-black text-kv-text">
                  {s.label}
                </td>
                {metrics.map((m) => (
                  <td
                    key={m.key}
                    className="px-kv-group py-kv-pair font-bold text-kv-text"
                  >
                    {s.display[m.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
