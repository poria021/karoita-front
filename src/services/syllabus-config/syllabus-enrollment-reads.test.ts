import { describe, expect, it } from 'vitest';

import { getTodayJalaliSlash } from '@/services/syllabus-config/syllabus-term-gates';
import { buildCourseOfferingId } from '@/services/syllabus-config/syllabus-mappers';
import {
  isCourseOfferedInTerm,
  pickActiveTermForKind,
  resolveEnrollmentSyllabusContext,
} from '@/services/syllabus-config/syllabus-enrollment-reads';
import type {
  CourseOfferingKind,
  SyllabusConfigSnapshot,
} from '@/types/syllabus-config';

function activateOffering(
  draft: SyllabusConfigSnapshot,
  termId: string,
  courseCatalogId: string,
  type: CourseOfferingKind
): void {
  const id = buildCourseOfferingId(termId, courseCatalogId);
  draft.offerings[id] = {
    id,
    termId,
    courseCatalogId,
    type,
    isOffered: true,
    weeks: [],
  };
}

function emptySnapshot(): SyllabusConfigSnapshot {
  return {
    terms: [
      {
        id: 'term_sem',
        title: 'نیم‌سال تست 1405-1406',
        type: 'semester',
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      },
      {
        id: 'term_mod',
        title: 'دوره مهارتی تست 1405-1406',
        type: 'modular',
        isEnrollOpen: false,
        isTermOpen: false,
        enrollStart: '',
        termStart: '',
      },
    ],
    offerings: {},
    internships: [],
    globalProfessorCapacity: 15,
    passingScoreThreshold: 70,
  };
}

describe('syllabus enrollment reads', () => {
  it('picks semester for internship and modular for apprenticeship', () => {
    const snapshot = emptySnapshot();
    expect(pickActiveTermForKind(snapshot, 'internship')?.type).toBe('semester');
    expect(pickActiveTermForKind(snapshot, 'apprenticeship')?.type).toBe(
      'modular'
    );
  });

  it('reports course offered after activate even with empty weeks', () => {
    const draft = emptySnapshot();
    const term = draft.terms[0]!;
    expect(isCourseOfferedInTerm(draft, term, 'internship', 1)).toBe(false);

    activateOffering(draft, term.id, 'course_internship_1', 'internship');
    expect(isCourseOfferedInTerm(draft, term, 'internship', 1)).toBe(true);
  });

  it('builds enrollment context from gates and offering', () => {
    const draft = emptySnapshot();
    const today = getTodayJalaliSlash();
    const term = draft.terms[0]!;
    term.isEnrollOpen = true;
    term.enrollStart = today;
    activateOffering(draft, term.id, 'course_internship_2', 'internship');

    const context = resolveEnrollmentSyllabusContext(draft, 'internship', 2);
    expect(context.syllabusConfigured).toBe(true);
    expect(context.enrollOpen).toBe(true);
    expect(context.termOpen).toBe(false);
    expect(context.termId).toBe(term.id);
  });

});
