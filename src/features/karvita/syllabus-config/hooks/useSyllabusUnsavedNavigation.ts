'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
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
  weeks: SyllabusWeek[];
  setWeeks: (weeks: SyllabusWeek[]) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  loadTermContext: (termId: string, preferredCourseId?: string) => Promise<unknown>;
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
  weeks,
  setWeeks,
  setHasUnsavedChanges,
  loadTermContext,
}: UseSyllabusUnsavedNavigationArgs) {
  const [pendingNavigation, setPendingNavigation] =
    useState<PendingNavigation>(null);
  const {
    value: persistedWeeksDraft,
    hasDraft: hasSyllabusWeeksDraft,
    setValue: setSyllabusWeeksDraft,
    clearDraft: clearSyllabusWeeksDraft,
  } = useLocalFormDraft<SyllabusWeek[]>({
    key:
      selectedTermId && selectedCourse
        ? `syllabus-weeks:${selectedTermId}:${selectedCourse.id}`
        : 'syllabus-weeks:placeholder',
    initialValue: [],
    debounceMs: 400,
  });

  useEffect(() => {
    if (!selectedTermId || !selectedCourse || !hasUnsavedChanges) return;
    setSyllabusWeeksDraft(weeks);
  }, [hasUnsavedChanges, selectedCourse, selectedTermId, setSyllabusWeeksDraft, weeks]);

  useEffect(() => {
    if (!selectedTermId || !selectedCourse || hasUnsavedChanges) return;
    if (!hasSyllabusWeeksDraft || !persistedWeeksDraft.length) return;

    toast.warning('پیش‌نویس ذخیره‌نشده‌ای دارید — بازیابی شود؟', {
      action: {
        label: 'بازیابی',
        onClick: () => {
          setWeeks(persistedWeeksDraft);
          setHasUnsavedChanges(true);
        },
      },
    });
  }, [hasSyllabusWeeksDraft, hasUnsavedChanges, persistedWeeksDraft, selectedCourse, selectedTermId, setHasUnsavedChanges, setWeeks]);

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
      clearSyllabusWeeksDraft();
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
      clearSyllabusWeeksDraft();
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
