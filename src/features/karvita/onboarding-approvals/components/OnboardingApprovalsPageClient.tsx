'use client';

import { KvButton } from '@/components/shared/KvButton';
import { KvRouteStatus } from '@/components/shared/KvRouteStatus';
import { SuperAdminModuleGuard } from '@/components/shared/shell/SuperAdminModuleGuard';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';

import { getApprovalTabActions } from '../constants';
import { useOnboardingApprovalsPage } from '../hooks/useOnboardingApprovalsPage';
import { OnboardingApprovalsDetailPanel } from './OnboardingApprovalsDetailPanel';
import { OnboardingApprovalsFilters } from './OnboardingApprovalsFilters';
import { OnboardingApprovalsMobileList } from './OnboardingApprovalsMobileList';
import { OnboardingApprovalsTable } from './OnboardingApprovalsTable';
import { OnboardingApprovalsTabs } from './OnboardingApprovalsTabs';

export function OnboardingApprovalsPageClient() {
  const page = useOnboardingApprovalsPage();

  const { canApprove, canReject } = getApprovalTabActions(page.tab);
  const hasActiveFilters =
    page.query.trim().length > 0 || page.province !== 'all';
  const clearFilters = () => {
    page.setQuery('');
    page.setProvince('all');
  };

  if (page.error) {
    return (
      <SuperAdminModuleGuard>
        <KvRouteStatus
          kind="error"
          layout="inset"
          title="بارگذاری پرونده‌ها ناموفق بود"
          description={page.error}
          actions={
            <KvButton type="button" color="cta" onClick={page.reload}>
              تلاش مجدد
            </KvButton>
          }
        />
      </SuperAdminModuleGuard>
    );
  }

  return (
    <SuperAdminModuleGuard>
      <KvSplitWorkspace
        tabs={
          <OnboardingApprovalsTabs
            active={page.tab}
            onChange={page.changeTab}
          />
        }
        toolbar={
          <div className="lg:hidden">
            <OnboardingApprovalsFilters
              query={page.query}
              onQueryChange={page.setQuery}
              province={page.province}
              onProvinceChange={page.setProvince}
              provinces={page.provinces}
              searchPlaceholder="جستجوی نام یا کد ملی..."
            />
          </div>
        }
        primary={
          <>
            <OnboardingApprovalsFilters
              query={page.query}
              onQueryChange={page.setQuery}
              province={page.province}
              onProvinceChange={page.setProvince}
              provinces={page.provinces}
            />
            <OnboardingApprovalsTable
              users={page.users}
              selectedId={page.selectedUser?.id ?? null}
              tab={page.tab}
              isLoading={page.isLoading}
              isLoadingMore={page.isLoadingMore}
              hasMore={page.hasMore}
              loadMoreError={page.loadMoreError}
              actionBusy={page.actionBusy}
              onLoadMore={page.loadMore}
              onRetryLoadMore={page.retryLoadMore}
              onSelect={page.selectUser}
              onApprove={(user) => void page.approveUser(user)}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
            />
          </>
        }
        secondary={
          <OnboardingApprovalsDetailPanel
            user={page.selectedUser}
            canApprove={canApprove}
            canReject={canReject}
            showRejectForm={page.showRejectForm}
            rejectReason={page.rejectReason}
            actionBusy={page.actionBusy}
            onRejectReasonChange={page.setRejectReason}
            onShowRejectForm={() => page.setShowRejectForm(true)}
            onCancelReject={() => {
              page.setShowRejectForm(false);
              page.setRejectReason('');
            }}
            onSubmitReject={() => {
              if (page.selectedUser) {
                void page.submitReject(page.selectedUser);
              }
            }}
            onApprove={() => {
              if (page.selectedUser) {
                void page.approveUser(page.selectedUser);
              }
            }}
          />
        }
        mobile={
          <OnboardingApprovalsMobileList
            users={page.users}
            selectedId={page.selectedUser?.id ?? null}
            tab={page.tab}
            isLoading={page.isLoading}
            isLoadingMore={page.isLoadingMore}
            hasMore={page.hasMore}
            loadMoreError={page.loadMoreError}
            actionBusy={page.actionBusy}
            showRejectForm={page.showRejectForm}
            rejectReason={page.rejectReason}
            onSelect={page.selectUser}
            onApprove={(user) => void page.approveUser(user)}
            onShowRejectForm={() => page.setShowRejectForm(true)}
            onCancelReject={() => {
              page.setShowRejectForm(false);
              page.setRejectReason('');
            }}
            onRejectReasonChange={page.setRejectReason}
            onSubmitReject={(user) => void page.submitReject(user)}
            onLoadMore={page.loadMore}
            onRetryLoadMore={page.retryLoadMore}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
          />
        }
      />
    </SuperAdminModuleGuard>
  );
}
