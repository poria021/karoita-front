'use client';

import { useQueryClient } from '@tanstack/react-query';
import { type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { scheduleLocalChange, scheduleUndoableLocalChange } from '@/lib/undoable-mutation';
import {
  DEFAULT_WEEK_WEIGHT,
  SyllabusConfigService,
} from '@/services/syllabus-config.service';
import type { CourseCatalogItem, SyllabusWeek } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

import { syllabusSnapshotQueryKey } from '../lib/syllabusPageCache';
import { errorMessage } from '../lib/syllabusPageUtils';
import { weekWeightSchema } from '../schemas/syllabus-config.schema';

type UseSyllabusWeeksEditorArgs = {
  selectedTermId: string;
  selectedCourse: CourseCatalogItem | null;
  weeks: SyllabusWeek[];
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
};

export function useSyllabusWeeksEditor({
  selectedTermId,
  selectedCourse,
  weeks,
  setWeeks,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  setIsSaving,
}: UseSyllabusWeeksEditorArgs) {
  const queryClient = useQueryClient();

  function ensureCourseSelected() {
    if (!selectedTermId || !selectedCourse) {
      toast.error('ابتدا ترم و درس را انتخاب کنید.');
      return false;
    }
    return true;
  }

  function updateWeekWeight(weekId: string, weight: number) {
    const parsed = weekWeightSchema.safeParse(weight);
    if (!parsed.success) {
      toast.error('ضریب اهمیت معتبر نیست.');
      return;
    }
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === weekId ? { ...week, weight: parsed.data } : week
      )
    );
    setHasUnsavedChanges(true);
  }

  function restoreWeek(target: SyllabusWeek) {
    if (!ensureCourseSelected()) return;
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === target.id ? { ...week, status: 'active' as const } : week
      )
    );
    setHasUnsavedChanges(true);
    toast.success(
      `جلسه ${toPersianDigits(target.suffix)} مجدداً به کارتابل فراگیران بازگشت.`
    );
  }

  function archiveWeek(target: SyllabusWeek) {
    if (!ensureCourseSelected()) return;
    const label = toPersianDigits(target.title || target.suffix);

    scheduleLocalChange({
      tone: 'warning',
      message: `جلسه «${label}» آرشیو شد.`,
      apply: () => {
        setWeeks((prev) =>
          prev.map((week) =>
            week.id === target.id
              ? { ...week, status: 'archived' as const }
              : week
          )
        );
        setHasUnsavedChanges(true);
      },
    });
  }

  function addWeek() {
    if (!ensureCourseSelected()) return;
    const n = weeks.length + 1;
    const label = `هفته ${n}`;
    const next: SyllabusWeek = {
      id: `week_${Date.now()}_${n}`,
      suffix: label,
      title: label,
      weight: DEFAULT_WEEK_WEIGHT,
      status: 'active',
    };

    scheduleLocalChange({
      message: `هفته ${toPersianDigits(n)} افزوده شد.`,
      apply: () => {
        setWeeks((prev) => [...prev, next]);
        setHasUnsavedChanges(true);
      },
    });
  }

  function deleteWeek(target: SyllabusWeek) {
    if (!ensureCourseSelected()) return;
    const previous = weeks;
    const label = toPersianDigits(target.title || target.suffix);

    scheduleUndoableLocalChange({
      tone: 'error',
      message: `هفته «${label}» حذف شد.`,
      apply: () => {
        setWeeks((prev) => prev.filter((week) => week.id !== target.id));
        setHasUnsavedChanges(true);
      },
      revert: () => {
        setWeeks(previous);
      },
    });
  }

  async function saveSyllabus() {
    if (!selectedTermId || !selectedCourse || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      const courseOfferingId = SyllabusConfigService.resolveOfferingId(
        selectedTermId,
        selectedCourse.id
      );
      const snapshot = await SyllabusConfigService.saveSyllabusWeeks({
        courseOfferingId,
        termId: selectedTermId,
        courseCatalogId: selectedCourse.id,
        weeks,
      });
      queryClient.setQueryData(syllabusSnapshotQueryKey, snapshot);
      setHasUnsavedChanges(false);
      try {
        const nextWeeks = await SyllabusConfigService.getWeeks(
          selectedTermId,
          selectedCourse.id
        );
        setWeeks(nextWeeks);
      } catch {
        // ذخیره موفق بود؛ شناسهٔ هفته تا GET بعدی محلی می‌ماند.
      }
      toast.success('برنامه سرفصل‌های هفتگی با موفقیت ثبت نهایی شد.');
      toast.success('برنامه سرفصل‌های هفتگی با موفقیت ثبت نهایی شد.');
    } catch (err) {
      toast.error(errorMessage(err, 'ثبت نهایی سرفصل ناموفق بود.'));
    } finally {
      setIsSaving(false);
    }
  }

  return {
    updateWeekWeight,
    restoreWeek,
    archiveWeek,
    addWeek,
    deleteWeek,
    saveSyllabus,
  };
}
