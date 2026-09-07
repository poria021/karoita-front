'use client';

import { useQuery } from '@tanstack/react-query';
import { useLayoutEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { DASHBOARD_QUERY } from '@/lib/dashboard-query-keys';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { unknownErrorMessage } from '@/lib/unknown-error-message';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import { RouteService } from '@/services/route.service';
import { useUserStore } from '@/store/useUserStore';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentLevel,
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

  const resolved = useMemo(() => {
    if (!actor) return null;
    return InternshipEnrollmentService.resolveLevelForRole(actor.role, level);
  }, [actor, level]);

  const levelAllowed = Boolean(resolved && level <= resolved.maxLevel);

  useLayoutEffect(() => {
    if (!role || !resolved) return;
    if (level > resolved.maxLevel) {
      router.replace(RouteService.karvita.internshipSelection(resolved.maxLevel));
    }
  }, [role, level, resolved, router]);

  const query = useQuery({
    queryKey: [
      ...DASHBOARD_QUERY.internshipEnrollment,
      actor?.id ?? 'anon',
      actor?.role ?? 'none',
      resolved?.level ?? level,
    ],
    queryFn: () => {
      if (!actor || !resolved) {
        throw new Error('بارگذاری وضعیت انتخاب واحد ناموفق بود.');
      }
      return InternshipEnrollmentService.getEnrollmentPageState({
        actor,
        level: resolved.level,
      });
    },
    enabled: Boolean(actor) && levelAllowed,
    staleTime: QUERY_STALE_MS.module,
  });

  const isLoading =
    Boolean(actor) &&
    levelAllowed &&
    query.data == null &&
    (query.isPending || query.isFetching);

  return {
    role,
    actor,
    level,
    state: query.data ?? null,
    isLoading: actor ? isLoading : false,
    error: query.error
      ? unknownErrorMessage(
          query.error,
          'بارگذاری وضعیت انتخاب واحد ناموفق بود.'
        )
      : null,
    reload: async () => {
      await query.refetch();
    },
    cancelEnrollment: async () => {
      if (!actor || !resolved || !query.data) return;
      await InternshipEnrollmentService.cancelEnrollment({
        actor,
        kind: query.data.kind,
        level: resolved.level,
        termId: query.data.termId,
      });
      await query.refetch();
    },
  };
}

export type UseInternshipEnrollmentPageReturn = ReturnType<
  typeof useInternshipEnrollmentPage
>;
