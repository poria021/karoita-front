'use client';

import { useCallback, useMemo, useState } from 'react';

import {
  AppTabs,
  AppTabsContent,
  AppTabsList,
  AppTabsTrigger,
} from '@/components/shared/AppTabs';
import { FaIcon } from '@/components/shared/FaIcon';
import { KarvitaBrandMark } from '@/components/shared/KarvitaBrandMark';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import {
  KvDropdownMenu,
  KvDropdownMenuContent,
  KvDropdownMenuItem,
  KvDropdownMenuLabel,
  KvDropdownMenuSeparator,
  KvDropdownMenuTrigger,
} from '@/components/shared/KvDropdownMenu';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvTypography } from '@/components/shared/KvTypography';
import { ReportCompareCharts } from '@/features/karvita/reports/components/ReportCompareCharts';
import { ReportCompareMatrix } from '@/features/karvita/reports/components/ReportCompareMatrix';
import {
  METRIC_TAB_CLASS,
  METRIC_TABS_LIST_CLASS,
} from '@/features/karvita/reports/components/report-compare-metric-tabs';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import {
  REPORT_COMPARE_PRINT_OPTIONS,
  type ReportComparePrintScope,
} from '@/features/karvita/reports/lib/report-compare-print';
import { cn } from '@/lib/utils';
import type { ReportSlug } from '@/types/report-access';
import { formatJalaliDate } from '@/utils/formatJalaliDate';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareViewProps = {
  page: AdminReportPageModel;
};

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
  /** محدودهٔ پرینت — قبل از window.print ست می‌شود تا شیت چاپ بداند چه چیزی نشان دهد. */
  const [printScope, setPrintScope] =
    useState<ReportComparePrintScope>('table');
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

  /** برچسب دورهٔ انتخاب‌شده در فیلتر گزارش (برای هدر پرینت). */
  const printPeriodLabel = useMemo(() => {
    const semesterId = page.period.semesterId?.trim();
    if (!semesterId) {
      return page.period.mode === 'module' ? 'همه پودمان‌ها' : 'همه نیم‌سال‌ها';
    }
    return (
      page.periodOptions.find((option) => option.value === semesterId)?.label ??
      semesterId
    );
  }, [page.period.mode, page.period.semesterId, page.periodOptions]);

  const printPeriodKindLabel =
    page.period.mode === 'module' ? 'پودمان' : 'نیم‌سال';

  const runPrint = useCallback(
    (scope: ReportComparePrintScope) => {
      setPrintScope(scope);
      // صبر تا React شیت (و نمودار) را mount کند؛ بعد resize برای ResponsiveContainer.
      window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.setTimeout(() => {
          // عنوان تب (`عملکرد … | کارویتا`) در هدر پرینت مرورگر می‌آید و در RTL درهم می‌شود —
          // موقتاً خالی می‌کنیم؛ اطلاعات گزارش داخل خودِ شیت چاپ هست.
          const previousTitle = document.title;
          document.title = ' ';
          let restored = false;
          const restoreTitle = () => {
            if (restored) return;
            restored = true;
            document.title = previousTitle;
            window.removeEventListener('afterprint', restoreTitle);
          };
          window.addEventListener('afterprint', restoreTitle);
          window.print();
          window.setTimeout(restoreTitle, 1500);
        }, 80);
      }, 80);
    },
    []
  );

  const printTitleSuffix =
    printScope === 'chart'
      ? chartMetricKey
        ? ` — ${metricTitles[chartMetricKey] ?? chartMetricKey}`
        : ''
      : printScope === 'table' && metrics.includes(metricTab)
        ? ` — ${metricTitles[metricTab] ?? metricTab}`
        : '';

  return (
    <div
      className="kv-report-compare-print-root flex min-h-0 min-w-0 flex-1 flex-col gap-kv-group overflow-x-hidden"
      data-print-scope={printScope}
    >
      <header
        className={cn(
          'kv-report-compare-no-print flex shrink-0 flex-col gap-kv-group',
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

        {/* خلاصهٔ انتخاب: فقط تعداد موارد (بدون فهرست نام‌ها). */}
        <section
          aria-label="موارد انتخاب‌شده برای مقایسه"
          className={cn(
            'flex min-w-0 flex-1 items-center justify-between gap-kv-pair sm:max-w-md',
            'rounded-kv-control border border-kv-border-muted bg-kv-surface-subtle px-3.5 py-2.5'
          )}
        >
          <KvTypography
            as="h3"
            variant="label"
            tone="default"
            className="text-sm font-black"
          >
            موارد مقایسه
          </KvTypography>
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
        </section>
      </header>

      {page.compareSelected.length < page.compareMin ? (
        <KvCard
          padding="md"
          className="kv-report-compare-no-print flex min-h-[calc(100dvh-4rem-(var(--spacing-kv-group)*2)-8rem)] flex-1 flex-col items-center justify-center gap-kv-pair text-center"
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
          className="kv-report-compare-no-print flex min-h-[calc(100dvh-4rem-(var(--spacing-kv-group)*2)-8rem)] flex-1 flex-col items-center justify-center gap-kv-pair text-center"
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
            fullWidth
            className="gap-kv-group"
          >
            <AppTabsList
              aria-label="نوع نمایش مقایسه"
              className="kv-report-compare-no-print w-full md:w-fit md:self-start"
            >
              {COMPARE_TABS.map(({ id, label }) => (
                <AppTabsTrigger key={id} value={id}>
                  {label}
                </AppTabsTrigger>
              ))}
            </AppTabsList>

            {/* موبایل: سلکت شاخص + پرینت تمام‌عرض؛ md+: چیپ شاخص و پرینت جمع‌وجور */}
            <div
              className={cn(
                'kv-report-compare-no-print flex min-w-0 flex-col gap-kv-inline',
                'md:flex-row md:items-center md:justify-between'
              )}
            >
              {tab === 'table' ? (
                <>
                  <div className="w-full md:hidden">
                    <KvSelect
                      value={
                        metrics.includes(metricTab) ? metricTab : ALL_METRICS
                      }
                      onValueChange={(next) => {
                        if (next) setMetricTab(next);
                      }}
                    >
                      <KvSelectTrigger aria-label="شاخص گزارش">
                        <KvSelectValue placeholder="شاخص گزارش" />
                      </KvSelectTrigger>
                      <KvSelectContent>
                        <KvSelectItem value={ALL_METRICS}>
                          همه شاخص‌ها
                        </KvSelectItem>
                        {metrics.map((key) => (
                          <KvSelectItem key={key} value={key}>
                            {metricTitles[key] ?? key}
                          </KvSelectItem>
                        ))}
                      </KvSelectContent>
                    </KvSelect>
                  </div>
                  <AppTabs
                    value={
                      metrics.includes(metricTab) ? metricTab : ALL_METRICS
                    }
                    onValueChange={setMetricTab}
                    className="hidden min-w-0 flex-1 md:block"
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
                </>
              ) : (
                <>
                  <div className="w-full md:hidden">
                    <KvSelect
                      value={chartMetricKey}
                      onValueChange={(next) => {
                        if (next) setChartMetric(next);
                      }}
                    >
                      <KvSelectTrigger aria-label="شاخص نمودار">
                        <KvSelectValue placeholder="شاخص نمودار" />
                      </KvSelectTrigger>
                      <KvSelectContent>
                        {metrics.map((key) => (
                          <KvSelectItem key={key} value={key}>
                            {metricTitles[key] ?? key}
                          </KvSelectItem>
                        ))}
                      </KvSelectContent>
                    </KvSelect>
                  </div>
                  <AppTabs
                    value={chartMetricKey}
                    onValueChange={setChartMetric}
                    className="hidden min-w-0 flex-1 md:block"
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
                </>
              )}

              <KvDropdownMenu>
                <KvDropdownMenuTrigger asChild>
                  <KvButton
                    type="button"
                    color="neutral"
                    appearance="secondary"
                    size="sm"
                    className="w-full shrink-0 md:w-auto md:self-center"
                    aria-label="پرینت گزارش مقایسه"
                    icon={<FaIcon icon={faIcons.print} size="sm" />}
                  >
                    پرینت
                  </KvButton>
                </KvDropdownMenuTrigger>
                <KvDropdownMenuContent align="end" className="min-w-56">
                  <KvDropdownMenuLabel>چه چیزی چاپ شود؟</KvDropdownMenuLabel>
                  <KvDropdownMenuSeparator />
                  {REPORT_COMPARE_PRINT_OPTIONS.map((option) => (
                    <KvDropdownMenuItem
                      key={option.id}
                      onSelect={() => runPrint(option.id)}
                      className="flex flex-col items-stretch gap-0.5"
                    >
                      <span>{option.label}</span>
                      <span className="text-[0.65rem] font-medium text-kv-text-muted">
                        {option.description}
                      </span>
                    </KvDropdownMenuItem>
                  ))}
                </KvDropdownMenuContent>
              </KvDropdownMenu>
            </div>

            {/* نمایش صفحه — از پرینت حذف می‌شود؛ شیت چاپ جداگانه پایین است. */}
            <AppTabsContent
              value="table"
              className="kv-report-compare-no-print mt-0"
            >
              <ReportCompareMatrix
                items={page.compareItems}
                metrics={shownMetrics}
                metricTitles={metricTitles}
                entityLabel={COMPARE_ENTITY_LABEL[page.slug]}
              />
            </AppTabsContent>
            <AppTabsContent
              value="chart"
              className="kv-report-compare-no-print mt-0"
            >
              <ReportCompareCharts
                items={page.compareItems}
                metrics={metrics}
                metricKey={chartMetricKey}
                metricTitles={metricTitles}
              />
            </AppTabsContent>
          </AppTabs>

          {/* شیت چاپ: هدر لوگو+تاریخ+دوره؛ جدول یکپارچه با تکرار thead در صفحهٔ بعد. */}
          <div
            className="kv-report-compare-print-only kv-report-compare-print-sheet"
            aria-hidden
          >
            {/* RTL: تاریخ/نیم‌سال/نوع گزارش راست، لوگوی کارویتا چپ */}
            <header className="kv-report-compare-print-masthead mb-kv-group flex items-center justify-between gap-kv-group rounded-kv-control border border-kv-border px-kv-group py-kv-pair">
              <div className="flex min-w-0 flex-col gap-0.5 text-start">
                <KvTypography as="p" variant="caption" tone="muted">
                  تاریخ: {formatJalaliDate()}
                </KvTypography>
                <KvTypography as="p" variant="caption" className="font-bold">
                  {printPeriodKindLabel}: {printPeriodLabel}
                </KvTypography>
                <KvTypography as="p" variant="caption" className="font-bold">
                  نوع گزارش: مقایسه‌ی {page.def.title}
                  {printTitleSuffix}
                </KvTypography>
              </div>
              <KarvitaBrandMark className="!size-10 shrink-0 text-kv-brand" />
            </header>

            {/* جدول و نمودار همیشه mount می‌مانند تا Recharts قبل از پرینت اندازه بگیرد؛
                دامنهٔ چاپ با data-print-scope روی ریشه کنترل می‌شود. */}
            <div className="kv-report-compare-print-section kv-report-compare-print-table flex flex-col gap-kv-group">
              <KvTypography
                as="h3"
                variant="subtitle"
                className="kv-report-compare-print-both-label"
              >
                جدول
              </KvTypography>
              <ReportCompareMatrix
                items={page.compareItems}
                metrics={shownMetrics}
                metricTitles={metricTitles}
                entityLabel={COMPARE_ENTITY_LABEL[page.slug]}
                forPrint
              />
            </div>

            <div className="kv-report-compare-print-section kv-report-compare-print-chart flex flex-col gap-kv-group">
              <KvTypography
                as="h3"
                variant="subtitle"
                className="kv-report-compare-print-both-label"
              >
                نمودار
                {chartMetricKey
                  ? ` — ${metricTitles[chartMetricKey] ?? chartMetricKey}`
                  : ''}
              </KvTypography>
              <ReportCompareCharts
                items={page.compareItems}
                metrics={metrics}
                metricKey={chartMetricKey}
                metricTitles={metricTitles}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
