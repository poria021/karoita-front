'use client';

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';

import {
  SyllabusConfigService,
  getAcademicYearOptions,
} from '@/services/syllabus-config.service';
import type { AcademicTerm, AcademicTermType } from '@/types/syllabus-config';
import { toPersianDigits } from '@/utils/persianDigits';

import {
  defaultPrefixForType,
  parseTermTitleParts,
} from '../constants';
import { errorMessage } from './syllabusPageUtils';

type UseSyllabusTermSettingsArgs = {
  terms: AcademicTerm[];
  setTerms: Dispatch<SetStateAction<AcademicTerm[]>>;
  setSelectedTermTitle: Dispatch<SetStateAction<string>>;
  selectTerm: (termTitle: string) => Promise<void>;
  setIsSaving: Dispatch<SetStateAction<boolean>>;
  professorCapacity: string;
  setProfessorCapacity: Dispatch<SetStateAction<string>>;
  passingThreshold: string;
  setPassingThreshold: Dispatch<SetStateAction<string>>;
};

export function useSyllabusTermSettings({
  terms,
  setTerms,
  setSelectedTermTitle,
  selectTerm,
  setIsSaving,
  professorCapacity,
  setProfessorCapacity,
  passingThreshold,
  setPassingThreshold,
}: UseSyllabusTermSettingsArgs) {
  const academicYears = useMemo(() => getAcademicYearOptions(), []);
  const [editTermId, setEditTermId] = useState('');
  const [termType, setTermType] = useState<AcademicTermType>('semester');
  const [termPrefix, setTermPrefix] = useState(defaultPrefixForType('semester'));
  const [termYear, setTermYear] = useState(
    () => academicYears[1] ?? academicYears[0] ?? ''
  );
  const [deleteTermTarget, setDeleteTermTarget] = useState<AcademicTerm | null>(
    null
  );

  const editingTerm = useMemo(
    () => terms.find((t) => t.id === editTermId) ?? null,
    [terms, editTermId]
  );

  const resetTermForm = useCallback(() => {
    setEditTermId('');
    setTermType('semester');
    setTermPrefix(defaultPrefixForType('semester'));
    setTermYear(academicYears[1] ?? academicYears[0] ?? '');
  }, [academicYears]);

  const selectEditTerm = useCallback(
    (termId: string) => {
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
    },
    [resetTermForm, terms]
  );

  const onTermTypeChange = useCallback((type: AcademicTermType) => {
    setTermType(type);
    setTermPrefix(defaultPrefixForType(type));
  }, []);

  const saveTerm = useCallback(async () => {
    if (editTermId) {
      toast.message('برای دوره موجود فقط حذف مجاز است؛ فیلدهای عنوان قفل‌اند.');
      return;
    }
    setIsSaving(true);
    try {
      const snapshot = await SyllabusConfigService.createTerm({
        type: termType,
        titlePrefix: termPrefix,
        academicYear: termYear,
      });
      setTerms(snapshot.terms);
      resetTermForm();
      toast.success(
        `دوره تحصیلی «${toPersianDigits(`${termPrefix} ${termYear}`)}» با موفقیت ایجاد شد.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'ایجاد دوره تحصیلی ناموفق بود.'));
    } finally {
      setIsSaving(false);
    }
  }, [
    editTermId,
    resetTermForm,
    setIsSaving,
    setTerms,
    termPrefix,
    termType,
    termYear,
  ]);

  const requestDeleteTerm = useCallback(() => {
    if (!editingTerm) return;
    setDeleteTermTarget(editingTerm);
  }, [editingTerm]);

  const confirmDeleteTerm = useCallback(async () => {
    if (!deleteTermTarget) return;
    try {
      const snapshot = await SyllabusConfigService.deleteTerm(
        deleteTermTarget.id
      );
      setTerms(snapshot.terms);
      setSelectedTermTitle(snapshot.selectedTermTitle);
      resetTermForm();
      setDeleteTermTarget(null);
      toast.success('دوره تحصیلی با موفقیت حذف گردید.');
      if (snapshot.selectedTermTitle) {
        await selectTerm(snapshot.selectedTermTitle);
      }
    } catch (err) {
      toast.error(errorMessage(err, 'حذف دوره تحصیلی ناموفق بود.'));
      setDeleteTermTarget(null);
    }
  }, [
    deleteTermTarget,
    resetTermForm,
    selectTerm,
    setSelectedTermTitle,
    setTerms,
  ]);

  const saveProfessorCapacity = useCallback(async () => {
    const n = Number.parseInt(professorCapacity, 10);
    if (!Number.isFinite(n) || n < 0) {
      toast.error('ظرفیت معتبر نیست.');
      return;
    }
    try {
      const snapshot = await SyllabusConfigService.setProfessorCapacity(n);
      setProfessorCapacity(String(snapshot.globalProfessorCapacity));
      toast.success(
        `ظرفیت پیش‌فرض تمامی اساتید به ${toPersianDigits(n)} نفر تغییر یافت.`
      );
    } catch (err) {
      toast.error(errorMessage(err, 'ذخیره ظرفیت ناموفق بود.'));
    }
  }, [professorCapacity, setProfessorCapacity]);

  const savePassingThreshold = useCallback(async () => {
    const n = Number.parseInt(passingThreshold, 10);
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error('حدنصاب باید بین ۰ تا ۱۰۰ باشد.');
      return;
    }
    try {
      const snapshot = await SyllabusConfigService.setPassingThreshold(n);
      setPassingThreshold(String(snapshot.passingScoreThreshold));
      toast.success('حدنصاب قبولی کل سیستم با موفقیت ثبت نهایی شد.');
    } catch (err) {
      toast.error(errorMessage(err, 'ذخیره حدنصاب ناموفق بود.'));
    }
  }, [passingThreshold, setPassingThreshold]);

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
