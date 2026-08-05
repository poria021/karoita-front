'use client';

import { useCallback, useEffect, useState } from 'react';

import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import { useUserStore } from '@/store/useUserStore';
import type {
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRole,
} from '@/types/internship-enrollment';

import {
  INTERNSHIP_ENROLLMENT_CHROME_ID,
  levelsForRole,
} from '../constants';

type EnrollmentChrome = {
  level: InternshipEnrollmentLevel;
};

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

export function useInternshipEnrollmentPage() {
  const activeUser = useUserStore((s) => s.activeUser);
  const role = isEnrollmentRole(activeUser?.role) ? activeUser.role : null;

  const getChrome = useDashboardModuleCache((s) => s.getChrome);
  const setChrome = useDashboardModuleCache((s) => s.setChrome);
  const cachedChrome = getChrome<EnrollmentChrome>(
    INTERNSHIP_ENROLLMENT_CHROME_ID
  );

  const allowedLevels: InternshipEnrollmentLevel[] = role
    ? levelsForRole(role)
    : [1];
  const initialLevel: InternshipEnrollmentLevel =
    cachedChrome?.level && allowedLevels.includes(cachedChrome.level)
      ? cachedChrome.level
      : (allowedLevels[0] ?? 1);

  const [level, setLevel] = useState<InternshipEnrollmentLevel>(initialLevel);
  const [state, setState] = useState<InternshipEnrollmentPageState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!role) return;
    const nextAllowed = levelsForRole(role);
    if (!nextAllowed.includes(level)) {
      setLevel(nextAllowed[0]!);
    }
  }, [role, level]);

  useEffect(() => {
    setChrome<EnrollmentChrome>(INTERNSHIP_ENROLLMENT_CHROME_ID, { level });
  }, [level, setChrome]);

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
        level,
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
  }, [role, level]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeLevel = useCallback((next: InternshipEnrollmentLevel) => {
    setLevel(next);
  }, []);

  return {
    role,
    level,
    changeLevel,
    state,
    isLoading,
    error,
    reload: load,
  };
}

export type UseInternshipEnrollmentPageReturn = ReturnType<
  typeof useInternshipEnrollmentPage
>;
