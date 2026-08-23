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
  if (typeof value === 'string') {
    return value.trim() ? value : undefined;
  }
  if (Array.isArray(value)) {
    const items = value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0
    );
    return items.length > 0 ? items.join('، ') : undefined;
  }
  return undefined;
}

interface OnboardingApprovalsUserFieldsProps {
  user: OnboardingApprovalUser;
}

export function OnboardingApprovalsUserFields({
  user,
}: OnboardingApprovalsUserFieldsProps) {
  const roleFields = getRoleProfileDisplayFields(user.role);
  const mobile = user.mobile?.trim()
    ? toPersianDigits(user.mobile.trim())
    : '---';

  return (
    <KvDescriptionList>
      <KvDescriptionItem label="شماره موبایل" value={mobile} mono />
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
