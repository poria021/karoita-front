'use client';

import { useMemo, useState } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { ReportCompareCharts } from '@/features/karvita/reports/components/ReportCompareCharts';
import { ReportCompareMatrix } from '@/features/karvita/reports/components/ReportCompareMatrix';
import {
  METRIC_TAB_CLASS,
  METRIC_TABS_LIST_CLASS,
} from '@/features/karvita/reports/components/report-compare-metric-tabs';
import type { ReportSlug } from '@/types/report-access';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

type ReportCompareViewProps = {
  page: AdminReportPageModel;
};

function candidateLabel(row: { name?: unknown }): string {
  return String(row.name ?? '').trim();
}

type CompareTab = 'table' | 'chart';

/** عنوان ستون اول جدول مقایسه: موضوع هر گزارش (نه عنوان عمومی «مورد»). */
const COMPARE_ENTITY_LABEL: Record<ReportSlug, string> = {
  learners: 'فراگیر',
  attendance: 'فراگیر',
  scores: 'فراگیر',
  'professor-attendance': 'استاد',
  professors: 'استاد',
  'professor-performance': 'استاد',
  teachers: 'معلم',
  'teacher-performance': 'معلم',
  principals: 'مدیر مدرسه',
  schools: 'مدرسه',
  'school-performance': 'مدرسه',
  faculties: 'دانشکده',
  'faculty-performance': 'دانشکده',
  provinces: 'استان',
  'province-performance': 'استان',
};

/** مقدار تب شاخص برای «نمایش همهٔ شاخص‌ها». */
const ALL_METRICS = '__all__';

const COMPARE_TABS: readonly { id: CompareTab; label: string }[] = [
  { id: 'table', label: 'جدول' },
  { id: 'chart', label: 'نمودار' },
];

export function ReportCompareView({ page }: ReportCompareViewProps) {
  const [tab, setTab] = useState<CompareTab>('table');
  const [metricTab, setMetricTab] = useState<string>(ALL_METRICS);
  /** شاخص نمودار (یک شاخص در هر لحظه)؛ پیش‌فرض اولین شاخص. */
  const [chartMetric, setChartMetric] = useState<string>('');
  const n = page.compareDraft.length;
  const atMax = n >= page.compareMax;
  const dirty =
    page.compareDraft.length !== page.compareSelected.length ||
    page.compareDraft.some((id) => !page.compareSelected.includes(id));

  const help =
    n < page.compareMin
      ? `حداقل ${toPersianDigits(page.compareMin)} مورد را انتخاب کنید.`
      : atMax
        ? `به سقف ${toPersianDigits(page.compareMax)} مورد رسیده‌اید؛ برای افزودن مورد دیگر، یکی را بردارید.`
        : dirty
          ? 'برای دیدن گزارش، تأیید را بزنید.'
          : page.compareItems.length < page.compareMin
            ? 'در حال آماده‌سازی گزارش مقایسه…'
            : 'گزارش مطابق انتخاب شما نمایش داده شده است.';

  const labelById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of page.compareCandidates) {
      map.set(row.id, candidateLabel(row) || row.id);
    }
    for (const item of page.compareItems) {
      if (!map.has(item.id)) map.set(item.id, item.name);
    }
    return map;
  }, [page.compareCandidates, page.compareItems]);

  const metrics = useMemo(() => {
    const keys = new Set<string>();
    page.compareItems.forEach((item) => {
      Object.keys(item.metrics).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [page.compareItems]);

  const metricTitles: Record<string, string> = {
    attProf: 'نرخ حضور ثبت‌شده توسط استاد',
    attMgr: 'نرخ حضور تاییدشده توسط مدیر مدرسه',
    att: 'درصد حضور جلسات',
    resp: 'نرخ پاسخ‌دهی به گزارش‌ها',
    score: 'میانگین نمره فراگیران',
    days: 'میانگین روزهای حضور نسبت به کل جلسات',
  };

  /** تب شاخص: «همه» یا فقط یک شاخص؛ فقط روی تب جدول اثر دارد. */
  const shownMetrics = metrics.includes(metricTab) ? [metricTab] : metrics;
  const chartMetricKey = metrics.includes(chartMetric)
    ? chartMetric
    : (metrics[0] ?? '');

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
      <header
        className={cn(
          'flex shrink-0 flex-col gap-kv-group',
          'sm:flex-row sm:items-start sm:justify-between'
        )}
      >
        <div className="flex min-w-0 flex-1 items-start gap-kv-inline">
          <KvButton
            type="button"
            color="neutral"
            appearance="ghost"
            size="sm"
            className="shrink-0"
            aria-label={`بازگشت به ${page.def.title}`}
            icon={<FaIcon icon={faIcons.arrowRight} size="sm" />}
            onClick={page.exitCompare}
          >
            بازگشت
          </KvButton>
          <span
            className="mt-2 hidden h-5 w-px shrink-0 bg-kv-border-muted sm:inline"
            aria-hidden
          />
          <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
            <KvTypography as="h2" variant="title" id="cmp-h" truncate>
              مقایسه‌ی {page.def.title}
            </KvTypography>
            <KvTypography as="p" variant="caption" tone="muted">
              {help}
            </KvTypography>
          </div>
        </div>

        {/* خلاصهٔ انتخاب: برچسب + شمارندهٔ کم‌رنگ، زیرش نام‌ها با جداکنندهٔ نقطه‌ای (بدون چیپ). */}
        <section
          aria-label="موارد انتخاب‌شده برای مقایسه"
          className={cn(
            'flex min-w-0 flex-1 flex-col gap-kv-micro sm:max-w-md',
            'rounded-kv-control border border-kv-border-muted bg-kv-surface-subtle px-3.5 py-2.5'
          )}
        >
          <div className="flex items-center justify-between gap-kv-pair">
            <KvTypography
              as="h3"
              variant="label"
              tone="default"
              className="text-sm font-black"
            >
              موارد مقایسه
            </KvTypography>
            {/* خط‌چین کمرنگ بین عنوان و شمارنده */}
            <span
              aria-hidden
              className="h-px min-w-4 flex-1 border-t border-dashed border-kv-border"
            />
            <span
              className="shrink-0 text-sm font-black tabular-nums text-kv-text"
              aria-label={`${toPersianDigits(n)} مورد از ${toPersianDigits(page.compareMax)}`}
            >
              {toPersianDigits(n)} / {toPersianDigits(page.compareMax)}
            </span>
          </div>

          {n > 0 ? (
            <ul
              className={cn(
                'flex min-w-0 flex-wrap items-center gap-y-kv-micro',
                '[&>li:not(:last-child)]:after:mx-1.5 [&>li:not(:last-child)]:after:text-kv-text-faint',
                "[&>li:not(:last-child)]:after:content-['•']"
              )}
            >
              {page.compareDraft.map((id) => (
                <li key={id} className="min-w-0">
                  <KvTypography as="span" variant="caption" tone="muted">
                    {labelById.get(id) ?? id}
                  </KvTypography>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </header>

      {page.compareSelected.length < page.compareMin ? (
        <KvCard
          padding="md"
          className="flex min-h-[calc(100dvh-4rem-(var(--spacing-kv-group)*2)-8rem)] flex-1 flex-col items-center justify-center gap-kv-pair text-center"
        >
          <KvTypography as="h3" variant="subtitle">
            گزارش مقایسه هنوز ساخته نشده است
          </KvTypography>
          <KvTypography as="p" variant="body" tone="muted" className="max-w-[36ch]">
            از فهرست گزارش، {toPersianDigits(page.compareMin)} تا{' '}
            {toPersianDigits(page.compareMax)} مورد را انتخاب کنید و دوباره وارد
            مقایسه شوید.
          </KvTypography>
        </KvCard>
      ) : page.compareItems.length < page.compareMin ? (
        <KvCard
          padding="md"
          className="flex min-h-[calc(100dvh-4rem-(var(--spacing-kv-group)*2)-8rem)] flex-1 flex-col items-center justify-center gap-kv-pair text-center"
        >
          <KvTypography as="h3" variant="subtitle">
            در حال آماده‌سازی گزارش مقایسه
          </KvTypography>
          <KvTypography as="p" variant="body" tone="muted" className="max-w-[36ch]">
            موارد انتخاب‌شده هنوز در جدول بارگذاری نشده‌اند. کمی صبر کنید یا
            دوباره «تأیید و نمایش گزارش» را بزنید.
          </KvTypography>
        </KvCard>
      ) : (
        <div className="flex min-h-0 flex-col gap-kv-group">
          <AppTabs
            value={tab}
            onValueChange={(value) => setTab(value as CompareTab)}
            className="gap-kv-group"
          >
            {/* یک سطر: تب جدول/نمودار سمت راست، تب شاخص‌ها سمت چپ (فقط در تب جدول). */}
            <div className="flex min-w-0 flex-col gap-kv-inline lg:flex-row lg:items-center lg:justify-between">
              <AppTabsList aria-label="نوع نمایش مقایسه">
                {COMPARE_TABS.map(({ id, label }) => (
                  <AppTabsTrigger key={id} value={id}>
                    {label}
                  </AppTabsTrigger>
                ))}
              </AppTabsList>
              {tab === 'table' ? (
                <AppTabs
                  value={metrics.includes(metricTab) ? metricTab : ALL_METRICS}
                  onValueChange={setMetricTab}
                  className="min-w-0 lg:w-auto"
                >
                  <AppTabsList
                    aria-label="شاخص گزارش"
                    className={METRIC_TABS_LIST_CLASS}
                  >
                    <AppTabsTrigger
                      value={ALL_METRICS}
                      className={METRIC_TAB_CLASS}
                    >
                      همه شاخص‌ها
                    </AppTabsTrigger>
                    {metrics.map((key) => (
                      <AppTabsTrigger
                        key={key}
                        value={key}
                        className={METRIC_TAB_CLASS}
                      >
                        {metricTitles[key] ?? key}
                      </AppTabsTrigger>
                    ))}
                  </AppTabsList>
                </AppTabs>
              ) : (
                <AppTabs
                  value={chartMetricKey}
                  onValueChange={setChartMetric}
                  className="min-w-0 lg:w-auto"
                >
                  <AppTabsList
                    aria-label="شاخص نمودار"
                    className={METRIC_TABS_LIST_CLASS}
                  >
                    {metrics.map((key) => (
                      <AppTabsTrigger
                        key={key}
                        value={key}
                        className={METRIC_TAB_CLASS}
                      >
                        {metricTitles[key] ?? key}
                      </AppTabsTrigger>
                    ))}
                  </AppTabsList>
                </AppTabs>
              )}
            </div>
            <AppTabsContent value="table" className="mt-0">
              <ReportCompareMatrix
                items={page.compareItems}
                metrics={shownMetrics}
                metricTitles={metricTitles}
                entityLabel={COMPARE_ENTITY_LABEL[page.slug]}
              />
            </AppTabsContent>
            <AppTabsContent value="chart" className="mt-0">
              <ReportCompareCharts
                items={page.compareItems}
                metrics={metrics}
                metricKey={chartMetricKey}
                metricTitles={metricTitles}
              />
            </AppTabsContent>
          </AppTabs>        </div>
      )}
    </div>
  );
}
