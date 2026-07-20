'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import {
  DEFAULT_WEEK_WEIGHT,
  SyllabusConfigService,
} from '@/services/syllabus-config.service';
import type {
  CourseOfferingCatalogItem,
  SyllabusWeek,
} from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

import { computeOfferedTitles, errorMessage } from './syllabusPageUtils';

type UseSyllabusWeeksEditorArgs = {
  selectedTermTitle: string;
  selectedCourse: CourseOfferingCatalogItem | null;
  courses: CourseOfferingCatalogItem[];
  weeks: SyllabusWeek[];
  setWeeks: Dispatch<SetStateAction<SyllabusWeek[]>>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: Dispatch<SetStateAction<boolean>>;
  setOfferedTitles: Dispatch<SetStateAction<Set<string>>>;
  isSelectedCourseOffered: boolean;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
};

export function useSyllabusWeeksEditor({
  selectedTermTitle,
  selectedCourse,
  courses,
  weeks,
  setWeeks,
  hasUnsavedChanges,
  setHasUnsavedChanges,
  setOfferedTitles,
  isSelectedCourseOffered,
  setIsSaving,
}: UseSyllabusWeeksEditorArgs) {
  const [weekEditId, setWeekEditId] = useState<string | null>(null);
  const [weekEditTitle, setWeekEditTitle] = useState('');
  const [deleteWeekTarget, setDeleteWeekTarget] = useState<SyllabusWeek | null>(
    null
  );

  function ensureCourseOffered() {
    if (!selectedCourse || !isSelectedCourseOffered) {
      toast.error('ابتدا این درس را ارائه دهید.');
      return false;
    }
    return true;
  }

  function updateWeekWeight(weekId: string, weight: number) {
    setWeeks((prev) =>
      prev.map((week) => (week.id === weekId ? { ...week, weight } : week))
    );
    setHasUnsavedChanges(true);
  }

  function restoreWeek(target: SyllabusWeek) {
    if (!ensureCourseOffered()) return;
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === target.id ? { ...week, status: 'active' as const } : week
      )
    );
    setHasUnsavedChanges(true);
    toast.success(`جلسه ${target.suffix} مجدداً به کارتابل فراگیران بازگشت.`);
  }

  function archiveWeek(target: SyllabusWeek) {
    if (!ensureCourseOffered()) return;
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === target.id
          ? { ...week, status: 'archived' as const }
          : week
      )
    );
    setHasUnsavedChanges(true);
    toast.warning(`جلسه (${target.suffix}) موقتاً آرشیو گردید.`);
  }

  function addWeek() {
    if (!ensureCourseOffered()) return;
    setWeeks((prev) => {
      const n = prev.length + 1;
      const label = `هفته ${n}`;
      const next: SyllabusWeek = {
        id: `week_${Date.now()}_${n}`,
        suffix: label,
        title: label,
        weight: DEFAULT_WEEK_WEIGHT,
        status: 'active',
      };
      setHasUnsavedChanges(true);
      toast.success(`هفته ${toPersianDigits(n)} افزوده شد.`);
      return [...prev, next];
    });
  }

  function requestDeleteWeek(target: SyllabusWeek) {
    if (!ensureCourseOffered()) return;
    setDeleteWeekTarget(target);
  }

  function confirmDeleteWeek() {
    if (!deleteWeekTarget) return;
    setWeeks((prev) => {
      const next = prev.filter((week) => week.id !== deleteWeekTarget.id);
      toast.warning(
        `هفته «${deleteWeekTarget.title || deleteWeekTarget.suffix}» حذف شد.`
      );
      setHasUnsavedChanges(true);
      return next;
    });
    setDeleteWeekTarget(null);
  }

  function openWeekEdit(week: SyllabusWeek) {
    if (week.status === 'archived') return;
    setWeekEditId(week.id);
    setWeekEditTitle(week.title || week.suffix);
  }

  function closeWeekEdit() {
    setWeekEditId(null);
    setWeekEditTitle('');
  }

  function saveWeekEdit() {
    const title = weekEditTitle.trim();
    if (!weekEditId || !title) {
      toast.error('عنوان سرفصل الزامی است.');
      return;
    }
    setWeeks((prev) =>
      prev.map((week) =>
        week.id === weekEditId ? { ...week, title, suffix: title } : week
      )
    );
    setHasUnsavedChanges(true);
    toast.warning('تغییرات در جدول اعمال شد. لطفاً ثبت نهایی کنید.');
    closeWeekEdit();
  }

  async function saveSyllabus() {
    if (!selectedTermTitle || !selectedCourse || !hasUnsavedChanges) return;
    setIsSaving(true);
    try {
      await SyllabusConfigService.saveSyllabusWeeks({
        termTitle: selectedTermTitle,
        courseTitle: selectedCourse.title,
        weeks,
      });
      setHasUnsavedChanges(false);
      setOfferedTitles(computeOfferedTitles(selectedTermTitle, courses));
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
    requestDeleteWeek,
    deleteWeekTarget,
    deleteWeekConfirmOpen: Boolean(deleteWeekTarget),
    clearDeleteWeek: () => setDeleteWeekTarget(null),
    confirmDeleteWeek,
    weekEditId,
    weekEditTitle,
    setWeekEditTitle,
    openWeekEdit,
    closeWeekEdit,
    saveWeekEdit,
    saveSyllabus,
  };
}
