'use client';

import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

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

function FieldRow({
  label,
  value,
  numeric,
}: {
  label: string;
  value: string;
  numeric?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 border-b border-kv-border pb-1.5 text-xs font-bold text-kv-text-muted">
      <span>{label}:</span>
      <span
        className={`text-end text-kv-text ${numeric ? 'font-mono' : ''}`}
      >
        {numeric ? toPersianDigits(value) : value}
      </span>
    </div>
  );
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
    <div className="space-y-3.5 text-xs font-bold text-kv-text-muted">
      <FieldRow
        label="نام و نام خانوادگی"
        value={user.fullName || '---'}
      />
      <FieldRow
        label="شماره تماس"
        value={user.mobile ? `0${user.mobile}` : '---'}
        numeric
      />
      <FieldRow
        label="نقش کاربری"
        value={getRoleStrategy(user.role).label}
      />
      {rows.map((field) => {
        const value = readFieldValue(user, field.key);
        if (!value) return null;
        return (
          <FieldRow
            key={field.key}
            label={field.label}
            value={value}
            numeric={field.numeric}
          />
        );
      })}
      {user.docType ? (
        <FieldRow label="نوع مدرک" value={user.docType} />
      ) : null}
    </div>
  );
}
