'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { useUserStore } from '@/store/useUserStore';

import { useDailyApprovalsPage } from '../hooks/useDailyApprovalsPage';
import { canDropDailyApprovalTrainee } from '../lib/dailyApprovalsAccess';
import { DailyApprovalDetailPanel } from './DailyApprovalDetailPanel';
import { DailyApprovalsCourseTabs } from './DailyApprovalsCourseTabs';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';
import { DailyApprovalsGuard } from './DailyApprovalsGuard';
import { DailyApprovalsMobileWorkspace } from './DailyApprovalsMobileWorkspace';
import { DailyApprovalsTable } from './DailyApprovalsTable';
import { DailyApprovalsWorkspaceHeader } from './DailyApprovalsWorkspaceHeader';

export function DailyApprovalsPage() {
  const page = useDailyApprovalsPage();
  const role = useUserStore((state) => state.activeUser?.role);
  const canDrop = canDropDailyApprovalTrainee(role);
  const hasActiveFilters =
    page.query.trim().length > 0 || page.readFilter !== 'all';

  const clearFilters = () => {
    page.setQuery('');
    page.changeReadFilter('all');
  };

  const detail = <DailyApprovalDetailPanel trainee={page.selectedTrainee} />;

  const listChrome = (
    <div className="space-y-kv-group">
      <DailyApprovalsFilters
        query={page.query}
        readFilter={page.readFilter}
        onQueryChange={page.setQuery}
        onReadFilterChange={page.changeReadFilter}
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
      <KvSplitWorkspace
        ratio="5/7"
        tabs={
          <DailyApprovalsCourseTabs
            value={page.kind}
            onChange={page.changeKind}
          />
        }
        toolbar={
          <DailyApprovalsWorkspaceHeader
            title="ارزیابی و ممیزی نهایی گزارش‌ها"
            termId={page.termId}
            terms={page.terms}
            onTermChange={page.changeTerm}
          />
        }
        primary={
          <div className="space-y-kv-group">
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
                canDrop={canDrop}
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
              canDrop={canDrop}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          )
        }
      />
    </DailyApprovalsGuard>
  );
}
