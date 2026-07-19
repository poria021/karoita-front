'use client';

import {
  KvAccordion,
  KvAccordionContent,
  KvAccordionItem,
  KvAccordionTrigger,
  KvAccordionTriggerMeta,
} from '@/components/shared/KvAccordion';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvBadge } from '@/components/shared/KvBadge';
import type { KvBadgeVariant } from '@/components/shared/KvBadge';
import { KvBusySurface } from '@/components/shared/table/KvBusySurface';
import { KvButton } from '@/components/shared/KvButton';
import { KvButtonGroup } from '@/components/shared/KvButtonGroup';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaAside } from '@/components/shared/KvMediaAside';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { cn } from '@/lib/utils';
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { getApprovalTabActions } from '../constants';
import { OnboardingApprovalsRejectForm } from './OnboardingApprovalsRejectForm';
import { OnboardingApprovalsUserFields } from './OnboardingApprovalsUserFields';

function statusBadge(status: OnboardingApprovalUser['docStatus']): {
  label: string;
  variant: KvBadgeVariant;
} {
  if (status === 'approved') {
    return { label: 'تایید شده', variant: 'success' };
  }
  if (status === 'rejected') {
    return { label: 'رد شده', variant: 'danger' };
  }
  return { label: 'انتظار بررسی', variant: 'warning' };
}

interface OnboardingApprovalsMobileListProps {
  users: OnboardingApprovalUser[];
  selectedId: string | null;
  tab: ApprovalFilterTab;
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMoreError: string | null;
  actionBusy: boolean;
  showRejectForm: boolean;
  rejectReason: string;
  onSelect: (user: OnboardingApprovalUser | null) => void;
  onApprove: (user: OnboardingApprovalUser) => void;
  onShowRejectForm: () => void;
  onCancelReject: () => void;
  onRejectReasonChange: (value: string) => void;
  onSubmitReject: (user: OnboardingApprovalUser) => void;
  onPreviewDoc: (url: string) => void;
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
}

export function OnboardingApprovalsMobileList({
  users,
  selectedId,
  tab,
  isLoading,
  isLoadingMore,
  hasMore,
  loadMoreError,
  actionBusy,
  showRejectForm,
  rejectReason,
  onSelect,
  onApprove,
  onShowRejectForm,
  onCancelReject,
  onRejectReasonChange,
  onSubmitReject,
  onPreviewDoc,
  onLoadMore,
  onRetryLoadMore,
}: OnboardingApprovalsMobileListProps) {
  const { canApprove, canReject } = getApprovalTabActions(tab);

  if (isLoading) {
    return <KvBusySurface tableViewport />;
  }

  if (users.length === 0) {
    return (
      <div className={cn('flex w-full flex-col', KV_TABLE_VIEWPORT_HEIGHT)}>
        <KvEmptyState
          icon={<FaIcon icon={faIcons.idCard} size="lg" />}
          title="پرونده‌ای یافت نشد"
          description="با تغییر تب، جستجو یا فیلترها دوباره امتحان کنید."
        />
      </div>
    );
  }

  return (
    <div className="space-y-kv-group">
      {loadMoreError ? (
        <KvAlert
          variant="error"
          title="بارگذاری ادامه فهرست ناموفق بود"
          description={loadMoreError}
          actions={
            <KvButton
              type="button"
              appearance="secondary"
              size="sm"
              onClick={onRetryLoadMore}
            >
              تلاش مجدد
            </KvButton>
          }
        />
      ) : null}

      <KvAccordion
        type="single"
        collapsible
        value={selectedId ?? ''}
        onValueChange={(value) => {
          if (!value) {
            onSelect(null);
            return;
          }
          const next = users.find((user) => user.id === value) ?? null;
          onSelect(next);
        }}
      >
        {users.map((user) => {
          const badge = statusBadge(user.docStatus);
          const roleLabel = getRoleStrategy(user.role).label;

          return (
            <KvAccordionItem key={user.id} value={user.id}>
              <KvAccordionTrigger>
                <KvAccordionTriggerMeta
                  title={user.fullName}
                  description={`${roleLabel} • ${user.province || '---'}`}
                  trailing={
                    <KvBadge variant={badge.variant}>{badge.label}</KvBadge>
                  }
                />
              </KvAccordionTrigger>

              <KvAccordionContent stacked>
                <KvMediaAside
                  media={
                    <KvMediaThumb
                      src={user.docUrl}
                      onPreview={onPreviewDoc}
                      size="lg"
                      fluid
                    />
                  }
                >
                  <OnboardingApprovalsUserFields user={user} />
                </KvMediaAside>

                {canApprove || canReject ? (
                  <>
                    {canReject && showRejectForm ? (
                      <OnboardingApprovalsRejectForm
                        reason={rejectReason}
                        onReasonChange={onRejectReasonChange}
                        onCancel={onCancelReject}
                        onSubmit={() => onSubmitReject(user)}
                        busy={actionBusy}
                      />
                    ) : null}

                    <KvButtonGroup fullWidth>
                      {canReject ? (
                        <KvButton
                          type="button"
                          color="error"
                          appearance="solid"
                          size="sm"
                          fullWidth
                          disabled={actionBusy}
                          onClick={onShowRejectForm}
                        >
                          رد صلاحیت
                        </KvButton>
                      ) : null}
                      {canApprove ? (
                        <KvButton
                          type="button"
                          color="success"
                          appearance="solid"
                          size="sm"
                          fullWidth
                          loading={actionBusy}
                          onClick={() => onApprove(user)}
                        >
                          تایید صلاحیت
                        </KvButton>
                      ) : null}
                    </KvButtonGroup>
                  </>
                ) : null}
              </KvAccordionContent>
            </KvAccordionItem>
          );
        })}
      </KvAccordion>

      {hasMore ? (
        <KvButton
          type="button"
          appearance="secondary"
          size="sm"
          fullWidth
          loading={isLoadingMore}
          onClick={onLoadMore}
        >
          بارگذاری ۱۰ مورد بعدی
        </KvButton>
      ) : null}
    </div>
  );
}
