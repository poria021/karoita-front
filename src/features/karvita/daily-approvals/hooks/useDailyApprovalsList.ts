'use client';

import { useCallback } from 'react';

import { useOffsetLimitInfiniteList } from '@/hooks/useOffsetLimitInfiniteList';
import {
  DAILY_APPROVALS_PAGE_SIZE,
  DailyApprovalsService,
} from '@/services/daily-approvals.service';
import type {
  DailyApprovalCourseFilter,
  DailyApprovalCourseKind,
  DailyApprovalReadFilter,
  DailyApprovalTrainee,
} from '@/types/daily-approvals';

import { DAILY_APPROVALS_CACHE_NAMESPACE } from '../lib/dailyApprovalsListKeys';

type UseDailyApprovalsListArgs = {
  kind: DailyApprovalCourseKind;
  listQuery: string;
  readFilter: DailyApprovalReadFilter;
  course: DailyApprovalCourseFilter;
  scopeKeys?: readonly string[];
  termId: string;
  termsReady: boolean;
  resetKey: string;
};

/** لیست offset/limit کارآموز برای chrome فعال + گیت ترم. */
export function useDailyApprovalsList({
  kind,
  listQuery,
  readFilter,
  course,
  scopeKeys,
  termId,
  termsReady,
  resetKey,
}: UseDailyApprovalsListArgs) {
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
        scopeKeys,
        termId,
        offset,
        limit,
      });
    },
    [course, kind, listQuery, readFilter, scopeKeys, termId, termsReady]
  );

  const list = useOffsetLimitInfiniteList<DailyApprovalTrainee>({
    resetKey: termsReady ? resetKey : `pending-terms::${kind}`,
    fetchPage,
    pageSize: DAILY_APPROVALS_PAGE_SIZE,
    cacheNamespace: DAILY_APPROVALS_CACHE_NAMESPACE,
  });

  return list;
}

export type UseDailyApprovalsListReturn = ReturnType<
  typeof useDailyApprovalsList
>;
