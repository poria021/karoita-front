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

    void DailyApprovalsService.listTerms(kind)
      .then((nextTerms) => {
        if (cancelled) return;

        setTerms(nextTerms);
        setTermsError(null);
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

    void DailyApprovalsService.getPassingScoreThreshold()
      .then((threshold) => {
        if (cancelled) return;
        setPassingScoreThreshold(
          Number.isFinite(threshold) ? threshold : DAILY_APPROVAL_PASSING_SCORE
        );
      })
      .catch(() => {
        if (cancelled) return;
        setPassingScoreThreshold(DAILY_APPROVAL_PASSING_SCORE);
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