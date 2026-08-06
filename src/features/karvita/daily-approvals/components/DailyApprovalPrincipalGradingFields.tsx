'use client';

import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalCompetencyRating } from '@/types/daily-approvals';

import {
  competencyRatingLabel,
  DAILY_APPROVAL_COMPETENCY_OPTIONS,
} from '../constants';

type DailyApprovalPrincipalGradingFieldsProps = {
  principalRating: DailyApprovalCompetencyRating;
  principalFeedback: string;
  onPrincipalRatingChange: (value: DailyApprovalCompetencyRating) => void;
  onPrincipalFeedbackChange: (value: string) => void;
};

export function DailyApprovalPrincipalGradingFields({
  principalRating,
  principalFeedback,
  onPrincipalRatingChange,
  onPrincipalFeedbackChange,
}: DailyApprovalPrincipalGradingFieldsProps) {
  return (
    <div className="space-y-kv-group rounded-kv-panel border-2 border-kv-brand/25 bg-kv-brand-soft/40 p-kv-section shadow-kv-soft">
      <div className="flex items-center gap-kv-pair border-b border-kv-brand/20 pb-kv-pair">
        <KvTypography variant="subtitle" as="h4" tone="brand">
          ارزیابی توصیفی مدیریت مدرسه
        </KvTypography>
      </div>

      <div className="grid grid-cols-1 items-center gap-kv-group sm:grid-cols-2">
        <KvSelectField
          label="سطح شایستگی کارورز:"
          value={principalRating}
          displayValue={competencyRatingLabel(principalRating)}
          contentClassName="z-[150]"
          onValueChange={(value) => {
            if (
              value === '1' ||
              value === '2' ||
              value === '3' ||
              value === '4' ||
              value === '5'
            ) {
              onPrincipalRatingChange(value);
            }
          }}
        >
          {DAILY_APPROVAL_COMPETENCY_OPTIONS.map((option) => (
            <KvSelectItem key={option.value} value={option.value}>
              {option.label}
            </KvSelectItem>
          ))}
        </KvSelectField>
        <KvTypography variant="caption" tone="muted" as="p">
          ارزیابی حضور، انضباط و همیاری کارورز با مدیریت واحد آموزشی.
        </KvTypography>
      </div>

      <KvTextArea
        label="توضیحات و بازخورد کتبی مدیریت مدرسه (اختیاری):"
        value={principalFeedback}
        rows={3}
        maxLength={1200}
        placeholder="توضیحات اختیاری خود را بنویسید..."
        onChange={(event) => onPrincipalFeedbackChange(event.target.value)}
      />
    </div>
  );
}
