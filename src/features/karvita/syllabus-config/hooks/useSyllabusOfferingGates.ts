'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { notifyIfPostCommitRefreshFailure } from '@/lib/post-commit-refresh';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  CourseCatalogItem,
  SyllabusConfigSnapshot,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { publishSyllabusSnapshot } from '../lib/syllabusPageCache';
import { errorMessage, offeredCatalogIdsFromList } from '../lib/syllabusPageUtils';

type UseSyllabusOfferingGatesArgs = {
  selectedTermId: string;
  selectedTerm: AcademicTerm | null;
  selectedCourse: CourseCatalogItem | null;
  offeredCatalogIds: Set<string>;
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
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

  function applySnapshotTerms(snapshot: SyllabusConfigSnapshot) {
    publishSyllabusSnapshot(queryClient, snapshot);
    setTerms(snapshot.terms);
  }

  async function refreshOfferingsAndWeeks(course: CourseCatalogItem) {
    if (!selectedTermId) return;
    const offerings = await SyllabusConfigService.listOfferings(selectedTermId);
    setOfferedCatalogIds(offeredCatalogIdsFromList(offerings));
    if (selectedCourse?.id === course.id) {
      const nextWeeks = await SyllabusConfigService.getWeeks(
        selectedTermId,
        course.id
      );
      setWeeks(nextWeeks);
      setHasUnsavedChanges(false);
    }
  }

  async function toggleEnroll(open: boolean) {
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
            term.id === selectedTermId ? { ...term, isEnrollOpen: open } : term
          )
        );
        return;
      }
      toast.error(errorMessage(err, 'تغییر وضعیت انتخاب واحد ناموفق بود.'));
    } finally {
      setPendingEnroll(false);
    }
  }

  async function toggleTermOpen(open: boolean) {
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
            term.id === selectedTermId ? { ...term, isTermOpen: open } : term
          )
        );
        return;
      }
      toast.error(errorMessage(err, 'تغییر وضعیت برگزاری کلاس ناموفق بود.'));
    } finally {
      setPendingTermOpen(false);
    }
  }

  function requestToggleEnroll(open: boolean) {
    if (!selectedTermId || pendingEnroll) return;
    if (open) {
      void toggleEnroll(true);
      return;
    }
    setGateCloseTarget('enroll');
  }

  function requestToggleTermOpen(open: boolean) {
    if (!selectedTermId || pendingTermOpen) return;
    if (open) {
      void toggleTermOpen(true);
      return;
    }
    setGateCloseTarget('term');
  }

  async function confirmGateClose() {
    const target = gateCloseTarget;
    setGateCloseTarget(null);
    if (target === 'enroll') {
      await toggleEnroll(false);
    } else if (target === 'term') {
      await toggleTermOpen(false);
    }
  }

  async function applyActivateCourse(course: CourseCatalogItem) {
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
  }

  async function applyDeactivateCourse(course: CourseCatalogItem) {
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
      toast.warning(
        `ارائه درس «${course.title}» در این نیم‌سال متوقف شد.`
      );
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
  }

  function requestToggleCourseOffering(course: CourseCatalogItem) {
    if (pendingCourseId) return;
    if (offeredCatalogIds.has(course.id)) {
      setDeactivateCourseTarget(course);
      return;
    }
    void applyActivateCourse(course);
  }

  async function confirmDeactivateCourse() {
    if (!deactivateCourseTarget) return;
    const course = deactivateCourseTarget;
    setDeactivateCourseTarget(null);
    await applyDeactivateCourse(course);
  }

  return {
    toggleEnroll: requestToggleEnroll,
    toggleTermOpen: requestToggleTermOpen,
    gateCloseTarget,
    clearGateClose: () => setGateCloseTarget(null),
    confirmGateClose,
    toggleCourseOffering: requestToggleCourseOffering,
    deactivateCourseTarget,
    clearDeactivateCourse: () => setDeactivateCourseTarget(null),
    confirmDeactivateCourse,
    pendingEnroll,
    pendingTermOpen,
    pendingCourseId,
  };
}
