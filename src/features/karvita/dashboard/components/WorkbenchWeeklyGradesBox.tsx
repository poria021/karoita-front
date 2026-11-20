'use client';

import { useMemo, type CSSProperties } from 'react';

import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMultiSeriesPointChart } from '@/components/shared/KvMultiSeriesPointChart';
import { DAILY_APPROVAL_PASSING_SCORE } from '@/features/karvita/daily-approvals/constants';
import { cn } from '@/lib/utils';
import { workbenchBoxToneClass } from '@/lib/workbench-grid';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  buildLearnerGradeChartRows,
  type LearnerGradeSeries,
} from '../lib/learner-workbench';
import { WorkbenchBoxBusy } from './WorkbenchBoxBusy';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

const CHART_HEIGHT = 300;

export type WorkbenchWeeklyGradesBoxProps = {
  series: LearnerGradeSeries[];
  isLoading?: boolean;
  isError?: boolean;
  isForbidden?: boolean;
  /** آستانهٔ قبولی روی نمودار؛ پیش‌فرض ثابت روزانه. */
  minGrade?: number;
  className?: string;
  style?: CSSProperties;
};

function scoredValues(series: LearnerGradeSeries): number[] {
  return series.weeks
    .map((week) => week.score)
    .filter((score): score is number => typeof score === 'number');
}

function formatScore(value: number): string {
  return toPersianDigits(Number.isInteger(value) ? value : Math.round(value));
}

/**
 * باکس «روند نمره هفتگی»ی مشترک میز کار دانشجو و مهارت‌آموز.
 * بدنهٔ نمودار از `KvMultiSeriesPointChart` می‌آید.
 */
export function WorkbenchWeeklyGradesBox({
  series,
  isLoading = false,
  isError = false,
  isForbidden = false,
  minGrade = DAILY_APPROVAL_PASSING_SCORE,
  className,
  style,
}: WorkbenchWeeklyGradesBoxProps) {
  const rows = buildLearnerGradeChartRows(series);
  const chartSeries = useMemo(
    () =>
      series.map((item) => ({
        id: item.id,
        label: item.courseTitle,
        color: item.color,
      })),
    [series]
  );
  const hasScores = series.some((item) => scoredValues(item).length > 0);
  const isEmpty = isError || (!isLoading && !hasScores);

  return (
    <section
      aria-label="روند نمره هفتگی"
      style={style}
      className={cn(
        'flex min-h-0 min-w-0 flex-col rounded-kv-panel border p-kv-section sm:p-kv-page',
        workbenchBoxToneClass(isEmpty, 'default'),
        className
      )}
    >
      <header className="mb-3 grid gap-2">
        <h2 className="min-w-0 font-sans text-base font-bold tracking-tight text-kv-text sm:text-lg">
          روند نمره هفتگی
        </h2>
      </header>

      {isError ? (
        <KvEmptyState
          title={workbenchErrorText(isForbidden, 'روند نمره فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.')}
          className="min-h-[300px] py-kv-pair"
        />
      ) : isLoading ? (
        <WorkbenchBoxBusy
          label="در حال بارگذاری روند نمره هفتگی"
          className="h-[300px] min-h-[300px]"
        />
      ) : !hasScores ? (
        <KvEmptyState
          title="هنوز نمرهٔ هفتگی ثبت نشده است. به‌محض نمره‌دهی، روند اینجا دیده می‌شود."
          className="min-h-[300px] py-kv-pair"
        />
      ) : (
        <KvMultiSeriesPointChart
          series={chartSeries}
          rows={rows}
          xKey="weekNumber"
          height={CHART_HEIGHT}
          referenceY={minGrade}
          ariaLabel="روند نمره هفتگی"
          xTickFormatter={(value) => `هفته ${toPersianDigits(Number(value))}`}
          formatValue={formatScore}
        />
      )}
    </section>
  );
}
