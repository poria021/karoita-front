'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import { scheduleUndoableMutation } from '@/lib/undoable-mutation';
import {
  DAILY_APPROVALS_PAGE_SIZE,
  DailyApprovalsService,
} from '@/services/daily-approvals.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  DailyApprovalCompetencyRating,
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  DAILY_APPROVAL_PASSING_SCORE,
  getDailyApprovalCourseOptions,
} from '../constants';
import {
  DAILY_APPROVALS_CACHE_NAMESPACE,
  DAILY_APPROVALS_CHROME_ID,
  dailyApprovalsListResetKey,
} from '../lib/dailyApprovalsListKeys';

const SEARCH_DEBOUNCE_MS = 300;

type DailyApprovalsChrome = {
  kind: DailyApprovalCourseKind;
  query: string;
  readFilter: DailyApprovalReadFilter;
  course: DailyApprovalCourseFilter;
  termId: string;
};

export function useDailyApprovalsPage() {
  const getChrome = useDashboardModuleCache((state) => state.getChrome);
  const setChrome = useDashboardModuleCache((state) => state.setChrome);
  const cachedChrome = getChrome<DailyApprovalsChrome>(
    DAILY_APPROVALS_CHROME_ID
  );

  const [kind, setKind] = useState<DailyApprovalCourseKind>(
    () => cachedChrome?.kind ?? 'internship'
  );
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const [readFilter, setReadFilter] = useState<DailyApprovalReadFilter>(
    () => cachedChrome?.readFilter ?? 'all'
  );
  const [course, setCourse] = useState<DailyApprovalCourseFilter>(
    () => cachedChrome?.course ?? 'all'
  );
  const [termId, setTermId] = useState(() => cachedChrome?.termId ?? '');
  const [terms, setTerms] = useState<Array<{ id: string; title: string }>>([]);
  const [termsReady, setTermsReady] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [passingScoreThreshold, setPassingScoreThreshold] = useState(
    DAILY_APPROVAL_PASSING_SCORE
  );

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const listQuery = query.trim() === '' ? '' : debouncedQuery;
  const resetKey = dailyApprovalsListResetKey(
    kind,
    readFilter,
    course,
    termId,
    listQuery
  );

  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(
    null
  );
  const [gradingTarget, setGradingTarget] = useState<{
    traineeId: string;
    weekId: string;
  } | null>(null);
  const [bulkExtendOpen, setBulkExtendOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  useEffect(() => {
    setChrome<DailyApprovalsChrome>(DAILY_APPROVALS_CHROME_ID, {
      kind,
      query,
      readFilter,
      course,
      termId,
    });
  }, [course, kind, query, readFilter, setChrome, termId]);

  useEffect(() => {
    let cancelled = false;
    setTermsReady(false);
    setTermsError(null);
    void Promise.all([
      DailyApprovalsService.listTerms(kind),
      DailyApprovalsService.getPassingScoreThreshold(),
    ])
      .then(([nextTerms, threshold]) => {
        if (cancelled) return;
        setTerms(nextTerms);
        setPassingScoreThreshold(
          Number.isFinite(threshold) ? threshold : DAILY_APPROVAL_PASSING_SCORE
        );
        setTermId((current) => {
          if (nextTerms.some((term) => term.id === current)) return current;
          return nextTerms[0]?.id ?? '';
        });
        setTermsReady(true);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setTerms([]);
        setTermId('');
        setTermsError(
          error instanceof Error
            ? error.message
            : 'بارگذاری نیم‌سال‌ها ناموفق بود.'
        );
        setTermsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      if (!termsReady || !termId) {
        return {
          items: [] as DailyApprovalTrainee[],
          total: 0,
          hasMore: false,
          terms: [] as Array<{ id: string; title: string }>,
        };
      }
      return DailyApprovalsService.listPage({
        kind,
        query: listQuery,
        readFilter,
        course,
        termId,
        offset,
        limit,
      });
    },
    [course, kind, listQuery, readFilter, termId, termsReady]
  );

  const list = useOffsetLimitInfiniteList<DailyApprovalTrainee>({
    resetKey: termsReady ? resetKey : `pending-terms::${kind}`,
    fetchPage,
    pageSize: DAILY_APPROVALS_PAGE_SIZE,
    cacheNamespace: DAILY_APPROVALS_CACHE_NAMESPACE,
  });

  const selectedTrainee =
    list.items.find((row) => row.id === selectedTraineeId) ?? null;
  const gradingTrainee =
    list.items.find((row) => row.id === gradingTarget?.traineeId) ?? null;
  const gradingWeek =
    gradingTrainee?.weeks.find((week) => week.id === gradingTarget?.weekId) ??
    null;

  const courseOptions = getDailyApprovalCourseOptions(kind);

  const selectTrainee = useCallback((trainee: DailyApprovalTrainee | null) => {
    setSelectedTraineeId(trainee?.id ?? null);
  }, []);

  const changeKind = useCallback((next: DailyApprovalCourseKind) => {
    setKind(next);
    setCourse('all');
    setSelectedTraineeId(null);
    setGradingTarget(null);
  }, []);

  const changeReadFilter = useCallback((next: DailyApprovalReadFilter) => {
    setReadFilter(next);
    setSelectedTraineeId(null);
    setGradingTarget(null);
  }, []);

  const changeCourse = useCallback((next: DailyApprovalCourseFilter) => {
    setCourse(next);
    setSelectedTraineeId(null);
    setGradingTarget(null);
  }, []);

  const changeTerm = useCallback((nextTermId: string) => {
    setTermId(nextTermId);
    setSelectedTraineeId(null);
    setGradingTarget(null);
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
    async (trainee: DailyApprovalTrainee) => {
      setActionBusy(true);
      try {
        await DailyApprovalsService.dropTrainee({ traineeId: trainee.id });
        toast.success('وضعیت کارورز به حذف تغییر یافت.');
        if (selectedTraineeId === trainee.id) {
          setSelectedTraineeId(null);
        }
        if (gradingTarget?.traineeId === trainee.id) {
          setGradingTarget(null);
        }
        await list.reload();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : 'حذف کارورز ناموفق بود.'
        );
      } finally {
        setActionBusy(false);
      }
    },
    [gradingTarget?.traineeId, list, selectedTraineeId]
  );

  const saveSupervisorWeek = useCallback(
    async (input: { score: number | null; advisorFeedback: string }) => {
      if (!gradingTarget) return;
      const target = gradingTarget;
      setGradingTarget(null);

      scheduleUndoableMutation({
        message:
          input.score === null
            ? 'بازخورد اصلاحی تا چند ثانیه دیگر ثبت می‌شود…'
            : 'نمره نهایی تا چند ثانیه دیگر ثبت می‌شود…',
        commit: () =>
          DailyApprovalsService.updateWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            score: input.score,
            advisorFeedback: input.advisorFeedback,
          }),
        onCommitted: async () => {
          toast.success(
            input.score === null
              ? 'بازخورد ذخیره شد؛ گزارش به وضعیت «نیازمند ویرایش» تغییر یافت.'
              : 'نمره نهایی گزارش با موفقیت ثبت شد.'
          );
          await list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'ثبت ارزیابی استاد ناموفق بود.'
          );
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
      if (!gradingTarget) return;
      const target = gradingTarget;
      setGradingTarget(null);

      scheduleUndoableMutation({
        message: 'ارزیابی معلم راهنما تا چند ثانیه دیگر ثبت می‌شود…',
        commit: () =>
          DailyApprovalsService.updateMentorWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            mentorFeedback: input.mentorFeedback,
            mentorRating: input.mentorRating,
          }),
        onCommitted: async () => {
          toast.success(
            'ارزیابی با موفقیت ثبت نهایی شد و گزارش در وضعیت تایید قرار گرفت.'
          );
          await list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'ثبت ارزیابی معلم راهنما ناموفق بود.'
          );
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
      if (!gradingTarget) return;
      const target = gradingTarget;
      setGradingTarget(null);

      scheduleUndoableMutation({
        message: 'ارزیابی مدیر مدرسه تا چند ثانیه دیگر ثبت می‌شود…',
        commit: () =>
          DailyApprovalsService.updatePrincipalWeekEvaluation({
            traineeId: target.traineeId,
            weekId: target.weekId,
            principalFeedback: input.principalFeedback,
            principalRating: input.principalRating,
          }),
        onCommitted: async () => {
          toast.success('ارزیابی توصیفی مدیر مدرسه با موفقیت ثبت نهایی شد.');
          await list.reload();
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : 'ثبت ارزیابی مدیر مدرسه ناموفق بود.'
          );
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
    kind,
    changeKind,
    query,
    setQuery,
    readFilter,
    changeReadFilter,
    course,
    changeCourse,
    courseOptions,
    termId,
    changeTerm,
    terms,
    resetKey,
    trainees: list.items,
    isLoading: !termsReady || list.isLoading,
    isLoadingMore: list.isLoadingMore,
    hasMore: list.hasMore,
    error: termsError ?? list.error,
    loadMoreError: list.loadMoreError,
    loadMore: () => void list.loadMore(),
    retryLoadMore: () => {
      list.clearLoadMoreError();
      void list.loadMore();
    },
    reload: () => void list.reload(),
    selectedTrainee,
    selectTrainee,
    actionBusy,
    dropTrainee,
    gradingOpen: gradingTarget !== null,
    gradingTrainee,
    gradingWeek,
    passingScoreThreshold,
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

export type UseDailyApprovalsPageReturn = ReturnType<
  typeof useDailyApprovalsPage
>;
