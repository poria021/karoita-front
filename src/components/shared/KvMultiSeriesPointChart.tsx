'use client';

import { useId, useMemo, useState, type ReactNode } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

export type KvPointChartSeries = {
  id: string;
  label: string;
  color: string;
};

export type KvPointChartRow = Record<string, string | number | null | undefined>;

export type KvMultiSeriesPointChartProps = {
  series: readonly KvPointChartSeries[];
  rows: readonly KvPointChartRow[];
  /** کلید محور افقی روی هر ردیف. */
  xKey: string;
  height?: number;
  yDomain?: [number, number];
  yTicks?: number[];
  /** خط مرجع افقی (مثلاً آستانهٔ قبولی). */
  referenceY?: number;
  xTickFormatter?: (value: string | number) => string;
  yTickFormatter?: (value: number) => string;
  /** قالب مقدار در تولتیپ. */
  formatValue?: (value: number) => string;
  /** عنوان تولتیپ از روی ردیف؛ پیش‌فرض مقدار xKey. */
  tooltipTitleKey?: string;
  showLegend?: boolean;
  /** همهٔ سری‌ها را بتوان با کلیک روی راهنما فوکوس کرد. */
  focusable?: boolean;
  ariaLabel?: string;
  empty?: ReactNode;
  className?: string;
  /** زاویهٔ برچسب محور X (برای نام‌های بلند). */
  xTickAngle?: number;
  xTickHeight?: number;
};

const FADED_OPACITY = 0.08;
const SERIES_STROKE_OPACITY = 0.55;
const SERIES_DOT_OPACITY = 0.7;
const FONT_FAMILY = 'var(--font-vazirmatn), sans-serif';

type ChartPayloadEntry = {
  dataKey?: string | number;
  color?: string;
  value?: number | string | null;
  name?: string;
  payload?: Record<string, unknown>;
};

function defaultFormatValue(value: number): string {
  return toPersianDigits(Number.isInteger(value) ? value : Math.round(value * 10) / 10);
}

function PointTooltip({
  active,
  payload,
  seriesById,
  focusedId,
  formatValue,
  tooltipTitleKey,
  xKey,
}: {
  active?: boolean;
  payload?: ReadonlyArray<ChartPayloadEntry>;
  seriesById: Map<string, KvPointChartSeries>;
  focusedId: string | null;
  formatValue: (value: number) => string;
  tooltipTitleKey?: string;
  xKey: string;
}) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((entry) => {
    const key = String(entry.dataKey ?? '');
    if (!seriesById.has(key)) return false;
    if (entry.value == null || entry.value === '') return false;
    if (focusedId && key !== focusedId) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const first = rows[0]!;
  const key = String(first.dataKey ?? '');
  const titleFromKey =
    tooltipTitleKey != null ? first.payload?.[tooltipTitleKey] : undefined;
  const titleFromSeries = first.payload?.[`${key}__title`];
  const title =
    typeof titleFromKey === 'string'
      ? titleFromKey
      : typeof titleFromSeries === 'string'
        ? titleFromSeries
        : String(first.payload?.[xKey] ?? '');

  return (
    <div
      className="rounded-kv-control border border-kv-border bg-kv-surface px-3 py-2 shadow-kv-overlay"
      dir="rtl"
    >
      {title ? (
        <KvTypography variant="caption" tone="muted" as="p" className="mb-1.5">
          {title}
        </KvTypography>
      ) : null}
      <ul className="grid gap-1.5">
        {rows.map((entry) => {
          const item = seriesById.get(String(entry.dataKey));
          if (!item) return null;
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <KvTypography variant="caption" as="span">
                  {item.label}
                </KvTypography>
              </span>
              <span className="font-sans text-sm font-bold tabular-nums text-kv-text">
                {formatValue(Number(entry.value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * نمودار چندسری نقطه‌ای (همان الگوی روند نمرهٔ میز کار دانشجو):
 * خط ملایم + نقطه؛ با امکان فوکوس روی یک سری از راهنما.
 */
export function KvMultiSeriesPointChart({
  series,
  rows,
  xKey,
  height = 300,
  yDomain = [0, 100],
  yTicks = [0, 20, 40, 60, 80, 100],
  referenceY,
  xTickFormatter,
  yTickFormatter = (value) => toPersianDigits(value),
  formatValue = defaultFormatValue,
  tooltipTitleKey,
  showLegend = true,
  focusable = true,
  ariaLabel = 'نمودار نقطه‌ای',
  empty,
  className,
  xTickAngle = -40,
  xTickHeight = 52,
}: KvMultiSeriesPointChartProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const gradientNs = useId().replace(/:/g, '');
  const seriesById = useMemo(
    () => new Map(series.map((item) => [item.id, item])),
    [series]
  );

  const hasPoints = series.some((item) =>
    rows.some((row) => {
      const value = row[item.id];
      return typeof value === 'number' && Number.isFinite(value);
    })
  );

  if (!hasPoints) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <div className={cn('flex min-h-0 min-w-0 flex-col gap-3', className)}>
      {showLegend && series.length > 0 ? (
        <div
          className="flex min-w-0 items-center gap-2"
          aria-label="راهنمای سری‌های نمودار"
        >
          {focusable ? (
            <button
              type="button"
              onClick={() => setFocusedId(null)}
              aria-pressed={focusedId == null}
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 rounded-kv-tight font-sans text-xs transition-opacity duration-300',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring',
                focusedId == null
                  ? 'font-bold text-kv-text'
                  : 'text-kv-text-muted can-hover:hover:text-kv-text opacity-55'
              )}
            >
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-[2px] border border-kv-border-strong bg-kv-surface-muted"
              />
              همه
            </button>
          ) : null}

          <ul className="flex min-w-0 flex-1 items-center gap-x-3 overflow-x-auto whitespace-nowrap [scrollbar-width:thin]">
            {series.map((item) => {
              const selected = focusedId === item.id;
              const muted = focusable && focusedId != null && !selected;
              return (
                <li key={item.id} className="shrink-0">
                  {focusable ? (
                    <button
                      type="button"
                      onClick={() => setFocusedId(item.id)}
                      aria-pressed={selected}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-kv-tight font-sans text-xs transition-opacity duration-300',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kv-ring',
                        selected
                          ? 'font-bold text-kv-text'
                          : 'text-kv-text-muted can-hover:hover:text-kv-text',
                        muted && 'opacity-40'
                      )}
                    >
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-[2px] opacity-70"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 font-sans text-xs text-kv-text-muted">
                      <span
                        aria-hidden
                        className="size-2 shrink-0 rounded-[2px] opacity-70"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <div
        role="img"
        aria-label={ariaLabel}
        className="relative w-full flex-1"
        style={{ minHeight: height }}
      >
        <div dir="ltr" className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={[...rows]}
              margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
            >
              <defs>
                {series.map((item) => (
                  <linearGradient
                    key={item.id}
                    id={`${gradientNs}-${item.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={item.color}
                      stopOpacity={0.08}
                    />
                    <stop
                      offset="55%"
                      stopColor={item.color}
                      stopOpacity={0.025}
                    />
                    <stop
                      offset="100%"
                      stopColor={item.color}
                      stopOpacity={0}
                    />
                  </linearGradient>
                ))}
              </defs>

              <CartesianGrid
                stroke="var(--kv-border)"
                strokeOpacity={0.7}
                strokeWidth={1}
                vertical={false}
              />

              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={xTickAngle}
                textAnchor="end"
                height={xTickHeight}
                tickMargin={6}
                tick={{
                  fill: 'var(--kv-text-faint)',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                }}
                tickFormatter={xTickFormatter}
              />

              <YAxis
                domain={yDomain}
                ticks={yTicks}
                width={36}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{
                  fill: 'var(--kv-text-faint)',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: FONT_FAMILY,
                }}
                tickFormatter={yTickFormatter}
              />

              {typeof referenceY === 'number' ? (
                <ReferenceLine
                  y={referenceY}
                  stroke="var(--kv-text-faint)"
                  strokeDasharray="4 6"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              ) : null}

              <Tooltip
                cursor={{
                  stroke: 'var(--kv-border-strong)',
                  strokeWidth: 1,
                  strokeOpacity: 0.55,
                }}
                content={
                  <PointTooltip
                    seriesById={seriesById}
                    focusedId={focusedId}
                    formatValue={formatValue}
                    tooltipTitleKey={tooltipTitleKey}
                    xKey={xKey}
                  />
                }
                wrapperStyle={{ outline: 'none', zIndex: 20 }}
              />

              {series.map((item) => {
                const faded = focusedId != null && focusedId !== item.id;
                const strokeOpacity = faded
                  ? FADED_OPACITY
                  : focusedId === item.id
                    ? 0.85
                    : SERIES_STROKE_OPACITY;
                const fillOpacity = faded ? FADED_OPACITY : 1;
                const dotOpacity = faded
                  ? FADED_OPACITY
                  : focusedId === item.id
                    ? 0.95
                    : SERIES_DOT_OPACITY;

                return (
                  <Area
                    key={item.id}
                    type="monotone"
                    dataKey={item.id}
                    name={item.label}
                    stroke={item.color}
                    fill={`url(#${gradientNs}-${item.id})`}
                    strokeWidth={
                      faded ? 1.1 : focusedId === item.id ? 2 : 1.6
                    }
                    strokeOpacity={strokeOpacity}
                    fillOpacity={fillOpacity}
                    connectNulls
                    isAnimationActive
                    animationDuration={650}
                    animationEasing="ease-out"
                    dot={{
                      r: 3.5,
                      fill: item.color,
                      strokeWidth: 0,
                      fillOpacity: dotOpacity,
                    }}
                    activeDot={
                      faded
                        ? false
                        : {
                            r: 5,
                            fill: item.color,
                            fillOpacity: 0.9,
                            stroke: 'var(--kv-surface)',
                            strokeWidth: 2,
                          }
                    }
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
