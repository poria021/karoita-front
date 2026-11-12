'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/fields/KvFilterBar';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { Badge } from '@/components/ui/badge';
import { FILTER_LABELS } from '@/features/karvita/reports/constants';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import type { ReportFilterKey } from '@/types/reports';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';
import { cn } from '@/lib/utils';

const ALL_VALUE = 'all';

type ReportToolbarProps = {
  page: AdminReportPageModel;
};

function FilterSelect({
  filterKey,
  page,
}: {
  filterKey: ReportFilterKey;
  page: AdminReportPageModel;
}) {
  const raw = page.filters[filterKey] ?? '';
  const val = raw || ALL_VALUE;
  const opts = page.filterOptions[filterKey] ?? [];
  return (
    <KvSelectField
      label={false}
      placeholder={FILTER_LABELS[filterKey]}
      value={val}
      onValueChange={(next) =>
        page.setFilter(filterKey, next === ALL_VALUE ? '' : next)
      }
      displayValue={
        raw
          ? (opts.find((o) => o.value === raw)?.label ?? raw)
          : FILTER_LABELS[filterKey]
      }
      triggerClassName={cn(
        raw &&
          'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg'
      )}
    >
      <KvSelectItem value={ALL_VALUE}>همه</KvSelectItem>
      {opts.map((o) => (
        <KvSelectItem key={o.value} value={o.value}>
          {o.label}
        </KvSelectItem>
      ))}
    </KvSelectField>
  );
}

export function ReportToolbar({ page }: ReportToolbarProps) {
  const adv = page.advKeys;

  return (
    <KvFilterBar>
      <KvFilterBarSearch className="max-w-sm flex-none sm:w-72">
        <KvSearchField
          label={false}
          placeholder={page.def.placeholder}
          value={page.query}
          onChange={(e) => page.setQuery(e.target.value)}
          onClear={() => page.setQuery('')}
          aria-label="جستجو"
        />
      </KvFilterBarSearch>

      {adv.length === 1 ? (
        <KvFilterBarControl width="md">
          <FilterSelect filterKey={adv[0]!} page={page} />
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
            page.activeAdvCount > 0 &&
              'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg'
          )}
        >
          فیلتر پیشرفته
          {page.activeAdvCount > 0 ? (
            <Badge variant="brand" className="ms-1 size-[1.125rem] justify-center p-0">
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
          onClick={page.clearFilters}
        >
          پاک کردن فیلترها
        </KvButton>
      ) : null}

      <div className="ms-auto flex w-full flex-wrap gap-kv-pair sm:w-auto">
        {page.canCompare ? (
          <KvButton
            type="button"
            appearance="secondary"
            color="neutral"
            onClick={() => void page.enterCompare()}
            className={cn(
              page.compareSelected.length > 0 &&
                'border-kv-brand-border bg-kv-brand-soft text-kv-brand-soft-fg'
            )}
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
          appearance="secondary"
          color="neutral"
          icon={<FaIcon icon={faIcons.download} size="sm" />}
          onClick={() => page.exportStub('PDF')}
        >
          دانلود PDF
        </KvButton>
        <KvButton
          type="button"
          appearance="secondary"
          color="neutral"
          icon={<FaIcon icon={faIcons.download} size="sm" />}
          onClick={() => page.exportStub('اکسل')}
        >
          دانلود اکسل
        </KvButton>
      </div>
    </KvFilterBar>
  );
}
