'use client';

import { useQuery } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
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
import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { cn } from '@/lib/utils';
import { WORKBENCH_FULL_SPAN } from '@/lib/workbench-grid';
import { RouteService } from '@/services/route.service';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import { toPersianDigits } from '@/utils/persianDigits';

import { useLearnerWorkbenchSnapshot } from '../hooks/useLearnerWorkbenchSnapshot';
import {
  buildLearnerCourseWeekHighlights,
  buildLearnerGradeChartRows,
  buildLearnerGradeSeries,
  LEARNER_GRADE_SERIES_COLORS,
  type LearnerCourseWeekHighlight,
  type LearnerGradeSeries,
} from '../lib/learner-workbench';
import { DashboardLearnerCourseWeekCards } from './DashboardLearnerCourseWeekCards';

const CHART_HEIGHT = 300;
const FADED_OPACITY = 0.08;
/** شفافیت خط و نقطه در حالت عادی — رنگ‌ها عمداً خیلی ملایم‌اند. */
const SERIES_STROKE_OPACITY = 0.55;
const SERIES_DOT_OPACITY = 0.7;

/**
 * TEMP — دیتای فیک فقط برای پیش‌نمایش ظاهر نمودار.
 * بعد از تأیید UI این فلگ و `TEMP_FAKE_GRADE_SERIES` را حذف کن.
 */
const USE_TEMP_FAKE_GRADE_CHART = true;

function tempWeek(
  weekNumber: number,
  score: number | null
): LearnerGradeSeries['weeks'][number] {
  return {
    weekNumber,
    weekTitle: `هفته ${toPersianDigits(weekNumber)}`,
    score,
    status: score == null ? 'pending' : 'graded',
  };
}

const TEMP_FAKE_GRADE_SERIES: LearnerGradeSeries[] = [
  {
    id: 'fake-internship-1',
    courseTitle: 'کارورزی ۱',
    level: 1,
    kind: 'internship',
    color: LEARNER_GRADE_SERIES_COLORS[0]!,
    weeks: [
      tempWeek(1, 42),
      tempWeek(2, 78),
      tempWeek(3, 68),
      tempWeek(4, 55),
      tempWeek(5, 48),
      tempWeek(6, 62),
      tempWeek(7, 58),
      tempWeek(8, 70),
    ],
  },
  {
    id: 'fake-internship-2',
    courseTitle: 'کارورزی ۲',
    level: 2,
    kind: 'internship',
    color: LEARNER_GRADE_SERIES_COLORS[3]!,
    weeks: [
      tempWeek(1, 28),
      tempWeek(2, 52),
      tempWeek(3, 45),
      tempWeek(4, 38),
      tempWeek(5, 42),
      tempWeek(6, 50),
      tempWeek(7, 47),
      tempWeek(8, 55),
    ],
  },
  {
    id: 'fake-one',
    courseTitle: 'one',
    level: 3,
    kind: 'internship',
    color: LEARNER_GRADE_SERIES_COLORS[1]!,
    weeks: [
      tempWeek(1, 55),
      tempWeek(2, 88),
      tempWeek(3, 72),
      tempWeek(4, 60),
      tempWeek(5, 65),
      tempWeek(6, 78),
      tempWeek(7, 70),
      tempWeek(8, 82),
    ],
  },
];

const TEMP_FAKE_HIGHLIGHTS: LearnerCourseWeekHighlight[] = [
  {
    id: 'fake-internship-1',
    courseTitle: 'کارورزی ۱',
    href: RouteService.karvita.internshipSelection(1),
    color: LEARNER_GRADE_SERIES_COLORS[0]!,
    weekNumber: 8,
    weekTitle: `هفته ${toPersianDigits(8)}`,
    status: 'graded',
    score: 70,
    hasTeacherReaction: true,
    reactionRole: 'advisor',
    reactionText:
      'گزارش منسجم بود؛ برای هفته بعد روی بازخورد کلاسی دانش‌آموزان دقیق‌تر بنویسید.',
    reactionAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    supervisorName: 'دکتر احمدی',
    mentorName: null,
  },
  {
    id: 'fake-internship-2',
    courseTitle: 'کارورزی ۲',
    href: RouteService.karvita.internshipSelection(2),
    color: LEARNER_GRADE_SERIES_COLORS[3]!,
    weekNumber: 8,
    weekTitle: `هفته ${toPersianDigits(8)}`,
    status: 'needs_edit',
    score: null,
    hasTeacherReaction: true,
    reactionRole: 'advisor',
    reactionText:
      'بخش مشاهدهٔ مشارکتی ناقص است. لطفاً اصلاح کنید و دوباره ارسال کنید.',
    reactionAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    supervisorName: 'استاد رضایی',
    mentorName: null,
  },
  {
    id: 'fake-one',
    courseTitle: 'one',
    href: RouteService.karvita.internshipSelection(3),
    color: LEARNER_GRADE_SERIES_COLORS[1]!,
    weekNumber: 8,
    weekTitle: `هفته ${toPersianDigits(8)}`,
    status: 'pending',
    score: null,
    hasTeacherReaction: false,
    reactionRole: null,
    reactionText: null,
    reactionAt: null,
    supervisorName: null,
    mentorName: 'خانم محمدی',
  },
];

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
 * الگوی Leads tracking: خط نرم + سایهٔ گرادیان زیر منحنی + نقاط توپر کوچک.
 */
export function DashboardLearnerGradesChart() {
  const desk = useLearnerWorkbenchSnapshot();
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const gradientNs = useId().replace(/:/g, '');

  const passingQuery = useQuery({
    queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    queryFn: () => SyllabusConfigService.getPassingScoreThreshold(),
    staleTime: QUERY_STALE_MS.module,
    enabled: desk.enabled || USE_TEMP_FAKE_GRADE_CHART,
  });

  const series = USE_TEMP_FAKE_GRADE_CHART
    ? TEMP_FAKE_GRADE_SERIES
    : buildLearnerGradeSeries(desk.snapshots);
  const highlights = USE_TEMP_FAKE_GRADE_CHART
    ? TEMP_FAKE_HIGHLIGHTS
    : buildLearnerCourseWeekHighlights(desk.snapshots);
  const rows = buildLearnerGradeChartRows(series);
  const seriesById = useMemo(
    () => new Map(series.map((item) => [item.id, item])),
    [series]
  );
  const hasScores = series.some((item) => scoredValues(item).length > 0);

  const minGrade =
    typeof passingQuery.data === 'number' && Number.isFinite(passingQuery.data)
      ? passingQuery.data
      : DAILY_APPROVAL_PASSING_SCORE;

  if (!USE_TEMP_FAKE_GRADE_CHART && !desk.enabled) return null;

  if (!USE_TEMP_FAKE_GRADE_CHART && desk.isError) {
    return (
      <section
        aria-label="روند نمره هفتگی"
        className={cn(
          WORKBENCH_FULL_SPAN,
          'rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section shadow-kv-soft'
        )}
      >
        <KvTypography variant="body" tone="muted" as="p">
          روند نمره فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.
        </KvTypography>
      </section>
    );
  }

  if (
    !USE_TEMP_FAKE_GRADE_CHART &&
    !desk.isLoading &&
    series.length === 0 &&
    highlights.length === 0
  ) {
    return null;
  }

  const selectCourse = (id: string | null) => {
    setFocusedId(id);
  };

  return (
    <div
      className={cn(
        WORKBENCH_FULL_SPAN,
        'grid grid-cols-1 gap-kv-group lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:items-stretch'
      )}
    >
      {/* RTL: ستون اول = راست = کارت درس‌ها */}
      <DashboardLearnerCourseWeekCards highlights={highlights} />

      {/* ستون دوم = چپ = نمودار نصف‌عرض */}
      <section
        aria-label="روند نمره هفتگی"
        className="flex min-h-0 min-w-0 flex-col rounded-kv-panel border border-kv-border bg-kv-surface p-kv-section shadow-kv-soft sm:p-kv-page"
      >
        <header className="mb-3 grid gap-2">
          <h2 className="min-w-0 font-sans text-base font-bold tracking-tight text-kv-text sm:text-lg">
            روند نمره هفتگی
          </h2>

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
        </header>

        {!USE_TEMP_FAKE_GRADE_CHART && desk.isLoading ? (
          <div
            aria-hidden
            className="h-[300px] flex-1 animate-pulse rounded-kv-control bg-kv-surface-muted"
          />
        ) : !hasScores ? (
          <div className="flex min-h-48 flex-1 items-center justify-center">
            <KvTypography
              variant="body"
              tone="muted"
              as="p"
              className="text-center"
            >
              هنوز نمرهٔ هفتگی ثبت نشده است. به‌محض نمره‌دهی، روند اینجا دیده
              می‌شود.
            </KvTypography>
          </div>
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
        )}
      </section>
    </div>
  );
}
