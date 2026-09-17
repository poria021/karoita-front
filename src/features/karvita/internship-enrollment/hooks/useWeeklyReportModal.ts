'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useLocalFormDraft } from '@/hooks/useLocalFormDraft';
import {
  scheduleOptimisticMutation,
  scheduleUndoableLocalChange,
} from '@/lib/undoable-mutation';
import { InternshipEnrollmentService } from '@/services/internship-enrollment.service';
import type {
  InternshipEnrollmentActor,
  InternshipEnrollmentPageState,
  InternshipWeeklyReportFile,
  InternshipWeeklySession,
} from '@/types/internship-enrollment';
import { toPersianDigits } from '@/utils/persianDigits';

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
  onReopen: (week: InternshipWeeklySession) => void;
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
  onReopen,
  onSaved,
}: UseWeeklyReportModalInput) {
  void open;

  const enrollment = state.enrollment;
  const {
    value: draftValue,
    hasDraft: hasWeeklyReportDraft,
    setValue: setWeeklyReportDraft,
    clearDraft: clearWeeklyReportDraft,
  } = useLocalFormDraft<{
    text: string;
    files: InternshipWeeklyReportFile[];
  }>({
    key: week ? `weekly-report:${week.id}` : 'weekly-report:placeholder',
    initialValue: { text: '', files: [] },
  });
  const [editorWeekId, setEditorWeekId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [files, setFiles] = useState<InternshipWeeklyReportFile[]>([]);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const undoDraftRef = useRef<{
    weekId: string;
    text: string;
    files: InternshipWeeklyReportFile[];
  } | null>(null);

  const syncDraft = useCallback(
    (nextText: string, nextFiles: InternshipWeeklyReportFile[]) => {
      setWeeklyReportDraft({ text: nextText, files: cloneFiles(nextFiles) });
    },
    [setWeeklyReportDraft]
  );

  const resetForm = useCallback(
    (force = false) => {
      if (!week) {
        setEditorWeekId(null);
        setText('');
        setFiles([]);
        return;
      }

      if (!force && week.id === editorWeekId) {
        return;
      }

      const draft = undoDraftRef.current;
      setEditorWeekId(week.id);

      if (hasWeeklyReportDraft) {
        setText(draftValue.text);
        setFiles(cloneFiles(draftValue.files));
        return;
      }

      if (draft && draft.weekId === week.id) {
        setText(draft.text);
        setFiles(cloneFiles(draft.files));
        undoDraftRef.current = null;
        return;
      }

      setText(week.text ?? '');
      setFiles(cloneFiles(week.files));
    },
    [draftValue, editorWeekId, hasWeeklyReportDraft, week]
  );

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
    ? toPersianDigits(week.title)
    : week
      ? 'گزارش هفته'
      : 'ویرایش گزارش';

  const busy = isSavingDraft || isSubmitting;

  const addFiles = useCallback(
    (incoming: InternshipWeeklyReportFile[]) => {
      if (locked) return;
      setFiles((prev) => {
        const next = [...prev, ...incoming];
        syncDraft(text, next);
        return next;
      });
    },
    [locked, syncDraft, text]
  );

  const removeFile = useCallback(
    (fileId: string) => {
      if (locked) return;

      let snapshot: InternshipWeeklyReportFile[] = [];

      scheduleUndoableLocalChange({
        tone: 'error',
        message: 'ضمیمه مورد نظر حذف شد.',
        undoLabel: 'لغو',
        apply: () => {
          setFiles((prev) => {
            snapshot = prev;
            const next = prev.filter((file) => file.id !== fileId);
            syncDraft(text, next);
            return next;
          });
        },
        revert: () => {
          setFiles(snapshot);
          syncDraft(text, snapshot);
        },
      });
    },
    [locked, syncDraft, text]
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

      clearWeeklyReportDraft();
      toast.success('گزارش با موفقیت به عنوان پیش‌نویس ذخیره گردید.');
      await onSaved();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : ''
      );
    } finally {
      setIsSavingDraft(false);
    }
  }, [
    actor,
    assertNonEmpty,
    clearWeeklyReportDraft,
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

    const payload = {
      actor,
      kind: state.kind,
      level: state.level,
      termId: state.termId,
      weekId: week.id,
      text,
      files: cloneFiles(files),
    };

    const reopenWeek = week;

    scheduleOptimisticMutation({
      message: 'گزارش نهایی شده و جهت دریافت بازخورد ارسال گردید.',
      apply: () => {
        undoDraftRef.current = {
          weekId: week.id,
          text,
          files: cloneFiles(files),
        };
        onClose();
      },
      revert: () => {
        onReopen(reopenWeek);
      },
      commit: () => InternshipEnrollmentService.submitWeeklyReport(payload),
      onCommitted: async () => {
        undoDraftRef.current = null;
        clearWeeklyReportDraft();
        await onSaved();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : 'ارسال گزارش برای بازخورد ناموفق بود.'
        );
      },
    });

    setIsSubmitting(false);
  }, [
    actor,
    assertNonEmpty,
    clearWeeklyReportDraft,
    enrollment,
    files,
    locked,
    onClose,
    onReopen,
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
    setText: (nextText: string) => {
      setText(nextText);
      syncDraft(nextText, files);
    },
    files,
    addFiles,
    removeFile,
    locked,
    lockNotice,
    feedback: week?.feedback,
    reportSubmittedAt: week?.reportSubmittedAt ?? null,
    busy,
    isSavingDraft,
    isSubmitting,
    resetForm,
    saveDraft,
    submitForFeedback,
  };
}