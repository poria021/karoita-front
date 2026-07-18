'use client';

import { useState } from 'react';

import { KvButton } from '@/components/shared/KvButton';
import { KvCard, KvCardContent } from '@/components/shared/KvCard';
import { KvSelectField } from '@/components/shared/KvSelectField';
import { KvSelectItem } from '@/components/shared/KvSelect';
import { KvTextArea } from '@/components/shared/KvTextArea';

import { DEFAULT_REJECT_REASONS } from '../constants';

interface OnboardingApprovalsRejectFormProps {
  reason: string;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  busy?: boolean;
}

export function OnboardingApprovalsRejectForm({
  reason,
  onReasonChange,
  onCancel,
  onSubmit,
  busy = false,
}: OnboardingApprovalsRejectFormProps) {
  const [preset, setPreset] = useState<string | undefined>(undefined);

  return (
    <KvCard className="border-kv-danger-border bg-kv-danger-soft shadow-none">
      <KvCardContent className="space-y-3 p-3 sm:p-4">
        <KvSelectField
          id="onboarding-reject-preset"
          label={false}
          size="sm"
          value={preset}
          placeholder="-- علت نقص مدارک --"
          onValueChange={(value) => {
            setPreset(value);
            const match = DEFAULT_REJECT_REASONS.find(
              (item) => item.value === value
            );
            if (match) onReasonChange(match.text);
          }}
        >
          {DEFAULT_REJECT_REASONS.map((item) => (
            <KvSelectItem key={item.value} value={item.value}>
              {item.text}
            </KvSelectItem>
          ))}
        </KvSelectField>

        <KvTextArea
          id="onboarding-reject-reason"
          label={false}
          size="sm"
          rows={3}
          value={reason}
          placeholder="توضیحات تکمیلی..."
          onChange={(event) => onReasonChange(event.target.value)}
        />

        <div className="flex justify-end gap-1.5">
          <KvButton
            type="button"
            appearance="secondary"
            size="sm"
            disabled={busy}
            onClick={onCancel}
          >
            انصراف
          </KvButton>
          <KvButton
            type="button"
            color="error"
            appearance="solid"
            size="sm"
            loading={busy}
            disabled={!reason.trim()}
            onClick={onSubmit}
          >
            ثبت رد صلاحیت
          </KvButton>
        </div>
      </KvCardContent>
    </KvCard>
  );
}
