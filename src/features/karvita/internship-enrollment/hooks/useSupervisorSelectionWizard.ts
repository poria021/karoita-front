'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  resolveListSearchQuery,
  SEARCH_DEBOUNCE_MS,
} from '@/lib/search-debounce';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { cacheSupervisorName } from '@/services/internship-enrollment/real/supervisor-name-cache';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipSupervisor,
} from '@/types/internship-enrollment';

type UseSupervisorSelectionWizardInput = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  onEnrollmentComplete: () => Promise<void>;
};

export function useSupervisorSelectionWizard({
  actor,
  state,
  onEnrollmentComplete,
}: UseSupervisorSelectionWizardInput) {
  const selection = state.selection;
  const initialScope = selection?.scope;
  const [started, setStarted] = useState(false);
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState(initialScope?.province ?? '');
  const [college, setCollege] = useState(initialScope?.college ?? '');
  const [supervisors, setSupervisors] = useState<InternshipSupervisor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const listQuery = resolveListSearchQuery(query, debouncedQuery);

  useEffect(() => {
    if (!started || !initialScope) return;

    let cancelled = false;
    void InternshipEnrollmentService.listEligibleSupervisors({
      actor,
      kind: state.kind,
      level: state.level,
      query: listQuery,
      province,
      college,
      semesterId: state.termId,
      lessonId: state.lessonId ?? undefined,
    })
      .then((items) => {
        if (!cancelled) setSupervisors(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setSupervisors([]);
          toast.error(
            error instanceof Error
              ? error.message
              : 'بارگذاری فهرست استادان ناموفق بود.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    actor,
    college,
    initialScope,
    listQuery,
    province,
    started,
    state.kind,
    state.level,
    state.lessonId,
    state.termId,
  ]);

  const handleProvinceChange = useCallback(
    (nextProvince: string) => {
      if (!initialScope?.canChangeScope) return;
      const nextCollege = initialScope.collegesByProvince[nextProvince]?.[0] ?? '';
      setIsLoading(true);
      setProvince(nextProvince);
      setCollege(nextCollege);
    },
    [initialScope]
  );

  const handleCollegeChange = useCallback(
    (nextCollege: string) => {
      if (!initialScope?.canChangeScope) return;
      setIsLoading(true);
      setCollege(nextCollege);
    },
    [initialScope]
  );

  const enroll = useCallback(
    async (supervisorId: string) => {
      setSubmittingId(supervisorId);
      try {
        await InternshipEnrollmentService.enrollWithSupervisor({
          actor,
          kind: state.kind,
          level: state.level,
          termId: state.termId,
          supervisorId,
        });
        // همین لحظه که استاد هنوز در لیست ظرفیت‌دار قابل‌مشاهده است اسمش را کش
        // می‌کنیم — بعد از پر شدن ظرفیتش دیگر از GET `/professors` قابل بازیابی نیست.
        const chosen = supervisors.find((item) => item.id === supervisorId);
        if (chosen) cacheSupervisorName(chosen.id, chosen.name);
        toast.success('اخذ واحد و انتخاب استاد با موفقیت انجام شد.');
        setStarted(false);
        await onEnrollmentComplete();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'ثبت انتخاب واحد ناموفق بود. لطفاً دوباره تلاش کنید.'
        );
      } finally {
        setSubmittingId(null);
      }
    },
    [actor, onEnrollmentComplete, state.kind, state.level, state.termId, supervisors]
  );

  return {
    started,
    start: () => {
      setIsLoading(true);
      setStarted(true);
    },
    query,
    setQuery: (nextQuery: string) => {
      setIsLoading(true);
      setQuery(nextQuery);
    },
    province,
    college,
    supervisors,
    isLoading,
    submittingId,
    scope: initialScope,
    enroll,
    onProvinceChange: handleProvinceChange,
    onCollegeChange: handleCollegeChange,
  };
}
