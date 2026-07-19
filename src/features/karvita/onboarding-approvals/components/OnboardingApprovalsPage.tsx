'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

import { getApprovalTabActions } from '../constants';
import { useOnboardingApprovalsPage } from '../hooks/useOnboardingApprovalsPage';
import { OnboardingApprovalsDetailPanel } from './OnboardingApprovalsDetailPanel';
import { OnboardingApprovalsDocPreviewDialog } from './OnboardingApprovalsDocPreviewDialog';
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
        className="min-h-40 w-full bg-kv-surface bg-kv-canvas"
        aria-busy="true"
      />
    );
  }

  const { canApprove, canReject } = getApprovalTabActions(page.tab);

  return (
    <div className="space-y-kv-section" dir="rtl">
      <OnboardingApprovalsTabs
        active={page.tab}
        onChange={page.changeTab}
      />

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
      ) : (
        <>
          <div className="hidden w-full flex-row items-stretch gap-kv-section lg:flex">
            <section className="flex w-full flex-col gap-kv-group text-right lg:w-5/12">
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
            </section>

            <section className="flex w-full min-h-0 flex-col lg:w-7/12">
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
                onPreviewDoc={page.openDocPreview}
              />
            </section>
          </div>

          <div className="block lg:hidden">
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
              onPreviewDoc={page.openDocPreview}
              onLoadMore={() => void page.loadMore()}
              onRetryLoadMore={() => {
                page.clearLoadMoreError();
                void page.loadMore();
              }}
            />
          </div>
        </>
      )}

      <OnboardingApprovalsDocPreviewDialog
        url={page.docPreviewUrl}
        onClose={page.closeDocPreview}
      />
    </div>
  );
}
