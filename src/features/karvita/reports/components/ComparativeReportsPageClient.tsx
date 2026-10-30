'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvSelect,
  KvSelectContent,
  KvSelectItem,
  KvSelectTrigger,
  KvSelectValue,
} from '@/components/shared/fields/KvSelect';
import { KvFeatureIntro } from '@/components/shared/shell/KvFeatureIntro';
import { useRegisterPageRefresh } from '@/components/shared/shell/PageRefreshContext';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/role-strategy/helpers';
import { toPersianDigits } from '@/utils/persianDigits';

import { REPORT_FILTER_DEFS } from '../catalog/filters';
import { COMPARATIVE_REPORTS_FEATURE } from '../constants';
import { useComparativeReportsPage } from '../hooks/useComparativeReportsPage';
import { ComparativeEntityPicker } from './ComparativeEntityPicker';
import { ComparativeMetricsChart } from './ComparativeMetricsChart';
import { ReportsFiltersDialog } from './ReportsFiltersDialog';
import { ReportsGuard } from './ReportsGuard';

export function ComparativeReportsPageClient() {
  const page = useComparativeReportsPage();
  useRegisterPageRefresh(() => page.selectReport(page.reportId));

  const roleLabel = page.role
    ? getRoleStrategy(page.role).label
    : '';

  const activeChips = Object.entries(page.applied)
    .filter(([, v]) => Boolean(v))
    .map(([key, value]) => ({
      key,
      label: `${REPORT_FILTER_DEFS[key]?.label ?? key}: ${value}`,
    }));

  return (
    <ReportsGuard>
      <div className="flex flex-col gap-kv-group">
        <div
          data-slot="comparative-reports-workspace-header"
          className="border-b border-kv-border pb-kv-group"
        >
          <KvFeatureIntro
            title={
              page.label
                ? `مقایسه — ${page.label}`
                : COMPARATIVE_REPORTS_FEATURE.title
            }
            description={
              page.compareSpec?.hint ?? COMPARATIVE_REPORTS_FEATURE.description
            }
            actions={
              <>
                <div className="order-1 w-full shrink-0 lg:order-2 lg:min-w-[18rem] lg:max-w-md lg:flex-1">
                  {page.views.length ? (
                    <KvSelect
                      value={page.reportId}
                      onValueChange={page.selectReport}
                    >
                      <KvSelectTrigger
                        aria-label="گزارش قابل‌مقایسه"
                        className="bg-kv-surface !shadow-kv-raised"
                      >
                        <KvSelectValue placeholder="انتخاب گزارش" />
                      </KvSelectTrigger>
                      <KvSelectContent>
                        {page.views.map((view) => (
                          <KvSelectItem key={view.id} value={view.id}>
                            {view.label}
                          </KvSelectItem>
                        ))}
                      </KvSelectContent>
                    </KvSelect>
                  ) : (
                    <div className="flex h-11 items-center rounded-kv-control border border-kv-border bg-kv-surface-muted px-kv-group text-xs font-bold text-kv-text-faint">
                      گزارش مقایسه‌ای برای این نقش نیست
                    </div>
                  )}
                </div>
                <KvButton
                  type="button"
                  appearance="secondary"
                  size="md"
                  className="order-2 lg:order-1"
                  disabled={!page.filterDefs.length}
                  icon={<FaIcon icon={faIcons.sliders} size="xs" />}
                  onClick={page.openFilters}
                >
                  فیلتر مقایسه‌ای
                  {page.activeFilterCount > 0
                    ? ` (${toPersianDigits(page.activeFilterCount)})`
                    : ''}
                </KvButton>
              </>
            }
          />
        </div>

        {page.toast ? (
          <KvAlert variant="info" title={page.toast} />
        ) : null}

        {page.compareSpec ? (
          <KvAlert
            variant="info"
            title={`مقایسه ${page.compareSpec.entityLabel}`}
            description={`شاخص‌ها از همین گزارش گرفته می‌شوند. حداکثر ${toPersianDigits(page.maxEntities)} ${page.compareSpec.entityLabel} قابل انتخاب است. فیلترهای این صفحه فقط محدودهٔ مقایسه را محدود می‌کنند و با فیلتر گزارش پایه یکی نیستند.`}
          />
        ) : null}

        {activeChips.length ? (
          <div className="flex flex-wrap items-center gap-kv-micro">
            {activeChips.map((chip) => (
              <KvButton
                key={chip.key}
                type="button"
                appearance="ghost"
                size="sm"
                onClick={() => page.clearFilter(chip.key)}
              >
                {chip.label} ×
              </KvButton>
            ))}
            <KvButton
              type="button"
              appearance="ghost"
              size="sm"
              onClick={page.clearFilters}
            >
              پاک‌سازی فیلتر مقایسه‌ای
            </KvButton>
          </div>
        ) : null}

        {page.compareSpec ? (
          <div className="grid gap-kv-group lg:grid-cols-[minmax(0,1fr)_16rem]">
            <ComparativeMetricsChart
              entityLabel={page.compareSpec.entityLabel}
              metrics={page.compareSpec.metrics}
              series={page.series}
              minEntities={page.minEntities}
            />
            <ComparativeEntityPicker
              entityLabel={page.compareSpec.entityLabel}
              pool={page.entityPool}
              selectedIds={page.selectedIds}
              maxEntities={page.maxEntities}
              onToggle={page.toggleEntity}
            />
          </div>
        ) : (
          <KvAlert
            variant="warning"
            title="گزارش مقایسه‌ای انتخاب نشده"
            description="از فهرست بالا یک گزارش comparable انتخاب کنید."
          />
        )}
      </div>

      <ReportsFiltersDialog
        open={page.filtersOpen}
        onOpenChange={page.setFiltersOpen}
        dialogTitle="فیلتر گزارش مقایسه‌ای"
        roleLabel={roleLabel}
        reportLabel={`مقایسه · ${page.label}`}
        scopeHint="فیلترهای مقایسه‌ای جدا از گزارش پایه‌اند و فقط استخر موجودیت‌های قابل‌مقایسه را محدود می‌کنند."
        filters={page.filterDefs}
        draft={page.draft}
        onDraftChange={(key, value) =>
          page.setDraft((prev) => ({ ...prev, [key]: value }))
        }
        onApply={page.applyFilters}
        onReset={() => {
          const next: Record<string, string> = {};
          page.filterKeys.forEach((k) => {
            next[k] = '';
          });
          page.setDraft(next);
        }}
      />
    </ReportsGuard>
  );
}
