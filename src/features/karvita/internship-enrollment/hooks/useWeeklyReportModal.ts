'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipWeeklyReportFile,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';

import {
  getWeeklyReportLockNotice,
  isWeeklyReportLocked,
  type WeeklyReportLockNotice,
} from '../lib/weekly-report-lock';

type UseWeeklyReportModalInput = {
  actor: InternshipEnrollmentActor;
  state: InternshipEnrollmentPageState;
  week: InternshipWeeklySession | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
};

function cloneFiles(
  files: InternshipWeeklyReportFile[] | undefined
): InternshipWeeklyReportFile[] {
  return (files ?? []).map((file) => ({ ...file }));
}

export function useWeeklyReportModal({
  actor,
  state,
  week,
  open,
  onClose,
  onSaved,
}: UseWeeklyReportModalInput) {
  const enrollment = state.enrollment;
  const [text, setText] = useState('');
  const [files, setFiles] = useState<InternshipWeeklyReportFile[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !week) return;
    setText(week.text ?? '');
    setFiles(cloneFiles(week.files));
  }, [open, week]);

  const lockContext = useMemo(() => {
    if (!week || !enrollment) return null;
    return {
      week,
      weeks: enrollment.weeks,
      enrollmentStatus: enrollment.status,
      removalPending: enrollment.removalPending,
      isTermArchived: enrollment.isTermArchived,
    };
  }, [enrollment, week]);

  const locked = lockContext ? isWeeklyReportLocked(lockContext) : true;
  const lockNotice: WeeklyReportLockNotice | null =
    locked && lockContext ? getWeeklyReportLockNotice(lockContext) : null;

  const title = week?.title?.trim()
    ? week.title
    : week
      ? `گزارش هفته`
      : 'ویرایش گزارش';

  const busy = isSavingDraft || isSubmitting;

  const addFiles = useCallback(
    (incoming: InternshipWeeklyReportFile[]) => {
      if (locked) return;
      setFiles((prev) => [...prev, ...incoming]);
    },
    [locked]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      if (locked) return;
      setFiles((prev) => prev.filter((file) => file.id !== fileId));
      toast.success('ضمیمه مورد نظر با موفقیت حذف شد.');
    },
    [locked]
  );

  const assertNonEmpty = useCallback(() => {
    if (text.trim().length === 0 && files.length === 0) {
      toast.error(
        'امکان ثبت گزارش خالی وجود ندارد. لطفاً متنی وارد کنید یا فایلی ضمیمه نمایید.'
      );
      return false;
    }
    return true;
  }, [files.length, text]);

  const saveDraft = useCallback(async () => {
    if (!week || !enrollment || locked) return;
    if (!assertNonEmpty()) return;

    setIsSavingDraft(true);
    try {
      await InternshipEnrollmentService.saveWeeklyReportDraft({
        actor,
        kind: state.kind,
        level: state.level,
        termId: state.termId,
        weekId: week.id,
        text,
        files,
      });
      toast.success('گزارش با موفقیت به عنوان پیش‌نویس ذخیره گردید.');
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'ذخیره پیش‌نویس ناموفق بود.'
      );
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    actor,
    assertNonEmpty,
    enrollment,
    files,
    locked,
    onClose,
    onSaved,
    state.kind,
    state.level,
    state.termId,
    text,
    week,
  ]);

  const submitForFeedback = useCallback(async () => {
    if (!week || !enrollment || locked) return;
    if (!assertNonEmpty()) return;

    setIsSubmitting(true);
    try {
      await InternshipEnrollmentService.submitWeeklyReport({
        actor,
        kind: state.kind,
        level: state.level,
        termId: state.termId,
        weekId: week.id,
        text,
        files,
      });
      toast.success('گزارش نهایی شده و جهت دریافت بازخورد ارسال گردید.');
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'ارسال گزارش برای بازخورد ناموفق بود.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    actor,
    assertNonEmpty,
    enrollment,
    files,
    locked,
    onClose,
    onSaved,
    state.kind,
    state.level,
    state.termId,
    text,
    week,
  ]);

  return {
    title,
    text,
    setText,
    files,
    addFiles,
    removeFile,
    locked,
    lockNotice,
    feedback: week?.feedback,
    busy,
    isSavingDraft,
    isSubmitting,
    saveDraft,
    submitForFeedback,
  };
}
