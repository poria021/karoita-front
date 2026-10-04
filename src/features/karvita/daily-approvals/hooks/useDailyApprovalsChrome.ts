'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import { isMockApiMode } from '@/lib/api-mode';
import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { DailyApprovalsService } from '@/services/daily-approvals.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
} from '@/types/daily-approvals';

import {
  evaluationScopeKeys,
  getDailyApprovalCourseOptions,
  getRealDailyApprovalCourseOptions,
} from '../constants';
import { useDailyApprovalModule } from './useDailyApprovalModule';
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
  const { courseModule, hasDynamicCourses, setModuleId } =
    useDailyApprovalModule(kind);
  const [termId, setTermId] = useState(() => cachedChrome?.termId ?? '');
  // real: گزینه‌های درس از lessonهای همین ترم می‌آید (مقدار = lessonId)، نه لیست ثابت.
  const isRealCatalog = !isMockApiMode();
  const termCoursesQuery = useQuery({
    queryKey: DASHBOARD_QUERY.dailyApprovalsCourses(kind, termId),
    queryFn: () => DailyApprovalsService.listCourses({ kind, termId }),
    enabled: isRealCatalog && Boolean(termId),
    staleTime: QUERY_STALE_MS.module,
  });
  const termCourses = termCoursesQuery.data;
  const courseOptions = useMemo(
    () =>
      isRealCatalog
        ? getRealDailyApprovalCourseOptions(termCourses ?? [])
        : getDailyApprovalCourseOptions(kind, courseModule),
    [isRealCatalog, termCourses, kind, courseModule]
  );
  const scopeKeys = useMemo(
    () => (courseModule ? evaluationScopeKeys(courseModule) : undefined),
    [courseModule]
  );
  const [rawCourse, setCourse] = useState<DailyApprovalCourseFilter>('all');
  // زیرمجموعهٔ درس قبلی در درس/پنل دیگر معنا ندارد.
  const course = courseOptions.some((option) => option.value === rawCourse)
    ? rawCourse
    : 'all';

  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const listQuery = resolveListSearchQuery(query, debouncedQuery);
  const resetKey = dailyApprovalsListResetKey(
    kind,
    readFilter,
    course,
    termId,
    listQuery,
    courseModule?.id
  );
  useEffect(() => {
    setChrome<DailyApprovalsChrome>(DAILY_APPROVALS_CHROME_ID, {
      kind,
      query,
      readFilter,
      termId,
    });
  }, [kind, query, readFilter, setChrome, termId]);

  return {
    kind,
    setKind,
    query,
    setQuery,
    readFilter,
    setReadFilter,
    course,
    setCourse,
    courseModule,
    showKindTabs: !hasDynamicCourses,
    setModuleId,
    scopeKeys,
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
