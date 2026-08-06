'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { DailyApprovalsService } from '@/services/daily-approvals.service';
import type {
  DailyApprovalCompetencyRating,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  scheduleWeekGradingSave,
  type DailyApprovalGradingTarget,
} from '../lib/scheduleWeekGradingSave';
import type { UseDailyApprovalsListReturn } from './useDailyApprovalsList';

type UseDailyApprovalsActionsArgs = {
  list: UseDailyApprovalsListReturn;
  kind: DailyApprovalCourseKind;
  course: DailyApprovalCourseFilter;
  termId: string;
};

/** Selection, grading modal, drop, and bulk-extend mutations. */
export function useDailyApprovalsActions({
  list,
  kind,
  course,
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
      }
    },
    [list]
  );

  const dropTrainee = useCallback(
    (trainee: DailyApprovalTrainee) => {
      const prevSelected = selectedTraineeId;
      const prevGrading = gradingTarget;
      let snapshot: DailyApprovalTrainee[] = [];
      let snapshotTotal = 0;

      scheduleUndoableMutation({
        tone: 'error',
        message: 'وضعیت کارورز به حذف تغییر یافت.',
        undoLabel: 'لغو',
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
        commit: () =>
          DailyApprovalsService.dropTrainee({ traineeId: trainee.id }),
        onCommitted: async () => {
          await list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : 'حذف کارورز ناموفق بود.'
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
        errorFallback: 'ثبت ارزیابی استاد ناموفق بود.',
        setGradingTarget,
        commit: (target) =>
          DailyApprovalsService.updateWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            score: input.score,
            advisorFeedback: input.advisorFeedback,
          }),
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
        errorFallback: 'ثبت ارزیابی معلم راهنما ناموفق بود.',
        setGradingTarget,
        commit: (target) =>
          DailyApprovalsService.updateMentorWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            mentorFeedback: input.mentorFeedback,
            mentorRating: input.mentorRating,
          }),
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
        errorFallback: 'ثبت ارزیابی مدیر مدرسه ناموفق بود.',
        setGradingTarget,
        commit: (target) =>
          DailyApprovalsService.updatePrincipalWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            principalFeedback: input.principalFeedback,
            principalRating: input.principalRating,
          }),
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
    async (weekNumbers: number[]) => {
      if (!termId) {
        toast.error('نیم‌سال تحصیلی مشخص نشده است.');
        return;
      }
      setActionBusy(true);
      try {
        const result = await DailyApprovalsService.bulkExtendWeeks({
          kind,
          termId,
          course,
          weekNumbers,
        });
        toast.success(
          `مهلت ${toPersianDigits(result.extendedPairCount)} گزارش برای ${toPersianDigits(result.affectedTraineeCount)} کارورز تمدید شد.`
        );
        setBulkExtendOpen(false);
        await list.reload();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'تمدید گروهی ناموفق بود.'
        );
      } finally {
        setActionBusy(false);
      }
    },
    [course, kind, list, termId]
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
