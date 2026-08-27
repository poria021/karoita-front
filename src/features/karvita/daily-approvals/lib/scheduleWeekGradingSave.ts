import { toast } from 'sonner';

import { scheduleOptimisticMutation } from '@/lib/undoable-mutation';

export type DailyApprovalGradingTarget = {
  traineeId: string;
  weekId: string;
};

type ScheduleWeekGradingSaveArgs<T> = {
  gradingTarget: DailyApprovalGradingTarget | null;
  message: string;
  errorFallback: string;
  setGradingTarget: (next: DailyApprovalGradingTarget | null) => void;
  commit: (target: DailyApprovalGradingTarget) => Promise<T>;
  onCommitted: () => Promise<void>;
};

/**
 * Shared undoable close-modal + commit path for supervisor/mentor/principal week saves.
 */
export function scheduleWeekGradingSave<T>({
  gradingTarget,
  message,
  errorFallback,
  setGradingTarget,
  commit,
  onCommitted,
}: ScheduleWeekGradingSaveArgs<T>): void {
  if (!gradingTarget) return;
  const target = gradingTarget;

  scheduleOptimisticMutation({
    message,
    apply: () => {
      setGradingTarget(null);
    },
    revert: () => {
      setGradingTarget(target);
    },
    commit: () => commit(target),
    onCommitted,
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : errorFallback);
    },
  });
}
