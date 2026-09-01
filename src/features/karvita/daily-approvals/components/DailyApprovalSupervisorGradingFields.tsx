'use client';

import { Badge } from '@/components/ui/badge';
import { FaIcon } from '@/components/shared/FaIcon';
import { KvAlert } from '@/components/shared/KvAlert';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTextField } from '@/components/shared/fields/KvTextField';
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalWeek } from '@/types/daily-approvals';
import { faIcons } from '@/utils/iconMap';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  competencyRatingLabel,
  DAILY_APPROVAL_PASSING_SCORE,
} from '../constants';

type DailyApprovalSupervisorGradingFieldsProps = {
  week: DailyApprovalWeek;
  schoolName: string | null;
  advisorFeedback: string;
  scoreInput: string;
  /** حد نصاب قبولی سیستم از تنظیمات ترم (۰–۱۰۰). */
  passingScoreThreshold?: number;
  onAdvisorFeedbackChange: (value: string) => void;
  onScoreInputChange: (value: string) => void;
};

export function DailyApprovalSupervisorGradingFields({
  week,
  schoolName,
  advisorFeedback,
  scoreInput,
  passingScoreThreshold = DAILY_APPROVAL_PASSING_SCORE,
  onAdvisorFeedbackChange,
  onScoreInputChange,
}: DailyApprovalSupervisorGradingFieldsProps) {
  const threshold = Number.isFinite(passingScoreThreshold)
    ? passingScoreThreshold
    : DAILY_APPROVAL_PASSING_SCORE;
  const scoreNumber =
    scoreInput.trim() === '' ? null : Number(scoreInput.trim());
  const hasScore = scoreNumber !== null && Number.isFinite(scoreNumber);
  const scoreTone = !hasScore
    ? 'neutral'
    : scoreNumber! >= threshold
      ? 'success'
      : 'danger';

  const scorePanelClass =
    scoreTone === 'success'
      ? 'border-kv-success-border bg-kv-success-soft'
      : scoreTone === 'danger'
        ? 'border-kv-danger-border bg-kv-danger-soft'
        : 'border-kv-border bg-kv-surface-muted';

  return (
    <div className="space-y-kv-group border-t border-kv-border pt-kv-group">
      <KvTypography variant="subtitle" as="h4">
        ۲. ارزیابی ثبت شده توسط ارکان مدرسه:
      </KvTypography>

      <div className="grid grid-cols-1 gap-kv-pair sm:grid-cols-2">
        <div className="flex flex-col justify-between rounded-kv-control border border-kv-border bg-kv-surface-muted p-kv-group">
          <div className="mb-kv-pair flex items-center justify-between gap-kv-pair border-b border-kv-border pb-kv-pair">
            <KvTypography variant="caption" weight="bold" as="span">
              مربی (معلم راهنما):
            </KvTypography>
            {week.feedback.mentorRating ? (
              <Badge variant="success">
                {competencyRatingLabel(week.feedback.mentorRating)}
              </Badge>
            ) : null}
          </div>
          {week.feedback.mentor ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {week.feedback.mentor}
            </KvTypography>
          ) : (
            <KvAlert
              variant="error"
              title="بازخورد متنی معلم راهنما ثبت نشده است!"
            />
          )}
        </div>

        <div className="flex flex-col justify-between rounded-kv-control border border-kv-border bg-kv-surface-muted p-kv-group">
          <div className="mb-kv-pair flex items-center justify-between gap-kv-pair border-b border-kv-border pb-kv-pair">
            <KvTypography variant="caption" weight="bold" as="span">
              مدیر مدرسه
              {schoolName ? ` (${schoolName})` : ''}:
            </KvTypography>
            {week.feedback.principalRating ? (
              <Badge variant="success">
                {competencyRatingLabel(week.feedback.principalRating)}
              </Badge>
            ) : null}
          </div>
          {week.feedback.principal ? (
            <KvTypography variant="caption" tone="muted" as="p">
              {week.feedback.principal}
            </KvTypography>
          ) : (
            <KvTypography variant="caption" tone="muted" weight="bold" as="p">
              ارزیابی توصیفی مدیر مدرسه هنوز ثبت نشده است.
            </KvTypography>
          )}
        </div>
      </div>

      <div className="space-y-kv-pair border-t border-kv-border pt-kv-group">
        <div className="flex items-center gap-kv-pair">
          <FaIcon
            icon={faIcons.commentDots}
            size="xs"
            className="text-kv-brand"
          />
          <KvTypography variant="subtitle" as="h4">
            ۳. ثبت بازخورد و یادداشت استاد (اختیاری):
          </KvTypography>
        </div>
        <KvTextArea
          label={false}
          value={advisorFeedback}
          rows={3}
          maxLength={1200}
          placeholder="بازخورد آموزشی خود را در این بخش بنویسید..."
          onChange={(event) => onAdvisorFeedbackChange(event.target.value)}
        />
      </div>

      <div
        className={`mt-kv-pair flex flex-col items-stretch justify-between gap-kv-group rounded-kv-panel border p-kv-group sm:flex-row sm:items-center ${scorePanelClass}`}
      >
        <div className="min-w-0 space-y-1">
          <KvTypography
            variant="subtitle"
            as="h4"
            tone={
              scoreTone === 'success'
                ? 'success'
                : scoreTone === 'danger'
                  ? 'danger'
                  : 'default'
            }
          >
            ثبت نمره نهایی گزارش ({toPersianDigits(0)} تا{' '}
            {toPersianDigits(100)})
          </KvTypography>
          <KvTypography variant="caption" tone="muted" as="p">
            حد نصاب قبولی: {toPersianDigits(threshold)}
            {hasScore
              ? scoreTone === 'success'
                ? ' — قبول'
                : ' — کمتر از حد نصاب (مردود)'
              : null}
          </KvTypography>
        </div>
        <div className="sm:w-32">
          <KvTextField
            label={false}
            type="number"
            inputMode="decimal"
            emphasis="metric"
            value={scoreInput}
            placeholder="نمره"
            maxLength={5}
            onChange={(event) => onScoreInputChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
