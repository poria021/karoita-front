'use client';

import { useMemo } from 'react';

import { KvBarChart } from '@/components/shared/KvBarChart';
import { KvCard } from '@/components/shared/KvCard';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type { ReportCompareItem } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';

type ReportCompareChartsProps = {
  items: ReportCompareItem[];
  /** کلید شاخص‌ها به همان ترتیب جدول مقایسه. */
  metrics: string[];
  /** شاخص انتخاب‌شده؛ دکمه‌هایش در سطر بالای صفحهٔ مقایسه است. */
  metricKey: string;
  /** عنوان کامل هر شاخص (کارت‌ها و تولتیپ). */
  metricTitles: Record<string, string>;
  className?: string;
  /** عنوان کارت (پیش‌فرض: مقایسهٔ میله‌ای شاخص‌ها). */
  title?: string;
  yDomain?: [number, number];
  yTicks?: number[];
  /** قالب مقدار؛ پیش‌فرض درصد. */
  formatValue?: (value: number) => string;
  barSize?: number;
  /** حداقل ارتفاع نمودار (px). */
  chartHeight?: number;
  /**
   * وقتی کارت از بیرون کش می‌آید (مثلاً سلول `stretch` میز کار)، نمودار هم
   * بلند می‌شود و فضای خالیِ زیرش را پر می‌کند؛ `chartHeight` حداقل می‌ماند.
   * پیش‌فرض: خاموش — صفحهٔ مقایسه همان رفتار قبلی را دارد.
   */
  fillHeight?: boolean;
  /**
   * وقتی داده شود، میله‌ها به‌جای رنگ‌های دسته‌ایِ متفاوت (برای زمینه‌های
   * رسمی که تنوعِ رنگی نمی‌خواهند)، هر کدام یک تُنِ متفاوت از همین رنگ پایه
   * می‌گیرند (تیره تا روشن) — راهنمای رنگ هم‌چنان نشان داده می‌شود.
   * پیش‌فرض: بدون آن، رفتار قبلی (رنگ هر مورد از `ITEM_COLORS`) دست‌نخورده می‌ماند.
   */
  brandToneBase?: string;
  /**
   * سبک باکس‌های میز کار: بدون سایه و با بردر نرم، هم‌شکل بقیهٔ باکس‌ها.
   * پیش‌فرض: خاموش — صفحهٔ مقایسه همان کارت معمولی را دارد.
   */
  flat?: boolean;
};

const BAR_CHART_HEIGHT = 300;
const PCT_TICKS = [0, 25, 50, 75, 100];

/** رنگ هر مورد (به ترتیب انتخاب)؛ توکن‌ها در globals.css. */
const ITEM_COLORS = Array.from(
  { length: 10 },
  (_, i) => `var(--kv-chart-cat-${i + 1})`
);

function itemColor(index: number): string {
  return ITEM_COLORS[index % ITEM_COLORS.length] ?? 'var(--kv-brand)';
}

/**
 * تُنِ شمارهٔ `index` از رنگ پایه (تیره‌ترین اول، روشن‌ترین آخر) — با
 * `color-mix` روی همان رنگ، بدون ساختن رنگ‌های کاملاً جدا از برند.
 */
export function brandTone(base: string, index: number, total: number): string {
  if (total <= 1) return base;
  // از ~۱۵٪ تیره‌تر تا ~۶۰٪ روشن‌تر، به‌ترتیب پخش روی تعداد موارد.
  const step = index / (total - 1); // 0..1
  if (step <= 0.5) {
    const darkenBy = Math.round((0.5 - step) * 2 * 30); // تا ۳۰٪ سیاه
    return `color-mix(in oklab, ${base} ${100 - darkenBy}%, black ${darkenBy}%)`;
  }
  const lightenBy = Math.round((step - 0.5) * 2 * 60); // تا ۶۰٪ سفید
  return `color-mix(in oklab, ${base} ${100 - lightenBy}%, white ${lightenBy}%)`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** عدد درصد برای نمایش: صحیح همان‌طور، اعشاری تا یک رقم. */
function formatPct(value: number): string {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
  return `${toPersianDigits(rounded)}٪`;
}

/**
 * نمودار صفحهٔ مقایسه: نمودار میله‌ای نازک برای یک شاخص؛
 * شاخص را کاربر از دکمه‌های سطر بالای صفحه (کنار تب جدول/نمودار) انتخاب می‌کند.
 */
export function ReportCompareCharts({
  items,
  metrics,
  metricKey,
  metricTitles,
  className,
  title = 'مقایسهٔ میله‌ای شاخص‌ها',
  yDomain,
  yTicks = PCT_TICKS,
  formatValue = formatPct,
  barSize = 10,
  chartHeight = BAR_CHART_HEIGHT,
  fillHeight = false,
  brandToneBase,
  flat = false,
}: ReportCompareChartsProps) {
  const metricLabel = metricTitles[metricKey] ?? metricKey;
  const colorFor = (index: number) =>
    brandToneBase ? brandTone(brandToneBase, index, items.length) : itemColor(index);

  const rows = useMemo(
    () =>
      items.map((item, index) => {
        const value = item.metrics[metricKey];
        return {
          name: item.name,
          color: colorFor(index),
          value:
            typeof value === 'number' && Number.isFinite(value) ? value : null,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, metricKey, brandToneBase]
  );

  if (items.length === 0 || metrics.length === 0) return null;

  return (
    <section
      aria-label="نمودار مقایسه"
      className={cn('flex h-full min-w-0 flex-col gap-kv-group', className)}
    >
      <KvCard
        padding="md"
        className={cn(
          'flex h-full min-w-0 flex-col gap-kv-group rounded-kv-shell',
          flat && 'border-kv-border/70 shadow-none'
        )}
      >
        <header className="flex min-w-0 flex-col gap-kv-micro">
          <div className="flex min-w-0 flex-col gap-kv-micro">
            <KvTypography as="h3" variant="subtitle">
              {title}
            </KvTypography>
            <ul
              className="kv-report-compare-chart-legend flex min-w-0 items-center gap-x-3 overflow-x-auto whitespace-nowrap [scrollbar-width:thin]"
              aria-label="راهنمای رنگ موارد"
            >
              {items.map((item, index) => (
                <li key={item.id} className="inline-flex shrink-0 items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: colorFor(index) }}
                  />
                  <KvTypography as="span" variant="caption" tone="muted">
                    {item.name}
                  </KvTypography>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <KvBarChart
          rows={rows}
          xKey="name"
          valueKey="value"
          valueLabel={metricLabel}
          colorKey="color"
          height={chartHeight}
          className={fillHeight ? 'flex-1' : undefined}
          barSize={barSize}
          yDomain={yDomain}
          yTicks={yTicks}
          ariaLabel={`نمودار میله‌ای ${metricLabel}`}
          formatValue={formatValue}
          xTickFormatter={(value) => truncate(String(value), 14)}
        />
      </KvCard>
    </section>
  );
}
