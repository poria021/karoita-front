'use client';

import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import {
  KvDescriptionItem,
  KvDescriptionList,
} from '@/components/shared/KvDescriptionList';
import { getRoleProfileDisplayFields } from '@/utils/roleFieldStrategy';
import { toPersianDigits } from '@/utils/persianDigits';

function readFieldValue(
  user: OnboardingApprovalUser,
  key: string
): string | undefined {
  if (!(key in user)) return undefined;
  const value = user[key as keyof OnboardingApprovalUser];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

interface OnboardingApprovalsUserFieldsProps {
  user: OnboardingApprovalUser;
}

export function OnboardingApprovalsUserFields({
  user,
}: OnboardingApprovalsUserFieldsProps) {
  const roleFields = getRoleProfileDisplayFields(user.role);

  return (
    <KvDescriptionList>
      {roleFields.map((field) => {
        const raw = readFieldValue(user, field.key);
        const display = raw
          ? field.numeric
            ? toPersianDigits(raw)
            : raw
          : '---';
        return (
          <KvDescriptionItem
            key={field.key}
            label={field.label}
            value={display}
            mono={field.numeric}
          />
        );
      })}
    </KvDescriptionList>
  );
}
