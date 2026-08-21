'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const [termId] = useState(() => cached?.termId ?? '');
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // isDirty را با state نگه می‌داریم نه با ref داخل useMemo
  const [isDirty, setIsDirty] = useState(false);

  // baseline: وضعیت آخرین بار که داده از سرور آمده یا submit شده
  const baselineRef = useRef<string | null>(null);
  const baselineKeyRef = useRef<string>('');

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

  const resolvedTermId = (() => {
    const terms = termsData ?? [];
    if (terms.some((term) => term.id === termId)) return termId;
    return terms[0]?.id ?? '';
  })();

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

  // baseline فقط اولین بار که داده برای این kind+term میاد ست می‌شه
  useEffect(() => {
    if (!snapshotData || snapshotData.termId !== resolvedTermId) return;
    const key = `${kind}::${resolvedTermId}`;
    if (baselineKeyRef.current === key && baselineRef.current !== null) return;
    baselineKeyRef.current = key;
    baselineRef.current = courseDraftSignature(snapshotData.courses);
    setIsDirty(false);
  }, [snapshotData, resolvedTermId, kind]);

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

  const reload = useCallback(() => {
    baselineRef.current = null;
    baselineKeyRef.current = '';
    setIsDirty(false);
    void refetchTerms();
    if (resolvedTermId) void refetchSnapshot();
  }, [refetchSnapshot, refetchTerms, resolvedTermId]);

  const changeKind = useCallback(
    (next: OrganizationalCapacityKind) => {
      setKind(next);
      setExpandedCourseId(null);
      baselineRef.current = null;
      baselineKeyRef.current = '';
      setIsDirty(false);
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
          const updated: OrganizationalCapacitiesSnapshot = {
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
          // isDirty رو اینجا محاسبه می‌کنیم که خارج از render cycle هست
          const newSignature = courseDraftSignature(updated.courses);
          const dirty = baselineRef.current !== null && newSignature !== baselineRef.current;
          setIsDirty(dirty);
          return updated;
        }
      );
    },
    [kind, queryClient, resolvedTermId]
  );

  const updateCourseTotal = useCallback(
    (courseId: string, rawValue: string) => {
      if (!snapshot) return;
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

  const toggleDay = useCallback(
    (courseId: string, day: OrganizationalCapacityWeekday) => {
      if (!snapshot) return;
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
      // baseline رو به وضعیت جدید ست می‌کنیم → isDirty=false → دکمه قفل می‌شه
      baselineRef.current = courseDraftSignature(next.courses);
      baselineKeyRef.current = `${kind}::${next.termId}`;
      setConfirmOpen(false);
      setIsDirty(false);
      toast.success('ظرفیت‌ها با موفقیت ذخیره شدند.');
    } catch (err) {
      toast.error(unknownErrorMessage(err, 'ذخیره ظرفیت‌ها ناموفق بود.'));
    } finally {
      setActionBusy(false);
    }
  }, [kind, setSnapshotData, snapshot]);

  return {
    kind,
    changeKind,
    termId,
    snapshot,
    isLoading,
    error,
    reload,
    actionBusy,
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

export type UseOrganizationalCapacitiesPageReturn = ReturnType<typeof useOrganizationalCapacitiesPage>;
