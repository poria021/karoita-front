'use client';

import { KvButton } from '@/components/shared/KvButton';
import { useRegisterPageRefresh } from '@/components/shared/shell/PageRefreshContext';
import { getRoleStrategy } from '@/utils/role-strategy/helpers';

import { REPORT_FILTER_DEFS } from '../catalog/filters';
import { REPORTS_FEATURE } from '../constants';
import { useReportsPage } from '../hooks/useReportsPage';
import { ReportsFiltersDialog } from './ReportsFiltersDialog';
import { ReportsGuard } from './ReportsGuard';
import { ReportsMobileList } from './ReportsMobileList';
import { ReportsTable } from './ReportsTable';
import { ReportsWorkspaceHeader } from './ReportsWorkspaceHeader';

export function ReportsPageClient() {
  const page = useReportsPage();
  useRegisterPageRefresh(() => page.selectReport(page.reportId));

  const roleLabel = page.role
    ? getRoleStrategy(page.role)?.label ?? page.role
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
        <ReportsWorkspaceHeader
          title={page.label || REPORTS_FEATURE.title}
          description={
            page.report?.summary ?? REPORTS_FEATURE.description
          }
          views={page.views}
          reportId={page.reportId}
          onReportChange={page.selectReport}
          activeFilterCount={page.activeFilterCount}
          filterCount={page.filterDefs.length}
          onOpenFilters={page.openFilters}
          onExport={() => {
            /* خروجی اکسل بعداً به سرویس واقعی وصل می‌شود */
          }}
        />

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
              پاک‌سازی
            </KvButton>
          </div>
        ) : null}

        <ReportsTable
          columns={page.columns}
          rows={page.rows}
          isLoading={page.isLoading}
          resetKey={`${page.role ?? ''}::${page.reportId}`}
          hasActiveFilters={page.activeFilterCount > 0}
          onClearFilters={page.clearFilters}
        />

        <ReportsMobileList
          columns={page.columns}
          rows={page.rows}
          isLoading={page.isLoading}
          hasActiveFilters={page.activeFilterCount > 0}
          onClearFilters={page.clearFilters}
        />
      </div>

      <ReportsFiltersDialog
        open={page.filtersOpen}
        onOpenChange={page.setFiltersOpen}
        dialogTitle="فیلتر گزارش پایه"
        roleLabel={roleLabel}
        reportLabel={page.label}
        scopeHint="فیلترهای گزارش پایه — جدا از فیلترهای صفحهٔ مقایسه‌ای."
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
