'use client';

import type { ReactNode } from 'react';

import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { cn } from '@/lib/utils';
import { getRoleProfileDisplayFields } from '@/utils/roleFieldStrategy';
import { toPersianDigits } from '@/utils/persianDigits';

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
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-kv-group border-b border-kv-border pb-1.5">
      <dt className="font-sans text-xs font-bold text-kv-text-muted">{label}:</dt>
      <dd
        className={cn(
          'text-end font-sans text-xs font-bold text-kv-text',
          mono && 'font-mono'
        )}
      >
        {value}
      </dd>
    </div>
  );
}

interface OnboardingApprovalsUserFieldsProps {
  user: OnboardingApprovalUser;
}

/**
 * Detail fields mirror the role profile form only
 * ({@link getRoleProfileDisplayFields} / ROLE_FIELD_STRATEGY) — no extra rows.
 */
export function OnboardingApprovalsUserFields({
  user,
}: OnboardingApprovalsUserFieldsProps) {
  const roleFields = getRoleProfileDisplayFields(user.role);

  return (
    <dl className="space-y-3.5">
      {roleFields.map((field) => {
        const raw = readFieldValue(user, field.key);
        const display = raw
          ? field.numeric
            ? toPersianDigits(raw)
            : raw
          : '---';
        return (
          <FieldRow
            key={field.key}
            label={field.label}
            value={display}
            mono={field.numeric}
          />
        );
      })}
    </dl>
  );
}
