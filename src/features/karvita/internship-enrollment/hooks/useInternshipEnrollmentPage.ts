'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
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
  InternshipEnrollmentActor,
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
  const actor = useMemo<InternshipEnrollmentActor | null>(
    () =>
      activeUser && role
        ? {
            id: activeUser.id,
            role,
            approved: activeUser.approved,
            province: activeUser.province,
            college: activeUser.college,
            district: activeUser.district,
            specialPermissions: activeUser.specialPermissions,
          }
        : null,
    [activeUser, role]
  );

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
    if (!actor) {
      setState(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    const kind = kindForRole(actor.role);
    if (level > maxLevelForKind(kind)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const next = await InternshipEnrollmentService.getEnrollmentPageState({
        actor,
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
  }, [actor, level]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return {
    role,
    actor,
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
