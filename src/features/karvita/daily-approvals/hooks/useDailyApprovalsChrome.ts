'use client';

import { useEffect, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
} from '@/types/daily-approvals';

import { getDailyApprovalCourseOptions } from '../constants';
import {
  DAILY_APPROVALS_CHROME_ID,
  dailyApprovalsListResetKey,
} from '../lib/dailyApprovalsListKeys';

const DAILY_APPROVAL_KIND_KEYS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly DailyApprovalCourseKind[];

export type DailyApprovalsChrome = {
  kind: DailyApprovalCourseKind;
  query: string;
  readFilter: DailyApprovalReadFilter;
  course: DailyApprovalCourseFilter;
  termId: string;
};

/** chrome فیلتر + کش ماژول — بدون دغدغهٔ لیست/mutation. */
export function useDailyApprovalsChrome() {
  const getChrome = useDashboardModuleCache((state) => state.getChrome);
  const setChrome = useDashboardModuleCache((state) => state.setChrome);
  const cachedChrome = getChrome<DailyApprovalsChrome>(
    DAILY_APPROVALS_CHROME_ID
  );

  const [kind, setKind] = useSyncedUrlParam<DailyApprovalCourseKind>({
    name: 'kind',
    allowed: DAILY_APPROVAL_KIND_KEYS,
    defaultValue: 'internship',
    preferWhenMissing: cachedChrome?.kind,
  });
  const [query, setQuery] = useState(() => cachedChrome?.query ?? '');
  const [readFilter, setReadFilter] = useState<DailyApprovalReadFilter>(
    () => cachedChrome?.readFilter ?? 'all'
  );
  const [course, setCourse] = useState<DailyApprovalCourseFilter>(
    () => cachedChrome?.course ?? 'all'
  );
  const [termId, setTermId] = useState(() => cachedChrome?.termId ?? '');

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const listQuery = resolveListSearchQuery(query, debouncedQuery);
  const resetKey = dailyApprovalsListResetKey(
    kind,
    readFilter,
    course,
    termId,
    listQuery
  );
  const courseOptions = getDailyApprovalCourseOptions(kind);

  useEffect(() => {
    setChrome<DailyApprovalsChrome>(DAILY_APPROVALS_CHROME_ID, {
      kind,
      query,
      readFilter,
      course,
      termId,
    });
  }, [course, kind, query, readFilter, setChrome, termId]);

  return {
    kind,
    setKind,
    query,
    setQuery,
    readFilter,
    setReadFilter,
    course,
    setCourse,
    termId,
    setTermId,
    listQuery,
    resetKey,
    courseOptions,
  };
}

export type UseDailyApprovalsChromeReturn = ReturnType<
  typeof useDailyApprovalsChrome
>;
