'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { CourseCatalogItem, SyllabusWeek } from '@/types/syllabus-config';

import type { PendingNavigation } from '../lib/syllabusPageCache';
import {
  decideUnsavedCourseSelect,
  decideUnsavedTermSelect,
  pendingCourseNavigation,
  pendingTermNavigation,
} from '../lib/syllabusUnsavedNav';
import { errorMessage } from '../lib/syllabusPageUtils';

type UseSyllabusUnsavedNavigationArgs = {
  hasUnsavedChanges: boolean;
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  setSelectedTermId: (termId: string) => void;
  setSelectedCourse: (course: CourseCatalogItem | null) => void;
  setWeeks: (weeks: SyllabusWeek[]) => void;
  setIsWeeksPublished: (value: boolean) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  loadTermContext: (termId: string, preferredCourseId?: string) => Promise<unknown>;
  clearSyllabusWeeksDraft: () => void;
};

/**
 * گارد عوض‌کردن ترم/درس وقتی ویرایشگر هفته‌ها ذخیرهٔ نشده دارد.
 */
export function useSyllabusUnsavedNavigation({
  hasUnsavedChanges,
  selectedTermId,
  selectedCourse,
  setSelectedTermId,
  setSelectedCourse,
  setWeeks,
  setIsWeeksPublished,
  setHasUnsavedChanges,
  loadTermContext,
  clearSyllabusWeeksDraft,
}: UseSyllabusUnsavedNavigationArgs) {
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  const commitSelectTerm = useCallback(
    async (termId: string) => {
      try {
        setSelectedTermId(termId);
        await loadTermContext(termId);
        clearSyllabusWeeksDraft();
      } catch (err) {
        toast.error(errorMessage(err, 'انتخاب ترم ناموفق بود.'));
      }
    },
    [setSelectedTermId, loadTermContext, clearSyllabusWeeksDraft]
  );

  const commitSelectCourse = useCallback(
    async (course: CourseCatalogItem) => {
      if (!selectedTermId) return;
      setSelectedCourse(course);
      try {
        const loaded = await SyllabusConfigService.getWeeks(
          selectedTermId,
          course.id
        );
        setWeeks(loaded.weeks);
        setIsWeeksPublished(loaded.isPublished);
        if (loaded.serverAlert) {
          toast.error(loaded.serverAlert);
        }
        clearSyllabusWeeksDraft();
        setHasUnsavedChanges(false);
      } catch (err) {
        toast.error(errorMessage(err, 'بارگذاری سرفصل ناموفق بود.'));
      }
    },
    [
      selectedTermId,
      setSelectedCourse,
      setWeeks,
      setIsWeeksPublished,
      clearSyllabusWeeksDraft,
      setHasUnsavedChanges,
    ]
  );

  const requestSelectTerm = useCallback(
    (termId: string) => {
      const decision = decideUnsavedTermSelect(
        termId,
        selectedTermId,
        hasUnsavedChanges
      );
      if (decision === 'noop') return;
      if (decision === 'defer') {
        setPendingNavigation(pendingTermNavigation(termId));
        return;
      }
      void commitSelectTerm(termId);
    },
    [selectedTermId, hasUnsavedChanges, commitSelectTerm]
  );

  const requestSelectCourse = useCallback(
    (course: CourseCatalogItem) => {
      const decision = decideUnsavedCourseSelect(
        course.id,
        selectedCourse?.id,
        hasUnsavedChanges
      );
      if (decision === 'noop') return;
      if (decision === 'defer') {
        setPendingNavigation(pendingCourseNavigation(course));
        return;
      }
      void commitSelectCourse(course);
    },
    [selectedCourse, hasUnsavedChanges, commitSelectCourse]
  );

  const clearPendingNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  const confirmDiscardAndNavigate = useCallback(async () => {
    const pending = pendingNavigation;
    setPendingNavigation(null);
    if (!pending) return;

    if (pending.kind === 'term') {
      await commitSelectTerm(pending.termId);
      return;
    }
    await commitSelectCourse(pending.course);
  }, [pendingNavigation, commitSelectTerm, commitSelectCourse]);

  return {
    pendingNavigation,
    clearPendingNavigation,
    confirmDiscardAndNavigate,
    selectTerm: requestSelectTerm,
    selectCourse: requestSelectCourse,
  };
}
