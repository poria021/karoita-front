'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardContent,
  KvCardHeader,
  KvCardTitle,
  KvCardDescription,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import { OnboardingApprovalsRejectForm } from './OnboardingApprovalsRejectForm';
import { OnboardingApprovalsUserFields } from './OnboardingApprovalsUserFields';

interface OnboardingApprovalsDetailPanelProps {
  user: OnboardingApprovalUser | null;
  canApprove: boolean;
  canReject: boolean;
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
  canApprove,
  canReject,
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
      <KvCard tone="muted" className="flex min-h-[28rem] flex-col justify-center">
        <KvCardContent className="p-6">
          <KvEmptyState
            icon={<FaIcon icon={faIcons.idCard} size="lg" />}
            title="کاربری انتخاب نشده"
            description="از جدول سمت راست یک پرونده را برای مشاهده جزئیات و اقدام انتخاب کنید."
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const showActions = canApprove || canReject;

  return (
    <KvCard tone="muted" className="p-5 sm:p-6">
      <KvCard tone="surface" className="p-5 sm:p-6">
        <KvCardHeader className="mb-4 flex flex-row flex-wrap items-center justify-between gap-3 space-y-0 border-b border-kv-border px-0 pb-3">
          <div className="flex items-center gap-4">
            <KvMediaThumb
              src={user.docUrl}
              onPreview={onPreviewDoc}
            />
            <div className="text-right">
              <KvCardTitle className="text-xs sm:text-sm">
                {user.fullName || 'کاربر جدید'}
              </KvCardTitle>
              <KvCardDescription className="mt-1 font-bold">
                {getRoleStrategy(user.role).label}
              </KvCardDescription>
            </div>
          </div>

          {showActions ? (
            <div className="flex gap-2">
              {canReject ? (
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
              ) : null}
              {canApprove ? (
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
              ) : null}
            </div>
          ) : null}
        </KvCardHeader>

        <KvCardContent className="space-y-4 px-0">
          {canReject && showRejectForm ? (
            <OnboardingApprovalsRejectForm
              reason={rejectReason}
              onReasonChange={onRejectReasonChange}
              onCancel={onCancelReject}
              onSubmit={onSubmitReject}
              busy={actionBusy}
            />
          ) : null}

          <OnboardingApprovalsUserFields user={user} />
        </KvCardContent>
      </KvCard>
    </KvCard>
  );
}
