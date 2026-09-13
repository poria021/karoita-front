'use client';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import {
  DemoDataBadge,
  IS_DEMO_FALLBACK_ACTIVE,
  IS_REAL_MODE_STUB_ACTIVE,
} from '@/components/shared/RealModeStubNotice';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { useUserStore } from '@/store/useUserStore';

import { useDailyApprovalsPage } from '../hooks/useDailyApprovalsPage';
import {
  canBulkExtendDailyApprovalWeeks,
  canDropDailyApprovalTrainee,
} from '../lib/dailyApprovalsAccess';
import { DailyApprovalBulkExtendModal } from './DailyApprovalBulkExtendModal';
import { DailyApprovalDetailPanel } from './DailyApprovalDetailPanel';
import { DailyApprovalsCourseTabs } from './DailyApprovalsCourseTabs';
import { DailyApprovalsFilters } from './DailyApprovalsFilters';
import { DailyApprovalsGuard } from './DailyApprovalsGuard';
import { DailyApprovalsMobileWorkspace } from './DailyApprovalsMobileWorkspace';
import { DailyApprovalsTable } from './DailyApprovalsTable';
import { DailyApprovalsWorkspaceHeader } from './DailyApprovalsWorkspaceHeader';
import { DailyApprovalWeekGradingModal } from './DailyApprovalWeekGradingModal';

export function DailyApprovalsPageClient() {
  const page = useDailyApprovalsPage();
  const role = useUserStore((state) => state.activeUser?.role);
  const canDrop = canDropDailyApprovalTrainee(role);
  const canBulkExtend = canBulkExtendDailyApprovalWeeks(role);
  const hasActiveFilters =
    page.query.trim().length > 0 || page.course !== 'all';

  const clearFilters = () => {
    page.setQuery('');
    page.changeCourse('all');
  };

  const detail = (
    <DailyApprovalDetailPanel
      trainee={page.selectedTrainee}
      selectedWeekId={
        page.gradingTrainee?.id === page.selectedTrainee?.id
          ? page.gradingWeek?.id ?? null
          : null
      }
      onSelectWeek={(week) => {
        if (!page.selectedTrainee) return;
        void page.openWeekGrading(page.selectedTrainee, week);
      }}
    />
  );

  const listChrome = (
    <div className="space-y-kv-group">
      <DailyApprovalsFilters
        query={page.query}
        course={page.course}
        courseOptions={page.courseOptions}
        onQueryChange={page.setQuery}
        onCourseChange={page.changeCourse}
      />
      {IS_REAL_MODE_STUB_ACTIVE ? (
        <KvAlert
          variant="warning"
          title="عملیات این صفحه هنوز به API واقعی وصل نیست"
          description="باز کردن گزارش هفته، ثبت نمره، حذف/بازگردانی کارورز و تمدید هفته‌ها فعلاً فقط در حالت شبیه‌ساز (mock) کار می‌کنند."
        />
      ) : null}
      {IS_DEMO_FALLBACK_ACTIVE ? (
        <div className="flex items-center gap-kv-pair">
          <DemoDataBadge />
          <span className="text-xs text-kv-text-secondary">
            عملیات این صفحه (باز کردن هفته، ثبت نمره، حذف/تمدید) هنوز به Nest
            وصل نشده و روی داده‌ی نمایشی اجرا می‌شود.
          </span>
        </div>
      ) : null}
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
      <>
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
              termId={page.termId}
              terms={page.terms}
              onTermChange={page.changeTerm}
              showBulkExtend={canBulkExtend}
              onBulkExtendClick={page.openBulkExtend}
              bulkExtendDisabled={page.actionBusy || !page.termId}
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
        <DailyApprovalWeekGradingModal
          open={page.gradingOpen}
          role={role}
          trainee={page.gradingTrainee}
          week={page.gradingWeek}
          actionBusy={page.actionBusy}
          passingScoreThreshold={page.passingScoreThreshold}
          onClose={page.closeWeekGrading}
          onSaveSupervisor={page.saveSupervisorWeek}
          onSaveMentor={page.saveMentorWeek}
          onSavePrincipal={page.savePrincipalWeek}
        />
        {canBulkExtend ? (
          <DailyApprovalBulkExtendModal
            open={page.bulkExtendOpen}
            kind={page.kind}
            termId={page.termId}
            preferredCourse={page.course}
            busy={page.actionBusy}
            trainees={page.trainees}
            onClose={page.closeBulkExtend}
            onConfirm={({ course, weekNumbers, revokeWeekNumbers }) => {
              page.bulkExtendWeeks({
                course,
                weekNumbers,
                revokeWeekNumbers,
              });
            }}
          />
        ) : null}
      </>
    </DailyApprovalsGuard>
  );
}
