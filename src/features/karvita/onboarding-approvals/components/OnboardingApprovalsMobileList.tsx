'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import type {
  ApprovalFilterTab,
  OnboardingApprovalUser,
} from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { OnboardingApprovalsRejectForm } from './OnboardingApprovalsRejectForm';
import {
  DocThumbnailButton,
  OnboardingApprovalsUserFields,
} from './OnboardingApprovalsUserFields';

function statusBadge(status: OnboardingApprovalUser['docStatus']) {
  if (status === 'approved') {
    return {
      label: 'تایید شده',
      className:
        'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg',
    };
  }
  if (status === 'rejected') {
    return {
      label: 'رد شده',
      className:
        'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg',
    };
  }
  return {
    label: 'انتظار بررسی',
    className:
      'border-kv-warning-border bg-kv-warning-soft text-kv-warning-soft-fg',
  };
}

interface OnboardingApprovalsMobileListProps {
  users: OnboardingApprovalUser[];
  selectedId: string | null;
  tab: ApprovalFilterTab;
  isLoading: boolean;
  actionBusy: boolean;
  showRejectForm: boolean;
  rejectReason: string;
  onToggle: (user: OnboardingApprovalUser) => void;
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
  onToggle,
  onApprove,
  onShowRejectForm,
  onCancelReject,
  onRejectReasonChange,
  onSubmitReject,
  onPreviewDoc,
}: OnboardingApprovalsMobileListProps) {
  const canAct = tab === 'pending_admin';

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center gap-2 rounded-kv-panel border border-kv-border bg-kv-surface p-6 text-xs font-bold text-kv-brand"
        aria-busy="true"
      >
        <FaIcon icon={faIcons.spinner} size="sm" spin />
        در حال فراخوانی...
      </div>
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
    <div className="space-y-3">
      {users.map((user) => {
        const expanded = selectedId === user.id;
        const badge = statusBadge(user.docStatus);

        return (
          <div
            key={user.id}
            className="flex flex-col rounded-kv-panel border border-kv-border bg-kv-surface p-4 text-right shadow-kv-raised"
          >
            <KvButton
              type="button"
              appearance="text"
              fullWidth
              className="h-auto justify-between gap-3 px-0 py-0 hover:bg-transparent"
              onClick={() => onToggle(user)}
              aria-expanded={expanded}
            >
              <div className="flex min-w-0 flex-col gap-1 text-right">
                <h4 className="truncate text-xs font-black text-kv-text sm:text-sm">
                  {user.fullName}
                </h4>
                <p className="truncate text-xs font-bold leading-relaxed text-kv-text-faint">
                  {getRoleStrategy(user.role).label} •{' '}
                  {user.province || '---'}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`whitespace-nowrap rounded-kv-control border px-2.5 py-1 text-xs font-bold ${badge.className}`}
                >
                  {badge.label}
                </span>
                <FaIcon
                  icon={faIcons.chevronDown}
                  size="xs"
                  className={`text-kv-text-faint transition-transform duration-300 ${
                    expanded ? 'rotate-180 text-kv-brand' : ''
                  }`}
                />
              </div>
            </KvButton>

            {expanded ? (
              <div className="mt-3 space-y-4 border-t border-kv-border pt-3">
                <div className="flex flex-col items-center gap-3 sm:flex-row">
                  <DocThumbnailButton
                    user={user}
                    onPreview={onPreviewDoc}
                    className="h-28 w-full sm:w-24"
                  />
                  <div className="w-full flex-grow">
                    <OnboardingApprovalsUserFields user={user} dense />
                  </div>
                </div>

                {canAct ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex w-full gap-2">
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
                    </div>

                    {showRejectForm ? (
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
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
