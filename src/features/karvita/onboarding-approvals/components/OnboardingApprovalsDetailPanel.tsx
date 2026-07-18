'use client';

import { FaIcon } from '@/components/shared/FaIcon';
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
      <KvCard tone="muted" fillMin>
        <KvCardContent padding="md">
          <KvEmptyState
            icon={<FaIcon icon={faIcons.idCard} size="lg" />}
            title="کاربری انتخاب نشده"
            description="از جدول یک پرونده را برای مشاهده جزئیات و اقدام انتخاب کنید."
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const showActions = canApprove || canReject;

  return (
    <KvCard padding="md">
      <KvCardHeader toolbar bordered>
        <KvCardIdentity
          leading={
            <KvMediaThumb src={user.docUrl} onPreview={onPreviewDoc} />
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

      <KvCardContent padding="none" stacked>
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
