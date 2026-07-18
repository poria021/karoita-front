'use client';

import { KvBadge } from '@/components/shared/KvBadge';
import type { KvBadgeVariant } from '@/components/shared/KvBadge';
import { KvButton } from '@/components/shared/KvButton';
import { KvCard } from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import {
  KvAccordion,
  KvAccordionContent,
  KvAccordionItem,
  KvAccordionTrigger,
} from '@/components/shared/KvAccordion';
import { FaIcon } from '@/components/shared/FaIcon';
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
}

export function OnboardingApprovalsMobileList({
  users,
  selectedId,
  tab,
  isLoading,
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
}: OnboardingApprovalsMobileListProps) {
  const { canApprove, canReject } = getApprovalTabActions(tab);

  if (isLoading) {
    return (
      <KvCard className="flex items-center justify-center gap-2 p-6 text-xs font-bold text-kv-brand">
        <FaIcon icon={faIcons.spinner} size="sm" spin />
        در حال فراخوانی...
      </KvCard>
    );
  }

  if (users.length === 0) {
    return (
      <KvEmptyState
        icon={<FaIcon icon={faIcons.idCard} size="lg" />}
        title="پرونده‌ای یافت نشد"
        description="با تغییر تب، جستجو یا فیلترها دوباره امتحان کنید."
      />
    );
  }

  return (
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
      className="space-y-0"
    >
      {users.map((user) => {
        const badge = statusBadge(user.docStatus);

        return (
          <KvAccordionItem key={user.id} value={user.id}>
            <KvAccordionTrigger>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 pe-2">
                <div className="flex min-w-0 flex-col gap-1 text-right">
                  <span className="truncate text-xs font-black text-kv-text sm:text-sm">
                    {user.fullName}
                  </span>
                  <span className="truncate text-xs font-bold leading-relaxed text-kv-text-faint">
                    {getRoleStrategy(user.role).label} •{' '}
                    {user.province || '---'}
                  </span>
                </div>
                <KvBadge variant={badge.variant} className="shrink-0">
                  {badge.label}
                </KvBadge>
              </div>
            </KvAccordionTrigger>

            <KvAccordionContent>
              <div className="space-y-4 pt-3">
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <KvMediaThumb
                    src={user.docUrl}
                    onPreview={onPreviewDoc}
                    className="h-28 w-full sm:w-24"
                  />
                  <div className="w-full flex-grow">
                    <OnboardingApprovalsUserFields user={user} />
                  </div>
                </div>

                {canApprove || canReject ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex w-full gap-2">
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
                    </div>

                    {canReject && showRejectForm ? (
                      <OnboardingApprovalsRejectForm
                        reason={rejectReason}
                        onReasonChange={onRejectReasonChange}
                        onCancel={onCancelReject}
                        onSubmit={() => onSubmitReject(user)}
                        busy={actionBusy}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </KvAccordionContent>
          </KvAccordionItem>
        );
      })}
    </KvAccordion>
  );
}
