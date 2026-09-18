'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { KvButton } from '@/components/shared/KvButton';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { getWeekVisual } from '../constants';

type DailyApprovalWeekGridProps = {
  trainee: DailyApprovalTrainee;
  selectedWeekId?: string | null;
  compact?: boolean;
  onSelectWeek?: (week: DailyApprovalWeek) => void;
};

function draftCardLabel(week: DailyApprovalWeek): string {
  const hasText = Boolean(week.text?.trim());
  const hasFiles = week.files.length > 0;
  return hasText || hasFiles ? 'پیش‌نویس' : 'ثبت نشده';
}

export function DailyApprovalWeekGrid({
  trainee,
  selectedWeekId = null,
  compact = false,
  onSelectWeek,
}: DailyApprovalWeekGridProps) {
  if (trainee.weeks.length === 0) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-kv-control border border-dashed border-kv-border text-xs font-bold text-kv-text-faint ${
          compact ? 'min-h-[72px]' : 'min-h-[160px]'
        }`}
      >
        هنوز هیچ هفته‌ای برای این کارآموز ثبت نشده است.
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-2 gap-kv-inline sm:grid-cols-4'
          : 'grid grid-cols-2 gap-kv-inline sm:grid-cols-4'
      }
    >
      {trainee.weeks.map((week) => {
        const visual = getWeekVisual(week.status);
        const score =
          week.status === 'graded' && week.score !== null ? week.score : null;
        const label =
          week.status === 'draft' ? draftCardLabel(week) : visual.label;
        // تا وقتی دانشجو گزارشی نفرستاده (status === 'draft')، استاد/معلم
        // راهنما/مدیر مدرسه چیزی برای بازخورد دادن ندارند — ببین
        // openWeekGrading برای گارد اصلی.
        const locked = week.status === 'locked_future' || week.status === 'draft';
        const selected = selectedWeekId === week.id;

        return (
          <KvButton
            key={week.id}
            type="button"
            color="neutral"
            appearance="secondary"
            size="md"
            className={`h-auto min-h-[95px] flex-col items-stretch justify-between gap-0 rounded-kv-control border px-kv-group pb-kv-field pt-kv-inline text-start shadow-none ${visual.className} ${visual.hoverClassName} ${
              selected ? 'ring-[3px] ring-kv-ring/25' : ''
            } ${compact ? 'min-h-[72px]' : ''}`}
            aria-label={`هفته ${toPersianDigits(week.weekNumber)}`}
            disabled={locked}
            onClick={() => {
              if (locked) return;
              onSelectWeek?.(week);
            }}
          >
            <span className="flex w-full items-center justify-between gap-kv-inline">
              <span className="text-xs font-black leading-none">
                هفته {toPersianDigits(week.weekNumber)}
              </span>
              <FaIcon icon={visual.icon} size="xs" />
            </span>
            <span className="flex w-full flex-col items-start justify-end gap-1 pt-kv-pair text-start">
              <span className="block w-full text-xs font-bold leading-snug">
                {label}
              </span>
              {score !== null ? (
                <span className="block w-full text-xs font-black leading-snug">
                  {toPersianDigits(score)}/۱۰۰
                </span>
              ) : null}
            </span>
          </KvButton>
        );
      })}
    </div>
  );
}
