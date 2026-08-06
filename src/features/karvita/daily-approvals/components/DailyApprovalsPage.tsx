'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';

import { useDailyApprovalsPage } from '../hooks/useDailyApprovalsPage';
import { DailyApprovalDetailPanel } from './DailyApprovalDetailPanel';
import { DailyApprovalsCourseTabs } from './DailyApprovalsCourseTabs';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';
import { DailyApprovalsGuard } from './DailyApprovalsGuard';
import { DailyApprovalsMobileWorkspace } from './DailyApprovalsMobileWorkspace';
import { DailyApprovalsTable } from './DailyApprovalsTable';

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

  const detail = (
    <DailyApprovalDetailPanel
      trainee={page.selectedTrainee}
      selectedWeek={page.selectedWeek}
      advisorFeedback={page.advisorFeedback}
      scoreInput={page.scoreInput}
      actionBusy={page.actionBusy}
      onSelectWeek={(week) => {
        if (!page.selectedTrainee) return;
        void page.selectWeek(page.selectedTrainee, week);
      }}
      onAdvisorFeedbackChange={page.setAdvisorFeedback}
      onScoreInputChange={page.setScoreInput}
      onSave={() => void page.saveEvaluation()}
      onExtend={() => void page.extendDeadline()}
      onCloseWeek={page.closeWeekEvaluation}
    />
  );

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
      <KvSplitWorkspace
        ratio="5/7"
        tabs={
          <DailyApprovalsCourseTabs
            value={page.kind}
            termId={page.termId}
            terms={page.terms}
            onChange={page.changeKind}
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
    </DailyApprovalsGuard>
  );
}
