'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvSplitWorkspace } from '@/components/shared/shell/KvSplitWorkspace';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { getApprovalTabActions } from '../constants';
import { useOnboardingApprovalsPage } from '../hooks/useOnboardingApprovalsPage';
import { OnboardingApprovalsDetailPanel } from './OnboardingApprovalsDetailPanel';
import { OnboardingApprovalsFilters } from './OnboardingApprovalsFilters';
import { OnboardingApprovalsMobileList } from './OnboardingApprovalsMobileList';
import { OnboardingApprovalsTable } from './OnboardingApprovalsTable';
import { OnboardingApprovalsTabs } from './OnboardingApprovalsTabs';

/**
 * Super-admin identity-document review workspace.
 * UX gate only — Nest must enforce authorization later (rule 45).
 */
export function OnboardingApprovalsPage() {
  const router = useRouter();
  const activeUser = useUserStore((state) => state.activeUser);
  const page = useOnboardingApprovalsPage();

  useEffect(() => {
    if (!activeUser) return;
    if (!isSuperAdminRole(activeUser.role)) {
      router.replace(getPostLoginPath(activeUser));
    }
  }, [activeUser, router]);

  if (!activeUser || !isSuperAdminRole(activeUser.role)) {
    return (
      <div
        className="min-h-40 w-full bg-kv-canvas"
        aria-busy="true"
      />
    );
  }

  const { canApprove, canReject } = getApprovalTabActions(page.tab);

  return (
    <>
      <KvSplitWorkspace
        tabs={
          <OnboardingApprovalsTabs
            active={page.tab}
            onChange={page.changeTab}
          />
        }
        toolbar={
          <>
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
            {page.error ? (
              <KvAlert
                variant="error"
                title="بارگذاری پرونده‌ها ناموفق بود"
                description={page.error}
                actions={
                  <KvButton
                    type="button"
                    appearance="secondary"
                    size="sm"
                    onClick={() => void page.reload()}
                  >
                    تلاش مجدد
                  </KvButton>
                }
              />
            ) : null}
          </>
        }
        primary={
          page.error ? null : (
            <>
              <OnboardingApprovalsFilters
                query={page.query}
                onQueryChange={page.setQuery}
                province={page.province}
                onProvinceChange={page.setProvince}
                provinces={page.provinces}
              />
              <KvCard>
                <OnboardingApprovalsTable
                  users={page.users}
                  selectedId={page.selectedUser?.id ?? null}
                  tab={page.tab}
                  isLoading={page.isLoading}
                  isLoadingMore={page.isLoadingMore}
                  hasMore={page.hasMore}
                  loadMoreError={page.loadMoreError}
                  actionBusy={page.actionBusy}
                  onLoadMore={() => void page.loadMore()}
                  onRetryLoadMore={() => {
                    page.clearLoadMoreError();
                    void page.loadMore();
                  }}
                  onSelect={page.selectUser}
                  onApprove={(user) => void page.approveUser(user)}
                  onStartReject={(user) => {
                    page.selectUser(user);
                    page.setShowRejectForm(true);
                  }}
                />
              </KvCard>
            </>
          )
        }
        secondary={
          page.error ? null : (
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
          )
        }
        mobile={
          page.error ? null : (
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
              onLoadMore={() => void page.loadMore()}
              onRetryLoadMore={() => {
                page.clearLoadMoreError();
                void page.loadMore();
              }}
            />
          )
        }
      />
    </>
  );
}
