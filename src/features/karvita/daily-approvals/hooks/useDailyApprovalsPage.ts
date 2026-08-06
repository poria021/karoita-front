'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from '@/types/daily-approvals';

import { getDailyApprovalCourseOptions } from '../constants';
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
    void DailyApprovalsService.listTerms(kind)
      .then((nextTerms) => {
        if (cancelled) return;
        setTerms(nextTerms);
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

  const courseOptions = getDailyApprovalCourseOptions(kind);

  const selectTrainee = useCallback((trainee: DailyApprovalTrainee | null) => {
    setSelectedTraineeId(trainee?.id ?? null);
  }, []);

  const changeKind = useCallback((next: DailyApprovalCourseKind) => {
    setKind(next);
    setCourse('all');
    setSelectedTraineeId(null);
  }, []);

  const changeReadFilter = useCallback((next: DailyApprovalReadFilter) => {
    setReadFilter(next);
    setSelectedTraineeId(null);
  }, []);

  const changeCourse = useCallback((next: DailyApprovalCourseFilter) => {
    setCourse(next);
    setSelectedTraineeId(null);
  }, []);

  const changeTerm = useCallback((nextTermId: string) => {
    setTermId(nextTermId);
    setSelectedTraineeId(null);
  }, []);

  const dropTrainee = useCallback(
    async (trainee: DailyApprovalTrainee) => {
      setActionBusy(true);
      try {
        await DailyApprovalsService.dropTrainee({ traineeId: trainee.id });
        toast.success('وضعیت کارورز به حذف تغییر یافت.');
        if (selectedTraineeId === trainee.id) {
          setSelectedTraineeId(null);
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
  };
}

export type UseDailyApprovalsPageReturn = ReturnType<
  typeof useDailyApprovalsPage
>;
