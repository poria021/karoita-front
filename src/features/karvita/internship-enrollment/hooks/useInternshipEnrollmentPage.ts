'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import {
  clampLevel,
  kindForRole,
  maxLevelForKind,
} from '@/services/internship-enrollment/mock-enrollment-store';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type {
  InternshipEnrollmentLevel,
  InternshipEnrollmentPageState,
  InternshipEnrollmentRole,
} from '@/types/internship-enrollment';

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

export function useInternshipEnrollmentPage(level: InternshipEnrollmentLevel) {
  const router = useRouter();
  const activeUser = useUserStore((s) => s.activeUser);
  const role = isEnrollmentRole(activeUser?.role) ? activeUser.role : null;

  const [state, setState] = useState<InternshipEnrollmentPageState | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!role) return;
    const kind = kindForRole(role);
    const max = maxLevelForKind(kind);
    if (level > max) {
      router.replace(RouteService.karvita.internshipSelection(max));
    }
  }, [role, level, router]);

  const load = useCallback(async () => {
    if (!role) {
      setState(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const kind = kindForRole(role);
    if (level > maxLevelForKind(kind)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await InternshipEnrollmentService.getEnrollmentPageState({
        role,
        level: clampLevel(kind, level),
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

  return {
    role,
    level,
    state,
    isLoading,
    error,
    reload: load,
  };
}

export type UseInternshipEnrollmentPageReturn = ReturnType<
  typeof useInternshipEnrollmentPage
>;
