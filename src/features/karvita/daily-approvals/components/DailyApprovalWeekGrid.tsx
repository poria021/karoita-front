'use client';

import { FaIcon } from '@/components/shared/FaIcon';
import { cn } from '@/lib/utils';
import type {
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import { getWeekVisual } from '../constants';

type DailyApprovalWeekGridProps = {
  trainee: DailyApprovalTrainee;
  selectedWeekId: string | null;
  compact?: boolean;
  onSelectWeek: (week: DailyApprovalWeek) => void;
};

export function DailyApprovalWeekGrid({
  trainee,
  selectedWeekId,
  compact = false,
  onSelectWeek,
}: DailyApprovalWeekGridProps) {
  return (
    <div className="grid grid-cols-4 gap-kv-group">
      {trainee.weeks.map((week) => {
        const visual = getWeekVisual(week.status);
        const selected = selectedWeekId === week.id;
        return (
          <button
            key={week.id}
            type="button"
            onClick={() => onSelectWeek(week)}
            className={cn(
              'flex min-h-[90px] flex-col justify-between rounded-kv-panel border p-kv-group text-start shadow-kv-soft transition-colors',
              'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-kv-ring/20',
              visual.chipClass,
              selected && 'ring-[3px] ring-kv-ring/25',
              compact && 'min-h-[72px] p-kv-pair'
            )}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-black">
                هفته {toPersianDigits(week.weekNumber)}
              </span>
              <FaIcon icon={visual.icon} size="2xs" />
            </div>
            <div className="mt-kv-pair space-y-kv-micro">
              <span className="block text-xs font-bold">{visual.label}</span>
              {week.status === 'graded' && week.score !== null ? (
                <span className="block text-xs font-black">
                  {toPersianDigits(week.score)}/۱۰۰
                </span>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
