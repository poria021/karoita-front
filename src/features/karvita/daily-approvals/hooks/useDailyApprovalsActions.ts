'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { IS_MOCK_MODE } from '@/lib/api-mode';
import { scheduleOptimisticMutation, scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { DailyApprovalsService } from '@/services/daily-approvals.service';
import type {
  DailyApprovalCompetencyRating,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';

import {
  applyOptimisticBulkExtendWeeks,
  buildBulkExtendUndoMessage,
} from '../lib/bulkExtendOptimistic';
import {
  scheduleWeekGradingSave,
  type DailyApprovalGradingTarget,
} from '../lib/scheduleWeekGradingSave';
import type { UseDailyApprovalsListReturn } from './useDailyApprovalsList';

type UseDailyApprovalsActionsArgs = {
  list: UseDailyApprovalsListReturn;
  kind: DailyApprovalCourseKind;
  termId: string;
};

/** انتخاب، مودال نمره، حذف، و mutation تمدید گروهی. */
export function useDailyApprovalsActions({
  list,
  kind,
  termId,
}: UseDailyApprovalsActionsArgs) {
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(
    null
  );
  const [gradingTarget, setGradingTarget] =
    useState<DailyApprovalGradingTarget | null>(null);
  const [bulkExtendOpen, setBulkExtendOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const selectedTrainee =
    list.items.find((row) => row.id === selectedTraineeId) ?? null;
  const gradingTrainee =
    list.items.find((row) => row.id === gradingTarget?.traineeId) ?? null;
  const gradingWeek =
    gradingTrainee?.weeks.find((week) => week.id === gradingTarget?.weekId) ??
    null;

  const clearSelection = useCallback(() => {
    setSelectedTraineeId(null);
    setGradingTarget(null);
  }, []);

  const selectTrainee = useCallback((trainee: DailyApprovalTrainee | null) => {
    setSelectedTraineeId(trainee?.id ?? null);
  }, []);

  const closeWeekGrading = useCallback(() => {
    setGradingTarget(null);
  }, []);

  const openWeekGrading = useCallback(
    async (trainee: DailyApprovalTrainee, week: DailyApprovalWeek) => {
      if (
        week.status === 'locked_future' ||
        week.status === 'locked_dropped' ||
        week.status === 'archived'
      ) {
        return;
      }
      setSelectedTraineeId(trainee.id);
      setGradingTarget({ traineeId: trainee.id, weekId: week.id });
      setActionBusy(true);
      try {
        await DailyApprovalsService.openWeek({
          traineeId: trainee.id,
          weekId: week.id,
        });
        await list.reload();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'باز کردن گزارش هفته ناموفق بود.'
        );
      } finally {
        setActionBusy(false);
      }
    },
    [list]
  );

  const dropTrainee = useCallback(
    (trainee: DailyApprovalTrainee) => {
      const prevSelected = selectedTraineeId;
      const prevGrading = gradingTarget;
      const traineeSnapshot = structuredClone(trainee);
      let snapshot: DailyApprovalTrainee[] = [];
      let snapshotTotal = 0;

      scheduleUndoableMutation({
        tone: 'error',
        message: 'وضعیت کارورز به حذف تغییر یافت.',
        undoLabel: 'لغو',
        // real mode: commit تا بسته‌شدن toast به تأخیر می‌افتد تا «لغو» واقعی باشد.
        // mock mode: commit فوری لازم است تا داده در localStorage قبل از reload ذخیره شود.
        deferCommit: !IS_MOCK_MODE,
        apply: () => {
          list.patchItems(
            (prev) => {
              snapshot = prev;
              return prev.filter((row) => row.id !== trainee.id);
            },
            (prevTotal) => {
              snapshotTotal = prevTotal;
              return Math.max(0, prevTotal - 1);
            }
          );
          if (selectedTraineeId === trainee.id) {
            setSelectedTraineeId(null);
          }
          if (gradingTarget?.traineeId === trainee.id) {
            setGradingTarget(null);
          }
        },
        revert: () => {
          list.patchItems(() => snapshot, () => snapshotTotal);
          setSelectedTraineeId(prevSelected);
          setGradingTarget(prevGrading);
        },
        commit: async () => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.dropTrainee({ traineeId: trainee.id });
          } finally {
            setActionBusy(false);
          }
        },
        reverse: async () => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.restoreTrainee(traineeSnapshot);
          } finally {
            setActionBusy(false);
          }
        },
        onCommitted: async () => {
          await list.reload();
        },
        onUndone: () => {
          void list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : ''
          );
        },
      });
    },
    [gradingTarget, list, selectedTraineeId]
  );

  const saveSupervisorWeek = useCallback(
    async (input: { score: number | null; advisorFeedback: string }) => {
      scheduleWeekGradingSave({
        gradingTarget,
        message:
          input.score === null
            ? 'بازخورد ذخیره شد؛ گزارش به وضعیت «نیازمند ویرایش» تغییر یافت.'
            : 'نمره نهایی گزارش با موفقیت ثبت شد.',
        setGradingTarget,
        commit: async (target) => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.updateWeekEvaluation({
              traineeId: target.traineeId,
              weekId: target.weekId,
              score: input.score,
              advisorFeedback: input.advisorFeedback,
            });
          } finally {
            setActionBusy(false);
          }
        },
        onCommitted: async () => {
          await list.reload();
        },
      });
    },
    [gradingTarget, list]
  );

  const saveMentorWeek = useCallback(
    async (input: {
      mentorFeedback: string;
      mentorRating: DailyApprovalCompetencyRating;
    }) => {
      scheduleWeekGradingSave({
        gradingTarget,
        message:
          'ارزیابی با موفقیت ثبت نهایی شد و گزارش در وضعیت تایید قرار گرفت.',
        setGradingTarget,
        commit: async (target) => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.updateMentorWeekEvaluation({
              traineeId: target.traineeId,
              weekId: target.weekId,
              mentorFeedback: input.mentorFeedback,
              mentorRating: input.mentorRating,
            });
          } finally {
            setActionBusy(false);
          }
        },
        onCommitted: async () => {
          await list.reload();
        },
      });
    },
    [gradingTarget, list]
  );

  const savePrincipalWeek = useCallback(
    async (input: {
      principalFeedback: string;
      principalRating: DailyApprovalCompetencyRating;
    }) => {
      scheduleWeekGradingSave({
        gradingTarget,
        message: 'ارزیابی توصیفی مدیر مدرسه با موفقیت ثبت نهایی شد.',
        setGradingTarget,
        commit: async (target) => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.updatePrincipalWeekEvaluation({
              traineeId: target.traineeId,
              weekId: target.weekId,
              principalFeedback: input.principalFeedback,
              principalRating: input.principalRating,
            });
          } finally {
            setActionBusy(false);
          }
        },
        onCommitted: async () => {
          await list.reload();
        },
      });
    },
    [gradingTarget, list]
  );

  const openBulkExtend = useCallback(() => {
    setBulkExtendOpen(true);
  }, []);

  const closeBulkExtend = useCallback(() => {
    if (actionBusy) return;
    setBulkExtendOpen(false);
  }, [actionBusy]);

  const bulkExtendWeeks = useCallback(
    (input: {
      course: DailyApprovalCourseFilter;
      weekNumbers: number[];
      revokeWeekNumbers: number[];
    }) => {
      if (!termId) {
        toast.error('نیم‌سال تحصیلی مشخص نشده است.');
        return;
      }

      let snapshot: DailyApprovalTrainee[] = [];
      let snapshotTotal = 0;
      const commitTermId = termId;
      const commitCourse = input.course;

      scheduleOptimisticMutation({
        tone: 'success',
        message: buildBulkExtendUndoMessage(
          input.weekNumbers,
          input.revokeWeekNumbers
        ),
        apply: () => {
          setBulkExtendOpen(false);
          list.patchItems(
            (prev) => {
              snapshot = prev;
              return applyOptimisticBulkExtendWeeks(
                prev,
                input.weekNumbers,
                input.revokeWeekNumbers,
                commitCourse
              );
            },
            (prevTotal) => {
              snapshotTotal = prevTotal;
              return prevTotal;
            }
          );
        },
        revert: () => {
          list.patchItems(() => snapshot, () => snapshotTotal);
        },
        commit: async () => {
          setActionBusy(true);
          try {
            await DailyApprovalsService.bulkExtendWeeks({
              kind,
              termId: commitTermId,
              course: commitCourse,
              weekNumbers: input.weekNumbers,
              revokeWeekNumbers: input.revokeWeekNumbers,
            });
          } finally {
            setActionBusy(false);
          }
        },
        onCommitted: async () => {
          await list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : ''
          );
        },
      });
    },
    [kind, list, termId]
  );

  return {
    clearSelection,
    selectedTrainee,
    selectTrainee,
    actionBusy,
    dropTrainee,
    gradingOpen: gradingTarget !== null,
    gradingTrainee,
    gradingWeek,
    openWeekGrading,
    closeWeekGrading,
    saveSupervisorWeek,
    saveMentorWeek,
    savePrincipalWeek,
    bulkExtendOpen,
    openBulkExtend,
    closeBulkExtend,
    bulkExtendWeeks,
  };
}

export type UseDailyApprovalsActionsReturn = ReturnType<
  typeof useDailyApprovalsActions
>;