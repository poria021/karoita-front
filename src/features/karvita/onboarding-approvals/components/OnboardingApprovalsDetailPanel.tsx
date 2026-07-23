'use client';

import { KvButton } from '@/components/shared/KvButton';
import {
  KvCard,
  KvCardAction,
  KvCardContent,
  KvCardDescription,
  KvCardHeader,
  KvCardIdentity,
  KvCardTitle,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvMediaThumb } from '@/components/shared/KvMediaThumb';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { getModuleEmptyCopy } from '@/utils/moduleDiscoverability';
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
};

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
}: OnboardingApprovalsDetailPanelProps) {
  if (!user) {
    const emptyCopy = getModuleEmptyCopy('onboarding_detail');
    return (
      <KvCard tone="muted" fill>
        <KvCardContent
          padding="md"
          className="flex h-full min-h-0 flex-1 flex-col items-center justify-center"
        >
          <KvEmptyState
            title={emptyCopy.title}
            description={emptyCopy.description}
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const showActions = canApprove || canReject;

  return (
    <KvCard padding="md" fill>
      <KvCardHeader toolbar bordered>
        <KvCardIdentity
          leading={
            <KvMediaThumb src={user.docUrl} openInNewTab />
          }
        >
          <KvCardTitle>{user.fullName || 'کاربر جدید'}</KvCardTitle>
          <KvCardDescription>
            {getRoleStrategy(user.role).label}
          </KvCardDescription>
        </KvCardIdentity>

        {showActions ? (
          <KvCardAction>
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
          </KvCardAction>
        ) : null}
      </KvCardHeader>

      <KvCardContent
        padding="none"
        stacked
        className="min-h-0 flex-1 overflow-y-auto"
      >
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
  );
}
