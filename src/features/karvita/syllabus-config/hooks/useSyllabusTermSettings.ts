'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { IS_MOCK_MODE } from '@/lib/api-mode';
import { scheduleOptimisticMutation, scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import { persianToEnglishDigits, toPersianDigits } from '@/utils/persianDigits';

import { defaultPrefixForType, parseTermTitleParts } from '../constants';
import {
  professorCapacitySchema,
  passingThresholdSchema,
  termFormSchema,
} from '../schemas/syllabus-config.schema';
import { errorMessage } from '../lib/syllabusPageUtils';

type UseSyllabusTermSettingsArgs = {
  terms: AcademicTerm[];
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setSelectedTermId: Dispatch<SetStateAction<string>>;
  loadTermContext: (termId: string) => Promise<void>;
  professorCapacity: string;
  setProfessorCapacity: Dispatch<SetStateAction<string>>;
  passingThreshold: string;
  setPassingThreshold: Dispatch<SetStateAction<string>>;
};

export function useSyllabusTermSettings({
  terms,
  setTerms,
  setSelectedTermId,
  loadTermContext,
  professorCapacity,
  setProfessorCapacity,
  passingThreshold,
  setPassingThreshold,
}: UseSyllabusTermSettingsArgs) {
  const defaultAcademicYear = SyllabusConfigService.getDefaultAcademicYear();
  const [editTermId, setEditTermId] = useState('');
  const [termType, setTermType] = useState<AcademicTermType>('semester');
  const [termPrefix, setTermPrefix] = useState(defaultPrefixForType('semester'));
  const [termYear, setTermYear] = useState(defaultAcademicYear);
  const [termFormError, setTermFormError] = useState<string | null>(null);

  const editingTerm = terms.find((t) => t.id === editTermId) ?? null;

  function resetTermForm() {
    setEditTermId('');
    setTermType('semester');
    setTermPrefix(defaultPrefixForType('semester'));
    setTermYear(SyllabusConfigService.getDefaultAcademicYear());
    setTermFormError(null);
  }

  function selectEditTerm(termId: string) {
    if (!termId) {
      resetTermForm();
      return;
    }
    const match = terms.find((t) => t.id === termId);
    if (!match) return;
    setEditTermId(match.id);
    setTermType(match.type);
    const parts = parseTermTitleParts(match.title);
    setTermPrefix(parts.prefix);
    setTermYear(parts.academicYear);
    setTermFormError(null);
  }

  function onTermTypeChange(type: AcademicTermType) {
    setTermType(type);
    setTermPrefix(defaultPrefixForType(type));
  }

  function saveTerm() {
    if (editTermId) {
      toast.message('برای دوره موجود فقط حذف مجاز است؛ فیلدهای عنوان قفل‌اند.');
      return;
    }
    const parsed = termFormSchema.safeParse({
      type: termType,
      titlePrefix: termPrefix,
      academicYear: termYear,
    });
    if (!parsed.success) {
      setTermFormError(
        parsed.error.issues[0]?.message ?? 'فرم دوره معتبر نیست.'
      );
      return;
    }
    setTermFormError(null);

    const title =
      `${parsed.data.titlePrefix} ${persianToEnglishDigits(parsed.data.academicYear)}`.trim();
    const tempId = `temp_term_${Date.now()}`;
    const optimistic: AcademicTerm = {
      id: tempId,
      title,
      type: parsed.data.type,
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    };
    let snapshot = terms;

    scheduleOptimisticMutation({
      message: `دوره تحصیلی «${toPersianDigits(`${parsed.data.titlePrefix} ${parsed.data.academicYear}`)}» ایجاد شد.`,
      apply: () => {
        snapshot = terms;
        setTerms((prev) => [...prev, optimistic]);
        resetTermForm();
        setSelectedTermId(tempId);
      },
      revert: () => {
        setTerms(snapshot);
        setSelectedTermId(snapshot[0]?.id ?? '');
      },
      commit: () => SyllabusConfigService.createTerm(parsed.data),
      onCommitted: async (result) => {
        setTerms(result.terms);
        const created = result.terms.find((t) => t.title === title);
        const nextId = created?.id ?? result.terms[0]?.id ?? '';
        setSelectedTermId(nextId);
        if (nextId) await loadTermContext(nextId);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'ایجاد دوره تحصیلی ناموفق بود.'));
      },
    });
  }

  function requestDeleteTerm() {
    if (!editingTerm) return;

    const target = editingTerm;
    let snapshot = terms;

    scheduleUndoableMutation({
      tone: 'error',
      message: `دوره تحصیلی «${toPersianDigits(target.title)}» حذف شد.`,
      undoLabel: 'لغو',
      // real mode: commit تا بسته‌شدن toast به تأخیر می‌افتد تا «لغو» واقعی باشد.
      // mock mode: commit فوری لازم است تا داده در localStorage قبل از reload ذخیره شود.
      deferCommit: !IS_MOCK_MODE,
      apply: () => {
        snapshot = terms;
        setTerms((prev) => prev.filter((term) => term.id !== target.id));
        resetTermForm();
        const nextId =
          snapshot.find((term) => term.id !== target.id)?.id ?? '';
        setSelectedTermId(nextId);
      },
      revert: () => {
        setTerms(snapshot);
        setEditTermId(target.id);
        setTermType(target.type);
        const parts = parseTermTitleParts(target.title);
        setTermPrefix(parts.prefix);
        setTermYear(parts.academicYear);
        setSelectedTermId(target.id);
      },
      commit: () => SyllabusConfigService.deleteTerm(target.id),
      onCommitted: async (result) => {
        setTerms(result.terms);
        const nextId = result.terms[0]?.id ?? '';
        setSelectedTermId(nextId);
        if (nextId) await loadTermContext(nextId);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'حذف دوره تحصیلی ناموفق بود.'));
      },
    });
  }

  async function saveProfessorCapacity() {
    const parsed = professorCapacitySchema.safeParse({
      capacity: professorCapacity,
    });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'ظرفیت معتبر نیست.'
      );
      return;
    }
    try {
      const snapshot = await SyllabusConfigService.setProfessorCapacity(
        parsed.data.capacity
      );
      setProfessorCapacity(String(snapshot.globalProfessorCapacity));
      toast.success(
        `ظرفیت پیش‌فرض تمامی اساتید به ${toPersianDigits(parsed.data.capacity)} نفر تغییر یافت.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'ذخیره ظرفیت ناموفق بود.'));
    }
  }

  async function savePassingThreshold() {
    const parsed = passingThresholdSchema.safeParse({
      threshold: passingThreshold,
    });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'حدنصاب باید بین ۰ تا ۱۰۰ باشد.'
      );
      return;
    }
    try {
      const snapshot = await SyllabusConfigService.setPassingThreshold(
        parsed.data.threshold
      );
      setPassingThreshold(String(snapshot.passingScoreThreshold));
      toast.success('حدنصاب قبولی کل سیستم با موفقیت ثبت نهایی شد.');
    } catch (err) {
      toast.error(errorMessage(err, 'ذخیره حدنصاب ناموفق بود.'));
    }
  }

  return {
    editTermId,
    selectEditTerm,
    termType,
    onTermTypeChange,
    termPrefix,
    setTermPrefix,
    termYear,
    setTermYear,
    termFormError,
    saveTerm,
    editingTerm,
    requestDeleteTerm,
    saveProfessorCapacity,
    savePassingThreshold,
  };
}
