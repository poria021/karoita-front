'use client';

import { useId, useState, type ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

export type KvBarChartRow = Record<string, string | number | null | undefined>;

export type KvBarChartProps = {
  rows: readonly KvBarChartRow[];
  /** کلید محور افقی (نام هر مورد). */
  xKey: string;
  /** کلید مقدار عددی هر میله. */
  valueKey: string;
  /** برچسب مقدار در تولتیپ. */
  valueLabel: string;
  /** رنگ پیش‌فرض میله‌ها. */
  color?: string;
  /** اگر ست شود، رنگ هر میله از این فیلد ردیف خوانده می‌شود. */
  colorKey?: string;
  /** اگر ست شود، توضیح زیر مقدار در تولتیپ از این فیلد ردیف خوانده می‌شود. */
  hintKey?: string;
  height?: number;
  /** ضخامت میله (px) — پیش‌فرض نازک. */
  barSize?: number;
  yDomain?: [number, number];
  yTicks?: number[];
  xTickFormatter?: (value: string | number) => string;
  /** قالب مقدار (تولتیپ و برچسب بالای میله). */
  formatValue?: (value: number) => string;
  ariaLabel?: string;
  empty?: ReactNode;
  className?: string;
  xTickAngle?: number;
  xTickHeight?: number;
  /** برچسب مقدار بالای هر میله (پیش‌فرض روشن). */
  showValueLabels?: boolean;
};

const FONT_FAMILY = 'var(--font-vazirmatn), sans-serif';

function defaultFormatValue(value: number): string {
  return toPersianDigits(
    Number.isInteger(value) ? value : Math.round(value * 10) / 10
  );
}

type TooltipEntry = {
  value?: number | string | null;
  payload?: Record<string, unknown>;
};

function BarTooltip({
  active,
  payload,
  xKey,
  valueLabel,
  color,
  colorKey,
  hintKey,
  formatValue,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  xKey: string;
  valueLabel: string;
  color: string;
  colorKey?: string;
  hintKey?: string;
  formatValue: (value: number) => string;
}) {
  const entry = payload?.[0];
  if (!active || !entry || entry.value == null || entry.value === '') {
    return null;
  }
  const title = String(entry.payload?.[xKey] ?? '');
  const rowColor = colorKey ? entry.payload?.[colorKey] : undefined;
  const dotColor = typeof rowColor === 'string' ? rowColor : color;
  const hint = hintKey ? entry.payload?.[hintKey] : undefined;
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
      <div className="flex items-center justify-between gap-4">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: dotColor }}
          />
          <KvTypography variant="caption" as="span">
            {valueLabel}
          </KvTypography>
        </span>
        <span className="font-sans text-sm font-bold tabular-nums text-kv-text">
          {formatValue(Number(entry.value))}
        </span>
      </div>
      {typeof hint === 'string' && hint ? (
        <KvTypography variant="caption" tone="muted" as="p" className="mt-1">
          {hint}
        </KvTypography>
      ) : null}
    </div>
  );
}

/**
 * نمودار میله‌ای تک‌سری (recharts) — میله‌های گرادیانی با بالای گرد و پایین صاف،
 * شبکهٔ خط‌چین و هایلایت میلهٔ زیر ماوس. رنگ هر میله با `colorKey` تعیین می‌شود.
 */
export function KvBarChart({
  rows,
  xKey,
  valueKey,
  valueLabel,
  color = 'var(--kv-brand)',
  colorKey,
  hintKey,
  height = 300,
  barSize = 10,
  yDomain = [0, 100],
  yTicks = [0, 25, 50, 75, 100],
  xTickFormatter,
  formatValue = defaultFormatValue,
  ariaLabel = 'نمودار میله‌ای',
  empty,
  className,
  xTickAngle = -40,
  xTickHeight = 52,
  showValueLabels = true,
}: KvBarChartProps) {
  const uid = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  const hasValues = rows.some((row) => {
    const value = row[valueKey];
    return typeof value === 'number' && Number.isFinite(value);
  });

  if (!hasValues) return empty ? <>{empty}</> : null;

  const rowColorAt = (row: KvBarChartRow): string => {
    const rowColor = colorKey ? row[colorKey] : undefined;
    return typeof rowColor === 'string' ? rowColor : color;
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn('relative w-full min-w-0', className)}
      style={{ minHeight: height }}
    >
      <div dir="ltr" className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[...rows]}
            margin={{ top: 20, right: 8, left: 0, bottom: 8 }}
            onMouseMove={(state) => {
              const index = Number(state?.activeTooltipIndex);
              setHovered(Number.isFinite(index) ? index : null);
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              {rows.map((row, index) => (
                <linearGradient
                  key={index}
                  id={`kv-bar-${uid}-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={rowColorAt(row)}
                    stopOpacity={1}
                  />
                  <stop
                    offset="100%"
                    stopColor={rowColorAt(row)}
                    stopOpacity={0.35}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              stroke="var(--kv-border)"
              strokeDasharray="4 6"
              strokeOpacity={0.8}
              strokeWidth={1}
              vertical={false}
            />
            <XAxis
              dataKey={xKey}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={xTickAngle}
              textAnchor={xTickAngle ? 'end' : 'middle'}
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
              tickFormatter={(value: number) => toPersianDigits(value)}
            />
            <Tooltip
              cursor={false}
              content={
                <BarTooltip
                  xKey={xKey}
                  valueLabel={valueLabel}
                  color={color}
                  colorKey={colorKey}
                  hintKey={hintKey}
                  formatValue={formatValue}
                />
              }
              wrapperStyle={{ outline: 'none', zIndex: 20 }}
            />
            <Bar
              dataKey={valueKey}
              name={valueLabel}
              barSize={barSize}
              radius={[5, 5, 0, 0]}
              isAnimationActive
              animationDuration={650}
              animationEasing="ease-out"
            >
              {rows.map((row, index) => (
                <Cell
                  key={`${String(row[xKey])}-${index}`}
                  fill={`url(#kv-bar-${uid}-${index})`}
                  fillOpacity={hovered === null || hovered === index ? 1 : 0.55}
                />
              ))}
              {showValueLabels ? (
                <LabelList
                  dataKey={valueKey}
                  position="top"
                  offset={6}
                  formatter={(value: unknown) =>
                    typeof value === 'number' ? formatValue(value) : ''
                  }
                  style={{
                    fill: 'var(--kv-text-muted)',
                    fontSize: 11,
                    fontWeight: 700,
                    fontFamily: FONT_FAMILY,
                  }}
                />
              ) : null}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
