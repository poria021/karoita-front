'use client';

import { useEffect, useState } from 'react';
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
  setHasUnsavedChanges: (value: boolean) => void;
  loadTermContext: (termId: string, preferredCourseId?: string) => Promise<unknown>;
};

/**
 * Guard term/course switches while the weeks editor has unsaved edits.
 */
export function useSyllabusUnsavedNavigation({
  hasUnsavedChanges,
  selectedTermId,
  selectedCourse,
  setSelectedTermId,
  setSelectedCourse,
  setWeeks,
  setHasUnsavedChanges,
  loadTermContext,
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

  async function commitSelectTerm(termId: string) {
    try {
      setSelectedTermId(termId);
      await loadTermContext(termId);
    } catch (err) {
      toast.error(errorMessage(err, 'انتخاب ترم ناموفق بود.'));
    }
  }

  async function commitSelectCourse(course: CourseCatalogItem) {
    if (!selectedTermId) return;
    setSelectedCourse(course);
    try {
      const nextWeeks = await SyllabusConfigService.getWeeks(
        selectedTermId,
        course.id
      );
      setWeeks(nextWeeks);
      setHasUnsavedChanges(false);
    } catch (err) {
      toast.error(errorMessage(err, 'بارگذاری سرفصل ناموفق بود.'));
    }
  }

  function requestSelectTerm(termId: string) {
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
  }

  function requestSelectCourse(course: CourseCatalogItem) {
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
  }

  function clearPendingNavigation() {
    setPendingNavigation(null);
  }

  async function confirmDiscardAndNavigate() {
    const pending = pendingNavigation;
    setPendingNavigation(null);
    if (!pending) return;

    if (pending.kind === 'term') {
      await commitSelectTerm(pending.termId);
      return;
    }
    await commitSelectCourse(pending.course);
  }

  return {
    pendingNavigation,
    clearPendingNavigation,
    confirmDiscardAndNavigate,
    selectTerm: requestSelectTerm,
    selectCourse: requestSelectCourse,
  };
}
