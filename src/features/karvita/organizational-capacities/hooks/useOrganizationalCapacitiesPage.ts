'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useSyncedUrlParam } from '@/hooks/useSyncedUrlParam';
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

export function useOrganizationalCapacitiesPage() {
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
  const [snapshot, setSnapshot] =
    useState<OrganizationalCapacitiesSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  useEffect(() => {
    setChrome<CapacitiesChrome>(CHROME_ID, { kind, termId });
  }, [kind, setChrome, termId]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextTerms = await OrganizationalCapacitiesService.listTerms(kind);
      const resolvedTermId = nextTerms.some((term) => term.id === termId)
        ? termId
        : (nextTerms[0]?.id ?? '');
      if (resolvedTermId !== termId) setTermId(resolvedTermId);
      if (!resolvedTermId) {
        setSnapshot(null);
        return;
      }
      const next = await OrganizationalCapacitiesService.getSnapshot({
        kind,
        termId: resolvedTermId,
      });
      setSnapshot(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'بارگذاری ظرفیت‌ها ناموفق بود.'
      );
      setSnapshot(null);
    } finally {
      setIsLoading(false);
    }
  }, [kind, termId]);

  useEffect(() => {
    void load();
  }, [load]);

  const changeKind = useCallback(
    (next: OrganizationalCapacityKind) => {
      setKind(next);
      setExpandedCourseId(null);
    },
    [setKind]
  );

  const patchLocalCourse = useCallback(
    (courseId: string, patch: Partial<OrganizationalCapacityCourse>) => {
      setSnapshot((current) => {
        if (!current) return current;
        const courses = current.courses.map((course) =>
          course.id === courseId ? { ...course, ...patch } : course
        );
        return {
          ...current,
          courses,
          summary: {
            ...current.summary,
            // refreshed after service roundtrip; keep interim values usable
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
      });
    },
    []
  );

  const updateCourseTotal = useCallback(
    async (courseId: string, rawValue: string) => {
      if (!snapshot || snapshot.status !== 'draft') return;
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
      const total = normalizeCapacityTotalInput(english, snapshot.maxCapacity);
      patchLocalCourse(courseId, { total });
      try {
        const course = snapshot.courses.find((row) => row.id === courseId);
        const next = await OrganizationalCapacitiesService.updateCourse({
          kind,
          termId: snapshot.termId,
          courseId,
          total,
          selectedDays: course?.selectedDays ?? [],
        });
        setSnapshot(next);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'به‌روزرسانی ظرفیت ناموفق بود.'
        );
        await load();
      }
    },
    [kind, load, patchLocalCourse, snapshot]
  );

  const toggleDay = useCallback(
    async (courseId: string, day: OrganizationalCapacityWeekday) => {
      if (!snapshot || snapshot.status !== 'draft') return;
      const course = snapshot.courses.find((row) => row.id === courseId);
      if (!course) return;
      const selectedDays =
        course.selectedDays.includes(day) ? [] : [day];
      patchLocalCourse(courseId, { selectedDays });
      try {
        const next = await OrganizationalCapacitiesService.updateCourse({
          kind,
          termId: snapshot.termId,
          courseId,
          total: course.total,
          selectedDays,
        });
        setSnapshot(next);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'به‌روزرسانی روز حضور ناموفق بود.'
        );
        await load();
      }
    },
    [kind, load, patchLocalCourse, snapshot]
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
      setSnapshot(next);
      setConfirmOpen(false);
      toast.success('ظرفیت‌ها با موفقیت برای مدیریت ارسال شد.');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'ارسال نهایی ظرفیت‌ها ناموفق بود.'
      );
    } finally {
      setActionBusy(false);
    }
  }, [kind, snapshot]);

  const locked = snapshot?.status !== 'draft';

  return {
    kind,
    changeKind,
    termId,
    snapshot,
    isLoading,
    error,
    reload: () => void load(),
    actionBusy,
    locked: Boolean(locked),
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
