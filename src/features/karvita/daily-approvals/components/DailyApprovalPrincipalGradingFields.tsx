'use client';

import type { ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
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

type DailyApprovalPrincipalGradingFieldsProps = {
  principalRating: DailyApprovalCompetencyRating | null;
  principalFeedback: string;
  onPrincipalRatingChange: (value: DailyApprovalCompetencyRating) => void;
  onPrincipalFeedbackChange: (value: string) => void;
  attendanceDays: PrincipalAttendanceDay[];
  attendanceDates: string[];
  onAttendanceDatesChange: (value: string[]) => void;
  supervisorVisitDates: string[];
  onSupervisorVisitDatesChange: (value: string[]) => void;
  /** استاد راهنما حضورش را اعلام کرده — راهنمای مدیر برای تأیید. */
  mentorDeclaredPresence?: boolean;
};

function DayCheckboxGroup({
  legend,
  hint,
  days,
  selected,
  onChange,
}: {
  legend: string;
  hint?: ReactNode;
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
      {hint}
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
  mentorDeclaredPresence = false,
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
        hint={
          mentorDeclaredPresence ? (
            <Badge variant="warning" className="mb-kv-pair">
              استاد راهنما حضور خود در مدرسه را برای این هفته اعلام کرده است
            </Badge>
          ) : null
        }
        days={attendanceDays}
        selected={supervisorVisitDates}
        onChange={onSupervisorVisitDatesChange}
      />

      <div className="space-y-kv-pair">
        <div className="flex items-center justify-between gap-kv-pair">
          <KvTypography variant="label" as="span">
            سطح شایستگی کارورز (الزامی):
          </KvTypography>
          {principalRating === null ? (
            <Badge variant="danger">تکمیل این بخش اجباری است</Badge>
          ) : null}
        </div>
        <KvSelectField
          label={false}
          placeholder="انتخاب کنید"
          value={principalRating ?? ''}
          displayValue={principalRating ? competencyRatingLabel(principalRating) : ''}
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
