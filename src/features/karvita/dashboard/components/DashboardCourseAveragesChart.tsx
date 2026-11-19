'use client';

import { useMemo, type CSSProperties } from 'react';

import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { Spinner } from '@/components/ui/spinner';
import { ReportCompareCharts } from '@/features/karvita/reports/components/ReportCompareCharts';
import type { LessonReportFilter } from '@/services/reports/real/lesson-reports.api';
import type { UserRole } from '@/types/auth';
import type { ReportCompareItem } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';

import { useDashboardCourseGradeAverages } from '../hooks/useDashboardCourseGradeAverages';
import {
  COURSE_BAR_BASE_COLOR,
  COURSE_GRADE_MAX,
} from '../lib/course-grade-averages';
import { workbenchErrorText } from './WorkbenchUnavailableNote';

const METRIC_KEY = 'average';
const Y_TICKS = [0, 5, 10, 15, 20];
/** تُن‌های همین رنگ برند — سایت رسمی است؛ تنوعِ رنگیِ دسته‌ایِ قبلی را نمی‌خواهیم. */
const BRAND_BAR_COLOR = COURSE_BAR_BASE_COLOR;

function formatAverage(value: number): string {
  return toPersianDigits(Math.round(value * 10) / 10);
}

export type DashboardCourseAveragesChartProps = LessonReportFilter & {
  role: UserRole;
  className?: string;
  style?: CSSProperties;
};

/**
 * «میانگین نمرهٔ دروس» — داده از `GET /reports/lessons/average-scores`
 * (استاد راهنما، معلم راهنما، مدیر مدرسه). هر آیتم یک میله است:
 * `title` روی محور، `averageScore` ارتفاع میله؛ `null` یعنی هنوز نمرهٔ پایانی
 * ثبت نشده و میله خالی و بدون عدد می‌ماند.
 * `semesterId` / `structure` اختیاری‌اند؛ با تغییرشان همان درخواست دوباره زده می‌شود.
 * نمودار را همان `ReportCompareCharts` (نمودار صفحهٔ مقایسه) می‌کشد.
 */
export function DashboardCourseAveragesChart({
  role,
  semesterId,
  structure,
  className,
  style,
}: DashboardCourseAveragesChartProps) {
  const { isLoading, isError, isForbidden, courses } = useDashboardCourseGradeAverages(
    role,
    { semesterId, structure }
  );

  const items = useMemo<ReportCompareItem[]>(
    () =>
      courses.map((course, index) => {
        // بدون کلید = مقدار ندارد؛ نمودار آن را null می‌بیند (میلهٔ خالی، بدون عدد).
        const metrics: Record<string, number> = {};
        if (course.averageScore !== null) {
          metrics[METRIC_KEY] = course.averageScore;
        }
        return {
          id: `lesson-${index}`,
          name: course.title,
          metrics,
          info:
            course.averageScore === null
              ? [{ label: 'میانگین', value: 'نمرهٔ پایانی ثبت نشده' }]
              : [],
        };
      }),
    [courses]
  );

  if (isLoading || isError || courses.length === 0) {
    return (
      <div className={className} style={style}>
        <KvCard
          padding="md"
          className="flex h-full flex-col gap-kv-group rounded-kv-shell border-kv-border/70 shadow-none"
        >
          <KvTypography as="h3" variant="subtitle">
            میانگین نمرهٔ دروس
          </KvTypography>
          {isLoading ? (
            <div
              role="status"
              aria-label="در حال بارگذاری میانگین نمرهٔ دروس"
              className="flex min-h-[240px] flex-1 items-center justify-center"
            >
              <Spinner className="size-4 text-kv-brand" aria-hidden="true" />
            </div>
          ) : (
            <KvEmptyState
              title={
                isError
                  ? workbenchErrorText(isForbidden, 'میانگین نمرهٔ دروس فعلاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.')
                  : 'هنوز درسی برای نمایش میانگین نمره وجود ندارد.'
              }
              className="min-h-[240px] py-kv-pair"
            />
          )}
        </KvCard>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <ReportCompareCharts
        items={items}
        metrics={[METRIC_KEY]}
        metricKey={METRIC_KEY}
        metricTitles={{ [METRIC_KEY]: 'میانگین نمره' }}
        title="میانگین نمرهٔ دروس"
        yDomain={[0, COURSE_GRADE_MAX]}
        yTicks={Y_TICKS}
        formatValue={formatAverage}
        barSize={28}
        chartHeight={170}
        fillHeight
        brandToneBase={BRAND_BAR_COLOR}
        flat
      />
    </div>
  );
}
