'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent, KvCardHeader, KvCardTitle } from '@/components/shared/KvCard';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvTypography } from '@/components/shared/KvTypography';
import {
  KvTable,
  KvTableBody,
  KvTableCell,
  KvTableHead,
  KvTableHeader,
  KvTableRow,
} from '@/components/shared/table/KvTable';
import { Checkbox } from '@/components/ui/checkbox';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { cn } from '@/lib/utils';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';
import { useMemo } from 'react';

type ReportCompareViewProps = {
  page: AdminReportPageModel;
};

const SERIES = [
  'hsl(220 85% 58%)',
  'hsl(160 58% 42%)',
  'hsl(35 92% 52%)',
  'hsl(290 55% 62%)',
];

export function ReportCompareView({ page }: ReportCompareViewProps) {
  const n = page.compareDraft.length;
  const dirty =
    page.compareDraft.length !== page.compareSelected.length ||
    page.compareDraft.some((id) => !page.compareSelected.includes(id));

  const help =
    n < page.compareMin
      ? `حداقل ${toPersianDigits(page.compareMin)} مورد را انتخاب کنید.`
      : n >= page.compareMax
        ? `به سقف ${toPersianDigits(page.compareMax)} مورد رسیده‌اید؛ برای افزودن مورد دیگر، یکی را بردارید.`
        : dirty
          ? 'برای دیدن گزارش، تأیید را بزنید.'
          : 'گزارش مطابق انتخاب شما نمایش داده شده است.';

  const filtered = useMemo(() => {
    const q = page.compareQ.trim().toLowerCase();
    if (!q) return page.compareCandidates;
    return page.compareCandidates.filter((r) =>
      String(r.name ?? '')
        .toLowerCase()
        .includes(q)
    );
  }, [page.compareCandidates, page.compareQ]);

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
    <div className="grid grid-cols-1 gap-kv-group xl:grid-cols-[minmax(0,1fr)_19.5rem]">
      <div className="flex min-w-0 flex-col gap-kv-group">
        <div className="flex flex-wrap items-start gap-kv-group">
          <div className="flex min-w-0 flex-1 flex-col gap-kv-micro">
            <KvTypography as="h2" variant="title" id="cmp-h">
              مقایسه‌ی {page.def.title}
            </KvTypography>
            <KvTypography as="p" variant="caption" tone="muted">
              {help}
            </KvTypography>
          </div>
          <div className="flex flex-wrap gap-kv-pair">
            <KvButton
              type="button"
              appearance="secondary"
              color="neutral"
              onClick={page.exitCompare}
            >
              بازگشت
            </KvButton>
            <KvButton
              type="button"
              appearance="secondary"
              color="neutral"
              icon={<FaIcon icon={faIcons.download} size="sm" />}
              onClick={() => page.exportCompareStub('PDF')}
            >
              PDF
            </KvButton>
            <KvButton
              type="button"
              appearance="secondary"
              color="neutral"
              icon={<FaIcon icon={faIcons.download} size="sm" />}
              onClick={() => page.exportCompareStub('اکسل')}
            >
              اکسل
            </KvButton>
          </div>
        </div>

        {page.compareItems.length < page.compareMin ? (
          <KvCard padding="md">
            <KvTypography as="h3" variant="subtitle">
              گزارش مقایسه هنوز ساخته نشده است
            </KvTypography>
            <KvTypography as="p" variant="body" tone="muted" className="mt-2">
              از فهرست کنار صفحه {toPersianDigits(page.compareMin)} تا{' '}
              {toPersianDigits(page.compareMax)} مورد را تیک بزنید و «تأیید و
              نمایش گزارش» را بزنید.
            </KvTypography>
          </KvCard>
        ) : (
          <>
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

            <div className="overflow-hidden rounded-kv-shell border border-kv-border/70 bg-kv-surface shadow-kv-soft">
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
          </>
        )}
      </div>

      <KvCard className="flex max-h-[calc(100dvh-6rem)] flex-col overflow-hidden xl:sticky xl:top-20">
        <KvCardHeader bordered className="flex flex-row items-center justify-between gap-kv-inline px-kv-group py-kv-inline">
          <KvCardTitle>انتخاب موارد</KvCardTitle>
          <KvTypography as="span" variant="caption" tone="muted">
            {toPersianDigits(n)} از {toPersianDigits(page.compareMax)}
          </KvTypography>
        </KvCardHeader>
        <div className="border-b border-kv-border-muted p-kv-pair">
          <KvSearchField
            label={false}
            placeholder="جستجو…"
            value={page.compareQ}
            onChange={(e) => page.setCompareQ(e.target.value)}
            onClear={() => page.setCompareQ('')}
          />
        </div>
        <KvCardContent
          padding="sm"
          className="min-h-28 flex-1 space-y-kv-micro overflow-y-auto p-kv-pair"
        >
          {filtered.map((row) => {
            const on = page.compareDraft.includes(row.id);
            const blocked =
              !on && page.compareDraft.length >= page.compareMax;
            const k = page.compareDraft.indexOf(row.id);
            return (
              <label
                key={row.id}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center gap-3 rounded-kv-control border px-3 py-1.5',
                  on
                    ? 'border-kv-brand-border bg-kv-brand-soft'
                    : 'border-transparent hover:bg-kv-surface-muted',
                  blocked && 'cursor-not-allowed opacity-50'
                )}
              >
                <Checkbox
                  checked={on}
                  disabled={blocked}
                  onCheckedChange={(checked) =>
                    page.toggleCompareDraft(row.id, checked === true)
                  }
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-bold">
                    {String(row.name ?? '')}
                  </span>
                  {row.facName || row.schoolName ? (
                    <span className="block truncate text-xs text-kv-text-faint">
                      {String(row.facName ?? row.schoolName ?? '')}
                    </span>
                  ) : null}
                </span>
                {on ? (
                  <i
                    className="size-2.5 shrink-0 rounded-sm"
                    style={{ background: SERIES[k % SERIES.length] }}
                    aria-hidden
                  />
                ) : null}
              </label>
            );
          })}
        </KvCardContent>
        <div className="flex flex-col gap-kv-pair border-t border-kv-border-muted bg-kv-surface p-kv-inline">
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            fullWidth
            onClick={page.clearCompareDraft}
          >
            پاک کردن انتخاب
          </KvButton>
          <KvButton
            type="button"
            fullWidth
            disabled={n < page.compareMin || !dirty}
            icon={<FaIcon icon={faIcons.check} size="sm" />}
            onClick={() => void page.confirmCompare()}
          >
            تأیید و نمایش گزارش
          </KvButton>
        </div>
      </KvCard>
    </div>
  );
}
