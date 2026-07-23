'use client';

import {
  KvAccordion,
  KvAccordionContent,
  KvAccordionItem,
  KvAccordionTrigger,
  KvAccordionTriggerMeta,
} from '@/components/shared/KvAccordion';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvButton } from '@/components/shared/KvButton';
import { KvButtonGroup } from '@/components/shared/KvButtonGroup';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import { KvSkeletonListRow } from '@/components/shared/skeleton/KvSkeletonCard';
import { KV_TABLE_VIEWPORT_HEIGHT } from '@/components/shared/table/kvTableViewportHeight';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import type { VariantProps } from 'class-variance-authority';

import { getApprovalTabActions } from '../constants';
import { OnboardingApprovalsRejectForm } from './OnboardingApprovalsRejectForm';
import { OnboardingApprovalsUserFields } from './OnboardingApprovalsUserFields';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

function statusBadge(status: OnboardingApprovalUser['docStatus']): {
  label: string;
  variant: BadgeVariant;
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
  onLoadMore: () => void;
  onRetryLoadMore: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
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
  onLoadMore,
  onRetryLoadMore,
  hasActiveFilters = false,
  onClearFilters,
}: OnboardingApprovalsMobileListProps) {
  const { canApprove, canReject } = getApprovalTabActions(tab);
  const emptyCopy = getModuleEmptyCopy('onboarding_list');

  if (isLoading && users.length === 0) {
    return (
      <div
        className={cn('flex w-full flex-col gap-kv-group', KV_TABLE_VIEWPORT_HEIGHT)}
        role="status"
        aria-busy="true"
        aria-label="در حال بارگذاری فهرست پرونده‌ها"
      >
        <KvSkeletonListRow />
        <KvSkeletonListRow />
        <KvSkeletonListRow />
        <KvSkeletonListRow />
        <KvSkeletonListRow />
        <KvSkeletonListRow />
      </div>
    );
  }

  if (!isLoading && users.length === 0) {
    return (
      <div className={cn('flex w-full flex-col', KV_TABLE_VIEWPORT_HEIGHT)}>
        <KvEmptyState
          title={emptyCopy.title}
          description={emptyCopy.description}
          actions={
            hasActiveFilters && onClearFilters ? (
              <KvButton
                type="button"
                color="cta"
                appearance="solid"
                size="sm"
                onClick={onClearFilters}
              >
                {emptyCopy.actionLabel}
              </KvButton>
            ) : (
              <KvButton
                type="button"
                color="neutral"
                appearance="secondary"
                size="sm"
                onClick={onRetryLoadMore}
              >
                تلاش مجدد
              </KvButton>
            )
          }
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
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  }
                />
              </KvAccordionTrigger>

              <KvAccordionContent stacked>
                <div className="flex flex-col items-center gap-kv-group sm:flex-row sm:items-start">
                  <KvMediaThumb
                    src={user.docUrl}
                    openInNewTab
                    size="lg"
                    fluid
                  />
                  <div className="w-full min-w-0 grow">
                    <OnboardingApprovalsUserFields user={user} />
                  </div>
                </div>

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
