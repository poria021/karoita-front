'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/fields/KvFilterBar';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { Badge } from '@/components/ui/badge';
import {
  COMPARE_REPORT_SLUGS,
  FILTER_LABELS,
  REPORT_COMPARE_ENABLED,
} from '@/features/karvita/reports/constants';
import { ReportSearchableFilterField } from '@/features/karvita/reports/components/ReportSearchableFilterField';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';
import { cn } from '@/lib/utils';


type ReportToolbarProps = {
  page: AdminReportPageModel;
};

/** هدف لمس راحت زیر `lg` (موبایل و تبلت)؛ دسکتاپ همان ارتفاع قبلی. */
const TOUCH = 'max-lg:min-h-11';

export function ReportToolbar({ page }: ReportToolbarProps) {
  const adv = page.advKeys;
  const singleKey = adv.length === 1 ? adv[0]! : null;

  return (
    <div
      data-slot="kv-filter-bar"
      className="flex w-full flex-col gap-kv-inline lg:flex-row lg:items-center lg:gap-kv-pair"
    >
      {/* ردیف فیلترها: موبایل ستونی، تبلت یک ردیف با wrap، دسکتاپ مثل قبل */}
      <div className="flex min-w-0 flex-col gap-kv-pair sm:flex-row sm:flex-wrap sm:items-center lg:flex-1 lg:flex-nowrap">
        <KvFilterBarSearch className="sm:min-w-56 lg:max-w-sm lg:w-72 lg:flex-none">
          <KvSearchField
            label={false}
            placeholder={page.def.placeholder}
            value={page.query}
            onChange={(e) => page.setQuery(e.target.value)}
            onClear={() => page.setQuery('')}
            aria-label="جستجو"
          />
        </KvFilterBarSearch>

        {singleKey ? (
          <KvFilterBarControl width="md">
            <ReportSearchableFilterField
              label={false}
              placeholder={FILTER_LABELS[singleKey]}
              value={page.filters[singleKey] ?? ''}
              options={page.filterOptions[singleKey] ?? []}
              onChange={(next) => page.setFilter(singleKey, next)}
            />
          </KvFilterBarControl>
        ) : null}

        {adv.length > 1 ? (
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            icon={<FaIcon icon={faIcons.sliders} size="sm" />}
            onClick={() => page.setAdvOpen(true)}
            className={cn(
              'w-full sm:w-auto',
              TOUCH,
              page.activeAdvCount > 0 &&
                'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg'
            )}
          >
            فیلتر پیشرفته
            {page.activeAdvCount > 0 ? (
              <Badge
                variant="brand"
                className="ms-1 size-[1.125rem] justify-center p-0"
              >
                {toPersianDigits(page.activeAdvCount)}
              </Badge>
            ) : null}
          </KvButton>
        ) : null}

        {page.anyFilterActive ? (
          <KvButton
            type="button"
            appearance="ghost"
            color="neutral"
            className={cn('w-full sm:w-auto', TOUCH)}
            onClick={page.clearFilters}
          >
            پاک کردن فیلترها
          </KvButton>
        ) : null}
      </div>

      {/* اکشن‌ها: زیر lg گرید هم‌اندازه (هم‌عرض با ردیف بالا)، دسکتاپ flex انتهای نوار */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-kv-pair lg:ms-auto lg:flex lg:flex-nowrap">
        {REPORT_COMPARE_ENABLED &&
        COMPARE_REPORT_SLUGS.includes(page.slug) ? (
          <KvButton
            type="button"
            color="cta"
            appearance="ghost"
            size="sm"
            icon={<FaIcon icon={faIcons.codeCompare} size="sm" />}
            className={cn('w-full lg:w-auto', TOUCH)}
            disabled={!page.canCompare}
            onClick={() => page.enterCompare()}
          >
            مقایسه
            {page.compareSelected.length > 0 ? (
              <Badge
                variant="brand"
                className="ms-1 size-[1.125rem] justify-center p-0"
              >
                {toPersianDigits(page.compareSelected.length)}
              </Badge>
            ) : null}
          </KvButton>
        ) : null}
        <KvButton
          type="button"
          color="error"
          appearance="ghost"
          size="sm"
          icon={<FaIcon icon={faIcons.filePdf} size="sm" />}
          className={cn('w-full lg:w-auto', TOUCH)}
          onClick={() => page.exportStub('PDF')}
        >
          <span className="max-sm:hidden">دانلود </span>PDF
        </KvButton>
        <KvButton
          type="button"
          color="success"
          appearance="ghost"
          size="sm"
          icon={<FaIcon icon={faIcons.fileExcel} size="sm" />}
          className={cn('w-full lg:w-auto', TOUCH)}
          onClick={() => page.exportStub('اکسل')}
        >
          <span className="max-sm:hidden">دانلود </span>اکسل
        </KvButton>
      </div>
    </div>
  );
}
