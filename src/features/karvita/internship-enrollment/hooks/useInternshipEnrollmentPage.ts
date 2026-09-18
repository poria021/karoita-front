'use client';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useLayoutEffect, useMemo, useState } from 'react';
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
  InternshipEnrollmentPageState,
  InternshipEnrollmentRole,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

function isEnrollmentRole(
  role: string | undefined
): role is InternshipEnrollmentRole {
  return role === 'student' || role === 'skill_learner';
}

export function useInternshipEnrollmentPage(level: InternshipEnrollmentLevel) {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const queryKey = [
    ...DASHBOARD_QUERY.internshipEnrollment,
    actor?.id ?? 'anon',
    actor?.role ?? 'none',
    resolved?.level ?? level,
  ];

  const query = useQuery({
    queryKey,
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
    placeholderData: keepPreviousData,
  });

  const isLoading =
    Boolean(actor) &&
    levelAllowed &&
    query.data == null &&
    (query.isPending || query.isFetching);

  // نیم‌سال انتخاب‌شده در سلکت‌باکس تاریخچه — پیش‌فرض همیشه نیم‌سال جاری صفحه.
  // «تنظیم state حین رندر» به‌جای افکت (الگوی رسمی ری‌اکت) تا با عوض شدن
  // نیم‌سال جاری (`query.data.termId`)، انتخاب کاربر ریست شود بدون یک رندر اضافه.
  const [manualSelectedTermId, setManualSelectedTermId] = useState<
    string | null
  >(null);
  const [lastSeenTermId, setLastSeenTermId] = useState<string | null>(null);
  if (query.data && query.data.termId !== lastSeenTermId) {
    setLastSeenTermId(query.data.termId);
    setManualSelectedTermId(null);
  }
  const selectedTermId = manualSelectedTermId ?? query.data?.termId ?? '';

  const termHistory = query.data?.termHistory ?? [];
  const isViewingHistory = Boolean(
    query.data && selectedTermId && selectedTermId !== query.data.termId
  );

  const historyQuery = useQuery({
    queryKey: [
      ...DASHBOARD_QUERY.internshipEnrollment,
      'term-report',
      actor?.id ?? 'anon',
      resolved?.level ?? level,
      selectedTermId ?? 'none',
    ],
    queryFn: () => {
      if (!actor || !resolved || !selectedTermId) {
        throw new Error('بارگذاری گزارش نیم‌سال ناموفق بود.');
      }
      return InternshipEnrollmentService.getEnrollmentTermReport({
        actor,
        level: resolved.level,
        termId: selectedTermId,
      });
    },
    enabled: Boolean(actor && resolved && isViewingHistory),
    staleTime: QUERY_STALE_MS.module,
  });

  const viewedEnrollment = isViewingHistory
    ? (historyQuery.data ?? null)
    : (query.data?.enrollment ?? null);

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
    termHistory,
    selectedTermId,
    onSelectTerm: setManualSelectedTermId,
    isViewingHistory,
    viewedEnrollment,
    isLoadingViewedTerm:
      isViewingHistory && historyQuery.isFetching && historyQuery.data == null,
    viewedTermError:
      isViewingHistory && historyQuery.error
        ? unknownErrorMessage(
            historyQuery.error,
            'بارگذاری گزارش نیم‌سال ناموفق بود.'
          )
        : null,
    reload: async () => {
      await query.refetch();
    },
    // بعد از ذخیره/ارسال گزارش هفتگی، به‌جای refetch کامل صفحه (که برای هر
    // ۱۶ هفته یک GET گفتگو + پیام می‌زند)، فقط همان یک هفتهٔ تغییریافته را در
    // کش پچ می‌کنیم — نتیجهٔ mutation از قبل session کامل آن هفته را دارد.
    updateWeekLocally: (week: InternshipWeeklySession) => {
      queryClient.setQueryData<InternshipEnrollmentPageState>(queryKey, (prev) => {
        if (!prev?.enrollment) return prev;
        return {
          ...prev,
          enrollment: {
            ...prev.enrollment,
            weeks: prev.enrollment.weeks.map((w) =>
              w.id === week.id
                ? {
                    ...w,
                    status: week.status,
                    text: week.text,
                    files: week.files,
                    reportSubmittedAt: week.reportSubmittedAt,
                  }
                : w
            ),
          },
        };
      });
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
