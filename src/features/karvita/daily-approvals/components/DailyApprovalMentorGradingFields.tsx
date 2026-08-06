'use client';

import { Badge } from '@/components/ui/badge';
import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalCompetencyRating } from '@/types/daily-approvals';

import {
  competencyRatingLabel,
  DAILY_APPROVAL_COMPETENCY_OPTIONS,
} from '../constants';

type DailyApprovalMentorGradingFieldsProps = {
  mentorRating: DailyApprovalCompetencyRating;
  mentorFeedback: string;
  onMentorRatingChange: (value: DailyApprovalCompetencyRating) => void;
  onMentorFeedbackChange: (value: string) => void;
};

export function DailyApprovalMentorGradingFields({
  mentorRating,
  mentorFeedback,
  onMentorRatingChange,
  onMentorFeedbackChange,
}: DailyApprovalMentorGradingFieldsProps) {
  return (
    <div className="space-y-kv-group rounded-kv-panel border-2 border-kv-brand/25 bg-kv-brand-soft/40 p-kv-section shadow-kv-soft">
      <div className="flex items-center gap-kv-pair border-b border-kv-brand/20 pb-kv-pair">
        <KvTypography variant="subtitle" as="h4" tone="brand">
          ثبت بازخورد و ارزیابی شایستگی عملکرد (مربی)
        </KvTypography>
      </div>

      <KvSelectField
        label="سطح شایستگی کارورز:"
        value={mentorRating}
        displayValue={competencyRatingLabel(mentorRating)}
        contentClassName="z-[150]"
        onValueChange={(value) => {
          if (
            value === '1' ||
            value === '2' ||
            value === '3' ||
            value === '4' ||
            value === '5'
          ) {
            onMentorRatingChange(value);
          }
        }}
      >
        {DAILY_APPROVAL_COMPETENCY_OPTIONS.map((option) => (
          <KvSelectItem key={option.value} value={option.value}>
            {option.label}
          </KvSelectItem>
        ))}
      </KvSelectField>

      <div className="space-y-kv-pair">
        <div className="flex items-center justify-between gap-kv-pair">
          <KvTypography variant="label" as="span">
            شرح بازخورد متنی (الزامی):
          </KvTypography>
          <Badge variant="danger">تکمیل این بخش اجباری است</Badge>
        </div>
        <KvTextArea
          label={false}
          value={mentorFeedback}
          rows={3}
          maxLength={1200}
          placeholder="نقاط قوت، توصیه‌ها یا ضعف عملکرد کارورز را بنویسید..."
          onChange={(event) => onMentorFeedbackChange(event.target.value)}
        />
      </div>
    </div>
  );
}
