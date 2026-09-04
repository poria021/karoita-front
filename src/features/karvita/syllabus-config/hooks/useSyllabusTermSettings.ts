'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { IS_MOCK_MODE } from '@/lib/api-mode';
import { notifyIfPostCommitRefreshFailure } from '@/lib/post-commit-refresh';
import { scheduleOptimisticMutation, scheduleUndoableMutation } from '@/lib/undoable-mutation';
import { SyllabusConfigService } from '@/services/syllabus-config.service';
import type {
  AcademicTerm,
  AcademicTermType,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';
import { persianToEnglishDigits, toPersianDigits } from '@/utils/persianDigits';

import { defaultPrefixForType, parseTermTitleParts } from '../constants';
import {
  patchCachedSyllabusTerms,
  publishSyllabusSnapshot,
} from '../lib/syllabusPageCache';
import { errorMessage } from '../lib/syllabusPageUtils';
import {
  professorCapacitySchema,
  passingThresholdSchema,
  termFormSchema,
} from '../schemas/syllabus-config.schema';

function termFormKey(
  editTermId: string,
  type: AcademicTermType,
  prefix: string,
  year: string
) {
  return `${editTermId}|${type}|${prefix}|${year}`;
}

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
  const queryClient = useQueryClient();
  const [editTermId, setEditTermId] = useState('');
  const [termType, setTermType] = useState<AcademicTermType>('semester');
  const [termPrefix, setTermPrefix] = useState(defaultPrefixForType('semester'));
  const [termYear, setTermYearState] = useState('');
  const [termFormError, setTermFormError] = useState<string | null>(null);
  const [academicYearError, setAcademicYearError] = useState<string | null>(
    null
  );
  const [termFormBaseline, setTermFormBaseline] = useState(() =>
    termFormKey('', 'semester', defaultPrefixForType('semester'), '')
  );

  const editingTerm = terms.find((t) => t.id === editTermId) ?? null;
  const isTermFormDirty =
    termFormKey(editTermId, termType, termPrefix, termYear) !==
    termFormBaseline;

  function setTermYear(year: string) {
    setTermYearState(year);
    setAcademicYearError(null);
  }

  function resetTermForm() {
    const prefix = defaultPrefixForType('semester');
    setEditTermId('');
    setTermType('semester');
    setTermPrefix(prefix);
    setTermYearState('');
    setTermFormError(null);
    setAcademicYearError(null);
    setTermFormBaseline(termFormKey('', 'semester', prefix, ''));
  }

  function applySnapshotTerms(snapshot: SyllabusConfigSnapshot) {
    publishSyllabusSnapshot(queryClient, snapshot);
    setTerms(snapshot.terms);
  }

  function applyTermToForm(match: AcademicTerm) {
    const parts = parseTermTitleParts(match.title);
    const prefix = match.titlePrefix || parts.prefix;
    const year = match.academicYear || parts.academicYear;
    setEditTermId(match.id);
    setTermType(match.type);
    setTermPrefix(prefix);
    setTermYearState(year);
    setTermFormError(null);
    setAcademicYearError(null);
    setTermFormBaseline(termFormKey(match.id, match.type, prefix, year));
  }

  function selectEditTerm(termId: string) {
    if (!termId) {
      resetTermForm();
      return;
    }
    const match = terms.find((t) => t.id === termId);
    if (!match) return;
    applyTermToForm(match);
    void SyllabusConfigService.getTerm(termId)
      .then((fresh) => {
        if (fresh) applyTermToForm(fresh);
      })
      .catch(() => {
        // لیست کافی است اگر GET تکی شکست بخورد
      });
  }

  function onTermTypeChange(type: AcademicTermType) {
    setTermType(type);
    setTermPrefix(defaultPrefixForType(type));
  }

  function saveTerm() {
    const parsed = termFormSchema.safeParse({
      type: termType,
      titlePrefix: termPrefix,
      academicYear: termYear,
    });
    if (!parsed.success) {
      const yearIssue = parsed.error.issues.find(
        (issue) => issue.path[0] === 'academicYear'
      );
      const otherIssue = parsed.error.issues.find(
        (issue) => issue.path[0] !== 'academicYear'
      );
      setAcademicYearError(yearIssue?.message ?? null);
      setTermFormError(
        otherIssue?.message ?? (yearIssue ? null : 'فرم دوره معتبر نیست.')
      );
      return;
    }
    setAcademicYearError(null);
    setTermFormError(null);

    const title =
      `${parsed.data.titlePrefix} ${persianToEnglishDigits(parsed.data.academicYear)}`.trim();
    const label = toPersianDigits(
      `${parsed.data.titlePrefix} ${parsed.data.academicYear}`
    );

    if (editTermId) {
      const targetId = editTermId;
      let snapshot = terms;
      scheduleOptimisticMutation({
        message: `دوره تحصیلی «${label}» به‌روز شد.`,
        apply: () => {
          snapshot = terms;
          const next = terms.map((term) =>
            term.id === targetId
              ? {
                  ...term,
                  title,
                  type: parsed.data.type,
                  titlePrefix: parsed.data.titlePrefix,
                  academicYear: parsed.data.academicYear,
                }
              : term
          );
          setTerms(next);
          patchCachedSyllabusTerms(queryClient, next);
          setTermFormBaseline(
            termFormKey(
              targetId,
              parsed.data.type,
              parsed.data.titlePrefix,
              parsed.data.academicYear
            )
          );
        },
        revert: () => {
          setTerms(snapshot);
          patchCachedSyllabusTerms(queryClient, snapshot);
        },
        commit: () =>
          SyllabusConfigService.updateTerm(targetId, parsed.data),
        onCommitted: async (result) => {
          applySnapshotTerms(result);
          setSelectedTermId(targetId);
          await loadTermContext(targetId);
        },
        onError: (err) => {
          toast.error(errorMessage(err, 'به‌روزرسانی دوره تحصیلی ناموفق بود.'));
        },
      });
      return;
    }

    const tempId = `temp_term_${Date.now()}`;
    const optimistic: AcademicTerm = {
      id: tempId,
      title,
      type: parsed.data.type,
      titlePrefix: parsed.data.titlePrefix,
      academicYear: parsed.data.academicYear,
      isEnrollOpen: false,
      isTermOpen: false,
      enrollStart: '',
      termStart: '',
    };
    let snapshot = terms;

    scheduleOptimisticMutation({
      message: `دوره تحصیلی «${label}» ایجاد شد.`,
      apply: () => {
        snapshot = terms;
        const next = [...terms, optimistic];
        setTerms(next);
        patchCachedSyllabusTerms(queryClient, next);
        resetTermForm();
        setSelectedTermId(tempId);
      },
      revert: () => {
        setTerms(snapshot);
        patchCachedSyllabusTerms(queryClient, snapshot);
        setSelectedTermId(snapshot[0]?.id ?? '');
      },
      commit: () => SyllabusConfigService.createTerm(parsed.data),
      onCommitted: async (result) => {
        applySnapshotTerms(result);
        const previousIds = new Set(snapshot.map((term) => term.id));
        const created =
          result.terms.find(
            (term) =>
              !previousIds.has(term.id) &&
              term.type === parsed.data.type &&
              (term.academicYear === parsed.data.academicYear ||
                term.title === title)
          ) ??
          result.terms.find(
            (term) =>
              term.type === parsed.data.type && term.title === title
          );
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
        const next = terms.filter((term) => term.id !== target.id);
        setTerms(next);
        patchCachedSyllabusTerms(queryClient, next);
        resetTermForm();
        const nextId =
          snapshot.find((term) => term.id !== target.id)?.id ?? '';
        setSelectedTermId(nextId);
      },
      revert: () => {
        setTerms(snapshot);
        patchCachedSyllabusTerms(queryClient, snapshot);
        setEditTermId(target.id);
        setTermType(target.type);
        const parts = parseTermTitleParts(target.title);
        setTermPrefix(parts.prefix);
        setTermYearState(parts.academicYear);
        setAcademicYearError(null);
        setTermFormBaseline(
          termFormKey(target.id, target.type, parts.prefix, parts.academicYear)
        );
        setSelectedTermId(target.id);
      },
      commit: () => SyllabusConfigService.deleteTerm(target.id),
      onCommitted: async (result) => {
        applySnapshotTerms(result);
        const nextId = result.terms[0]?.id ?? '';
        setSelectedTermId(nextId);
        if (nextId) await loadTermContext(nextId);
      },
      onError: (err) => {
        toast.error(errorMessage(err, 'حذف دوره تحصیلی ناموفق بود.'));
      },
    });
  }

  async function saveProfessorCapacity(): Promise<boolean> {
    const parsed = professorCapacitySchema.safeParse({
      capacity: professorCapacity,
    });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'ظرفیت معتبر نیست.'
      );
      return false;
    }
    try {
      const snapshot = await SyllabusConfigService.setProfessorCapacity(
        parsed.data.capacity
      );
      applySnapshotTerms(snapshot);
      setProfessorCapacity(String(snapshot.globalProfessorCapacity));
      toast.success(
        `ظرفیت پیش‌فرض تمامی اساتید به ${toPersianDigits(parsed.data.capacity)} نفر تغییر یافت.`
      );
      return true;
    } catch (err) {
      if (notifyIfPostCommitRefreshFailure(err)) return true;
      toast.error(errorMessage(err, 'ذخیره ظرفیت ناموفق بود.'));
      return false;
    }
  }

  async function savePassingThreshold(): Promise<boolean> {
    const parsed = passingThresholdSchema.safeParse({
      threshold: passingThreshold,
    });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? 'حدنصاب باید بین ۰ تا ۱۰۰ باشد.'
      );
      return false;
    }
    try {
      const snapshot = await SyllabusConfigService.setPassingThreshold(
        parsed.data.threshold
      );
      applySnapshotTerms(snapshot);
      setPassingThreshold(String(snapshot.passingScoreThreshold));
      toast.success('حدنصاب قبولی کل سیستم با موفقیت ثبت نهایی شد.');
      return true;
    } catch (err) {
      if (notifyIfPostCommitRefreshFailure(err)) return true;
      toast.error(errorMessage(err, 'ذخیره حدنصاب ناموفق بود.'));
      return false;
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
    academicYearError,
    saveTerm,
    isTermFormDirty,
    editingTerm,
    requestDeleteTerm,
    saveProfessorCapacity,
    savePassingThreshold,
  };
}
