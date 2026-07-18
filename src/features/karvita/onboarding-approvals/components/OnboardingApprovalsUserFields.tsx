'use client';

import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import {
  KvDescriptionItem,
  KvDescriptionList,
} from '@/components/shared/KvDescriptionList';

import {
  GENERAL_APPROVAL_FIELDS,
  ROLE_APPROVAL_FIELDS,
  type ApprovalFieldDef,
} from '../constants';

function readFieldValue(
  user: OnboardingApprovalUser,
  key: string
): string | undefined {
  const record = user as unknown as Record<string, unknown>;
  const value = record[key];
  return typeof value === 'string' && value.trim() ? value : undefined;
}

interface OnboardingApprovalsUserFieldsProps {
  user: OnboardingApprovalUser;
}

export function OnboardingApprovalsUserFields({
  user,
}: OnboardingApprovalsUserFieldsProps) {
  const roleFields = ROLE_APPROVAL_FIELDS[user.role] ?? [];
  const seen = new Set<string>();
  const rows: ApprovalFieldDef[] = [];

  for (const field of [...GENERAL_APPROVAL_FIELDS, ...roleFields]) {
    if (seen.has(field.key)) continue;
    seen.add(field.key);
    if (readFieldValue(user, field.key)) rows.push(field);
  }

  return (
    <KvDescriptionList>
      <KvDescriptionItem
        label="نام و نام خانوادگی"
        value={user.fullName || '---'}
      />
      <KvDescriptionItem
        label="شماره تماس"
        value={
          user.mobile ? toPersianDigits(`0${user.mobile}`) : '---'
        }
        mono
      />
      <KvDescriptionItem
        label="نقش کاربری"
        value={getRoleStrategy(user.role).label}
      />
      {rows.map((field) => {
        const value = readFieldValue(user, field.key);
        if (!value) return null;
        return (
          <KvDescriptionItem
            key={field.key}
            label={field.label}
            value={field.numeric ? toPersianDigits(value) : value}
            mono={field.numeric}
          />
        );
      })}
      {user.docType ? (
        <KvDescriptionItem label="نوع مدرک" value={user.docType} />
      ) : null}
    </KvDescriptionList>
  );
}
