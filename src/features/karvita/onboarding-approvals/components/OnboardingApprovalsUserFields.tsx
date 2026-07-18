'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import type { OnboardingApprovalUser } from '@/types/onboarding-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';
import { getRoleStrategy } from '@/utils/RoleStrategyMap';

import {
  GENERAL_APPROVAL_FIELDS,
  ROLE_APPROVAL_FIELDS,
  isPdfDocUrl,
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

export function DocThumbnailButton({
  user,
  onPreview,
  className,
}: {
  user: OnboardingApprovalUser;
  onPreview: (url: string) => void;
  className?: string;
}) {
  if (!user.docUrl) {
    return (
      <div
        className={`flex h-24 w-20 shrink-0 flex-col items-center justify-center rounded-kv-panel border border-dashed border-kv-border bg-kv-surface-muted p-2 text-center text-kv-text-faint ${className ?? ''}`}
      >
        <FaIcon icon={faIcons.eyeSlash} size="md" />
        <span className="mt-1 text-xs font-bold leading-tight">
          فاقد مدرک پیوست
        </span>
      </div>
    );
  }

  const isPdf = isPdfDocUrl(user.docUrl);

  return (
    <KvButton
      type="button"
      appearance="secondary"
      className={`h-24 w-20 shrink-0 overflow-hidden p-1 ${className ?? ''}`}
      aria-label="پیش‌نمایش مدرک"
      onClick={() => onPreview(user.docUrl!)}
    >
      {isPdf ? (
        <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-kv-control bg-kv-danger-soft text-kv-danger">
          <FaIcon icon={faIcons.filePdf} size="lg" />
          <span className="text-xs font-bold">سند PDF</span>
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- data-URI mock docs
        <img
          src={user.docUrl}
          alt=""
          className="h-full w-full rounded-kv-control object-cover"
        />
      )}
    </KvButton>
  );
}

interface OnboardingApprovalsUserFieldsProps {
  user: OnboardingApprovalUser;
  /** Compact rows for mobile accordion. */
  dense?: boolean;
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
