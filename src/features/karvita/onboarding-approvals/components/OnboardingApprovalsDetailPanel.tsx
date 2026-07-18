'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { OnboardingApprovalsRejectForm } from './OnboardingApprovalsRejectForm';
import {
  DocThumbnailButton,
  OnboardingApprovalsUserFields,
} from './OnboardingApprovalsUserFields';

interface OnboardingApprovalsDetailPanelProps {
  user: OnboardingApprovalUser | null;
  canAct: boolean;
  showRejectForm: boolean;
  rejectReason: string;
  actionBusy: boolean;
  onRejectReasonChange: (value: string) => void;
  onShowRejectForm: () => void;
  onCancelReject: () => void;
  onSubmitReject: () => void;
  onApprove: () => void;
  onPreviewDoc: (url: string) => void;
}

export function OnboardingApprovalsDetailPanel({
  user,
  canAct,
  showRejectForm,
  rejectReason,
  actionBusy,
  onRejectReasonChange,
  onShowRejectForm,
  onCancelReject,
  onSubmitReject,
  onApprove,
  onPreviewDoc,
}: OnboardingApprovalsDetailPanelProps) {
  if (!user) {
    return (
      <div className="flex min-h-[28rem] flex-col justify-center rounded-kv-panel border border-kv-border bg-kv-surface-muted p-6 shadow-kv-raised">
        <KvEmptyState
          icon={<FaIcon icon={faIcons.idCard} size="lg" />}
          title="کاربری انتخاب نشده"
          description="از جدول سمت راست یک پرونده را برای مشاهده جزئیات و اقدام انتخاب کنید."
        />
      </div>
    );
  }

  return (
    <div className="rounded-kv-panel border border-kv-border bg-kv-surface-muted p-5 shadow-kv-raised sm:p-6">
      <div className="rounded-kv-panel border border-kv-border bg-kv-surface p-5 shadow-kv-raised sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-kv-border pb-3">
          <div className="flex items-center gap-4">
            <DocThumbnailButton user={user} onPreview={onPreviewDoc} />
            <div className="text-right">
              <h4 className="text-xs font-extrabold text-kv-text sm:text-sm">
                {user.fullName || 'کاربر جدید'}
              </h4>
              <p className="mt-1 text-xs font-bold text-kv-text-faint">
                {getRoleStrategy(user.role).label}
              </p>
            </div>
          </div>

          {canAct ? (
            <div className="flex gap-2">
              <KvButton
                type="button"
                color="error"
                appearance="solid"
                size="sm"
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
                loading={actionBusy}
                onClick={onApprove}
              >
                تایید صلاحیت
              </KvButton>
            </div>
          ) : null}
        </div>

        {canAct && showRejectForm ? (
          <div className="mb-4">
            <OnboardingApprovalsRejectForm
              reason={rejectReason}
              onReasonChange={onRejectReasonChange}
              onCancel={onCancelReject}
              onSubmit={onSubmitReject}
              busy={actionBusy}
            />
          </div>
        ) : null}

        <OnboardingApprovalsUserFields user={user} />
      </div>
    </div>
  );
}
