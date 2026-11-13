'use client';

import { useMemo } from 'react';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvSearchableOrganizationSelect } from '@/components/shared/fields/KvSearchableOrganizationSelect';
import { KvTypography } from '@/components/shared/KvTypography';
import { MockDataBadge } from '@/components/shared/MockDataBadge';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { ReportCompareItemCards } from '@/features/karvita/reports/components/ReportCompareItemCards';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';

type ReportCompareViewProps = {
  page: AdminReportPageModel;
};

const SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
];

function candidateLabel(row: { name?: unknown }): string {
  return String(row.name ?? '').trim();
}

export function ReportCompareView({ page }: ReportCompareViewProps) {
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
          : 'گزارش مطابق انتخاب شما نمایش داده شده است.';

  const pickOptions = useMemo(
    () =>
      page.compareCandidates.map((row) => ({
        id: row.id,
        label: candidateLabel(row),
      })),
    [page.compareCandidates]
  );

  const metrics = useMemo(() => {
    const keys = new Set<string>();
    page.compareItems.forEach((item) => {
      Object.keys(item.metrics).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [page.compareItems]);

  const metricTitles: Record<string, string> = {
    att: 'درصد حضور جلسات',
    resp: 'نرخ پاسخ‌دهی به گزارش‌ها',
    score: 'میانگین نمره فراگیران',
    days: 'میانگین روزهای حضور نسبت به کل جلسات',
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-kv-group">
      <header className="shrink-0">
        <KvCard
          padding="sm"
          className={cn(
            'flex flex-col gap-kv-group border-kv-border !shadow-none',
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
              <div className="flex min-w-0 max-w-full items-center gap-kv-pair">
                <KvTypography as="h2" variant="title" id="cmp-h" truncate>
                  مقایسه‌ی {page.def.title}
                </KvTypography>
                <MockDataBadge />
              </div>
              <KvTypography as="p" variant="caption" tone="muted">
                {help}
              </KvTypography>
              <KvTypography as="p" variant="caption" className="font-extrabold">
                انتخاب موارد:{' '}
                <span className="font-bold text-kv-text-muted">
                  {toPersianDigits(n)} از {toPersianDigits(page.compareMax)}
                </span>
              </KvTypography>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-kv-pair sm:max-w-sm sm:border-s sm:border-kv-border-muted sm:ps-kv-group">
            <KvSearchableOrganizationSelect
              multi
              label={false}
              placeholder="جستجو و انتخاب…"
              value={page.compareDraft}
              options={pickOptions}
              maxSelected={page.compareMax}
              allowEmpty
              emptyLabel="موردی یافت نشد."
              onChange={page.setCompareDraftIds}
            />

            <div className="flex items-center gap-kv-pair">
              <KvButton
                type="button"
                color="neutral"
                appearance="secondary"
                size="sm"
                aria-label="پاک کردن انتخاب"
                disabled={n === 0}
                icon={<FaIcon icon={faIcons.trashCan} size="sm" />}
                onClick={page.clearCompareDraft}
              />
              <KvButton
                type="button"
                size="sm"
                className="min-w-0 flex-1"
                disabled={n < page.compareMin || !dirty}
                icon={<FaIcon icon={faIcons.check} size="sm" />}
                onClick={() => void page.confirmCompare()}
              >
                تأیید و نمایش گزارش
              </KvButton>
            </div>
          </div>
        </KvCard>
      </header>

      {page.compareItems.length < page.compareMin ? (
        <KvCard
          padding="md"
          className="flex min-h-[calc(100dvh-4rem-(var(--spacing-kv-group)*2)-8rem)] flex-1 flex-col items-center justify-center gap-kv-pair text-center"
        >
          <KvTypography as="h3" variant="subtitle">
            گزارش مقایسه هنوز ساخته نشده است
          </KvTypography>
          <KvTypography as="p" variant="body" tone="muted" className="max-w-[36ch]">
            از سلکت بالا {toPersianDigits(page.compareMin)} تا{' '}
            {toPersianDigits(page.compareMax)} مورد را انتخاب کنید و «تأیید و
            نمایش گزارش» را بزنید.
          </KvTypography>
        </KvCard>
      ) : (
        <div className="flex min-h-0 flex-col gap-kv-group">
          <div
            className="flex flex-wrap gap-kv-group"
            role="list"
            aria-label="موارد مقایسه‌شده"
          >
            {page.compareItems.map((item, i) => (
              <span
                key={item.id}
                role="listitem"
                className="inline-flex items-center gap-2 text-[0.8125rem] font-bold"
              >
                <i
                  className="inline-block size-2.5 rounded-sm"
                  style={{ background: SERIES[i % SERIES.length] }}
                  aria-hidden
                />
                {item.name}
              </span>
            ))}
          </div>

          {/* تبلت و موبایل: کارت برای هر مورد؛ دسکتاپ: جدول شاخص × مورد */}
          <ReportCompareItemCards
            className="lg:hidden"
            items={page.compareItems}
            metrics={metrics}
            metricTitles={metricTitles}
            series={SERIES}
          />

          <div className="hidden overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft lg:block">
            <KvTable>
              <KvTableHeader>
                <KvTableRow>
                  <KvTableHead>شاخص</KvTableHead>
                  {page.compareItems.map((item, i) => (
                    <KvTableHead key={item.id}>
                      <span className="inline-flex items-start gap-2">
                        <i
                          className="mt-1 inline-block size-2.5 shrink-0 rounded-sm"
                          style={{ background: SERIES[i % SERIES.length] }}
                          aria-hidden
                        />
                        {item.name}
                      </span>
                    </KvTableHead>
                  ))}
                </KvTableRow>
              </KvTableHeader>
              <KvTableBody>
                {metrics.map((key) => {
                  const values = page.compareItems.map(
                    (item) => item.metrics[key] ?? 0
                  );
                  const best = Math.max(...values);
                  return (
                    <KvTableRow key={key}>
                      <KvTableCell className="font-bold text-kv-text-muted">
                        {metricTitles[key] ?? key}
                      </KvTableCell>
                      {page.compareItems.map((item) => {
                        const v = item.metrics[key] ?? 0;
                        return (
                          <KvTableCell key={item.id}>
                            <span
                              className={cn(
                                'font-black tabular-nums',
                                v === best &&
                                  values.filter((x) => x === best).length === 1
                                  ? 'text-kv-success-soft-fg'
                                  : 'text-kv-text'
                              )}
                            >
                              {toPersianDigits(v)}٪
                            </span>
                          </KvTableCell>
                        );
                      })}
                    </KvTableRow>
                  );
                })}
                {page.compareItems[0]?.info.map((_, infoIdx) => (
                  <KvTableRow key={`info-${infoIdx}`}>
                    <KvTableCell className="text-kv-text-muted">
                      {page.compareItems[0]?.info[infoIdx]?.label}
                    </KvTableCell>
                    {page.compareItems.map((item) => (
                      <KvTableCell key={item.id}>
                        {item.info[infoIdx]?.value ?? '—'}
                      </KvTableCell>
                    ))}
                  </KvTableRow>
                ))}
              </KvTableBody>
            </KvTable>
          </div>

          <div className="grid gap-kv-group md:grid-cols-2">
            {metrics.map((key) => {
              const values = page.compareItems.map(
                (item) => item.metrics[key] ?? 0
              );
              const best = Math.max(...values);
              return (
                <KvCard key={key} padding="md">
                  <KvTypography as="h3" variant="subtitle">
                    {metricTitles[key] ?? key}
                  </KvTypography>
                  <div
                    className="mt-kv-inline grid items-end gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${page.compareItems.length}, minmax(0, 1fr))`,
                      height: '14rem',
                    }}
                  >
                    {page.compareItems.map((item, i) => {
                      const v = item.metrics[key] ?? 0;
                      return (
                        <div
                          key={item.id}
                          className="flex h-full flex-col items-center justify-end gap-1"
                        >
                          <b
                            className={cn(
                              'text-[0.8125rem] font-black tabular-nums',
                              v === best
                                ? 'text-kv-success-soft-fg'
                                : 'text-kv-text'
                            )}
                          >
                            {toPersianDigits(v)}٪
                          </b>
                          <i
                            className="block w-[70%] max-w-15 rounded-t"
                            style={{
                              height: `${Math.max(4, v)}%`,
                              background: SERIES[i % SERIES.length],
                            }}
                            aria-hidden
                          />
                          <span className="truncate text-center text-xs font-bold text-kv-text-secondary">
                            {item.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </KvCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
