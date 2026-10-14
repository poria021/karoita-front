'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { notifyIfPostCommitRefreshFailure } from '@/lib/post-commit-refresh';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  CourseCatalogItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { toPersianDigits } from '@/utils/persianDigits';

import { publishSyllabusSnapshot } from '../lib/syllabusPageCache';
import { errorMessage, offeredCatalogIdsFromList } from '../lib/syllabusPageUtils';

type UseSyllabusOfferingGatesArgs = {
  selectedTermId: string;
  selectedTerm: AcademicTerm | null;
  selectedCourse: CourseCatalogItem | null;
  offeredCatalogIds: Set<string>;
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
  setIsWeeksPublished: Dispatch<SetStateAction<boolean>>;
  setOfferedCatalogIds: Dispatch<SetStateAction<Set<string>>>;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
};

export function useSyllabusOfferingGates({
  selectedTermId,
  selectedTerm,
  selectedCourse,
  offeredCatalogIds,
  setTerms,
  setWeeks,
  setIsWeeksPublished,
  setOfferedCatalogIds,
  setHasUnsavedChanges,
}: UseSyllabusOfferingGatesArgs) {
  const queryClient = useQueryClient();
  const [gateCloseTarget, setGateCloseTarget] = useState<
    'enroll' | 'term' | null
  >(null);
  const [deactivateCourseTarget, setDeactivateCourseTarget] =
    useState<CourseCatalogItem | null>(null);
  const [pendingEnroll, setPendingEnroll] = useState(false);
  const [pendingTermOpen, setPendingTermOpen] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState<string | null>(null);
  const [pendingBulkStatus, setPendingBulkStatus] = useState<boolean | null>(null);
  const [bulkDeactivateTarget, setBulkDeactivateTarget] = useState<
    CourseCatalogItem[] | null
  >(null);

  const applySnapshotTerms = useCallback(
    (snapshot: SyllabusConfigSnapshot) => {
      publishSyllabusSnapshot(queryClient, snapshot);
      setTerms(snapshot.terms);
    },
    [queryClient, setTerms]
  );

  const refreshOfferingsAndWeeks = useCallback(
    async (course: CourseCatalogItem) => {
      if (!selectedTermId) return;
      const offerings =
        await SyllabusConfigService.listOfferings(selectedTermId);
      setOfferedCatalogIds(offeredCatalogIdsFromList(offerings));
      if (selectedCourse?.id === course.id) {
        const loaded = await SyllabusConfigService.getWeeks(
          selectedTermId,
          course.id
        );
        setWeeks(loaded.weeks);
        setIsWeeksPublished(loaded.isPublished);
        if (loaded.serverAlert) {
          toast.error(loaded.serverAlert);
        }
        setHasUnsavedChanges(false);
      }
    },
    [
      selectedTermId,
      setOfferedCatalogIds,
      selectedCourse,
      setWeeks,
      setIsWeeksPublished,
      setHasUnsavedChanges,
    ]
  );

  const toggleEnroll = useCallback(
    async (open: boolean) => {
      if (!selectedTermId) return;
      setPendingEnroll(true);
      try {
        const snapshot = await SyllabusConfigService.updateTermGates({
          termId: selectedTermId,
          isEnrollOpen: open,
        });
        applySnapshotTerms(snapshot);
        toast.success(
          open
            ? 'فرآیند انتخاب واحد پورتال فعال گردید.'
            : 'فرآیند انتخاب واحد موقتاً مسدود شد.'
        );
      } catch (err) {
        if (notifyIfPostCommitRefreshFailure(err)) {
          setTerms((prev) =>
            prev.map((term) =>
              term.id === selectedTermId
                ? { ...term, isEnrollOpen: open }
                : term
            )
          );
          return;
        }
        toast.error(errorMessage(err, 'تغییر وضعیت انتخاب واحد ناموفق بود.'));
      } finally {
        setPendingEnroll(false);
      }
    },
    [selectedTermId, applySnapshotTerms, setTerms]
  );

  const toggleTermOpen = useCallback(
    async (open: boolean) => {
      if (!selectedTermId) return;
      setPendingTermOpen(true);
      try {
        const snapshot = await SyllabusConfigService.updateTermGates({
          termId: selectedTermId,
          isTermOpen: open,
        });
        applySnapshotTerms(snapshot);
        toast.success(
          open
            ? 'برگزاری کلاس‌های ترم فعال شد.'
            : 'برگزاری کلاس‌های ترم موقتاً غیرفعال شد.'
        );
      } catch (err) {
        if (notifyIfPostCommitRefreshFailure(err)) {
          setTerms((prev) =>
            prev.map((term) =>
              term.id === selectedTermId
                ? { ...term, isTermOpen: open }
                : term
            )
          );
          return;
        }
        toast.error(errorMessage(err, 'تغییر وضعیت برگزاری کلاس ناموفق بود.'));
      } finally {
        setPendingTermOpen(false);
      }
    },
    [selectedTermId, applySnapshotTerms, setTerms]
  );

  const requestToggleEnroll = useCallback(
    (open: boolean) => {
      if (!selectedTermId || pendingEnroll) return;
      if (open) {
        void toggleEnroll(true);
        return;
      }
      setGateCloseTarget('enroll');
    },
    [selectedTermId, pendingEnroll, toggleEnroll]
  );

  const requestToggleTermOpen = useCallback(
    (open: boolean) => {
      if (!selectedTermId || pendingTermOpen) return;
      if (open) {
        void toggleTermOpen(true);
        return;
      }
      setGateCloseTarget('term');
    },
    [selectedTermId, pendingTermOpen, toggleTermOpen]
  );

  const confirmGateClose = useCallback(async () => {
    const target = gateCloseTarget;
    setGateCloseTarget(null);
    if (target === 'enroll') {
      await toggleEnroll(false);
    } else if (target === 'term') {
      await toggleTermOpen(false);
    }
  }, [gateCloseTarget, toggleEnroll, toggleTermOpen]);

  const applyActivateCourse = useCallback(
    async (course: CourseCatalogItem) => {
      if (!selectedTermId || !selectedTerm) return;
      setPendingCourseId(course.id);
      try {
        const snapshot = await SyllabusConfigService.activateOffering({
          termId: selectedTermId,
          courseCatalogId: course.id,
        });
        applySnapshotTerms(snapshot);
        await refreshOfferingsAndWeeks(course);
        toast.success(
          `درس «${course.title}» با موفقیت برای این نیم‌سال ارائه شد.`
        );
      } catch (err) {
        if (notifyIfPostCommitRefreshFailure(err)) {
          setOfferedCatalogIds((prev) => new Set(prev).add(course.id));
          return;
        }
        toast.error(errorMessage(err, 'فعال‌سازی ارائه درس ناموفق بود.'));
      } finally {
        setPendingCourseId(null);
      }
    },
    [
      selectedTermId,
      selectedTerm,
      applySnapshotTerms,
      refreshOfferingsAndWeeks,
      setOfferedCatalogIds,
    ]
  );

  const applyDeactivateCourse = useCallback(
    async (course: CourseCatalogItem) => {
      if (!selectedTermId) return;
      setPendingCourseId(course.id);
      try {
        const courseOfferingId = SyllabusConfigService.resolveOfferingId(
          selectedTermId,
          course.id
        );
        const snapshot = await SyllabusConfigService.deactivateOffering({
          courseOfferingId,
        });
        applySnapshotTerms(snapshot);
        await refreshOfferingsAndWeeks(course);
        toast.warning(`ارائه درس «${course.title}» در این نیم‌سال متوقف شد.`);
      } catch (err) {
        if (notifyIfPostCommitRefreshFailure(err)) {
          setOfferedCatalogIds((prev) => {
            const next = new Set(prev);
            next.delete(course.id);
            return next;
          });
          return;
        }
        toast.error(errorMessage(err, 'غیرفعال‌سازی ارائه درس ناموفق بود.'));
      } finally {
        setPendingCourseId(null);
      }
    },
    [
      selectedTermId,
      applySnapshotTerms,
      refreshOfferingsAndWeeks,
      setOfferedCatalogIds,
    ]
  );

  const requestToggleCourseOffering = useCallback(
    (course: CourseCatalogItem) => {
      if (pendingCourseId) return;
      if (offeredCatalogIds.has(course.id)) {
        setDeactivateCourseTarget(course);
        return;
      }
      void applyActivateCourse(course);
    },
    [pendingCourseId, offeredCatalogIds, applyActivateCourse]
  );

  const confirmDeactivateCourse = useCallback(async () => {
    if (!deactivateCourseTarget) return;
    const course = deactivateCourseTarget;
    setDeactivateCourseTarget(null);
    await applyDeactivateCourse(course);
  }, [deactivateCourseTarget, applyDeactivateCourse]);

  /** `PATCH /admin/lessons/status` — یک درخواست برای همهٔ درس‌های داده‌شده. */
  const applyBulkStatus = useCallback(
    async (courses: CourseCatalogItem[], status: boolean) => {
      if (!selectedTermId || courses.length === 0) return;
      setPendingBulkStatus(status);
      const ids = courses.map((course) => course.id);
      try {
        const snapshot = await SyllabusConfigService.setOfferingsStatus({
          termId: selectedTermId,
          courseCatalogIds: ids,
          status,
        });
        applySnapshotTerms(snapshot);
        const offerings = await SyllabusConfigService.listOfferings(selectedTermId);
        setOfferedCatalogIds(offeredCatalogIdsFromList(offerings));
        const count = toPersianDigits(String(courses.length));
        if (status) {
          toast.success(`ارائهٔ ${count} درس در این نیم‌سال فعال شد.`);
        } else {
          toast.warning(`ارائهٔ ${count} درس در این نیم‌سال متوقف شد.`);
        }
      } catch (err) {
        if (notifyIfPostCommitRefreshFailure(err)) {
          setOfferedCatalogIds((prev) => {
            const next = new Set(prev);
            for (const id of ids) {
              if (status) next.add(id);
              else next.delete(id);
            }
            return next;
          });
          return;
        }
        toast.error(errorMessage(err, 'تغییر گروهی وضعیت ارائه ناموفق بود.'));
      } finally {
        setPendingBulkStatus(null);
      }
    },
    [selectedTermId, applySnapshotTerms, setOfferedCatalogIds]
  );

  /** فعال‌سازی گروهی بی‌درنگ؛ توقف گروهی تأیید می‌خواهد (مثل توقف تکی). */
  const requestBulkCourseOffering = useCallback(
    (courses: CourseCatalogItem[], status: boolean) => {
      if (pendingCourseId || pendingBulkStatus !== null || courses.length === 0) {
        return;
      }
      if (status) {
        void applyBulkStatus(courses, true);
        return;
      }
      setBulkDeactivateTarget(courses);
    },
    [pendingCourseId, pendingBulkStatus, applyBulkStatus]
  );

  const confirmBulkDeactivate = useCallback(async () => {
    if (!bulkDeactivateTarget) return;
    const courses = bulkDeactivateTarget;
    setBulkDeactivateTarget(null);
    await applyBulkStatus(courses, false);
  }, [bulkDeactivateTarget, applyBulkStatus]);

  const clearBulkDeactivate = useCallback(() => setBulkDeactivateTarget(null), []);

  const clearGateClose = useCallback(() => setGateCloseTarget(null), []);
  const clearDeactivateCourse = useCallback(
    () => setDeactivateCourseTarget(null),
    []
  );

  return {
    toggleEnroll: requestToggleEnroll,
    toggleTermOpen: requestToggleTermOpen,
    gateCloseTarget,
    clearGateClose,
    confirmGateClose,
    toggleCourseOffering: requestToggleCourseOffering,
    deactivateCourseTarget,
    clearDeactivateCourse,
    confirmDeactivateCourse,
    pendingEnroll,
    pendingTermOpen,
    pendingCourseId,
    setCourseOfferingsStatus: requestBulkCourseOffering,
    pendingBulkStatus,
    bulkDeactivateTarget,
    clearBulkDeactivate,
    confirmBulkDeactivate,
  };
}
