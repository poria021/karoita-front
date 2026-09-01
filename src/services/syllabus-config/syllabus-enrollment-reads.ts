import {
  isTermGateActive,
} from '@/services/syllabus-config/mock/mock-syllabus-store';
import {
  buildCourseOfferingId,
  catalogIdForKind,
} from '@/services/syllabus-config/syllabus-mappers';
import type {
  AcademicTerm,
  CourseOfferingKind,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

/**
 * خواندن خالص سرفصل برای مصرف‌کنندهٔ ثبت‌نام.
 * منبع snapshot را Nest می‌تواند عوض کند؛ این هلپرها دامنه را ثابت نگه می‌دارند.
 */

export function pickActiveTermForKind(
  snapshot: SyllabusConfigSnapshot,
  kind: CourseOfferingKind
): AcademicTerm | null {
  const preferredType = kind === 'apprenticeship' ? 'modular' : 'semester';
  const preferred = snapshot.terms.filter((term) => term.type === preferredType);
  const pool = preferred.length > 0 ? preferred : snapshot.terms;
  if (pool.length === 0) return null;

  return (
    pool.find(
      (term) =>
        isTermGateActive(term.isEnrollOpen, term.enrollStart) ||
        isTermGateActive(term.isTermOpen, term.termStart)
    ) ??
    pool[pool.length - 1] ??
    null
  );
}

export function isCourseOfferedInTerm(
  snapshot: SyllabusConfigSnapshot,
  term: AcademicTerm,
  kind: CourseOfferingKind,
  level: number
): boolean {
  const offeringId = buildCourseOfferingId(
    term.id,
    catalogIdForKind(kind, level)
  );
  const offering = snapshot.offerings[offeringId];
  return Boolean(offering?.isOffered);
}

export function getTermGateFlags(term: AcademicTerm | null): {
  enrollOpen: boolean;
  termOpen: boolean;
} {
  if (!term) return { enrollOpen: false, termOpen: false };
  return {
    enrollOpen: isTermGateActive(term.isEnrollOpen, term.enrollStart),
    termOpen: isTermGateActive(term.isTermOpen, term.termStart),
  };
}

export type EnrollmentSyllabusContext = {
  term: AcademicTerm | null;
  termId: string;
  termTitle: string;
  syllabusConfigured: boolean;
  enrollOpen: boolean;
  termOpen: boolean;
};

export function resolveEnrollmentSyllabusContext(
  snapshot: SyllabusConfigSnapshot,
  kind: CourseOfferingKind,
  level: number
): EnrollmentSyllabusContext {
  const term = pickActiveTermForKind(snapshot, kind);
  const gates = getTermGateFlags(term);
  return {
    term,
    termId: term?.id ?? `mock-term-${kind}`,
    termTitle: term?.title ?? 'نیم‌سال جاری',
    syllabusConfigured: term
      ? isCourseOfferedInTerm(snapshot, term, kind, level)
      : false,
    enrollOpen: gates.enrollOpen,
    termOpen: gates.termOpen,
  };
}
