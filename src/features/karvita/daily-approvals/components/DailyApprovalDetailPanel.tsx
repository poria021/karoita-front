'use client';

import {
  KvCard,
  KvCardContent,
} from '@/components/shared/KvCard';
import { KvEmptyState } from '@/components/shared/KvEmptyState';
import { KvTypography } from '@/components/shared/KvTypography';
import { cn } from '@/lib/utils';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { DailyApprovalWeekEvaluation } from './DailyApprovalWeekEvaluation';
import { DailyApprovalWeekGrid } from './DailyApprovalWeekGrid';
import { DailyApprovalWeekLegend } from './DailyApprovalWeekLegend';

type DailyApprovalDetailPanelProps = {
  trainee: DailyApprovalTrainee | null;
  selectedWeek: DailyApprovalWeek | null;
  advisorFeedback: string;
  scoreInput: string;
  actionBusy: boolean;
  onSelectWeek: (week: DailyApprovalWeek) => void;
  onAdvisorFeedbackChange: (value: string) => void;
  onScoreInputChange: (value: string) => void;
  onSave: () => void;
  onExtend: () => void;
  onCloseWeek: () => void;
};

export function DailyApprovalDetailPanel({
  trainee,
  selectedWeek,
  advisorFeedback,
  scoreInput,
  actionBusy,
  onSelectWeek,
  onAdvisorFeedbackChange,
  onScoreInputChange,
  onSave,
  onExtend,
  onCloseWeek,
}: DailyApprovalDetailPanelProps) {
  if (!trainee) {
    return (
      <KvCard tone="muted" fill className="min-h-[450px]">
        <KvCardContent
          padding="md"
          className="flex h-full min-h-[450px] flex-1 flex-col items-center justify-center"
        >
          <KvEmptyState
            title="ارزیابی و ممیزی نهایی گزارش‌ها"
            description="لطفاً از لیست سمت راست بر روی یکی از کارورزان کلیک کنید تا جدول هفته‌ها و گزارش‌های ارسالی او جهت ممیزی و ارزیابی در این بخش نمایش داده شود."
          />
        </KvCardContent>
      </KvCard>
    );
  }

  const grade = trainee.progressiveGrade;
  const scoreTone =
    grade.gradedCount === 0
      ? 'border-kv-border bg-kv-surface-muted text-kv-text-muted'
      : trainee.status === 'dropped'
        ? 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg'
        : (grade.final20 ?? 0) >= 14
          ? 'border-kv-success-border bg-kv-success-soft text-kv-success-soft-fg'
          : 'border-kv-danger-border bg-kv-danger-soft text-kv-danger-soft-fg';

  return (
    <KvCard
      tone="muted"
      fill
      className="min-h-[450px]"
      padding="md"
    >
      <KvCardContent padding="none" stacked className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col items-start justify-between gap-kv-group border-b border-kv-border pb-kv-group sm:flex-row sm:items-center">
          <div>
            <KvTypography variant="subtitle" as="h3">
              {trainee.traineeName}
            </KvTypography>
            <KvTypography variant="caption" tone="muted">
              {toPersianDigits(trainee.courseTitle)} • {trainee.major}
            </KvTypography>
          </div>

          <div className="flex w-full min-w-[260px] items-center justify-between gap-kv-group rounded-kv-panel border border-kv-border bg-kv-surface p-kv-group shadow-kv-soft sm:w-auto">
            <div className="space-y-kv-micro text-start">
              <KvTypography variant="caption" tone="muted" as="span">
                کارنامه تحصیلی جاری
              </KvTypography>
              <p className="text-xs font-medium text-kv-text-faint">
                وضعیت:{' '}
                <span
                  className={cn(
                    'font-bold text-kv-text',
                    trainee.status === 'dropped' && 'text-kv-danger'
                  )}
                >
                  {grade.statusLabel}
                </span>
              </p>
            </div>
            <span
              className={cn(
                'rounded-kv-control border px-kv-group py-kv-pair font-mono text-xs font-bold',
                scoreTone
              )}
            >
              نمره:{' '}
              {grade.gradedCount > 0
                ? toPersianDigits(grade.final20)
                : '---'}
              /۲۰
            </span>
          </div>
        </div>

        {selectedWeek ? (
          <DailyApprovalWeekEvaluation
            trainee={trainee}
            week={selectedWeek}
            advisorFeedback={advisorFeedback}
            scoreInput={scoreInput}
            actionBusy={actionBusy}
            onAdvisorFeedbackChange={onAdvisorFeedbackChange}
            onScoreInputChange={onScoreInputChange}
            onSave={onSave}
            onExtend={onExtend}
            onClose={onCloseWeek}
          />
        ) : (
          <>
            <DailyApprovalWeekGrid
              trainee={trainee}
              selectedWeekId={null}
              onSelectWeek={onSelectWeek}
            />
            <DailyApprovalWeekLegend />
          </>
        )}
      </KvCardContent>
    </KvCard>
  );
}
