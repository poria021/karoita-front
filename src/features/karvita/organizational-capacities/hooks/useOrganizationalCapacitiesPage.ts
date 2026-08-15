'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
import { QUERY_STALE_MS } from '@/lib/query-stale';
import { unknownErrorMessage } from '@/lib/unknown-error-message';
import { OrganizationalCapacitiesService } from '@/services/organizational-capacities.service';
import { useDashboardModuleCache } from '@/store/useDashboardModuleCache';
import type {
  OrganizationalCapacitiesSnapshot,
  OrganizationalCapacityCourse,
  OrganizationalCapacityKind,
  OrganizationalCapacityWeekday,
} from '@/types/organizational-capacities';
import { normalizeCapacityTotalInput } from '@/utils/organizational-capacity-math';
import {
  persianToEnglishDigits,
  toPersianDigits,
} from '@/utils/persianDigits';

const CHROME_ID = 'organizational-capacities';
const CAPACITY_KIND_KEYS = [
  'internship',
  'apprenticeship',
] as const satisfies readonly OrganizationalCapacityKind[];

type CapacitiesChrome = {
  kind: OrganizationalCapacityKind;
  termId: string;
};

function capacitiesTermsKey(kind: OrganizationalCapacityKind) {
  return ['org-capacities', 'terms', kind] as const;
}

function capacitiesSnapshotKey(
  kind: OrganizationalCapacityKind,
  termId: string
) {
  return ['org-capacities', 'snapshot', kind, termId] as const;
}

/** Stable signature of editable draft fields for dirty-checking. */
function courseDraftSignature(
  courses: readonly OrganizationalCapacityCourse[]
): string {
  return JSON.stringify(
    courses.map((course) => ({
      id: course.id,
      total: course.total,
      selectedDays: [...course.selectedDays].sort(),
    }))
  );
}

export function useOrganizationalCapacitiesPage() {
  const queryClient = useQueryClient();
  const getChrome = useDashboardModuleCache((state) => state.getChrome);
  const setChrome = useDashboardModuleCache((state) => state.setChrome);
  const cached = getChrome<CapacitiesChrome>(CHROME_ID);

  const [kind, setKind] = useSyncedUrlParam<OrganizationalCapacityKind>({
    name: 'kind',
    allowed: CAPACITY_KIND_KEYS,
    defaultValue: 'internship',
    preferWhenMissing: cached?.kind,
  });
  const [termId, setTermId] = useState(() => cached?.termId ?? '');
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [baselineScope, setBaselineScope] = useState('');
  const [baselineSignature, setBaselineSignature] = useState<string | null>(
    null
  );

  useEffect(() => {
    setChrome<CapacitiesChrome>(CHROME_ID, { kind, termId });
  }, [kind, setChrome, termId]);

  const {
    data: termsData,
    error: termsError,
    isPending: termsPending,
    refetch: refetchTerms,
  } = useQuery({
    queryKey: capacitiesTermsKey(kind),
    queryFn: () => OrganizationalCapacitiesService.listTerms(kind),
    staleTime: QUERY_STALE_MS.module,
  });

  const resolvedTermId = useMemo(() => {
    const terms = termsData ?? [];
    if (terms.some((term) => term.id === termId)) return termId;
    return terms[0]?.id ?? '';
  }, [termId, termsData]);

  useEffect(() => {
    if (resolvedTermId !== termId) setTermId(resolvedTermId);
  }, [resolvedTermId, termId]);

  const {
    data: snapshotData,
    error: snapshotError,
    isPending: snapshotPending,
    isFetching: snapshotFetching,
    refetch: refetchSnapshot,
  } = useQuery({
    queryKey: capacitiesSnapshotKey(kind, resolvedTermId),
    queryFn: () =>
      OrganizationalCapacitiesService.getSnapshot({
        kind,
        termId: resolvedTermId,
      }),
    enabled: Boolean(resolvedTermId),
    staleTime: QUERY_STALE_MS.module,
  });

  const snapshot = snapshotData ?? null;
  const isLoading =
    termsPending ||
    (Boolean(resolvedTermId) &&
      snapshot == null &&
      (snapshotPending || snapshotFetching));
  const error = termsError
    ? unknownErrorMessage(termsError, 'بارگذاری ظرفیت‌ها ناموفق بود.')
    : snapshotError
      ? unknownErrorMessage(snapshotError, 'بارگذاری ظرفیت‌ها ناموفق بود.')
      : null;

  useEffect(() => {
    const scope = `${kind}::${resolvedTermId}`;
    if (!snapshotData || snapshotData.termId !== resolvedTermId) return;
    if (baselineScope === scope) return;
    setBaselineScope(scope);
    setBaselineSignature(courseDraftSignature(snapshotData.courses));
  }, [baselineScope, kind, resolvedTermId, snapshotData]);

  const isDirty = useMemo(() => {
    if (!snapshot || snapshot.status !== 'draft' || baselineSignature == null) {
      return false;
    }
    return courseDraftSignature(snapshot.courses) !== baselineSignature;
  }, [baselineSignature, snapshot]);

  const reload = useCallback(() => {
    void refetchTerms();
    if (resolvedTermId) void refetchSnapshot();
  }, [refetchSnapshot, refetchTerms, resolvedTermId]);

  const changeKind = useCallback(
    (next: OrganizationalCapacityKind) => {
      setKind(next);
      setExpandedCourseId(null);
    },
    [setKind]
  );

  const setSnapshotData = useCallback(
    (next: OrganizationalCapacitiesSnapshot) => {
      queryClient.setQueryData(
        capacitiesSnapshotKey(kind, next.termId),
        next
      );
    },
    [kind, queryClient]
  );

  const patchLocalCourse = useCallback(
    (courseId: string, patch: Partial<OrganizationalCapacityCourse>) => {
      queryClient.setQueryData<OrganizationalCapacitiesSnapshot>(
        capacitiesSnapshotKey(kind, resolvedTermId),
        (current) => {
          if (!current) return current;
          const courses = current.courses.map((course) =>
            course.id === courseId ? { ...course, ...patch } : course
          );
          return {
            ...current,
            courses,
            summary: {
              ...current.summary,
              confirmed: courses.reduce((sum, row) => sum + row.confirmed, 0),
              total: courses.some((row) => row.total === null)
                ? 'unlimited'
                : courses.reduce((sum, row) => sum + (row.total ?? 0), 0),
              remaining: courses.some((row) => row.total === null)
                ? 'unlimited'
                : Math.max(
                    0,
                    courses.reduce((sum, row) => sum + (row.total ?? 0), 0) -
                      courses.reduce((sum, row) => sum + row.confirmed, 0)
                  ),
            },
          };
        }
      );
    },
    [kind, queryClient, resolvedTermId]
  );

  /** Local draft only — persist happens on final submit. */
  const updateCourseTotal = useCallback(
    (courseId: string, rawValue: string) => {
      if (!snapshot || snapshot.status !== 'draft') return;
      const course = snapshot.courses.find((row) => row.id === courseId);
      if (!course) return;
      const english = persianToEnglishDigits(rawValue);
      const digits = english.replace(/[^\d]/g, '');
      const attempted = digits === '' ? 0 : Number(digits);
      if (
        digits !== '' &&
        Number.isFinite(attempted) &&
        attempted > snapshot.maxCapacity
      ) {
        toast.message(
          `ظرفیت هر درس نمی‌تواند از سقف عمومی ${toPersianDigits(snapshot.maxCapacity)} بیشتر باشد.`
        );
      }
      let total = normalizeCapacityTotalInput(english, snapshot.maxCapacity);
      if (total < course.confirmed) {
        toast.message(
          `ظرفیت درس «${course.title}» نمی‌تواند کمتر از ثبت‌نام قطعی باشد.`
        );
        total = course.confirmed;
      }
      patchLocalCourse(courseId, { total });
    },
    [patchLocalCourse, snapshot]
  );

  /** Local draft only — persist happens on final submit. */
  const toggleDay = useCallback(
    (courseId: string, day: OrganizationalCapacityWeekday) => {
      if (!snapshot || snapshot.status !== 'draft') return;
      const course = snapshot.courses.find((row) => row.id === courseId);
      if (!course) return;
      const selectedDays = course.selectedDays.includes(day) ? [] : [day];
      patchLocalCourse(courseId, { selectedDays });
    },
    [patchLocalCourse, snapshot]
  );

  const submit = useCallback(async () => {
    if (!snapshot) return;
    setActionBusy(true);
    try {
      const next = await OrganizationalCapacitiesService.submit({
        kind,
        termId: snapshot.termId,
        courses: snapshot.courses.map((course) => ({
          courseId: course.id,
          total: course.total,
          selectedDays: course.selectedDays,
        })),
      });
      setSnapshotData(next);
      setConfirmOpen(false);
      setBaselineScope(`${kind}::${next.termId}`);
      setBaselineSignature(courseDraftSignature(next.courses));
      toast.success('ظرفیت‌ها با موفقیت برای مدیریت ارسال شد.');
    } catch (err) {
      toast.error(
        unknownErrorMessage(err, 'ارسال نهایی ظرفیت‌ها ناموفق بود.')
      );
    } finally {
      setActionBusy(false);
    }
  }, [kind, setSnapshotData, snapshot]);

  const locked = snapshot?.status !== 'draft';

  return {
    kind,
    changeKind,
    termId,
    snapshot,
    isLoading,
    error,
    reload,
    actionBusy,
    locked: Boolean(locked),
    isDirty,
    confirmOpen,
    setConfirmOpen,
    expandedCourseId,
    setExpandedCourseId,
    updateCourseTotal,
    toggleDay,
    submit,
  };
}

export type UseOrganizationalCapacitiesPageReturn = ReturnType<
  typeof useOrganizationalCapacitiesPage
>;
