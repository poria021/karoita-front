'use client';

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { toast } from 'sonner';

import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
import type { CourseCatalogItem, SyllabusWeek } from '@/types/syllabus-config';

export const SYLLABUS_WEEKS_DRAFT_TOAST_ID = 'syllabus-weeks-unsaved-draft';

type UseSyllabusWeeksDraftArgs = {
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  weeks: SyllabusWeek[];
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
};

/**
 * یک منبع واحد برای پیش‌نویس هفته‌ها تا ثبت نهایی و گارد ناوبری
 * همزمان toast بازیابی را نشان ندهند.
 */
export function useSyllabusWeeksDraft({
  selectedTermId,
  selectedCourse,
  weeks,
  setWeeks,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}: UseSyllabusWeeksDraftArgs) {
  const draftKey =
    selectedTermId && selectedCourse
      ? `syllabus-weeks:${selectedTermId}:${selectedCourse.id}`
      : 'syllabus-weeks:placeholder';

  const {
    value: persistedWeeksDraft,
    hasDraft: hasSyllabusWeeksDraft,
    setValue: setSyllabusWeeksDraft,
    clearDraft: clearPersistedDraft,
  } = useLocalFormDraft<SyllabusWeek[]>({
    key: draftKey,
    initialValue: [],
    debounceMs: 400,
  });

  const promptedKeyRef = useRef<string | null>(null);

  const clearDraft = useCallback(() => {
    promptedKeyRef.current = null;
    toast.dismiss(SYLLABUS_WEEKS_DRAFT_TOAST_ID);
    clearPersistedDraft();
  }, [clearPersistedDraft]);

  useEffect(() => {
    if (!selectedTermId || !selectedCourse || !hasUnsavedChanges) return;
    setSyllabusWeeksDraft(weeks);
  }, [
    hasUnsavedChanges,
    selectedCourse,
    selectedTermId,
    setSyllabusWeeksDraft,
    weeks,
  ]);

  useEffect(() => {
    if (!selectedTermId || !selectedCourse || hasUnsavedChanges) return;
    if (!hasSyllabusWeeksDraft || !persistedWeeksDraft.length) return;
    if (promptedKeyRef.current === draftKey) return;
    promptedKeyRef.current = draftKey;

    toast.warning('پیش‌نویس ذخیره‌نشده‌ای دارید — بازیابی شود؟', {
      id: SYLLABUS_WEEKS_DRAFT_TOAST_ID,
      action: {
        label: 'بازیابی',
        onClick: () => {
          setWeeks(persistedWeeksDraft);
          setHasUnsavedChanges(true);
        },
      },
    });
  }, [
    draftKey,
    hasSyllabusWeeksDraft,
    hasUnsavedChanges,
    persistedWeeksDraft,
    selectedCourse,
    selectedTermId,
    setHasUnsavedChanges,
    setWeeks,
  ]);

  return { clearDraft };
}
