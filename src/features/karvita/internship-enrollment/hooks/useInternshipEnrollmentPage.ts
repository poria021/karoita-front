'use client';

import { useCallback, useEffect, useState } from 'react';

import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { useUserStore } from '@/store/useUserStore';
import type {
  InternshipEnrollmentPageState,
  InternshipEnrollmentRole,
} from '@/types/internship-enrollment';

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

export function useInternshipEnrollmentPage() {
  const activeUser = useUserStore((s) => s.activeUser);
  const role = isEnrollmentRole(activeUser?.role) ? activeUser.role : null;

  const [state, setState] = useState<InternshipEnrollmentPageState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!role) {
      setState(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await InternshipEnrollmentService.getEnrollmentPageState({
        role,
      });
      setState(next);
    } catch (err) {
      setState(null);
      setError(
        err instanceof Error
          ? err.message
          : 'بارگذاری وضعیت انتخاب واحد ناموفق بود.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    role,
    state,
    isLoading,
    error,
    reload: load,
  };
}

export type UseInternshipEnrollmentPageReturn = ReturnType<
  typeof useInternshipEnrollmentPage
>;
