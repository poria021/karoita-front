'use client';

import { Badge } from '@/components/ui/badge';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { DailyApprovalWeekGrid } from './DailyApprovalWeekGrid';
import { DailyApprovalWeekLegend } from './DailyApprovalWeekLegend';

type DailyApprovalDetailPanelProps = {
  trainee: DailyApprovalTrainee | null;
  selectedWeekId?: string | null;
  onSelectWeek?: (week: DailyApprovalWeek) => void;
};

export function DailyApprovalDetailPanel({
  trainee,
  selectedWeekId = null,
  onSelectWeek,
}: DailyApprovalDetailPanelProps) {
  if (!trainee) {
    return (
      <KvCard tone="muted" fill className="min-h-[450px] shadow-none">
        <KvCardContent
          padding="md"
          className="flex h-full min-h-0 flex-1 flex-col items-center justify-center"
        >
          <KvEmptyState
            title="ارزیابی و ممیزی نهایی گزارش‌ها"
            description="لطفاً از لیست سمت راست بر روی یکی از کارورزان کلیک کنید تا جدول هفته‌ها و گزارش‌های ارسالی او جهت ممیزی و ارزیابی در این بخش نمایش داده شود."
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const grade =
    trainee.progressiveGrade.final20 === null
      ? '---'
      : `${toPersianDigits(trainee.progressiveGrade.final20)}/۲۰`;

  return (
    <KvCard tone="surface" fill className="min-h-[450px] shadow-none" padding="md">
      <KvCardContent
        padding="none"
        stacked
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="flex flex-col items-stretch justify-between gap-kv-group border-b border-kv-border pb-kv-group sm:flex-row sm:items-center">
          <div>
            <KvTypography variant="subtitle" as="h3">
              {trainee.traineeName}
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              {toPersianDigits(trainee.courseTitle)} • {trainee.major}
            </KvTypography>
          </div>

          <div className="flex shrink-0 items-center justify-end">
            <div className="flex w-full flex-row items-center justify-between gap-kv-group rounded-kv-control border border-kv-border bg-kv-surface px-kv-group py-kv-field text-start lg:w-auto lg:min-w-[260px]">
              <div className="flex flex-col gap-0.5 pe-kv-pair ps-kv-pair">
                <KvTypography
                  variant="caption"
                  tone="muted"
                  as="span"
                  weight="bold"
                >
                  کارنامه تحصیلی جاری
                </KvTypography>
                <KvTypography variant="caption" tone="muted" as="p">
                  وضعیت:{' '}
                  <span className="font-bold text-kv-text-secondary">
                    {trainee.progressiveGrade.statusLabel}
                  </span>
                </KvTypography>
              </div>
              <Badge
                variant={
                  trainee.progressiveGrade.gradedCount > 0
                    ? 'success'
                    : 'default'
                }
                className="font-sans font-bold"
              >
                نمره: {grade}
              </Badge>
            </div>
          </div>
        </div>

        <DailyApprovalWeekGrid
          trainee={trainee}
          selectedWeekId={selectedWeekId}
          onSelectWeek={onSelectWeek}
        />
        <DailyApprovalWeekLegend />
      </KvCardContent>
    </KvCard>
  );
}
