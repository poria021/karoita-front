'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, type Dispatch, type SetStateAction } from 'react';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { DailyApprovalsService } from '@/services/daily-approvals.service';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';

import { DAILY_APPROVAL_PASSING_SCORE } from '../constants';

type UseDailyApprovalsTermsArgs = {
  kind: DailyApprovalCourseKind;
  setTermId: Dispatch<SetStateAction<string>>;
};

/** فهرست ترم + حدنصاب قبولی — Query تا بعد از mutation سرفصل invalidate شود. */
export function useDailyApprovalsTerms({
  kind,
  setTermId,
}: UseDailyApprovalsTermsArgs) {
  const termsQuery = useQuery({
    queryKey: DASHBOARD_QUERY.dailyApprovalsTerms(kind),
    queryFn: () => DailyApprovalsService.listTerms(kind),
    staleTime: QUERY_STALE_MS.module,
  });
  const passingQuery = useQuery({
    queryKey: DASHBOARD_QUERY.passingScoreThreshold,
    queryFn: () => DailyApprovalsService.getPassingScoreThreshold(),
    staleTime: QUERY_STALE_MS.module,
  });

  const terms = termsQuery.data ?? [];
  const termsReady = termsQuery.isFetched || termsQuery.isError;

  useEffect(() => {
    if (!termsQuery.isSuccess || !termsQuery.data) return;
    const nextTerms = termsQuery.data;
    setTermId((current) => {
      if (nextTerms.some((term) => term.id === current)) return current;
      return nextTerms[0]?.id ?? '';
    });
  }, [setTermId, termsQuery.data, termsQuery.isSuccess]);

  return {
    terms,
    termsReady,
    termsError: termsQuery.error
      ? termsQuery.error instanceof Error
        ? termsQuery.error.message
        : 'بارگذاری نیم‌سال‌ها ناموفق بود.'
      : null,
    passingScoreThreshold:
      typeof passingQuery.data === 'number' && Number.isFinite(passingQuery.data)
        ? passingQuery.data
        : DAILY_APPROVAL_PASSING_SCORE,
  };
}

export type UseDailyApprovalsTermsReturn = ReturnType<
  typeof useDailyApprovalsTerms
>;
