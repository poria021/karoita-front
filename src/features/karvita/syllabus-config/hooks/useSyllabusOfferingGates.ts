'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  CourseCatalogItem,
  SyllabusWeek,
} from '@/types/syllabus-config';

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
  const [gateCloseTarget, setGateCloseTarget] = useState<
    'enroll' | 'term' | null
  >(null);
  const [deactivateCourseTarget, setDeactivateCourseTarget] =
    useState<CourseCatalogItem | null>(null);

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
    try {
      const snapshot = await SyllabusConfigService.updateTermGates({
        termId: selectedTermId,
        isEnrollOpen: open,
      });
      setTerms(snapshot.terms);
      toast.success(
        open
          ? 'فرآیند انتخاب واحد پورتال فعال گردید.'
          : 'فرآیند انتخاب واحد موقتاً مسدود شد.'
      );
    } catch (err) {
      toast.error(errorMessage(err, 'تغییر وضعیت انتخاب واحد ناموفق بود.'));
    }
  }

  async function toggleTermOpen(open: boolean) {
    if (!selectedTermId) return;
    try {
      const snapshot = await SyllabusConfigService.updateTermGates({
        termId: selectedTermId,
        isTermOpen: open,
      });
      setTerms(snapshot.terms);
      toast.success(
        open
          ? 'برگزاری کلاس‌های ترم فعال شد.'
          : 'برگزاری کلاس‌های ترم موقتاً غیرفعال شد.'
      );
    } catch (err) {
      toast.error(errorMessage(err, 'تغییر وضعیت برگزاری کلاس ناموفق بود.'));
    }
  }

  function requestToggleEnroll(open: boolean) {
    if (open) {
      void toggleEnroll(true);
      return;
    }
    setGateCloseTarget('enroll');
  }

  function requestToggleTermOpen(open: boolean) {
    if (open) {
      void toggleTermOpen(true);
      return;
    }
    setGateCloseTarget('term');
  }

  async function confirmGateClose() {
    if (gateCloseTarget === 'enroll') {
      await toggleEnroll(false);
    } else if (gateCloseTarget === 'term') {
      await toggleTermOpen(false);
    }
    setGateCloseTarget(null);
  }

  async function applyActivateCourse(course: CourseCatalogItem) {
    if (!selectedTermId || !selectedTerm) return;
    try {
      await SyllabusConfigService.activateOffering({
        termId: selectedTermId,
        courseCatalogId: course.id,
      });
      await refreshOfferingsAndWeeks(course);
      toast.success(
        `درس «${course.title}» با موفقیت برای این نیم‌سال ارائه شد.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'فعال‌سازی ارائه درس ناموفق بود.'));
    }
  }

  async function applyDeactivateCourse(course: CourseCatalogItem) {
    if (!selectedTermId) return;
    try {
      const courseOfferingId = SyllabusConfigService.resolveOfferingId(
        selectedTermId,
        course.id
      );
      await SyllabusConfigService.deactivateOffering({ courseOfferingId });
      await refreshOfferingsAndWeeks(course);
      toast.warning(
        `ارائه درس «${course.title}» در این نیم‌سال متوقف شد.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'غیرفعال‌سازی ارائه درس ناموفق بود.'));
    }
  }

  function requestToggleCourseOffering(course: CourseCatalogItem) {
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
  };
}
