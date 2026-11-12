'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvFilterBar,
  KvFilterBarControl,
  KvFilterBarSearch,
} from '@/components/shared/fields/KvFilterBar';
import { KvSearchField } from '@/components/shared/fields/KvSearchField';
import { Badge } from '@/components/ui/badge';
import { FILTER_LABELS } from '@/features/karvita/reports/constants';
import { ReportSearchableFilterField } from '@/features/karvita/reports/components/ReportSearchableFilterField';
import type { AdminReportPageModel } from '@/features/karvita/reports/hooks/useAdminReportPage';
import { toPersianDigits } from '@/utils/persianDigits';
import { faIcons } from '@/utils/iconMap';
import { cn } from '@/lib/utils';


type ReportToolbarProps = {
  page: AdminReportPageModel;
};

export function ReportToolbar({ page }: ReportToolbarProps) {
  const adv = page.advKeys;
  const singleKey = adv.length === 1 ? adv[0]! : null;

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
            color="cta"
            appearance="ghost"
            size="sm"
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
          onClick={() => page.exportStub('PDF')}
        >
          دانلود PDF
        </KvButton>
        <KvButton
          type="button"
          color="success"
          appearance="ghost"
          size="sm"
          icon={<FaIcon icon={faIcons.fileExcel} size="sm" />}
          onClick={() => page.exportStub('اکسل')}
        >
          دانلود اکسل
        </KvButton>
      </div>
    </KvFilterBar>
  );
}
