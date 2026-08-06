'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';

import { useDailyApprovalsPage } from '../hooks/useDailyApprovalsPage';
import { DailyApprovalDetailPanel } from './DailyApprovalDetailPanel';
import { DailyApprovalsCourseTabs } from './DailyApprovalsCourseTabs';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';
import { DailyApprovalsGuard } from './DailyApprovalsGuard';
import { DailyApprovalsMobileWorkspace } from './DailyApprovalsMobileWorkspace';
import { DailyApprovalsTable } from './DailyApprovalsTable';
import { DailyApprovalsWorkspaceHeader } from './DailyApprovalsWorkspaceHeader';

export function DailyApprovalsPage() {
  const page = useDailyApprovalsPage();
  const hasActiveFilters =
    page.query.trim().length > 0 ||
    page.readFilter !== 'all' ||
    page.course !== 'all';

  const clearFilters = () => {
    page.setQuery('');
    page.changeReadFilter('all');
    page.changeCourse('all');
  };

  const detail = <DailyApprovalDetailPanel trainee={page.selectedTrainee} />;

  const listChrome = (
    <div className="space-y-kv-group">
      <DailyApprovalsFilters
        query={page.query}
        readFilter={page.readFilter}
        course={page.course}
        courseOptions={page.courseOptions}
        onQueryChange={page.setQuery}
        onReadFilterChange={page.changeReadFilter}
        onCourseChange={page.changeCourse}
      />
      {page.error ? (
        <KvAlert
          variant="error"
          title="بارگذاری فهرست کارورزان ناموفق بود"
          description={page.error}
          actions={
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              onClick={page.reload}
            >
              تلاش مجدد
            </KvButton>
          }
        />
      ) : null}
    </div>
  );

  return (
    <DailyApprovalsGuard>
      <div className="space-y-kv-group">
        <DailyApprovalsCourseTabs
          value={page.kind}
          onChange={page.changeKind}
        />

        <KvCard tone="surface" padding="md">
          <KvCardContent padding="none" stacked>
            <DailyApprovalsWorkspaceHeader
              title="ارزیابی و ممیزی نهایی گزارش‌ها"
              termId={page.termId}
              terms={page.terms}
              onTermChange={page.changeTerm}
            />

            <KvSplitWorkspace
              ratio="5/7"
              primary={
                <div className="space-y-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-raised">
                  {listChrome}
                  {page.error ? null : (
                    <DailyApprovalsTable
                      trainees={page.trainees}
                      selectedId={page.selectedTrainee?.id ?? null}
                      resetKey={page.resetKey}
                      isLoading={page.isLoading}
                      isLoadingMore={page.isLoadingMore}
                      hasMore={page.hasMore}
                      loadMoreError={page.loadMoreError}
                      actionBusy={page.actionBusy}
                      hasActiveFilters={hasActiveFilters}
                      onSelect={page.selectTrainee}
                      onDrop={(trainee) => void page.dropTrainee(trainee)}
                      onLoadMore={page.loadMore}
                      onRetryLoadMore={page.retryLoadMore}
                      onClearFilters={clearFilters}
                    />
                  )}
                </div>
              }
              secondary={page.error ? null : detail}
              mobile={
                page.error ? (
                  listChrome
                ) : (
                  <DailyApprovalsMobileWorkspace
                    page={page}
                    hasActiveFilters={hasActiveFilters}
                    onClearFilters={clearFilters}
                  />
                )
              }
            />
          </KvCardContent>
        </KvCard>
      </div>
    </DailyApprovalsGuard>
  );
}
