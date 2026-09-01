'use client';

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { DailyApprovalsService } from '@/services/daily-approvals.service';
import type { DailyApprovalCourseKind } from '@/types/daily-approvals';

import { DAILY_APPROVAL_PASSING_SCORE } from '../constants';

type UseDailyApprovalsTermsArgs = {
  kind: DailyApprovalCourseKind;
  setTermId: Dispatch<SetStateAction<string>>;
};

/** بارگذاری فهرست ترم + حدنصاب قبولی برای kind فعال. */
export function useDailyApprovalsTerms({
  kind,
  setTermId,
}: UseDailyApprovalsTermsArgs) {
  const [terms, setTerms] = useState<Array<{ id: string; title: string }>>([]);
  const [termsReady, setTermsReady] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [passingScoreThreshold, setPassingScoreThreshold] = useState(
    DAILY_APPROVAL_PASSING_SCORE
  );

  useEffect(() => {
    let cancelled = false;

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
  }, [kind, setTermId]);

  return {
    terms,
    termsReady,
    termsError,
    passingScoreThreshold,
  };
}

export type UseDailyApprovalsTermsReturn = ReturnType<
  typeof useDailyApprovalsTerms
>;