'use client';

import { KvSelectField } from '@/components/shared/fields/KvSelectField';
import { KvSelectItem } from '@/components/shared/fields/KvSelect';
import { KvTextArea } from '@/components/shared/fields/KvTextArea';
import { KvTypography } from '@/components/shared/KvTypography';
import type { DailyApprovalCompetencyRating } from '@/types/daily-approvals';

import type { PrincipalAttendanceDay } from '../lib/principalAttendanceDays';
import {
  competencyRatingLabel,
  DAILY_APPROVAL_COMPETENCY_OPTIONS,
} from '../constants';

/** Radix `Select.Item` مقدار رشتهٔ خالی را قبول نمی‌کند — برای «بدون امتیاز» یک sentinel لازم است. */
const NO_RATING_VALUE = '__none__';

type DailyApprovalPrincipalGradingFieldsProps = {
  principalRating: DailyApprovalCompetencyRating | null;
  principalFeedback: string;
  onPrincipalRatingChange: (value: DailyApprovalCompetencyRating | null) => void;
  onPrincipalFeedbackChange: (value: string) => void;
  attendanceDays: PrincipalAttendanceDay[];
  attendanceDates: string[];
  onAttendanceDatesChange: (value: string[]) => void;
  supervisorVisitDates: string[];
  onSupervisorVisitDatesChange: (value: string[]) => void;
};

function DayCheckboxGroup({
  legend,
  days,
  selected,
  onChange,
}: {
  legend: string;
  days: PrincipalAttendanceDay[];
  selected: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="space-y-kv-pair border-0 p-0">
      <legend className="mb-kv-pair">
        <KvTypography variant="body" as="span">
          {legend}
        </KvTypography>
      </legend>
      <div className="grid grid-cols-1 gap-kv-pair sm:grid-cols-2">
        {days.map((day) => (
          <label
            key={day.isoDate}
            className="flex cursor-pointer items-center gap-kv-pair rounded-kv-control border border-kv-brand/20 bg-kv-surface px-kv-stack py-kv-pair"
          >
            <input
              type="checkbox"
              className="size-4 shrink-0 accent-kv-brand"
              checked={selected.includes(day.isoDate)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...selected, day.isoDate]
                    : selected.filter((iso) => iso !== day.isoDate)
                )
              }
            />
            <KvTypography variant="body" as="span">
              {day.weekdayLabel}
            </KvTypography>
            <KvTypography variant="caption" tone="muted" as="span">
              {day.dateLabel}
            </KvTypography>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function DailyApprovalPrincipalGradingFields({
  principalRating,
  principalFeedback,
  onPrincipalRatingChange,
  onPrincipalFeedbackChange,
  attendanceDays,
  attendanceDates,
  onAttendanceDatesChange,
  supervisorVisitDates,
  onSupervisorVisitDatesChange,
}: DailyApprovalPrincipalGradingFieldsProps) {
  return (
    <div className="space-y-kv-group rounded-kv-panel border-2 border-kv-brand/25 bg-kv-brand-soft/40 p-kv-section shadow-kv-soft">
      <div className="flex items-center gap-kv-pair border-b border-kv-brand/20 pb-kv-pair">
        <KvTypography variant="subtitle" as="h4" tone="brand">
          ارزیابی توصیفی مدیریت مدرسه
        </KvTypography>
      </div>

      <DayCheckboxGroup
        legend="تأیید حضور کارورز در مدرسه در این هفته:"
        days={attendanceDays}
        selected={attendanceDates}
        onChange={onAttendanceDatesChange}
      />

      <DayCheckboxGroup
        legend="تأیید بازدید استاد راهنما از مدرسه در این هفته (روزهایی که استاد به مدرسه آمده):"
        days={attendanceDays}
        selected={supervisorVisitDates}
        onChange={onSupervisorVisitDatesChange}
      />

      <KvSelectField
        label="سطح شایستگی کارورز (اختیاری):"
        placeholder="بدون امتیاز"
        value={principalRating ?? NO_RATING_VALUE}
        displayValue={principalRating ? competencyRatingLabel(principalRating) : 'بدون امتیاز'}
        contentClassName="z-[150]"
        onValueChange={(value) => {
          if (value === NO_RATING_VALUE) {
            onPrincipalRatingChange(null);
            return;
          }
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
        <KvSelectItem value={NO_RATING_VALUE}>بدون امتیاز</KvSelectItem>
        {DAILY_APPROVAL_COMPETENCY_OPTIONS.map((option) => (
          <KvSelectItem key={option.value} value={option.value}>
            {option.label}
          </KvSelectItem>
        ))}
      </KvSelectField>
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
