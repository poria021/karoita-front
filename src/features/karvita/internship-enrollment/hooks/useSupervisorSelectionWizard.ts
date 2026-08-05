'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
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
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (!started || !initialScope) return;

    let cancelled = false;
    void InternshipEnrollmentService.listEligibleSupervisors({
      actor,
      kind: state.kind,
      level: state.level,
      query: debouncedQuery,
      province,
      college,
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
    debouncedQuery,
    initialScope,
    province,
    started,
    state.kind,
    state.level,
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
    [actor, onEnrollmentComplete, state.kind, state.level, state.termId]
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
