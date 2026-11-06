'use client';

import { useId, useMemo, useState, type CSSProperties } from 'react';
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

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  buildLearnerGradeChartRows,
  type LearnerGradeSeries,
} from '../lib/learner-workbench';

const CHART_HEIGHT = 300;
const FADED_OPACITY = 0.08;
/** شفافیت خط و نقطه در حالت عادی — رنگ‌ها عمداً خیلی ملایم‌اند. */
const SERIES_STROKE_OPACITY = 0.55;
const SERIES_DOT_OPACITY = 0.7;

export type WorkbenchWeeklyGradesBoxProps = {
  series: LearnerGradeSeries[];
  isLoading?: boolean;
  isError?: boolean;
  /** آستانهٔ قبولی روی نمودار؛ پیش‌فرض ثابت روزانه. */
  minGrade?: number;
  className?: string;
  style?: CSSProperties;
};

type ChartPayloadEntry = {
  dataKey?: string | number;
  color?: string;
  value?: number | string | null;
  name?: string;
  payload?: Record<string, unknown>;
};

function scoredValues(series: LearnerGradeSeries): number[] {
  return series.weeks
    .map((week) => week.score)
    .filter((score): score is number => typeof score === 'number');
}

function formatScore(value: number): string {
  return toPersianDigits(Number.isInteger(value) ? value : Math.round(value));
}

function GradeTooltip({
  active,
  payload,
  seriesById,
  focusedId,
}: {
  active?: boolean;
  payload?: ReadonlyArray<ChartPayloadEntry>;
  seriesById: Map<string, LearnerGradeSeries>;
  focusedId: string | null;
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
  const weekTitleRaw = first.payload?.[`${key}__title`];
  const weekNumber = first.payload?.weekNumber;
  const weekTitle =
    typeof weekTitleRaw === 'string'
      ? weekTitleRaw
      : typeof weekNumber === 'number'
        ? `هفته ${toPersianDigits(weekNumber)}`
        : 'هفته';

  return (
    <div
      className="rounded-kv-control border border-kv-border bg-kv-surface px-3 py-2 shadow-kv-overlay"
      dir="rtl"
    >
      <KvTypography variant="caption" tone="muted" as="p" className="mb-1.5">
        {weekTitle}
      </KvTypography>
      <ul className="grid gap-1.5">
        {rows.map((entry) => {
          const series = seriesById.get(String(entry.dataKey));
          if (!series) return null;
          return (
            <li
              key={series.id}
              className="flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: series.color }}
                />
                <KvTypography variant="caption" as="span">
                  {series.courseTitle}
                </KvTypography>
              </span>
              <span className="font-sans text-sm font-bold tabular-nums text-kv-text">
                {formatScore(Number(entry.value))}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * باکس «روند نمره هفتگی»ی مشترک میز کار دانشجو و مهارت‌آموز.
 */
export function WorkbenchWeeklyGradesBox({
  series,
  isLoading = false,
  isError = false,
  minGrade = DAILY_APPROVAL_PASSING_SCORE,
  className,
  style,
}: WorkbenchWeeklyGradesBoxProps) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const gradientNs = useId().replace(/:/g, '');
  const rows = buildLearnerGradeChartRows(series);
  const seriesById = useMemo(
    () => new Map(series.map((item) => [item.id, item])),
    [series]
  );
  const hasScores = series.some((item) => scoredValues(item).length > 0);

  const selectCourse = (id: string | null) => {
    setFocusedId(id);
  };

  return (
    <section
      aria-label="روند نمره هفتگی"
      style={style}
      className={cn(
        'flex min-h-0 min-w-0 flex-col rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section shadow-kv-soft sm:p-kv-page',
        className
      )}
    >
      <header className="mb-3 grid gap-2">
        <h2 className="min-w-0 font-sans text-base font-bold tracking-tight text-kv-text sm:text-lg">
          روند نمره هفتگی
        </h2>

        {!isError && series.length > 0 ? (
          <div
            className="flex min-w-0 items-center gap-2"
            aria-label="فیلتر درس‌های نمودار"
          >
            <button
              type="button"
              onClick={() => selectCourse(null)}
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

            <ul className="flex min-w-0 flex-1 items-center gap-x-3 overflow-x-auto whitespace-nowrap [scrollbar-width:thin]">
              {series.map((item) => {
                const selected = focusedId === item.id;
                const muted = focusedId != null && !selected;
                return (
                  <li key={item.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => selectCourse(item.id)}
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
                      {item.courseTitle}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </header>

      {isError ? (
        <KvEmptyState
          title="روند نمره فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید."
          className="min-h-0 py-kv-pair"
        />
      ) : isLoading ? (
        <div
          aria-hidden
          className="h-[300px] flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
        />
      ) : !hasScores ? (
        <KvEmptyState
          title="هنوز نمرهٔ هفتگی ثبت نشده است. به‌محض نمره‌دهی، روند اینجا دیده می‌شود."
          className="min-h-0 py-kv-pair"
        />
      ) : (
        <div dir="ltr" className="w-full" style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={rows}
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
                dataKey="weekNumber"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-40}
                textAnchor="end"
                height={52}
                tickMargin={6}
                tick={{
                  fill: 'var(--kv-text-faint)',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: 'var(--font-vazirmatn), sans-serif',
                }}
                tickFormatter={(value: number) =>
                  `هفته ${toPersianDigits(value)}`
                }
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                width={36}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{
                  fill: 'var(--kv-text-faint)',
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: 'var(--font-vazirmatn), sans-serif',
                }}
                tickFormatter={(value: number) => toPersianDigits(value)}
              />

              <ReferenceLine
                y={minGrade}
                stroke="var(--kv-text-faint)"
                strokeDasharray="4 6"
                strokeOpacity={0.35}
                strokeWidth={1}
              />

              <Tooltip
                cursor={{
                  stroke: 'var(--kv-border-strong)',
                  strokeWidth: 1,
                  strokeOpacity: 0.55,
                }}
                content={
                  <GradeTooltip
                    seriesById={seriesById}
                    focusedId={focusedId}
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
                    name={item.courseTitle}
                    stroke={item.color}
                    fill={`url(#${gradientNs}-${item.id})`}
                    strokeWidth={faded ? 1.1 : focusedId === item.id ? 2 : 1.6}
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
      )}
    </section>
  );
}
