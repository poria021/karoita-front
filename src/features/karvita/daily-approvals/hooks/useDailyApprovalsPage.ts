'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  DAILY_APPROVALS_PAGE_SIZE,
  DailyApprovalsService,
} from '@/services/daily-approvals.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
  DailyApprovalWeek,
} from '@/types/daily-approvals';

import { getDailyApprovalCourseOptions } from '../constants';
import { normalizeDailyApprovalScoreInput } from '../lib/dailyApprovalScore';
import {
  DAILY_APPROVALS_CACHE_NAMESPACE,
  DAILY_APPROVALS_CHROME_ID,
  dailyApprovalsListResetKey,
} from '../lib/dailyApprovalsListKeys';

const SEARCH_DEBOUNCE_MS = 300;
const DEFAULT_TERM_ID = 'term-1404-2';

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
  const [termId, setTermId] = useState(
    () => cachedChrome?.termId ?? DEFAULT_TERM_ID
  );
  const [terms, setTerms] = useState<Array<{ id: string; title: string }>>([
    { id: 'term-1404-2', title: 'نیم‌سال دوم 1404-1405' },
    { id: 'term-1404-1', title: 'نیم‌سال اول 1404-1405' },
  ]);

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
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [advisorFeedback, setAdvisorFeedback] = useState('');
  const [scoreInput, setScoreInputState] = useState('');
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

  const fetchPage = useCallback(
    async ({ offset, limit }: { offset: number; limit: number }) => {
      const page = await DailyApprovalsService.listPage({
        kind,
        query: listQuery,
        readFilter,
        course,
        termId,
        offset,
        limit,
      });
      if (page.terms.length > 0) {
        setTerms(page.terms);
      }
      return page;
    },
    [course, kind, listQuery, readFilter, termId]
  );

  const list = useOffsetLimitInfiniteList<DailyApprovalTrainee>({
    resetKey,
    fetchPage,
    pageSize: DAILY_APPROVALS_PAGE_SIZE,
    cacheNamespace: DAILY_APPROVALS_CACHE_NAMESPACE,
  });

  const selectedTrainee =
    list.items.find((row) => row.id === selectedTraineeId) ?? null;

  const selectedWeek: DailyApprovalWeek | null = useMemo(() => {
    if (!selectedTrainee || !selectedWeekId) return null;
    return (
      selectedTrainee.weeks.find((week) => week.id === selectedWeekId) ?? null
    );
  }, [selectedTrainee, selectedWeekId]);

  const courseOptions = getDailyApprovalCourseOptions(kind);

  const selectTrainee = useCallback((trainee: DailyApprovalTrainee | null) => {
    setSelectedTraineeId(trainee?.id ?? null);
    setSelectedWeekId(null);
    setAdvisorFeedback('');
    setScoreInputState('');
  }, []);

  const selectWeek = useCallback(
    async (trainee: DailyApprovalTrainee, week: DailyApprovalWeek) => {
      setSelectedTraineeId(trainee.id);
      setSelectedWeekId(week.id);
      setAdvisorFeedback(week.feedback.advisor ?? '');
      setScoreInputState(week.score === null ? '' : String(week.score));
      try {
        await DailyApprovalsService.openWeek({
          traineeId: trainee.id,
          weekId: week.id,
        });
        await list.reload();
      } catch {
        // Opening still shows the week even if read-mark fails in mock edge cases.
      }
    },
    [list]
  );

  const changeKind = useCallback((next: DailyApprovalCourseKind) => {
    setKind(next);
    setCourse('all');
    setSelectedTraineeId(null);
    setSelectedWeekId(null);
  }, []);

  const changeReadFilter = useCallback((next: DailyApprovalReadFilter) => {
    setReadFilter(next);
    setSelectedTraineeId(null);
    setSelectedWeekId(null);
  }, []);

  const changeCourse = useCallback((next: DailyApprovalCourseFilter) => {
    setCourse(next);
    setSelectedTraineeId(null);
    setSelectedWeekId(null);
  }, []);

  const changeTerm = useCallback((nextTermId: string) => {
    setTermId(nextTermId);
    setSelectedTraineeId(null);
    setSelectedWeekId(null);
  }, []);

  const setScoreInput = useCallback((value: string) => {
    setScoreInputState(normalizeDailyApprovalScoreInput(value));
  }, []);

  const closeWeekEvaluation = useCallback(() => {
    setSelectedWeekId(null);
    setAdvisorFeedback('');
    setScoreInputState('');
  }, []);

  const saveEvaluation = useCallback(async () => {
    if (!selectedTrainee || !selectedWeek) return;
    const score =
      scoreInput.trim() === '' ? null : Number(scoreInput);
    setActionBusy(true);
    try {
      const updated = await DailyApprovalsService.updateWeekEvaluation({
        traineeId: selectedTrainee.id,
        weekId: selectedWeek.id,
        advisorFeedback,
        score,
      });
      toast.success(
        score === null
          ? 'بازخورد اصلاحی ثبت شد.'
          : 'نمره نهایی با موفقیت ثبت شد.'
      );
      setSelectedTraineeId(updated.id);
      setSelectedWeekId(null);
      await list.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'ثبت ارزیابی ناموفق بود.'
      );
    } finally {
      setActionBusy(false);
    }
  }, [advisorFeedback, list, scoreInput, selectedTrainee, selectedWeek]);

  const extendDeadline = useCallback(async () => {
    if (!selectedTrainee || !selectedWeek) return;
    setActionBusy(true);
    try {
      await DailyApprovalsService.extendWeek({
        traineeId: selectedTrainee.id,
        weekId: selectedWeek.id,
      });
      toast.success('مهلت هفته برای فراگیر تمدید شد.');
      setSelectedWeekId(null);
      await list.reload();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'تمدید مهلت ناموفق بود.'
      );
    } finally {
      setActionBusy(false);
    }
  }, [list, selectedTrainee, selectedWeek]);

  const dropTrainee = useCallback(
    async (trainee: DailyApprovalTrainee) => {
      setActionBusy(true);
      try {
        await DailyApprovalsService.dropTrainee({ traineeId: trainee.id });
        toast.success('وضعیت کارورز به حذف تغییر یافت.');
        if (selectedTraineeId === trainee.id) {
          setSelectedTraineeId(null);
          setSelectedWeekId(null);
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
    [list, selectedTraineeId]
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
    isLoading: list.isLoading,
    isLoadingMore: list.isLoadingMore,
    hasMore: list.hasMore,
    error: list.error,
    loadMoreError: list.loadMoreError,
    loadMore: () => void list.loadMore(),
    retryLoadMore: () => {
      list.clearLoadMoreError();
      void list.loadMore();
    },
    reload: () => void list.reload(),
    selectedTrainee,
    selectTrainee,
    selectedWeek,
    selectWeek,
    closeWeekEvaluation,
    advisorFeedback,
    setAdvisorFeedback,
    scoreInput,
    setScoreInput,
    actionBusy,
    saveEvaluation,
    extendDeadline,
    dropTrainee,
  };
}

export type UseDailyApprovalsPageReturn = ReturnType<
  typeof useDailyApprovalsPage
>;
