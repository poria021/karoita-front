'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import {
  SyllabusConfigService,
  getAcademicYearOptions,
} from '@/services/syllabus-config.service';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

import { defaultPrefixForType, parseTermTitleParts } from '../constants';
import {
  professorCapacitySchema,
  passingThresholdSchema,
  termFormSchema,
} from '../schemas/syllabus-config.schema';
import { errorMessage } from './syllabusPageUtils';

type UseSyllabusTermSettingsArgs = {
  terms: AcademicTerm[];
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setSelectedTermId: Dispatch<SetStateAction<string>>;
  loadTermContext: (termId: string) => Promise<void>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
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
  setIsSaving,
  professorCapacity,
  setProfessorCapacity,
  passingThreshold,
  setPassingThreshold,
}: UseSyllabusTermSettingsArgs) {
  const academicYears = getAcademicYearOptions();
  const [editTermId, setEditTermId] = useState('');
  const [termType, setTermType] = useState<AcademicTermType>('semester');
  const [termPrefix, setTermPrefix] = useState(defaultPrefixForType('semester'));
  const [termYear, setTermYear] = useState(
    () => academicYears[1] ?? academicYears[0] ?? ''
  );
  const [deleteTermTarget, setDeleteTermTarget] = useState<AcademicTerm | null>(
    null
  );
  const [termFormError, setTermFormError] = useState<string | null>(null);

  const editingTerm = terms.find((t) => t.id === editTermId) ?? null;

  function resetTermForm() {
    setEditTermId('');
    setTermType('semester');
    setTermPrefix(defaultPrefixForType('semester'));
    setTermYear(academicYears[1] ?? academicYears[0] ?? '');
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

  async function saveTerm() {
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
    setIsSaving(true);
    try {
      const snapshot = await SyllabusConfigService.createTerm(parsed.data);
      setTerms(snapshot.terms);
      const created = snapshot.terms.find(
        (t) =>
          t.title.includes(parsed.data.titlePrefix) &&
          t.title.includes(parsed.data.academicYear)
      );
      resetTermForm();
      toast.success(
        `دوره تحصیلی «${toPersianDigits(`${parsed.data.titlePrefix} ${parsed.data.academicYear}`)}» با موفقیت ایجاد شد.`
      );
      if (created) {
        setSelectedTermId(created.id);
        await loadTermContext(created.id);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'ایجاد دوره تحصیلی ناموفق بود.'));
    } finally {
      setIsSaving(false);
    }
  }

  function requestDeleteTerm() {
    if (!editingTerm) return;
    setDeleteTermTarget(editingTerm);
  }

  async function confirmDeleteTerm() {
    if (!deleteTermTarget) return;
    try {
      const snapshot = await SyllabusConfigService.deleteTerm(
        deleteTermTarget.id
      );
      setTerms(snapshot.terms);
      resetTermForm();
      setDeleteTermTarget(null);
      toast.success('دوره تحصیلی با موفقیت حذف گردید.');
      const nextId = snapshot.terms[0]?.id ?? '';
      setSelectedTermId(nextId);
      if (nextId) await loadTermContext(nextId);
    } catch (err) {
      toast.error(errorMessage(err, 'حذف دوره تحصیلی ناموفق بود.'));
      setDeleteTermTarget(null);
    }
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
    academicYears,
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
    deleteTermTarget,
    clearDeleteTerm: () => setDeleteTermTarget(null),
    confirmDeleteTerm,
    saveProfessorCapacity,
    savePassingThreshold,
  };
}
