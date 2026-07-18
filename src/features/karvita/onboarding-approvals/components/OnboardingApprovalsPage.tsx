'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { getPostLoginPath } from '@/services/post-login-path';
import { useUserStore } from '@/store/useUserStore';
import { isSuperAdminRole } from '@/utils/RoleStrategyMap';

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
      <div className="min-h-40 w-full bg-kv-canvas" aria-busy="true" />
    );
  }

  const canAct = page.tab === 'pending_admin';

  return (
    <div className="space-y-kv-section" dir="rtl">
      <OnboardingApprovalsTabs
        active={page.tab}
        onChange={page.changeTab}
      />

      {/* Mobile / tablet filters */}
      <div className="lg:hidden">
        <OnboardingApprovalsFilters
          query={page.query}
          onQueryChange={page.setQuery}
          province={page.province}
          onProvinceChange={page.setProvince}
          role={page.role}
          onRoleChange={page.setRole}
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
          {/* Desktop split */}
          <div className="hidden w-full flex-row items-start gap-6 lg:flex">
            <section className="flex w-full flex-col gap-4 text-right lg:w-5/12">
              <OnboardingApprovalsFilters
                query={page.query}
                onQueryChange={page.setQuery}
                province={page.province}
                onProvinceChange={page.setProvince}
                role={page.role}
                onRoleChange={page.setRole}
                provinces={page.provinces}
              />

              <div className="overflow-hidden rounded-kv-panel border border-kv-border bg-kv-surface shadow-kv-raised">
                <OnboardingApprovalsTable
                  users={page.users}
                  selectedId={page.selectedUser?.id ?? null}
                  tab={page.tab}
                  isLoading={page.isLoading}
                  actionBusy={page.actionBusy}
                  onSelect={page.selectUser}
                  onApprove={(user) => void page.approveUser(user)}
                  onStartReject={(user) => {
                    page.selectUser(user);
                    page.setShowRejectForm(true);
                  }}
                />
              </div>
            </section>

            <section className="flex w-full flex-col lg:w-7/12">
              <OnboardingApprovalsDetailPanel
                user={page.selectedUser}
                canAct={canAct}
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

          {/* Mobile accordion */}
          <div className="block lg:hidden">
            <OnboardingApprovalsMobileList
              users={page.users}
              selectedId={page.selectedUser?.id ?? null}
              tab={page.tab}
              isLoading={page.isLoading}
              actionBusy={page.actionBusy}
              showRejectForm={page.showRejectForm}
              rejectReason={page.rejectReason}
              onToggle={page.toggleUser}
              onApprove={(user) => void page.approveUser(user)}
              onShowRejectForm={() => page.setShowRejectForm(true)}
              onCancelReject={() => {
                page.setShowRejectForm(false);
                page.setRejectReason('');
              }}
              onRejectReasonChange={page.setRejectReason}
              onSubmitReject={(user) => void page.submitReject(user)}
              onPreviewDoc={page.openDocPreview}
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
