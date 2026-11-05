'use client';

import { Badge } from '@/components/ui/badge';
import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { kvScrollAreaClassName } from '@/components/shared/KvScrollArea';
import { KvTypography } from '@/components/shared/KvTypography';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { DailyApprovalWeekGrid } from './DailyApprovalWeekGrid';
import { DAILY_APPROVALS_FEATURE } from '../constants';

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
      <KvCard
        tone="muted"
        fill
        className="min-h-[450px] border-kv-border/70 shadow-kv-soft"
      >
        <KvCardContent
          padding="md"
          className="flex h-full min-h-0 flex-1 flex-col items-center justify-center"
        >
          <KvEmptyState
            title={DAILY_APPROVALS_FEATURE.title}
            description="یک کارورز را از فهرست انتخاب کنید تا هفته‌ها و گزارش‌های ارسالی او برای ارزیابی اینجا نمایش داده شود."
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const grade =
    trainee.progressiveGrade.final20 === null
      ? '---'
      : `${toPersianDigits(trainee.progressiveGrade.final20.toFixed(2))}/۲۰`;
  const hasGrade = trainee.progressiveGrade.gradedCount > 0;

  return (
    <KvCard
      tone="surface"
      fill
      className="min-h-[450px] border-kv-border/70 shadow-kv-soft"
      padding="md"
    >
      <KvCardContent
        padding="none"
        stacked
        className={`min-h-0 flex-1 overflow-y-auto ${kvScrollAreaClassName}`}
      >
        <div className="flex flex-col items-stretch justify-between gap-kv-group border-b border-kv-border-muted pb-kv-group sm:flex-row sm:items-center">
          <div className="min-w-0 space-y-0.5">
            <KvTypography variant="subtitle" as="h3" truncate>
              {trainee.traineeName}
            </KvTypography>
            <KvTypography variant="caption" tone="muted" truncate>
              {toPersianDigits(trainee.courseTitle)}
              {trainee.major ? ` • ${trainee.major}` : ''}
            </KvTypography>
          </div>

          <div className="flex shrink-0 items-center justify-end">
            <div className="flex w-full flex-row items-center justify-between gap-kv-group rounded-kv-control bg-kv-surface-subtle px-kv-inline py-kv-pair text-start lg:w-auto lg:min-w-[15rem]">
              <div className="flex min-w-0 flex-col gap-0.5">
                <KvTypography
                  variant="caption"
                  tone="muted"
                  as="span"
                  className="font-bold tracking-wide"
                >
                  کارنامه جاری
                </KvTypography>
                <KvTypography variant="caption" tone="muted" as="p">
                  وضعیت:{' '}
                  <span className="font-bold text-kv-text-secondary">
                    {trainee.progressiveGrade.statusLabel}
                  </span>
                </KvTypography>
              </div>
              <Badge
                variant={hasGrade ? 'success' : 'default'}
                className="font-sans"
              >
                نمره: {grade}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-kv-group pt-kv-group">
          <DailyApprovalWeekGrid
            trainee={trainee}
            selectedWeekId={selectedWeekId}
            onSelectWeek={onSelectWeek}
          />
        </div>
      </KvCardContent>
    </KvCard>
  );
}
