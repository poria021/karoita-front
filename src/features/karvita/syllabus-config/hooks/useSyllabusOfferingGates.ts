'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  CourseOfferingCatalogItem,
  SyllabusWeek,
} from '@/types/syllabus-config';

import { computeOfferedTitles, errorMessage } from './syllabusPageUtils';

type UseSyllabusOfferingGatesArgs = {
  selectedTermTitle: string;
  selectedTerm: AcademicTerm | null;
  selectedCourse: CourseOfferingCatalogItem | null;
  offeredTitles: Set<string>;
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
  setOfferedTitles: Dispatch<SetStateAction<Set<string>>>;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
};

/**
 * Term enroll/class gates + course offering activate/deactivate confirms.
 */
export function useSyllabusOfferingGates({
  selectedTermTitle,
  selectedTerm,
  selectedCourse,
  offeredTitles,
  setTerms,
  setWeeks,
  setOfferedTitles,
  setHasUnsavedChanges,
}: UseSyllabusOfferingGatesArgs) {
  const [gateCloseTarget, setGateCloseTarget] = useState<
    'enroll' | 'term' | null
  >(null);
  const [deactivateCourseTarget, setDeactivateCourseTarget] =
    useState<CourseOfferingCatalogItem | null>(null);

  async function toggleEnroll(open: boolean) {
    if (!selectedTermTitle) return;
    try {
      const snapshot = await SyllabusConfigService.updateTermGates({
        termTitle: selectedTermTitle,
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
    if (!selectedTermTitle) return;
    try {
      const snapshot = await SyllabusConfigService.updateTermGates({
        termTitle: selectedTermTitle,
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

  async function applyToggleCourseOffering(course: CourseOfferingCatalogItem) {
    if (!selectedTermTitle) return;
    try {
      await SyllabusConfigService.toggleCourseOffering({
        termTitle: selectedTermTitle,
        course,
      });
      const wasOffered = offeredTitles.has(course.title);
      setOfferedTitles(
        computeOfferedTitles(
          selectedTermTitle,
          SyllabusConfigService.getCoursesForTerm(selectedTerm)
        )
      );
      if (selectedCourse?.title === course.title) {
        const nextWeeks = await SyllabusConfigService.getOrSeedWeeks(
          selectedTermTitle,
          course.title,
          course.type
        );
        setWeeks(nextWeeks);
        setHasUnsavedChanges(false);
      }
      toast[wasOffered ? 'warning' : 'success'](
        wasOffered
          ? `ارائه درس «${course.title}» در این نیم‌سال متوقف شد.`
          : `درس «${course.title}» با موفقیت برای این نیم‌سال ارائه شد.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'تغییر وضعیت ارائه درس ناموفق بود.'));
    }
  }

  function requestToggleCourseOffering(course: CourseOfferingCatalogItem) {
    if (offeredTitles.has(course.title)) {
      setDeactivateCourseTarget(course);
      return;
    }
    void applyToggleCourseOffering(course);
  }

  async function confirmDeactivateCourse() {
    if (!deactivateCourseTarget) return;
    const course = deactivateCourseTarget;
    setDeactivateCourseTarget(null);
    await applyToggleCourseOffering(course);
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
